
use std::sync::Mutex;
use tauri::Manager;
use tauri::Emitter;
use tauri::Window;
use tauri_plugin_shell::ShellExt;
use tauri_plugin_shell::process::CommandEvent;
use std::fs::{self, File};
use std::io::{Read, Write};
use std::path::Path;
use std::time::{SystemTime, UNIX_EPOCH};
use zip::{ZipArchive, ZipWriter, write::FileOptions};
use serde::Serialize;

#[derive(Default)]
pub struct FfmpegState(pub Mutex<Option<tauri_plugin_shell::process::CommandChild>>);

#[tauri::command]
fn get_startup_file() -> Option<String> {
    std::env::args()
        .skip(1)
        .map(|arg| arg.trim_matches('"').to_string())
        .find(|arg| arg.to_lowercase().ends_with(".tsp"))
}

#[tauri::command]
async fn run_ffmpeg(
    app_handle: tauri::AppHandle,
    state: tauri::State<'_, FfmpegState>,
    args: Vec<String>,
) -> Result<String, String> {
    // 1. Check if there is already a running process
    {
        let guard = state.0.lock().unwrap();
        if guard.is_some() {
            return Err("FFmpeg process is already running.".to_string());
        }
    }

    // 2. Create sidecar command
    let sidecar_cmd = app_handle
        .shell()
        .sidecar("ffmpeg")
        .map_err(|e| format!("Failed to create sidecar command: {}", e))?
        .args(args);

    // 3. Spawn child
    let (mut rx, child) = sidecar_cmd
        .spawn()
        .map_err(|e| format!("Failed to spawn FFmpeg sidecar: {}", e))?;

    // 4. Store child in state
    {
        let mut guard = state.0.lock().unwrap();
        *guard = Some(child);
    }

    // 5. Read output in a background task
    let app_clone = app_handle.clone();
    let stderr_logs = std::sync::Arc::new(Mutex::new(Vec::new()));
    let stderr_logs_clone = stderr_logs.clone();

    let join_handle = tauri::async_runtime::spawn(async move {
        let mut exit_code = None;

        while let Some(event) = rx.recv().await {
            match event {
                CommandEvent::Stdout(line_bytes) => {
                    let line = String::from_utf8_lossy(&line_bytes).to_string();
                    let _ = app_clone.emit("ffmpeg-stdout", line);
                }
                CommandEvent::Stderr(line_bytes) => {
                    let line = String::from_utf8_lossy(&line_bytes).to_string();
                    // Store in log buffer
                    {
                        let mut logs = stderr_logs_clone.lock().unwrap();
                        logs.push(line.clone());
                        if logs.len() > 100 {
                            logs.remove(0);
                        }
                    }
                    // Emit progress or raw logs to JS
                    let _ = app_clone.emit("ffmpeg-stderr", line);
                }
                CommandEvent::Terminated(payload) => {
                    exit_code = payload.code;
                    break;
                }
                _ => {}
            }
        }

        // Clear child from state
        let state = app_clone.state::<FfmpegState>();
        {
            let mut guard = state.0.lock().unwrap();
            *guard = None;
        }

        exit_code
    });

    // Wait for the process to complete or fail
    let exit_code = join_handle.await
        .map_err(|e| format!("Background thread panicked: {}", e))?;

    match exit_code {
        Some(0) => Ok("Success".to_string()),
        Some(code) => {
            let logs = stderr_logs.lock().unwrap().join("\n");
            Err(format!("FFmpeg failed with exit status code {}.\n\nLogs:\n{}", code, logs))
        }
        None => {
            Err("FFmpeg process ended unexpectedly or was terminated by signal.".to_string())
        }
    }
}

#[tauri::command]
async fn abort_ffmpeg(state: tauri::State<'_, FfmpegState>) -> Result<(), String> {
    let mut guard = state.0.lock().unwrap();
    if let Some(child) = guard.take() {
        let _ = child.kill();
    }
    Ok(())
}

#[derive(Serialize)]
struct TspzPayload {
    json_state: String,
    video_paths: Vec<String>,
}

#[tauri::command]
fn load_tspz_bundle(archive_path: String) -> Result<TspzPayload, String> {
    let archive_file = File::open(&archive_path).map_err(|e| e.to_string())?;
    let mut archive = ZipArchive::new(archive_file).map_err(|e| e.to_string())?;

    let timestamp = SystemTime::now().duration_since(UNIX_EPOCH).unwrap().as_millis();
    let temp_dir = std::env::temp_dir().join(format!("tspz_{}", timestamp));
    fs::create_dir_all(&temp_dir).map_err(|e| e.to_string())?;

    let mut json_state = String::new();
    let mut video_paths = Vec::new();

    for i in 0..archive.len() {
        let mut file = archive.by_index(i).map_err(|e| e.to_string())?;
        let outpath = match file.enclosed_name() {
            Some(path) => temp_dir.join(path),
            None => continue,
        };

        if (*file.name()).ends_with('/') {
            fs::create_dir_all(&outpath).map_err(|e| e.to_string())?;
        } else {
            if let Some(p) = outpath.parent() {
                fs::create_dir_all(p).map_err(|e| e.to_string())?;
            }
            let mut outfile = File::create(&outpath).map_err(|e| e.to_string())?;
            std::io::copy(&mut file, &mut outfile).map_err(|e| e.to_string())?;

            if file.name() == "project.tsp" {
                let mut f = File::open(&outpath).map_err(|e| e.to_string())?;
                f.read_to_string(&mut json_state).map_err(|e| e.to_string())?;
            } else if let Some(ext) = outpath.extension() {
                let ext_str = ext.to_string_lossy().to_lowercase();
                if ["mp4", "mov", "webm", "avi", "ogg"].contains(&ext_str.as_str()) {
                    video_paths.push(outpath.to_string_lossy().to_string());
                }
            }
        }
    }

    if json_state.is_empty() {
        return Err("No project.tsp found in the archive".into());
    }

    Ok(TspzPayload {
        json_state,
        video_paths,
    })
}

#[derive(Clone, Serialize)]
struct ProgressPayload {
    percentage: f64,
    current_file: String,
}

#[tauri::command]
async fn save_tspz_bundle(window: Window, json_state: String, video_paths: Vec<String>, save_path: String) -> Result<(), String> {
    tokio::task::spawn_blocking(move || -> Result<(), String> {
        let file = File::create(&save_path).map_err(|e| e.to_string())?;
        let mut zip = ZipWriter::new(file);
        let options = FileOptions::default()
            .compression_method(zip::CompressionMethod::Deflated)
            .unix_permissions(0o755);

        zip.start_file("project.tsp", options).map_err(|e| e.to_string())?;
        zip.write_all(json_state.as_bytes()).map_err(|e| e.to_string())?;

        let mut total_bytes: u64 = 0;
        for path in &video_paths {
            if let Ok(meta) = fs::metadata(path) {
                total_bytes += meta.len();
            }
        }

        let mut bytes_written: u64 = 0;
        let mut buffer = vec![0; 4 * 1024 * 1024]; // 4MB Buffer Chunk

        for video_path in video_paths {
            let path = Path::new(&video_path);
            if let Some(filename) = path.file_name() {
                let filename_str = filename.to_string_lossy().to_string();
                let mut f = File::open(path).map_err(|e| e.to_string())?;

                zip.start_file(filename_str.clone(), options).map_err(|e| e.to_string())?;

                loop {
                    let bytes_read = f.read(&mut buffer).map_err(|e| e.to_string())?;
                    if bytes_read == 0 {
                        break;
                    }
                    zip.write_all(&buffer[..bytes_read]).map_err(|e| e.to_string())?;
                    bytes_written += bytes_read as u64;

                    let percentage = if total_bytes > 0 {
                        (bytes_written as f64 / total_bytes as f64) * 100.0
                    } else {
                        100.0
                    };

                    let _ = window.emit("bundle-progress", ProgressPayload {
                        percentage,
                        current_file: filename_str.clone(),
                    });
                }
            }
        }

        zip.finish().map_err(|e| e.to_string())?;
        Ok(())
    })
    .await
    .map_err(|e| format!("Failed to spawn blocking task: {}", e))?
}

// Triggering a recompile to pick up new icons

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .manage(FfmpegState(Mutex::new(None)))
    .plugin(tauri_plugin_fs::init())
    .plugin(tauri_plugin_dialog::init())
    .plugin(tauri_plugin_shell::init())
    .setup(|app| {
      if cfg!(debug_assertions) {
        app.handle().plugin(
          tauri_plugin_log::Builder::default()
            .level(log::LevelFilter::Info)
            .build(),
        )?;
      }
      Ok(())
    })
     // Add this line to register your new commands:
    .invoke_handler(tauri::generate_handler![
        get_startup_file,
        run_ffmpeg,
        abort_ffmpeg,
        load_tspz_bundle,
        save_tspz_bundle
    ])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}


#[tauri::command]
fn get_startup_file() -> Option<String> {
    // std::env::args().nth(1) grabs the first argument passed to the executable
    let arg = std::env::args().nth(1)?;
    
    // Only return the file path if it's a TimeStudy Project
    if arg.ends_with(".tsp") {
        Some(arg)
    } else {
        None
    }
}

// Triggering a recompile to pick up new icons

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .plugin(tauri_plugin_fs::init())
    .plugin(tauri_plugin_dialog::init())
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
     // Add this line to register your new command:
    .invoke_handler(tauri::generate_handler![get_startup_file]) 
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}

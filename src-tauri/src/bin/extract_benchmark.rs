use std::fs::File;
use std::io::Write;
use std::path::PathBuf;
use std::time::Instant;

fn setup_benchmark(count: usize) -> (Vec<String>, PathBuf, PathBuf) {
    let temp_dir = std::env::temp_dir().join("timestudy_bench_temp");
    let dest_dir = std::env::temp_dir().join("timestudy_bench_dest");

    let _ = std::fs::remove_dir_all(&temp_dir);
    let _ = std::fs::remove_dir_all(&dest_dir);

    std::fs::create_dir_all(&temp_dir).unwrap();
    std::fs::create_dir_all(&dest_dir).unwrap();

    let mut temp_files = Vec::new();

    let dummy_data = vec![0u8; 10 * 1024 * 1024]; // 10MB
    for i in 0..count {
        let file_path = temp_dir.join(format!("dummy_{}.bin", i));
        let mut file = File::create(&file_path).unwrap();
        file.write_all(&dummy_data).unwrap();
        temp_files.push(file_path.to_string_lossy().to_string());
    }

    (temp_files, temp_dir, dest_dir)
}

fn cleanup(temp_dir: &PathBuf, dest_dir: &PathBuf) {
    let _ = std::fs::remove_dir_all(temp_dir);
    let _ = std::fs::remove_dir_all(dest_dir);
}

fn main() {
    let file_count = 5; // Total 50MB
    let (temp_files, temp_dir, dest_dir) = setup_benchmark(file_count);

    // Test Sequential Copy (Baseline equivalent)
    let start_seq = Instant::now();
    for temp_path in &temp_files {
        let path = std::path::Path::new(temp_path);
        if let Some(file_name) = path.file_name() {
            let dest_path = dest_dir.join(file_name);
            std::fs::copy(path, &dest_path).unwrap();
        }
    }
    let duration_seq = start_seq.elapsed();
    println!("Sequential copy took: {:?}", duration_seq);

    // Clear dest dir for next test
    let _ = std::fs::remove_dir_all(&dest_dir);
    std::fs::create_dir_all(&dest_dir).unwrap();

    // Test Concurrent Blocking Async Copy (Optimized equivalent) using a tokio runtime
    let start_async = Instant::now();

    let rt = tokio::runtime::Builder::new_multi_thread()
        .enable_all()
        .build()
        .unwrap();

    rt.block_on(async {
        let mut handles: Vec<tokio::task::JoinHandle<()>> = Vec::with_capacity(temp_files.len());
        for temp_path in &temp_files {
            let dest_dir_clone = dest_dir.clone();
            let path_clone = temp_path.clone();
            let handle = tokio::task::spawn_blocking(move || {
                let path = std::path::Path::new(&path_clone);
                if let Some(file_name) = path.file_name() {
                    let dest_path = dest_dir_clone.join(file_name);
                    std::fs::copy(path, &dest_path).unwrap();
                }
            });
            handles.push(handle);
        }

        for handle in handles {
            handle.await.unwrap();
        }
    });

    let duration_async = start_async.elapsed();
    println!("Concurrent async copy took: {:?}", duration_async);

    cleanup(&temp_dir, &dest_dir);
}

use serde::{Deserialize, Serialize};
use std::fs;
use std::io::Write;
use std::path::PathBuf;
use std::process::Command;
use tauri::{AppHandle, Manager};

#[derive(Debug, Deserialize)]
pub struct ConvertRequest {
    pub markdown: String,
    pub output_path: Option<String>,
}

#[derive(Debug, Serialize)]
pub struct ConvertResponse {
    pub success: bool,
    pub file_path: Option<String>,
    pub error: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct SaveFileRequest {
    pub source_path: String,
    pub destination_path: String,
}

#[derive(Debug, Serialize)]
pub struct SaveFileResponse {
    pub success: bool,
    pub saved_path: Option<String>,
    pub error: Option<String>,
}

/// Find the pandoc executable - try multiple locations
fn find_pandoc(app: &AppHandle) -> Result<PathBuf, String> {
    // In development, try system pandoc first
    if cfg!(dev) {
        if let Ok(output) = Command::new("pandoc").arg("--version").output() {
            if output.status.success() {
                log::info!("Using system pandoc (dev mode)");
                return Ok(PathBuf::from("pandoc"));
            }
        }
    }

    // Try to resolve from app resources (production)
    let resource_path = app
        .path()
        .resolve("binaries/pandoc", tauri::path::BaseDirectory::Resource)
        .map_err(|e| format!("Failed to resolve resource path: {}", e))?;

    if resource_path.exists() {
        log::info!("Found pandoc at resource path: {:?}", resource_path);
        return Ok(resource_path);
    }

    // Fallback: try common installation paths
    let fallback_paths = [
        PathBuf::from("pandoc"),  // System PATH
        app.path()
            .resolve("pandoc", tauri::path::BaseDirectory::Resource)
            .unwrap_or_else(|_| PathBuf::from("pandoc")),
    ];

    for path in &fallback_paths {
        if path.exists() {
            log::info!("Found pandoc at fallback path: {:?}", path);
            return Ok(path.clone());
        }
    }

    // Last resort: assume pandoc is in PATH
    log::warn!("Using pandoc from PATH (may not exist)");
    Ok(PathBuf::from("pandoc"))
}

#[tauri::command]
pub async fn convert_markdown_to_docx(
    app: AppHandle,
    request: ConvertRequest,
) -> Result<ConvertResponse, String> {
    // Create a temporary file for the markdown input
    let temp_dir = std::env::temp_dir();
    let md_filename = format!("md2docx_{}.md", uuid::Uuid::new_v4());
    let md_path = temp_dir.join(&md_filename);

    // Write markdown content to temp file
    let mut md_file = fs::File::create(&md_path).map_err(|e| e.to_string())?;
    md_file.write_all(request.markdown.as_bytes()).map_err(|e| e.to_string())?;
    log::info!("Created temp markdown file: {:?}", md_path);

    // Determine output path
    let output_path = if let Some(path) = request.output_path {
        PathBuf::from(path)
    } else {
        let docx_filename = format!("md2docx_{}.docx", uuid::Uuid::new_v4());
        temp_dir.join(&docx_filename)
    };
    log::info!("Output path will be: {:?}", output_path);

    // Find pandoc - try multiple locations
    let pandoc_path = find_pandoc(&app)?;

    // Make sure the sidecar is executable on Unix-like systems
    #[cfg(unix)]
    if pandoc_path.is_absolute() {
        use std::os::unix::fs::PermissionsExt;
        let metadata = fs::metadata(&pandoc_path)
            .map_err(|e| format!("Failed to read pandoc metadata: {}", e))?;
        let mut perms = metadata.permissions();
        perms.set_mode(perms.mode() | 0o755);
        fs::set_permissions(&pandoc_path, perms).map_err(|e| e.to_string())?;
    }

    // Build and execute the pandoc command
    log::info!("Running pandoc: {:?} --from markdown --to docx", pandoc_path);
    let output = Command::new(&pandoc_path)
        .arg("--from")
        .arg("markdown")
        .arg("--to")
        .arg("docx")
        .arg(&md_path)
        .arg("-o")
        .arg(&output_path)
        .output()
        .map_err(|e| format!("Failed to execute pandoc: {}", e))?;

    log::info!("Pandoc exit status: {:?}", output.status);
    if !output.stdout.is_empty() {
        log::info!("Pandoc stdout: {}", String::from_utf8_lossy(&output.stdout));
    }
    if !output.stderr.is_empty() {
        log::warn!("Pandoc stderr: {}", String::from_utf8_lossy(&output.stderr));
    }

    // Clean up the temp markdown file
    let _ = fs::remove_file(&md_path);

    if output.status.success() {
        // Verify the output file exists
        if !output_path.exists() {
            return Ok(ConvertResponse {
                success: false,
                file_path: None,
                error: Some("Pandoc reported success but output file was not created".to_string()),
            });
        }

        Ok(ConvertResponse {
            success: true,
            file_path: Some(output_path.to_string_lossy().to_string()),
            error: None,
        })
    } else {
        let stderr = String::from_utf8_lossy(&output.stderr);
        Ok(ConvertResponse {
            success: false,
            file_path: None,
            error: Some(format!("Pandoc error: {}", stderr)),
        })
    }
}

/// Save file to user-specified location
#[tauri::command]
pub async fn save_file_to_location(
    _app: AppHandle,
    request: SaveFileRequest,
) -> Result<SaveFileResponse, String> {
    let source = PathBuf::from(&request.source_path);
    let dest = PathBuf::from(&request.destination_path);

    if !source.exists() {
        return Ok(SaveFileResponse {
            success: false,
            saved_path: None,
            error: Some("Source file does not exist".to_string()),
        });
    }

    fs::copy(&source, &dest).map_err(|e| format!("Failed to copy file: {}", e))?;

    Ok(SaveFileResponse {
        success: true,
        saved_path: Some(dest.to_string_lossy().to_string()),
        error: None,
    })
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_find_pandoc_exists() {
        // Test that pandoc is available on the system
        let result = Command::new("pandoc").arg("--version").output();
        assert!(result.is_ok(), "Pandoc should be available on the system");
    }
}

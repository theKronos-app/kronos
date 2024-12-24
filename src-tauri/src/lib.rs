use tauri_specta::Event;
use tauri_plugin_sql::{Builder, Migration, MigrationKind};

// demo command
#[tauri::command]
#[specta::specta]
fn greet(app: tauri::AppHandle, name: &str) -> String {
    DemoEvent("Demo event fired from Rust 🦀".to_string())
        .emit(&app)
        .ok();
    format!("Hello, {}! You've been greeted from Rust!", name)
}

// demo event
#[derive(serde::Serialize, serde::Deserialize, Debug, Clone, specta::Type, Event)]
pub struct DemoEvent(String);

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
 // let's add the note and task migrations, AI! 
    let migrations = vec![  
        Migration {  
            version: 1,  
            description: "create users table",  
            sql: "CREATE TABLE IF NOT EXISTS users (  
                id INTEGER PRIMARY KEY AUTOINCREMENT,  
                name TEXT NOT NULL,  
                email TEXT  
            )",  
            kind: MigrationKind::Up,  
        }  
    ];  

    #[cfg(debug_assertions)]
    {
        log::info!("App started!");
        log::warn!("Example Rust Log: warning!");
        log::error!("Example Rust Log: error!");
    }

    #[cfg(debug_assertions)]
    let devtools = tauri_plugin_devtools::init();
    let mut builder = tauri::Builder::default()
        .plugin(tauri_plugin_sql::Builder::default()
                .add_migrations("sqlite:kronoshpere.db", migrations).build())
        .plugin(tauri_plugin_store::Builder::new().build());

    let specta_builder = tauri_specta::Builder::<tauri::Wry>::new()
        .commands(tauri_specta::collect_commands![greet])
        .events(tauri_specta::collect_events![crate::DemoEvent]);

    #[cfg(debug_assertions)]
    {
        builder = builder.plugin(devtools);
    }

    #[cfg(all(debug_assertions, not(mobile)))]
    specta_builder
        .export(
            specta_typescript::Typescript::default()
                .formatter(specta_typescript::formatter::prettier),
            "../src/bindings.ts",
        )
        .expect("failed to export typescript bindings");

    builder
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .invoke_handler(specta_builder.invoke_handler())
        .setup(move |app| {
            specta_builder.mount_events(app);

            // listen to demo event
            DemoEvent::listen(app, |event| {
                log::info!("DemoEvent received in Rust:: {:?}", event.payload);
            });

            // dispatch demo event
            DemoEvent("Hello from Rust 🦀".to_string()).emit(app).ok();
            // /dispatch demo event

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

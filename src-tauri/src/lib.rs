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
    let migrations = vec![
        Migration {
            version: 1,
            description: "create notes table",
            sql: "CREATE TABLE IF NOT EXISTS notes (
                id TEXT PRIMARY KEY,
                content TEXT,
                created_at INTEGER,
                modified_at INTEGER,
                type TEXT,
                tags TEXT,
                properties JSON
            )",
            kind: MigrationKind::Up,
        },
        Migration {
            version: 2,
            description: "create tasks table",
            sql: "CREATE TABLE IF NOT EXISTS tasks (
                id TEXT PRIMARY KEY,
                title TEXT NOT NULL,
                notes TEXT,
                is_done INTEGER,
                created_at INTEGER,
                done_at INTEGER,
                journal_date TEXT NOT NULL,
                tags TEXT,
                priority INTEGER DEFAULT 0
            )",
            kind: MigrationKind::Up,
        },
        Migration {
            version: 3,
            description: "add path column to notes table",
            sql: "ALTER TABLE notes ADD COLUMN path TEXT",
            kind: MigrationKind::Up,
        },
        Migration {
            version: 4,
            description: "create users table",
            sql: "CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                email TEXT
            )",
            kind: MigrationKind::Up,
        },
        Migration {
            version: 5,
            description: "add ai_insights column to notes table",
            sql: "ALTER TABLE notes ADD COLUMN ai_insights TEXT",
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

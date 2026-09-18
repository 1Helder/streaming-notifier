import Database from 'better-sqlite3';

const db = new Database('filmes.db');

db.exec(`
  CREATE TABLE IF NOT EXISTS filmes_vigiados (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tmdb_id INTEGER NOT NULL,
    titulo TEXT NOT NULL,
    poster_path TEXT,
    chat_id INTEGER NOT NULL,
    notificado INTEGER DEFAULT 0,
    criado_em TEXT DEFAULT CURRENT_TIMESTAMP
  )
`);

export default db;
CREATE TABLE IF NOT EXISTS subscribers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE,
  token TEXT NOT NULL UNIQUE,      -- secret used in each subscriber's unsubscribe link
  created_at INTEGER NOT NULL,
  unsubscribed_at INTEGER
);

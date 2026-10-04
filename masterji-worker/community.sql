CREATE TABLE IF NOT EXISTS community_items (
 path TEXT NOT NULL, id TEXT NOT NULL, owner TEXT NOT NULL,
 data TEXT NOT NULL, created INTEGER NOT NULL,
 PRIMARY KEY(path,id)
);
CREATE INDEX IF NOT EXISTS community_items_path_created ON community_items(path,created DESC);
CREATE TABLE IF NOT EXISTS community_notes (id TEXT PRIMARY KEY, owner TEXT NOT NULL, title TEXT NOT NULL);
CREATE INDEX IF NOT EXISTS community_notes_owner ON community_notes(owner);
CREATE TABLE IF NOT EXISTS community_views (note TEXT NOT NULL, viewer TEXT NOT NULL, day TEXT NOT NULL, PRIMARY KEY(note,viewer,day));
CREATE TABLE IF NOT EXISTS community_likes (note TEXT NOT NULL, viewer TEXT NOT NULL, PRIMARY KEY(note,viewer));

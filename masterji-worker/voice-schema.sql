CREATE TABLE IF NOT EXISTS voice_usage (
  month TEXT NOT NULL,
  family TEXT NOT NULL,
  characters INTEGER NOT NULL DEFAULT 0 CHECK(characters >= 0),
  PRIMARY KEY (month, family)
);

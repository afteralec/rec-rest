CREATE TABLE IF NOT EXISTS endorsements
(
  id              INTEGER NOT NULL PRIMARY KEY,
  created_at      DATETIME DEFAULT(STRFTIME('%Y-%m-%dT%H:%M:%fZ', 'NOW')),
  updated_at      DATETIME DEFAULT(STRFTIME('%Y-%m-%dT%H:%M:%fZ', 'NOW')),
  tag             TEXT NOT NULL
);
CREATE UNIQUE INDEX endorsement_tag_key ON "endorsements"("tag");

CREATE TABLE IF NOT EXISTS restaurants 
(
  id              INTEGER NOT NULL PRIMARY KEY,
  created_at      DATETIME DEFAULT(STRFTIME('%Y-%m-%dT%H:%M:%fZ', 'NOW')),
  updated_at      DATETIME DEFAULT(STRFTIME('%Y-%m-%dT%H:%M:%fZ', 'NOW')),
  name            TEXT NOT NULL
);
CREATE UNIQUE INDEX restaurant_name_key ON "restaurants"("name");

CREATE TABLE IF NOT EXISTS restaurant_configs
(
  id              INTEGER NOT NULL PRIMARY KEY,
  created_at      DATETIME DEFAULT(STRFTIME('%Y-%m-%dT%H:%M:%fZ', 'NOW')),
  updated_at      DATETIME DEFAULT(STRFTIME('%Y-%m-%dT%H:%M:%fZ', 'NOW')),
  restaurant_id   INTEGER NOT NULL,
  zone            TEXT NOT NULL DEFAULT "America/Los_Angeles"
);
CREATE UNIQUE INDEX restaurant_configs_restaurant_id ON "restaurant_configs"("restaurant_id");

CREATE TABLE IF NOT EXISTS restaurants_reservation_windows
(
  id              INTEGER NOT NULL PRIMARY KEY,
  created_at      DATETIME DEFAULT(STRFTIME('%Y-%m-%dT%H:%M:%fZ', 'NOW')),
  updated_at      DATETIME DEFAULT(STRFTIME('%Y-%m-%dT%H:%M:%fZ', 'NOW')),
  restaurant_id   INTEGER NOT NULL,
  start_hour      INTEGER NOT NULL,
  end_hour        INTEGER NOT NULL
);
CREATE INDEX restaurants_reservation_windows_restaurant_id ON "restaurants_reservation_windows"("restaurant_id");

CREATE TABLE IF NOT EXISTS restaurants_endorsements
(
  id              INTEGER NOT NULL PRIMARY KEY,
  restaurant_id   INTEGER NOT NULL,
  endorsement_id  INTEGER NOT NULL
);
CREATE UNIQUE INDEX restaurans_endorsements_restaurant_id_endorsement_id ON "restaurants_endorsements"(restaurant_id, endorsement_id);

CREATE TABLE IF NOT EXISTS tables
(
  id              INTEGER NOT NULL PRIMARY KEY,
  created_at      DATETIME DEFAULT(STRFTIME('%Y-%m-%dT%H:%M:%fZ', 'NOW')),
  updated_at      DATETIME DEFAULT(STRFTIME('%Y-%m-%dT%H:%M:%fZ', 'NOW')),
  restaurant_id   INTEGER NOT NULL,
  capacity        INTEGER NOT NULL,
  minimum         INTEGER NOT NULL
);
CREATE INDEX tables_restaurant_id ON "tables"("restaurant_id");

CREATE TABLE IF NOT EXISTS reservations
(
  id              INTEGER NOT NULL PRIMARY KEY,
  created_at      DATETIME DEFAULT(STRFTIME('%Y-%m-%dT%H:%M:%fZ', 'NOW')),
  table_id        INTEGER NOT NULL,
  start           TEXT NOT NULL,
  end             TEXT NOT NULL,
  canceled        INTEGER DEFAULT "FALSE" 
);
CREATE INDEX reservations_table_id ON "reservations"("table_id");

CREATE TABLE IF NOT EXISTS diners
(
  id              INTEGER NOT NULL PRIMARY KEY,
  created_at      DATETIME DEFAULT(STRFTIME('%Y-%m-%dT%H:%M:%fZ', 'NOW')),
  updated_at      DATETIME DEFAULT(STRFTIME('%Y-%m-%dT%H:%M:%fZ', 'NOW')),
  name            TEXT NOT NULL
);
CREATE INDEX diners_name ON "diners"("name");

CREATE TABLE IF NOT EXISTS diners_endorsements
(
  id              INTEGER NOT NULL PRIMARY KEY,
  diner_id        INTEGER NOT NULL,
  endorsement_id  INTEGER NOT NULL
);
CREATE UNIQUE INDEX diners_endorsements_diner_id_endorsement_id ON "diners_endorsements"(diner_id, endorsement_id);

CREATE TABLE IF NOT EXISTS diners_reservations
(
  id              INTEGER NOT NULL PRIMARY KEY,
  diner_id        INTEGER NOT NULL,
  reservation_id  INTEGER NOT NULL
);
CREATE UNIQUE INDEX diners_reservations_diner_id_reservation_id ON "diners_reservations"(diner_id, reservation_id);

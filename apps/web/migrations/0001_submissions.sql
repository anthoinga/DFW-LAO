-- Sensitive submissions. Access is limited to the Access-protected /admin area.
CREATE TABLE assistance_requests (
	id TEXT PRIMARY KEY,
	received_at TEXT NOT NULL DEFAULT (datetime('now')),
	locale TEXT NOT NULL,
	first_name TEXT NOT NULL,
	last_name TEXT NOT NULL,
	email TEXT,
	phone TEXT,
	programs TEXT NOT NULL, -- JSON array
	details TEXT,
	preferred_language TEXT,
	consent_at TEXT NOT NULL,
	purge_after TEXT NOT NULL
);

CREATE TABLE camp_registrations (
	id TEXT PRIMARY KEY,
	received_at TEXT NOT NULL DEFAULT (datetime('now')),
	locale TEXT NOT NULL,
	season_year INTEGER NOT NULL,
	parent_name TEXT NOT NULL,
	parent_email TEXT NOT NULL,
	parent_phone TEXT NOT NULL,
	emergency_name TEXT NOT NULL,
	emergency_phone TEXT NOT NULL,
	volunteer_interest INTEGER NOT NULL DEFAULT 0,
	comments TEXT,
	photo_release INTEGER NOT NULL,
	liability_consent_at TEXT NOT NULL,
	purge_after TEXT NOT NULL
);

CREATE TABLE camp_children (
	id TEXT PRIMARY KEY,
	registration_id TEXT NOT NULL REFERENCES camp_registrations(id) ON DELETE CASCADE,
	first_name TEXT NOT NULL,
	last_name TEXT NOT NULL,
	age INTEGER NOT NULL,
	tshirt_size TEXT NOT NULL,
	allergies_medical TEXT
);

CREATE INDEX idx_assistance_purge ON assistance_requests(purge_after);
CREATE INDEX idx_camp_purge ON camp_registrations(purge_after);
CREATE INDEX idx_children_registration ON camp_children(registration_id);

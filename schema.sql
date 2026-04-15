-- D1 Database Schema for Klementina Tattoo Form Submissions
-- Run this in your Cloudflare D1 dashboard or via wrangler

CREATE TABLE IF NOT EXISTS submissions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    full_name TEXT NOT NULL,
    preference TEXT DEFAULT 'email', -- 'email', 'phone', or 'both'
    email TEXT,
    phone TEXT,
    description TEXT NOT NULL,
    existing_tattoos TEXT,
    palette TEXT, -- 'black' or 'color'
    style TEXT, -- 'linework' or 'shadow'
    days TEXT, -- JSON array of selected days
    preferred_time TEXT, -- 'morning', 'afternoon', 'evening'
    preferred_datetime TEXT,
    budget TEXT,
    extra_info TEXT,
    language TEXT DEFAULT 'en', -- 'en' or 'de'
    photo_url TEXT,
    reference_url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    status TEXT DEFAULT 'new' -- 'new', 'reviewed', 'contacted', 'booked', 'archived'
);

-- Index for common queries
CREATE INDEX IF NOT EXISTS idx_status ON submissions(status);
CREATE INDEX IF NOT EXISTS idx_created_at ON submissions(created_at);
CREATE INDEX IF NOT EXISTS idx_language ON submissions(language);

-- Optional: Create a view for admin dashboard
CREATE VIEW IF NOT EXISTS recent_submissions AS
SELECT 
    id,
    full_name,
    preference,
    email,
    phone,
    SUBSTR(description, 1, 100) as description_preview,
    days,
    preferred_datetime,
    language,
    created_at,
    status,
    CASE 
        WHEN photo_url IS NOT NULL OR reference_url IS NOT NULL THEN 1 
        ELSE 0 
    END as has_attachments
FROM submissions
ORDER BY created_at DESC;

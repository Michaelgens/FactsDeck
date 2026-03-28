-- Add content column for storing markdown inline (no Blob)
ALTER TABLE posts ADD COLUMN IF NOT EXISTS content TEXT;

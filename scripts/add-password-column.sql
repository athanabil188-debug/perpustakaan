-- Add password column to members table for proper authentication

ALTER TABLE members 
ADD COLUMN password_hash VARCHAR(255) NULL;

-- Update existing records if needed (you can add default values here if necessary)
-- UPDATE members SET password_hash = '$2a$10$defaultpasswordhash' WHERE password_hash IS NULL;
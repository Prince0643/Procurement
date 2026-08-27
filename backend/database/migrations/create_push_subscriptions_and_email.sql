-- Add email column to users if it doesn't exist (using a safe approach for MySQL if possible, but standard ADD COLUMN usually errors if it exists. Since this is a simple script, we'll just add it)
-- Note: MySQL does not support "ADD COLUMN IF NOT EXISTS" cleanly outside of stored procedures before 8.0.28, we'll just try to add it.
ALTER TABLE users ADD COLUMN IF NOT EXISTS email VARCHAR(255) NULL;

-- Create push_subscriptions table
CREATE TABLE IF NOT EXISTS push_subscriptions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    endpoint TEXT NOT NULL,
    p256dh VARCHAR(255) NOT NULL,
    auth VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

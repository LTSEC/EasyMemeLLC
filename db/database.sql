-- Create the database if it doesn't already exist
CREATE DATABASE IF NOT EXISTS MemeUsers;

-- Use the MemeUsers database
USE MemeUsers;

-- Table for users
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL, -- Store hashed passwords
    birthday DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    admin BOOLEAN DEFAULT FALSE, -- Admin flag
    subscriber_count INT DEFAULT 0 -- Tracks the number of subscribers
);

-- Table for posts
CREATE TABLE posts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL, -- Foreign key referencing users
    title VARCHAR(255), -- Title of the post
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    likes INT DEFAULT 0, -- Number of likes
    views INT DEFAULT 0, -- Number of views
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Table for subscriptions
CREATE TABLE subscriptions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL, -- The user being subscribed to
    subscriber_id INT NOT NULL, -- The user subscribing
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (subscriber_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE (user_id, subscriber_id) -- Prevent duplicate subscriptions
);

-- Trigger to increment subscriber_count after a subscription is added
CREATE TRIGGER after_subscription_insert
AFTER INSERT ON subscriptions
FOR EACH ROW
BEGIN
    UPDATE users 
    SET subscriber_count = subscriber_count + 1 
    WHERE id = NEW.user_id;
END;

-- Trigger to decrement subscriber_count after a subscription is removed
CREATE TRIGGER after_subscription_delete
AFTER DELETE ON subscriptions
FOR EACH ROW
BEGIN
    UPDATE users 
    SET subscriber_count = subscriber_count - 1 
    WHERE id = OLD.user_id;
END;

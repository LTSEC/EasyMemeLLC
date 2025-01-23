CREATE DATABASE IF NOT EXISTS MemeUsers;

USE MemeUsers;

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,         -- Unique identifier for each user
    username VARCHAR(50) NOT NULL UNIQUE,      -- Username, must be unique
    email VARCHAR(100) NOT NULL UNIQUE,        -- Email, must be unique
    birthday DATE NOT NULL,                    -- Date of birth
    password VARCHAR(255) NOT NULL,            -- Password (should be hashed)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP -- Timestamp of account creation
);

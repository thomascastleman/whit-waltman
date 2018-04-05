
DROP DATABASE IF EXISTS whit_waltman;
CREATE DATABASE whit_waltman;

USE whit_waltman;

-- to temporarily record whether a passage is real or fake
CREATE TABLE passages (
	uid INT NOT NULL AUTO_INCREMENT,
	whitman_status TINYINT,
	PRIMARY KEY (uid)
);

-- to track correct and incorrect responses over time
CREATE TABLE responses (
	description VARCHAR(32) NOT NULL UNIQUE,
	count INT
);

-- set up response table
INSERT INTO responses (description, count) VALUES
("correct", 0),
("incorrect", 0);
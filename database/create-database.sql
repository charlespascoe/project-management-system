# Author: Charles Pascoe
# Version: 0.13.0
# Last Modified: 22/04/2016

# Drop the existing database (this is a create script, not an update script!)
DROP DATABASE IF EXISTS `proj_mgr`;

# Set the storage engine for this session (i.e. to run the script)
SET default_storage_engine = INNODB;

# Create the database
CREATE DATABASE `proj_mgr`
    DEFAULT CHARACTER SET utf8
    DEFAULT COLLATE utf8_general_ci;

# Switch to the database
USE `proj_mgr`;

# Create Tables

CREATE TABLE `user` (
    `user_id` int(11) NOT NULL AUTO_INCREMENT,
    `email` varchar(128) NOT NULL UNIQUE,
    `first_name` varchar(64) NOT NULL,
    `other_names` varchar(128) NOT NULL,
    `pass_hash` varchar(256) NOT NULL,
    `active` bool NOT NULL DEFAULT TRUE,
    `sysadmin` bool NOT NULL DEFAULT FALSE,

    PRIMARY KEY (`user_id`)
);

CREATE TABLE `authentication_token_pair` (
    `token_id` int(11) NOT NULL AUTO_INCREMENT,
    `user_id` int(11) NOT NULL,
    `access_token_hash` varchar(128) NOT NULL,
    `access_token_expires` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `refresh_token_hash` varchar(128) NOT NULL,
    `refresh_token_expires` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `sysadmin_elevation_expires` timestamp NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (`token_id`),

    CONSTRAINT `authenticated_user_fk`
        FOREIGN KEY (`user_id`)
        REFERENCES `user` (`user_id`)
        ON DELETE CASCADE
);

CREATE TABLE `project` (
    `project_id` int(11) NOT NULL AUTO_INCREMENT,
    `project_name` varchar(64) NOT NULL UNIQUE,
    `completed` bool NOT NULL DEFAULT FALSE,

    PRIMARY KEY (`project_id`)
);

CREATE TABLE `role` (
    `role_id` int(11) NOT NULL AUTO_INCREMENT,
    `role_name` varchar(64) NOT NULL UNIQUE,

    PRIMARY KEY (`role_id`)
);

CREATE TABLE `permission` (
    `permission_id` int(11) NOT NULL AUTO_INCREMENT,
    `permission_key` varchar(64) NOT NULL UNIQUE,
    `description` varchar(256) NOT NULL,

    PRIMARY KEY (`permission_id`)
);

CREATE TABLE `role_permission` (
    `role_id` int(11) NOT NULL,
    `permission_id` int(11) NOT NULL,

    CONSTRAINT `role_permission_permission_fk`
        FOREIGN KEY (`permission_id`)
        REFERENCES `permission` (`permission_id`)
        ON DELETE CASCADE,

    CONSTRAINT `role_permission_role_fk`
        FOREIGN KEY (`role_id`)
        REFERENCES `role` (`role_id`)
        ON DELETE CASCADE
);

CREATE TABLE `project_assignment` (
    `user_id` int(11) NOT NULL,
    `project_id` int (11) NOT NULL,
    `role_id` int(11) NOT NULL,

    PRIMARY KEY (`user_id`, `project_id`),

    CONSTRAINT `assigned_user_fk`
        FOREIGN KEY (`user_id`)
        REFERENCES `user` (`user_id`)
        ON DELETE CASCADE,

    CONSTRAINT `assigned_project_fk`
        FOREIGN KEY (`project_id`)
        REFERENCES `project` (`project_id`)
        ON DELETE CASCADE,

    CONSTRAINT `assigned_role_fk`
        FOREIGN KEY (`role_id`)
        REFERENCES `role` (`role_id`)
);

CREATE TABLE `task` (
    `project_id` int(11) NOT NULL,
    `task_id` int(11) NOT NULL,
    `task_summary` varchar(256) NOT NULL,
    `task_desc` mediumtext NOT NULL,
    `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `target_completion` date,
    `complexity` int(2) NOT NULL,
    `completed` timestamp NULL DEFAULT NULL,
    `priority` tinyint(1) NOT NULL DEFAULT 4,
    `est_effort` int(6) NOT NULL DEFAULT 0,
    `assigned_user_id` int(11) NOT NULL,

    PRIMARY KEY (`project_id`, `task_id`),

    CONSTRAINT `task_project_fk`
        FOREIGN KEY (`project_id`)
        REFERENCES `project` (`project_id`)
        ON DELETE CASCADE,

    CONSTRAINT `task_user_fk`
        FOREIGN KEY (`assigned_user_id`)
        REFERENCES `user` (`user_id`)
);

CREATE TABLE `log` (
    `project_id` int(11) NOT NULL,
    `task_id` int(11) NOT NULL,
    `log_id` int(11) NOT NULL,
    `log_user_id` int(11) NOT NULL,
    `log_desc` mediumtext NOT NULL,
    `log_effort` int(6) NOT NULL DEFAULT 0,
    `log_timestamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (`project_id`, `task_id`, `log_id`),

    CONSTRAINT `log_task_fk`
        FOREIGN KEY (`project_id`, `task_id`)
        REFERENCES `task` (`project_id`, `task_id`)
        ON DELETE CASCADE,

    CONSTRAINT `log_user_fk`
        FOREIGN KEY (`log_user_id`)
        REFERENCES `user` (`user_id`)
);

# Functions

DELIMITER ;;

CREATE FUNCTION NEXT_TASK_ID(proj_id int(11)) RETURNS int(11)
BEGIN
    SET @next_id = NULL;

    SELECT MAX(`task_id`) + 1
        FROM `task`
        WHERE `task`.`project_id` = proj_id
        INTO @next_id;

    IF (@next_id IS NULL) THEN
        SET @next_id = 1;
    END IF;

    RETURN @next_id;
END;;

CREATE FUNCTION NEXT_LOG_ID(proj_id int(11), tsk_id int(11)) RETURNS int(11)
BEGIN
    SET @next_id = NULL;

    SELECT MAX(`log_id`) + 1
        FROM `log`
        WHERE `log`.`project_id` = proj_id AND `log`.`task_id` = tsk_id
        INTO @next_id;

    IF (@next_id IS NULL) THEN
        SET @next_id = 1;
    END IF;

    RETURN @next_id;
END;;

CREATE FUNCTION REMAINING_EFFORT(proj_id int(11), tsk_id int(11)) RETURNS int(11)
BEGIN
    SET @result = NULL;

    SELECT `task`.`est_effort` - COALESCE(SUM(`log`.`log_effort`), 0)
        FROM `task`
        LEFT JOIN `log`
            ON `log`.`task_id` = `task`.`task_id`
            AND `log`.`project_id` = `task`.`project_id`
        WHERE `task`.`task_id` = tsk_id
            AND `task`.`project_id` = proj_id
        GROUP BY `task`.`task_id`, `task`.`project_id`
        INTO @result;

    IF (@result IS NULL) THEN
        SET @result = 0;
    END IF;

    # Negative not valid, so return 0 instead
    RETURN GREATEST(@result, 0);
END;;

DELIMITER ;


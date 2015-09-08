DROP SCHEMA IF EXISTS `carbono` ;
CREATE SCHEMA IF NOT EXISTS `carbono` DEFAULT CHARACTER SET utf8 ;
USE `carbono`;

--
-- Table structure for table `access_level`
--
CREATE TABLE IF NOT EXISTS `access_level` (
  `id` int(11) UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  `description` text,
  PRIMARY KEY (`id`)
)
ENGINE = InnoDB
AUTO_INCREMENT = 0
DEFAULT CHARACTER SET = utf8;

--
-- Table structure for table `account_type`
--
CREATE TABLE IF NOT EXISTS `account_type` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(20) NOT NULL,
  `description` text,
  PRIMARY KEY (`id`),
  UNIQUE KEY `account_name` (`name`)
)
ENGINE = InnoDB
AUTO_INCREMENT = 0
DEFAULT CHARACTER SET = utf8;

--
-- Table structure for table `user`
--
CREATE TABLE IF NOT EXISTS `user` (
  `id` int(11) UNSIGNED NOT NULL AUTO_INCREMENT,
  `active` bit(1) NOT NULL DEFAULT 0,
  `modified` datetime DEFAULT NULL,
  `last_login` TIMESTAMP DEFAULT 0 ON UPDATE CURRENT_TIMESTAMP,
  `email` varchar(100) NOT NULL,
  `password` varchar(100) NOT NULL,
  UNIQUE INDEX `id` (`id` ASC),
  UNIQUE INDEX `email` (`email` ASC),
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_email` (`email`)
)
ENGINE = InnoDB
AUTO_INCREMENT = 0
DEFAULT CHARACTER SET = utf8;

--
-- Table structure for table `profile`
--
CREATE TABLE IF NOT EXISTS `profile` (
  `id` int(11) UNSIGNED NOT NULL AUTO_INCREMENT,
  `code` varchar(40),
  `account_id` int(11) DEFAULT NULL,
  `first_name` varchar(200),
  `last_name` varchar(200),
  `created` datetime DEFAULT NULL,
  `modified` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `account_id` (`account_id`),
  UNIQUE KEY `profile_code` (`code`),
  FOREIGN KEY (`account_id`) REFERENCES `account_type` (`id`) ON DELETE SET NULL
)
ENGINE = InnoDB
AUTO_INCREMENT = 0
DEFAULT CHARACTER SET = utf8;

--
-- Table structure for table `profile_user`
--
CREATE TABLE IF NOT EXISTS `profile_user` (
  `id` int(11) UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` int(11) UNSIGNED,
  `profile_id` int(11) UNSIGNED,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE SET NULL,
  FOREIGN KEY (`profile_id`) REFERENCES `profile` (`id`) ON DELETE SET NULL
)
ENGINE = InnoDB
AUTO_INCREMENT = 0
DEFAULT CHARACTER SET = utf8;

--
-- Table structure for table `project`
--
CREATE TABLE IF NOT EXISTS `project` (
  `id` int(11) UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` varchar(100),
  `safe_name` varchar(80) DEFAULT NULL,
  `description` text,
  `created` datetime DEFAULT NULL,
  `modified` datetime DEFAULT NULL,
  `owner` int(11) UNSIGNED,
  PRIMARY KEY (`id`),
  UNIQUE KEY `safe_name_unique` (`safe_name`),
  CONSTRAINT `project_owner` FOREIGN KEY (`owner`) REFERENCES `profile`(`id`) ON DELETE SET NULL
)
ENGINE = InnoDB
AUTO_INCREMENT = 0
DEFAULT CHARACTER SET = utf8;

--
-- Table structure for table `project_access`
--
CREATE TABLE IF NOT EXISTS `project_access` (
  `id` int(11) UNSIGNED NOT NULL AUTO_INCREMENT,
  `profile_id` int(11) UNSIGNED,
  `project_id` int(11) UNSIGNED,
  `access_type` int(11) UNSIGNED,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`profile_id`) REFERENCES `profile`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`project_id`) REFERENCES `project`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`access_type`) REFERENCES `access_level`(`id`) ON DELETE SET NULL
)
ENGINE = InnoDB
AUTO_INCREMENT = 0
DEFAULT CHARACTER SET = utf8;
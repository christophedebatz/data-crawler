CREATE SCHEMA `CRAWLER` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci ;

CREATE TABLE IF NOT EXISTS `CRAWLER`.`crawler_users_linkedin_step_1` (
  `id` INT(20) NOT NULL AUTO_INCREMENT,
  `crawler_id` INT(20) NOT NULL,
  `external_id` VARCHAR(90) DEFAULT NULL,
  `first_name` VARCHAR(65) NULL,
  `last_name` VARCHAR(125) NULL,
  `email` VARCHAR(125) NULL,
  `mobile` VARCHAR(15) NULL,
  `zipcode` CHAR(6) NULL,
  `city` VARCHAR(70) NULL,
  `job_position` VARCHAR(70) NULL,
  `job_company_sector` VARCHAR(45) NULL,
  `job_company_sub_sector` VARCHAR(45) NULL,
  `job_company_size` VARCHAR(45) NULL,
  `job_company_name` VARCHAR(45) NULL,
  `is_premium` TINYINT(1) NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
);

ALTER TABLE `CRAWLER`.`crawler_users_linkedin_step_1`
ADD INDEX `crawler_id-fk_idx` (`crawler_id` ASC);
ALTER TABLE `CRAWLER`.`crawler_users_linkedin_step_1`
ADD CONSTRAINT `crawler_id-fk`
  FOREIGN KEY (`crawler_id`)
  REFERENCES `CRAWLER`.`crawler_jobs` (`id`)
  ON DELETE CASCADE
  ON UPDATE CASCADE;

CREATE TABLE IF NOT EXISTS `CRAWLER`.`crawler_jobs` (
  `id` INT(20) NOT NULL AUTO_INCREMENT,
  `crawler_name` VARCHAR(80) NOT NULL,
  `input_file` VARCHAR(300) NOT NULL,
  `output_file` VARCHAR(300) DEFAULT NULL,
  `creation_date` TIMESTAMP DEFAULT NOW(),
  `start_date` TIMESTAMP DEFAULT NULL,
  `end_date` TIMESTAMP DEFAULT NULL,
  `crawler_path` VARCHAR(200) NOT NULL,
  `status` ENUM('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED') DEFAULT 'PENDING',
  `failure_cause` VARCHAR(350) DEFAULT NULL,
  `step` VARCHAR(40) DEFAULT NULL,
  `progress` TINYINT(3) DEFAULT 0,
  PRIMARY KEY (`id`)
);

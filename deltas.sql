CREATE TABLE `NUKE`.`crawler_users_linkedin_step_1` (
  `id` INT(20) NOT NULL,
  `external_id` VARCHAR DEFAULT NULL,
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

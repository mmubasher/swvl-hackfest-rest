CREATE DATABASE  IF NOT EXISTS `remotebasehqhackathon` /*!40100 DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `remotebasehqhackathon`;
-- MySQL dump 10.13  Distrib 8.0.22, for macos10.15 (x86_64)
--
-- Host: localhost    Database: remotebasehqhackathon
-- ------------------------------------------------------
-- Server version	8.0.23

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `jf_configs`
--

DROP TABLE IF EXISTS `jf_configs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8 */;
CREATE TABLE `jf_configs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `status` bit(1) DEFAULT b'1',
  `isDeleted` bit(1) DEFAULT b'0',
  `createdAt` datetime DEFAULT NULL,
  `updatedAt` datetime DEFAULT NULL,
  `createdBy` int DEFAULT NULL,
  `updatedBy` int DEFAULT NULL,
  `imageURLs` text,
  `version` text,
  `updated` datetime DEFAULT NULL,
  `buildUpdatediOS` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `jf_faqs`
--

DROP TABLE IF EXISTS `jf_faqs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8 */;
CREATE TABLE `jf_faqs` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `question` text,
  `answer` text,
  `status` bit(1) DEFAULT b'1',
  `isDeleted` bit(1) DEFAULT b'0',
  `createdAt` datetime DEFAULT NULL,
  `updatedAt` datetime DEFAULT NULL,
  `createdBy` int DEFAULT NULL,
  `updatedBy` int DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `jf_fellow_travellers`
--

DROP TABLE IF EXISTS `jf_fellow_travellers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8 */;
CREATE TABLE `jf_fellow_travellers` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `userId1` int NOT NULL,
  `userId2` int NOT NULL,
  `isDeleted` bit(1) DEFAULT b'0',
  `createdAt` datetime DEFAULT NULL,
  `updatedAt` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_jf_fellow_travellers_jf_users1_idx` (`userId1`),
  KEY `fk_jf_fellow_travellers_jf_users2_idx` (`userId2`),
  CONSTRAINT `fk_jf_fellow_travellers_jf_users1` FOREIGN KEY (`userId1`) REFERENCES `jf_users` (`id`),
  CONSTRAINT `fk_jf_fellow_travellers_jf_users2` FOREIGN KEY (`userId2`) REFERENCES `jf_users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `jf_friends`
--

DROP TABLE IF EXISTS `jf_friends`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8 */;
CREATE TABLE `jf_friends` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `userId` int NOT NULL,
  `friendUserId` int NOT NULL,
  `acceptRequest` BIT NULL,
  `isDeleted` bit(1) DEFAULT b'0',
  `createdAt` datetime DEFAULT NULL,
  `updatedAt` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_jf_notifications_jf_users1_idx` (`userId`),
  KEY `fk_jf_friends_jf_users1_idx` (`friendUserId`),
  CONSTRAINT `fk_jf_friends_jf_users1` FOREIGN KEY (`userId`) REFERENCES `jf_users` (`id`),
  CONSTRAINT `fk_jf_friends_jf_users2` FOREIGN KEY (`friendUserId`) REFERENCES `jf_users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `jf_index_info`
--

DROP TABLE IF EXISTS `jf_index_info`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8 */;
CREATE TABLE `jf_index_info` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `userId` int NOT NULL,
  `traitAppearanceAverage` double DEFAULT NULL,
  `traitPersonalityAverage` double DEFAULT NULL,
  `traitIntelligenceAverage` double DEFAULT NULL,
  `traitAppearanceTotal` double DEFAULT NULL,
  `traitPersonalityTotal` double DEFAULT NULL,
  `traitIntelligenceTotal` double DEFAULT NULL,
  `traitAppearanceAverageBk` double DEFAULT NULL,
  `traitPersonalityAverageBk` double DEFAULT NULL,
  `traitIntelligenceAverageBk` double DEFAULT NULL,
  `traitAppearanceTotalBk` double DEFAULT NULL,
  `traitPersonalityTotalBk` double DEFAULT NULL,
  `traitIntelligenceTotalBk` double DEFAULT NULL,
  `traitAppearanceCount` int DEFAULT NULL,
  `traitPersonalityCount` int DEFAULT NULL,
  `traitIntelligenceCount` int DEFAULT NULL,
  `status` bit(1) DEFAULT b'1',
  `isDeleted` bit(1) DEFAULT b'0',
  `createdAt` datetime DEFAULT NULL,
  `updatedAt` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_jf_index_info_jf_users1_idx` (`userId`),
  CONSTRAINT `fk_jf_index_info_jf_users10` FOREIGN KEY (`userId`) REFERENCES `jf_users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `jf_index_multiplier`
--

DROP TABLE IF EXISTS `jf_index_multiplier`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8 */;
CREATE TABLE `jf_index_multiplier` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `userId` int NOT NULL,
  `jfIndex` double DEFAULT NULL,
  `jfMultiplier` double DEFAULT NULL,
  `rateOfChange` double DEFAULT NULL,
  `appearanceAverage` double DEFAULT NULL,
  `intelligenceAverage` double DEFAULT NULL,
  `personalityAverage` double DEFAULT NULL,
  `appearanceRateOfChange` double DEFAULT NULL,
  `intelligenceRateOfChange` double DEFAULT NULL,
  `personalityRateOfChange` double DEFAULT NULL,
  `status` bit(1) DEFAULT b'1',
  `isDeleted` bit(1) DEFAULT b'0',
  `createdAt` datetime DEFAULT NULL,
  `updatedAt` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_jf_index_info_jf_users1_idx` (`userId`),
  CONSTRAINT `fk_jf_index_info_jf_users100` FOREIGN KEY (`userId`) REFERENCES `jf_users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `jf_index_multiplier_history_daily`
--

DROP TABLE IF EXISTS `jf_index_multiplier_history_daily`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8 */;
CREATE TABLE `jf_index_multiplier_history_daily` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `userId` int NOT NULL,
  `jfIndex` double DEFAULT NULL,
  `jfMultiplier` double DEFAULT NULL,
  `appearanceAverage` double DEFAULT NULL,
  `intelligenceAverage` double DEFAULT NULL,
  `personalityAverage` double DEFAULT NULL,
  `status` bit(1) DEFAULT b'1',
  `isDeleted` bit(1) DEFAULT b'0',
  `processingTime` date DEFAULT NULL,
  `createdAt` datetime DEFAULT NULL,
  `updatedAt` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_jf_index_multiplier_history_daily_jf_users1_idx` (`userId`),
  CONSTRAINT `fk_jf_index_multiplier_history_daily_jf_users10` FOREIGN KEY (`userId`) REFERENCES `jf_users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `jf_index_multiplier_history_hourly`
--

DROP TABLE IF EXISTS `jf_index_multiplier_history_hourly`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8 */;
CREATE TABLE `jf_index_multiplier_history_hourly` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `userId` int NOT NULL,
  `jfIndex` double DEFAULT NULL,
  `jfMultiplier` double DEFAULT NULL,
  `appearanceAverage` double DEFAULT NULL,
  `intelligenceAverage` double DEFAULT NULL,
  `personalityAverage` double DEFAULT NULL,
  `status` bit(1) DEFAULT b'1',
  `isDeleted` bit(1) DEFAULT b'0',
  `processingTime` date DEFAULT NULL,
  `createdAt` datetime DEFAULT NULL,
  `updatedAt` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_jf_index_multiplier_history_hourly_jf_users1_idx` (`userId`),
  CONSTRAINT `fk_jf_index_multiplier_history_hourly_jf_users1` FOREIGN KEY (`userId`) REFERENCES `jf_users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `jf_multiplier_info`
--

DROP TABLE IF EXISTS `jf_multiplier_info`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8 */;
CREATE TABLE `jf_multiplier_info` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `userId` int NOT NULL,
  `isCaptainProfile` bit(1) DEFAULT NULL,
  `anonymousRatingGiven` bit(1) DEFAULT NULL,
  `acceptAnonymousFeedback` bit(1) DEFAULT NULL,
  `ratingsRequested` int DEFAULT NULL,
  `peopleInvited` int DEFAULT NULL,
  `ratingsGiven` int DEFAULT NULL,
  `friendCount` int DEFAULT NULL,
  `ratingsReceived` int DEFAULT NULL,
  `lastActivityTime` datetime DEFAULT NULL,
  `loginDays` int DEFAULT NULL,
  `lastRatingGiven` datetime DEFAULT NULL,
  `signupTime` datetime DEFAULT NULL,
  `lastRatingRequested` datetime DEFAULT NULL,
  `status` bit(1) DEFAULT b'1',
  `isDeleted` bit(1) DEFAULT b'0',
  `createdAt` datetime DEFAULT NULL,
  `updatedAt` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_jf_index_info_jf_users1_idx` (`userId`),
  CONSTRAINT `fk_jf_index_info_jf_users1` FOREIGN KEY (`userId`) REFERENCES `jf_users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `jf_notifications`
--

DROP TABLE IF EXISTS `jf_notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8 */;
CREATE TABLE `jf_notifications` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `userId` int NOT NULL,
  `fromUserId` int DEFAULT NULL,
  `notificationType` enum('ratingRequested','userRated','anonymousRated','inviteAccepted','ratingRequestedAgain','followRequest') DEFAULT NULL,
  `isSeen` bit(1) DEFAULT b'0',
  `seenAt` datetime DEFAULT NULL,
  `jfIndex` double(18,8) DEFAULT '0.00000000',
  `jfMultiplier` double(18,8) DEFAULT '0.00000000',
  `status` bit(1) DEFAULT b'1',
  `isDeleted` bit(1) DEFAULT b'0',
  `createdAt` datetime DEFAULT NULL,
  `updatedAt` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_jf_notifications_jf_users1_idx` (`userId`),
  KEY `fk_jf_notifications_jf_users2_idx` (`fromUserId`),
  CONSTRAINT `fk_jf_notifications_jf_users1` FOREIGN KEY (`userId`) REFERENCES `jf_users` (`id`),
  CONSTRAINT `fk_jf_notifications_jf_users2` FOREIGN KEY (`fromUserId`) REFERENCES `jf_users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `jf_ratings`
--

DROP TABLE IF EXISTS `jf_ratings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8 */;
CREATE TABLE `jf_ratings` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `userId` int NOT NULL,
  `fromUserId` int NOT NULL,
  `trait1` tinyint DEFAULT NULL,
  `trait2` tinyint DEFAULT NULL,
  `trait3` tinyint DEFAULT NULL,
  `trait4` tinyint DEFAULT NULL,
  `trait5` tinyint DEFAULT NULL,
  `trait6` tinyint DEFAULT NULL,
  `trait7` tinyint DEFAULT NULL,
  `trait8` tinyint DEFAULT NULL,
  `trait9` tinyint DEFAULT NULL,
  `count` int DEFAULT NULL,
  `isAnonymous` bit(1) DEFAULT NULL,
  `status` int DEFAULT '1',
  `isDeleted` bit(1) DEFAULT b'0',
  `createdAt` datetime DEFAULT NULL,
  `updatedAt` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_jf_ratings_jf_users1_idx` (`userId`),
  KEY `fk_jf_ratings_jf_users2_idx` (`fromUserId`),
  CONSTRAINT `fk_jf_ratings_jf_users1` FOREIGN KEY (`userId`) REFERENCES `jf_users` (`id`),
  CONSTRAINT `fk_jf_ratings_jf_users2` FOREIGN KEY (`fromUserId`) REFERENCES `jf_users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `jf_report_users`
--

DROP TABLE IF EXISTS `jf_report_users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8 */;
CREATE TABLE `jf_report_users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `userId` int NOT NULL,
  `reportUserId` int NOT NULL,
  `reportComment` text,
  `moderatorFeedback` text,
  `isResolved` bit(1) DEFAULT b'0',
  `isDeleted` bit(1) DEFAULT b'0',
  `createdAt` datetime DEFAULT NULL,
  `updatedAt` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_jf_notifications_jf_users1_idx` (`userId`),
  KEY `fk_jf_report_users_jf_users1_idx` (`reportUserId`),
  CONSTRAINT `fk_jf_notifications_jf_users11` FOREIGN KEY (`userId`) REFERENCES `jf_users` (`id`),
  CONSTRAINT `fk_jf_report_users_jf_users1` FOREIGN KEY (`reportUserId`) REFERENCES `jf_users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `jf_users`
--

DROP TABLE IF EXISTS `jf_users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8 */;
CREATE TABLE `jf_users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `firstName` text,
  `lastName` text,
  `fullName` text,
  `facebookId` text,
  `fbProfileLink` text,
  `email` text,
  `password` text,
  `image` text,
  `gender` enum('male','female','other') DEFAULT NULL,
  `age` smallint DEFAULT NULL,
  `biography` text,
  `location` text,
  `longitude` double(18,8) DEFAULT NULL,
  `latitude` double(18,8) DEFAULT NULL,
  `authToken` text,
  `deviceUid` text,
  `deviceType` enum('android','ios','web') DEFAULT NULL,
  `deviceToken` text,
  `phoneNumber` text,
  `resetCode` text,
  `verificationCode` text COMMENT 'For phone verification',
  `emailVerificationCode` text,
  `status` bit(1) DEFAULT b'1',
  `isDeleted` bit(1) DEFAULT b'0',
  `createdAt` datetime DEFAULT NULL,
  `updatedAt` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `jf_users_settings`
--

DROP TABLE IF EXISTS `jf_users_settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8 */;
CREATE TABLE `jf_users_settings` (
  `id` int NOT NULL AUTO_INCREMENT,
  `userId` int NOT NULL,
  `notificationsEnabled` bit(1) DEFAULT NULL,
  `locationEnabled` bit(1) DEFAULT NULL,
  `scoreScope` enum('everyone','selective') DEFAULT NULL,
  `isCaptainProfile` bit(1) DEFAULT NULL,
  `acceptAnonymousRating` bit(1) DEFAULT b'1',
  `facebookConnected` bit(1) DEFAULT b'0',
  `displayFacebookProfile` bit(1) DEFAULT b'0',
  `acceptRating` bit(1) DEFAULT b'1',
  `status` bit(1) DEFAULT b'1',
  `isDeleted` bit(1) DEFAULT b'0',
  `createdAt` datetime DEFAULT NULL,
  `updatedAt` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_jf_users_settings_jf_users` (`userId`),
  CONSTRAINT `fk_jf_users_settings_jf_users` FOREIGN KEY (`userId`) REFERENCES `jf_users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2021-09-18 14:15:11

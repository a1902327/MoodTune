-- MySQL dump 10.13  Distrib 8.0.32, for Linux (x86_64)
--
-- Host: localhost    Database: moodtune
-- ------------------------------------------------------
-- Server version	8.0.32-0ubuntu0.22.04.2

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

-- Table structure for table `SavedTracks`
--

DROP TABLE IF EXISTS `SavedTracks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `SavedTracks` (
  `saved_track_id` int NOT NULL AUTO_INCREMENT,
  `user_id` char(36) NOT NULL,
  `spotify_track_id` varchar(50) NOT NULL,
  `track_name` varchar(200) DEFAULT NULL,
  `artist` varchar(200) DEFAULT NULL,
  `album` varchar(200) DEFAULT NULL,
  `artwork` varchar(255) DEFAULT NULL,
  `spotify_url` varchar(255) DEFAULT NULL,
  `saved_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`saved_track_id`),
  UNIQUE KEY `user_track_unique` (`user_id`,`spotify_track_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `SavedTracks_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `Users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Table structure for table `Admin`
--

DROP TABLE IF EXISTS `Admin`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Admin` (
  `setting_id` char(36) NOT NULL,
  `key` varchar(100) NOT NULL,
  `value` text,
  `description` text,
  PRIMARY KEY (`setting_id`),
  UNIQUE KEY `key` (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `Admin`
--

LOCK TABLES `Admin` WRITE;
/*!40000 ALTER TABLE `Admin` DISABLE KEYS */;
INSERT INTO `Admin` VALUES ('a908c5a1-2b98-11f0-8cfb-96c033798aa1','filter_explicit_content','true','Hide songs marked as explicit');
/*!40000 ALTER TABLE `Admin` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Feedbacks`
--

DROP TABLE IF EXISTS `Feedbacks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Feedbacks` (
  `feedback_id` int NOT NULL AUTO_INCREMENT,
  `user_id` char(36) DEFAULT NULL,
  `spotify_track_id` varchar(50) DEFAULT NULL,
  `thumbs_up` tinyint(1) DEFAULT NULL,
  `custom_tags` json DEFAULT NULL,
  `notes` text,
  `timestamp` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`feedback_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `Feedbacks_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `Users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Feedbacks`
--

LOCK TABLES `Feedbacks` WRITE;
/*!40000 ALTER TABLE `Feedbacks` DISABLE KEYS */;
INSERT INTO `Feedbacks` VALUES (17,'3e71a8fe-aaf6-4ba2-a91f-3f0c79e54c26','undefined',1,NULL,NULL,'2025-06-12 01:26:13'),(18,'3e71a8fe-aaf6-4ba2-a91f-3f0c79e54c26','undefined',0,NULL,NULL,'2025-06-12 01:26:14'),(19,'3e71a8fe-aaf6-4ba2-a91f-3f0c79e54c26','undefined',1,NULL,NULL,'2025-06-12 01:26:14'),(20,'3e71a8fe-aaf6-4ba2-a91f-3f0c79e54c26','undefined',0,NULL,NULL,'2025-06-12 01:26:15');
/*!40000 ALTER TABLE `Feedbacks` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Mood_history`
--

DROP TABLE IF EXISTS `Mood_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Mood_history` (
  `entry_id` int NOT NULL AUTO_INCREMENT,
  `user_id` char(36) DEFAULT NULL,
  `mood` varchar(30) DEFAULT NULL,
  `timestamp` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`entry_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `Mood_history_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `Users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Mood_history`
--

LOCK TABLES `Mood_history` WRITE;
/*!40000 ALTER TABLE `Mood_history` DISABLE KEYS */;
/*!40000 ALTER TABLE `Mood_history` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Playlists`
--

DROP TABLE IF EXISTS `Playlists`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Playlists` (
  `playlist_id` char(36) NOT NULL,
  `user_id` char(36) DEFAULT NULL,
  `mood` varchar(30) DEFAULT NULL,
  `name` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`playlist_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `Playlists_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `Users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Playlists`
--

LOCK TABLES `Playlists` WRITE;
/*!40000 ALTER TABLE `Playlists` DISABLE KEYS */;
/*!40000 ALTER TABLE `Playlists` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `SpotifyTracks`
--

DROP TABLE IF EXISTS `SpotifyTracks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `SpotifyTracks` (
  `spotify_track_id` varchar(50) NOT NULL,
  `track_name` varchar(200) DEFAULT NULL,
  `artist` varchar(200) DEFAULT NULL,
  `album` varchar(200) DEFAULT NULL,
  `valence` float DEFAULT NULL,
  `energy` float DEFAULT NULL,
  `danceability` float DEFAULT NULL,
  PRIMARY KEY (`spotify_track_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `SpotifyTracks`
--

LOCK TABLES `SpotifyTracks` WRITE;
/*!40000 ALTER TABLE `SpotifyTracks` DISABLE KEYS */;
/*!40000 ALTER TABLE `SpotifyTracks` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Tracks`
--

DROP TABLE IF EXISTS `Tracks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Tracks` (
  `track_id` char(36) NOT NULL,
  `playlist_id` char(36) DEFAULT NULL,
  `spotify_track_id` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`track_id`),
  KEY `playlist_id` (`playlist_id`),
  KEY `spotify_track_id` (`spotify_track_id`),
  CONSTRAINT `Tracks_ibfk_1` FOREIGN KEY (`playlist_id`) REFERENCES `Playlists` (`playlist_id`),
  CONSTRAINT `Tracks_ibfk_2` FOREIGN KEY (`spotify_track_id`) REFERENCES `SpotifyTracks` (`spotify_track_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Tracks`
--

LOCK TABLES `Tracks` WRITE;
/*!40000 ALTER TABLE `Tracks` DISABLE KEYS */;
/*!40000 ALTER TABLE `Tracks` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Users`
--

DROP TABLE IF EXISTS `Users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Users` (
  `user_id` char(36) NOT NULL,
  `name` varchar(50) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `date_of_birth` date DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `avatar` varchar(255) DEFAULT NULL,
  `is_admin` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `username` (`name`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Users`
--

LOCK TABLES `Users` WRITE;
/*!40000 ALTER TABLE `Users` DISABLE KEYS */;
INSERT INTO `Users` VALUES ('3e71a8fe-aaf6-4ba2-a91f-3f0c79e54c26','ADMIN MOODTUNE','admin@moodtune.com.au','$2b$10$To0Zkngq6ahwwZUfZAzvQ.oI2X9pie5MIgfJ5SJN.1lsxEX9QpDrS','2025-06-11 05:02:58','2000-01-01','University of Adelaide','/uploads/avatars/1749618178176-avatar.png',1),('726c9eee-24f7-45af-9cc5-edb6b8db33d1','Phillips','phillips@moodtune.com.au','$2b$10$rpPf4d3gLhdXIEr6K0ojdOqtE90uKqEwShxuyVGTT3aX.K0p5/KCi','2025-06-12 05:58:34','2024-03-26','Blackwood, SA','/uploads/avatars/1749707914572-Smile Icon.png',1),('8b23ae53-3b3a-46f2-a78d-604b98474b2e','Alex Vu','alex@moodtune.com.au','$2b$10$j4gxrWkz4Bewdkz9M43d7eqmfwtTdjlPbBAsSEgmruYJkbdc5lZi.','2025-06-11 05:57:08','2005-09-02','Adelaide, SA','/uploads/avatars/1749621428116-avatar.webp',0);
/*!40000 ALTER TABLE `Users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-06-12  5:59:19

<?php

class SetupService extends CoreService {

  function checkDb($dbkey) {
    $db = self::instance($dbkey);
    $dbkey = QB::esc($dbkey);
    $dbConfig = $db->getConfig();
    $dbname = $dbConfig['database'];
    $count = $db->getVar("SELECT COUNT(*) FROM information_schema.schemata WHERE schema_name = '$dbname'");
    if ($count == "0") throw CoreError::instance('Invalid database name.');
    $count = $db->getVar("SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = '$dbname'");
    // var_dump($count, $dbkey);
    return $count;
  }

  function getServerInfo($dbkey) {
    $db = self::instance($dbkey);
    return $db->connect()->server_info;
  }

  function doSetup($dbkey) {
    
    $multi[] = "SET NAMES utf8mb4;";
    $multi[] = "SET FOREIGN_KEY_CHECKS = 0;";
    $multi[] = "DROP TABLE IF EXISTS `app`;";
    $multi[] = "CREATE TABLE `app` (
      `app` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
      `name` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
      `shortdesc` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
      `description` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
      PRIMARY KEY (`app`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;";

    $multi[] = "DROP TABLE IF EXISTS `auth_app`;";
    $multi[] = "CREATE TABLE `auth_app` (
      `app` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
      `rid` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
      PRIMARY KEY (`app`,`rid`) USING BTREE,
      KEY `fk_auth_app_role_idx` (`rid`) USING BTREE /*!80000 INVISIBLE */,
      CONSTRAINT `fk_auth_app_app` FOREIGN KEY (`app`) REFERENCES `app` (`app`),
      CONSTRAINT `fk_auth_app_role` FOREIGN KEY (`rid`) REFERENCES `role` (`rid`) ON DELETE CASCADE ON UPDATE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci ROW_FORMAT=DYNAMIC;";

    $multi[] = "DROP TABLE IF EXISTS `auth_function`;";
    $multi[] = "CREATE TABLE `auth_function` (
      `rid` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
      `app` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
      `fid` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
      PRIMARY KEY (`rid`,`app`,`fid`) USING BTREE,
      KEY `fk_role_has_function_function_idx` (`app`,`fid`) USING BTREE /*!80000 INVISIBLE */,
      KEY `fk_role_has_function_role_idx` (`rid`) USING BTREE /*!80000 INVISIBLE */,
      CONSTRAINT `fk_auth_function_app` FOREIGN KEY (`app`) REFERENCES `app` (`app`),
      CONSTRAINT `fk_role_has_function_function` FOREIGN KEY (`app`, `fid`) REFERENCES `function` (`app`, `fid`) ON DELETE CASCADE ON UPDATE CASCADE,
      CONSTRAINT `fk_role_has_function_role` FOREIGN KEY (`rid`) REFERENCES `role` (`rid`) ON DELETE CASCADE ON UPDATE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci ROW_FORMAT=DYNAMIC;";

    $multi[] = "DROP TABLE IF EXISTS `auth_menu`;";
    $multi[] = "CREATE TABLE `auth_menu` (
      `rid` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
      `app` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
      `mid` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
      PRIMARY KEY (`rid`,`app`,`mid`) USING BTREE,
      KEY `fk_role_has_menu_menu_idx` (`app`,`mid`) USING BTREE /*!80000 INVISIBLE */,
      KEY `fk_role_has_menu_role_idx` (`rid`) USING BTREE /*!80000 INVISIBLE */,
      CONSTRAINT `fk_auth_menu_app` FOREIGN KEY (`app`) REFERENCES `app` (`app`),
      CONSTRAINT `fk_role_has_menu_menu` FOREIGN KEY (`app`, `mid`) REFERENCES `menu` (`app`, `mid`) ON DELETE CASCADE ON UPDATE CASCADE,
      CONSTRAINT `fk_role_has_menu_role` FOREIGN KEY (`rid`) REFERENCES `role` (`rid`) ON DELETE CASCADE ON UPDATE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci ROW_FORMAT=DYNAMIC;";

    $multi[] = "DROP TABLE IF EXISTS `concept`;";
    $multi[] = "CREATE TABLE `concept` (
      `cmid` int unsigned NOT NULL,
      `cid` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
      `label` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '-',
      `x` int NOT NULL DEFAULT '0',
      `y` int NOT NULL DEFAULT '0',
      `data` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
      PRIMARY KEY (`cmid`,`cid`) USING BTREE,
      KEY `fk_concept_conceptmap_idx` (`cmid`) USING BTREE /*!80000 INVISIBLE */,
      CONSTRAINT `fk_concept_conceptmap` FOREIGN KEY (`cmid`) REFERENCES `conceptmap` (`cmid`) ON DELETE CASCADE ON UPDATE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci ROW_FORMAT=DYNAMIC;";

    $multi[] = "DROP TABLE IF EXISTS `concept_ext`;";
    $multi[] = "CREATE TABLE `concept_ext` (
      `lmid` int unsigned NOT NULL,
      `cid` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
      `label` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '-',
      `x` int NOT NULL DEFAULT '0',
      `y` int NOT NULL DEFAULT '0',
      `data` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
      PRIMARY KEY (`lmid`,`cid`) USING BTREE,
      KEY `fk_learnermap_lmid` (`lmid`) /*!80000 INVISIBLE */,
      CONSTRAINT `fk_concept_ext_learnermap` FOREIGN KEY (`lmid`) REFERENCES `learnermap` (`lmid`) ON DELETE CASCADE ON UPDATE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci ROW_FORMAT=DYNAMIC;";

    $multi[] = "DROP TABLE IF EXISTS `conceptmap`;";
    $multi[] = "CREATE TABLE `conceptmap` (
      `cmid` int unsigned NOT NULL AUTO_INCREMENT,
      `cmfid` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
      `title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
      `author` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
      `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
      `direction` enum('bi','uni','multi') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'multi',
      `type` enum('teacher','scratch') COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'teacher',
      `text` int unsigned DEFAULT NULL,
      `topic` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
      `refmap` int unsigned DEFAULT NULL,
      PRIMARY KEY (`cmid`) USING BTREE,
      UNIQUE KEY `cmfid_UNIQUE` (`cmfid`) USING BTREE /*!80000 INVISIBLE */,
      KEY `fk_conceptmap_user_idx` (`author`) USING BTREE /*!80000 INVISIBLE */,
      KEY `fk_conceptmap_text_idx` (`text`) USING BTREE /*!80000 INVISIBLE */,
      KEY `fk_conceptmap_topic_idx` (`topic`) USING BTREE /*!80000 INVISIBLE */,
      KEY `fk_conceptmap_conceptmap` (`refmap`),
      CONSTRAINT `fk_conceptmap_conceptmap` FOREIGN KEY (`refmap`) REFERENCES `conceptmap` (`cmid`) ON DELETE SET NULL ON UPDATE CASCADE,
      CONSTRAINT `fk_conceptmap_text` FOREIGN KEY (`text`) REFERENCES `text` (`tid`) ON DELETE CASCADE ON UPDATE CASCADE,
      CONSTRAINT `fk_conceptmap_topic` FOREIGN KEY (`topic`) REFERENCES `topic` (`tid`) ON DELETE CASCADE ON UPDATE CASCADE,
      CONSTRAINT `fk_conceptmap_user` FOREIGN KEY (`author`) REFERENCES `user` (`username`) ON DELETE CASCADE ON UPDATE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci ROW_FORMAT=DYNAMIC;";

    $multi[] = "DROP TABLE IF EXISTS `function`;";
    $multi[] = "CREATE TABLE `function` (
      `app` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
      `fid` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
      `description` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
      PRIMARY KEY (`app`,`fid`) USING BTREE,
      CONSTRAINT `fk_function_app` FOREIGN KEY (`app`) REFERENCES `app` (`app`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci ROW_FORMAT=DYNAMIC;";

    $multi[] = "DROP TABLE IF EXISTS `grup`;";
    $multi[] = "CREATE TABLE `grup` (
      `gid` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
      `name` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
      `description` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
      PRIMARY KEY (`gid`) USING BTREE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci ROW_FORMAT=DYNAMIC;";

    $multi[] = "DROP TABLE IF EXISTS `grup_kit`;";
    $multi[] = "CREATE TABLE `grup_kit` (
      `gid` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
      `kid` int unsigned NOT NULL,
      PRIMARY KEY (`gid`,`kid`) USING BTREE,
      KEY `fk_grup_has_kit_kit_idx` (`kid`) USING BTREE /*!80000 INVISIBLE */,
      KEY `fk_grup_has_kit_grup_idx` (`gid`) USING BTREE /*!80000 INVISIBLE */,
      CONSTRAINT `fk_grup_kit_grup` FOREIGN KEY (`gid`) REFERENCES `grup` (`gid`) ON DELETE CASCADE ON UPDATE CASCADE,
      CONSTRAINT `fk_grup_kit_kit` FOREIGN KEY (`kid`) REFERENCES `kit` (`kid`) ON DELETE CASCADE ON UPDATE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci ROW_FORMAT=DYNAMIC;";

    $multi[] = "DROP TABLE IF EXISTS `grup_topic`;";
    $multi[] = "CREATE TABLE `grup_topic` (
      `gid` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
      `tid` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
      PRIMARY KEY (`gid`,`tid`) USING BTREE,
      KEY `fk_grup_has_topic_topic_idx` (`tid`) USING BTREE /*!80000 INVISIBLE */,
      KEY `fk_grup_has_topic_grup_idx` (`gid`) USING BTREE /*!80000 INVISIBLE */,
      CONSTRAINT `fk_grup_has_topic_grup` FOREIGN KEY (`gid`) REFERENCES `grup` (`gid`) ON DELETE CASCADE ON UPDATE CASCADE,
      CONSTRAINT `fk_grup_has_topic_topic` FOREIGN KEY (`tid`) REFERENCES `topic` (`tid`) ON DELETE CASCADE ON UPDATE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci ROW_FORMAT=DYNAMIC;";

    $multi[] = "DROP TABLE IF EXISTS `grup_user`;";
    $multi[] = "CREATE TABLE `grup_user` (
      `gid` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
      `username` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
      PRIMARY KEY (`gid`,`username`) USING BTREE,
      KEY `fk_grup_has_user_user_idx` (`username`) USING BTREE /*!80000 INVISIBLE */,
      KEY `fk_grup_has_user_grup_idx` (`gid`) USING BTREE /*!80000 INVISIBLE */,
      CONSTRAINT `fk_grup_has_user_grup` FOREIGN KEY (`gid`) REFERENCES `grup` (`gid`) ON DELETE CASCADE ON UPDATE CASCADE,
      CONSTRAINT `fk_grup_has_user_user` FOREIGN KEY (`username`) REFERENCES `user` (`username`) ON DELETE CASCADE ON UPDATE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci ROW_FORMAT=DYNAMIC;";

    $multi[] = "DROP TABLE IF EXISTS `kit`;";
    $multi[] = "CREATE TABLE `kit` (
      `kid` int unsigned NOT NULL AUTO_INCREMENT,
      `kfid` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
      `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '-',
      `layout` enum('preset','random') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'preset',
      `options` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
      `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
      `enabled` tinyint(1) NOT NULL DEFAULT '1',
      `author` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
      `cmid` int unsigned NOT NULL,
      `text` int unsigned DEFAULT NULL,
      PRIMARY KEY (`kid`) USING BTREE,
      UNIQUE KEY `kfid_UNIQUE` (`kfid`) USING BTREE /*!80000 INVISIBLE */,
      KEY `fk_kit_user_idx` (`author`) USING BTREE /*!80000 INVISIBLE */,
      KEY `fk_kit_conceptmap` (`cmid`) USING BTREE /*!80000 INVISIBLE */,
      KEY `fk_kit_text` (`text`) /*!80000 INVISIBLE */,
      CONSTRAINT `fk_kit_conceptmap` FOREIGN KEY (`cmid`) REFERENCES `conceptmap` (`cmid`) ON DELETE CASCADE ON UPDATE CASCADE,
      CONSTRAINT `fk_kit_text` FOREIGN KEY (`text`) REFERENCES `text` (`tid`) ON DELETE CASCADE ON UPDATE CASCADE,
      CONSTRAINT `fk_kit_user` FOREIGN KEY (`author`) REFERENCES `user` (`username`) ON DELETE CASCADE ON UPDATE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci ROW_FORMAT=DYNAMIC;";

    $multi[] = "DROP TABLE IF EXISTS `kit_concept`;";
    $multi[] = "CREATE TABLE `kit_concept` (
      `kid` int unsigned NOT NULL,
      `cmid` int unsigned NOT NULL,
      `cid` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
      `x` int DEFAULT NULL,
      `y` int DEFAULT NULL,
      `data` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
      PRIMARY KEY (`kid`,`cmid`,`cid`) USING BTREE,
      KEY `fk_kit_concept_kit_idx` (`kid`) USING BTREE /*!80000 INVISIBLE */,
      KEY `fk_kit_concept_concept_idx` (`cid`,`cmid`) USING BTREE /*!80000 INVISIBLE */,
      KEY `fk_kit_concept_concept` (`cmid`,`cid`) USING BTREE /*!80000 INVISIBLE */,
      CONSTRAINT `fk_kit_concept_concept` FOREIGN KEY (`cmid`, `cid`) REFERENCES `concept` (`cmid`, `cid`) ON DELETE CASCADE ON UPDATE CASCADE,
      CONSTRAINT `fk_kit_concept_kit` FOREIGN KEY (`kid`) REFERENCES `kit` (`kid`) ON DELETE CASCADE ON UPDATE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci ROW_FORMAT=DYNAMIC;";

    $multi[] = "DROP TABLE IF EXISTS `kit_concept_ext`;";
    $multi[] = "CREATE TABLE `kit_concept_ext` (
      `kid` int unsigned NOT NULL,
      `cmid` int unsigned NOT NULL,
      `cid` varchar(10) COLLATE utf8mb4_general_ci NOT NULL,
      `set_kid` int unsigned NOT NULL,
      `setid` tinyint unsigned NOT NULL,
      PRIMARY KEY (`kid`,`cmid`,`cid`),
      KEY `fk_kit_concept_ext_kit_set` (`set_kid`,`setid`),
      CONSTRAINT `fk_kit_concept_ext_kit_concept` FOREIGN KEY (`kid`, `cmid`, `cid`) REFERENCES `kit_concept` (`kid`, `cmid`, `cid`) ON DELETE CASCADE ON UPDATE CASCADE,
      CONSTRAINT `fk_kit_concept_ext_kit_set` FOREIGN KEY (`set_kid`, `setid`) REFERENCES `kit_set` (`kid`, `setid`) ON DELETE CASCADE ON UPDATE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;";

    $multi[] = "DROP TABLE IF EXISTS `kit_link`;";
    $multi[] = "CREATE TABLE `kit_link` (
      `kid` int unsigned NOT NULL,
      `cmid` int unsigned NOT NULL,
      `lid` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
      `x` int DEFAULT NULL,
      `y` int DEFAULT NULL,
      `data` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
      `source_cmid` int unsigned DEFAULT NULL,
      `source_cid` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
      `source_data` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
      PRIMARY KEY (`kid`,`cmid`,`lid`) USING BTREE,
      KEY `fk_kit_link_kit_idx` (`kid`) /*!80000 INVISIBLE */,
      KEY `fk_kit_link_link_idx` (`lid`,`cmid`) /*!80000 INVISIBLE */,
      KEY `fk_kit_link_concept_idx` (`source_cid`,`source_cmid`) /*!80000 INVISIBLE */,
      KEY `fk_kit_link_link` (`cmid`,`lid`) /*!80000 INVISIBLE */,
      KEY `fk_kit_link_concept` (`source_cmid`,`source_cid`) /*!80000 INVISIBLE */,
      KEY `fk_source_edge_ext_idx` (`kid`,`cmid`,`lid`,`source_cid`),
      CONSTRAINT `fk_kit_link_concept_source` FOREIGN KEY (`source_cmid`, `source_cid`) REFERENCES `concept` (`cmid`, `cid`) ON DELETE CASCADE ON UPDATE CASCADE,
      CONSTRAINT `fk_kit_link_kit` FOREIGN KEY (`kid`) REFERENCES `kit` (`kid`) ON DELETE CASCADE ON UPDATE CASCADE,
      CONSTRAINT `fk_kit_link_link` FOREIGN KEY (`cmid`, `lid`) REFERENCES `link` (`cmid`, `lid`) ON DELETE CASCADE ON UPDATE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci ROW_FORMAT=DYNAMIC;";

    $multi[] = "DROP TABLE IF EXISTS `kit_link_ext`;";
    $multi[] = "CREATE TABLE `kit_link_ext` (
      `kid` int unsigned NOT NULL,
      `cmid` int unsigned NOT NULL,
      `lid` varchar(10) COLLATE utf8mb4_general_ci NOT NULL,
      `set_kid` int unsigned NOT NULL,
      `setid` tinyint unsigned NOT NULL,
      PRIMARY KEY (`kid`,`cmid`,`lid`),
      KEY `fk_kit_link_ext_kit_set` (`set_kid`,`setid`),
      CONSTRAINT `fk_kit_link_ext_kit_link` FOREIGN KEY (`kid`, `cmid`, `lid`) REFERENCES `kit_link` (`kid`, `cmid`, `lid`) ON DELETE CASCADE ON UPDATE CASCADE,
      CONSTRAINT `fk_kit_link_ext_kit_set` FOREIGN KEY (`set_kid`, `setid`) REFERENCES `kit_set` (`kid`, `setid`) ON DELETE CASCADE ON UPDATE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;";

    $multi[] = "DROP TABLE IF EXISTS `kit_linktarget`;";
    $multi[] = "CREATE TABLE `kit_linktarget` (
      `kid` int unsigned NOT NULL,
      `cmid` int unsigned NOT NULL,
      `lid` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
      `target_cmid` int unsigned NOT NULL,
      `target_cid` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
      `target_data` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
      PRIMARY KEY (`kid`,`cmid`,`lid`,`target_cmid`,`target_cid`) USING BTREE,
      KEY `fk_kit_linktarget_concept_idx` (`target_cid`,`target_cmid`) USING BTREE,
      KEY `fk_kit_linktarget_concept` (`target_cmid`,`target_cid`) USING BTREE,
      KEY `fk_target_edge_ext` (`kid`,`cmid`,`lid`,`target_cid`),
      CONSTRAINT `fk_kit_linktarget_concept` FOREIGN KEY (`target_cmid`, `target_cid`) REFERENCES `concept` (`cmid`, `cid`) ON DELETE CASCADE ON UPDATE CASCADE,
      CONSTRAINT `fk_kit_linktarget_kit_link` FOREIGN KEY (`kid`, `cmid`, `lid`) REFERENCES `kit_link` (`kid`, `cmid`, `lid`) ON DELETE CASCADE ON UPDATE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci ROW_FORMAT=DYNAMIC;";

    $multi[] = "DROP TABLE IF EXISTS `kit_set`;";
    $multi[] = "CREATE TABLE `kit_set` (
      `kid` int unsigned NOT NULL,
      `setid` tinyint unsigned NOT NULL,
      `order` tinyint unsigned DEFAULT NULL,
      `text` int unsigned DEFAULT NULL,
      PRIMARY KEY (`kid`,`setid`),
      KEY `fk_kit_set_text` (`text`),
      CONSTRAINT `fk_kit_set_kit` FOREIGN KEY (`kid`) REFERENCES `kit` (`kid`) ON DELETE CASCADE ON UPDATE CASCADE,
      CONSTRAINT `fk_kit_set_text` FOREIGN KEY (`text`) REFERENCES `text` (`tid`) ON DELETE CASCADE ON UPDATE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;";

    $multi[] = "DROP TABLE IF EXISTS `kit_source_edge_ext`;";
    $multi[] = "CREATE TABLE `kit_source_edge_ext` (
      `kid` int unsigned NOT NULL,
      `cmid` int unsigned NOT NULL,
      `lid` varchar(10) COLLATE utf8mb4_general_ci NOT NULL,
      `source_cid` varchar(10) COLLATE utf8mb4_general_ci NOT NULL,
      `set_kid` int unsigned NOT NULL,
      `setid` tinyint unsigned NOT NULL,
      PRIMARY KEY (`kid`,`cmid`,`lid`,`source_cid`),
      KEY `fk_kit_source_edge_ext_kit_set` (`set_kid`,`setid`),
      CONSTRAINT `fk_kit_source_edge_ext_kit_link` FOREIGN KEY (`kid`, `cmid`, `lid`, `source_cid`) REFERENCES `kit_link` (`kid`, `cmid`, `lid`, `source_cid`) ON DELETE CASCADE ON UPDATE CASCADE,
      CONSTRAINT `fk_kit_source_edge_ext_kit_set` FOREIGN KEY (`set_kid`, `setid`) REFERENCES `kit_set` (`kid`, `setid`) ON DELETE CASCADE ON UPDATE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;";

    $multi[] = "DROP TABLE IF EXISTS `kit_target_edge_ext`;";
    $multi[] = "CREATE TABLE `kit_target_edge_ext` (
      `kid` int unsigned NOT NULL,
      `cmid` int unsigned NOT NULL,
      `lid` varchar(10) COLLATE utf8mb4_general_ci NOT NULL,
      `target_cid` varchar(10) COLLATE utf8mb4_general_ci NOT NULL,
      `set_kid` int unsigned NOT NULL,
      `setid` tinyint unsigned NOT NULL,
      PRIMARY KEY (`kid`,`cmid`,`lid`,`target_cid`),
      KEY `fk_kit_target_edge_ext_kit_set` (`set_kid`,`setid`),
      CONSTRAINT `fk_kit_target_edge_ext_kit_linktarget` FOREIGN KEY (`kid`, `cmid`, `lid`, `target_cid`) REFERENCES `kit_linktarget` (`kid`, `cmid`, `lid`, `target_cid`) ON DELETE CASCADE ON UPDATE CASCADE,
      CONSTRAINT `fk_kit_target_edge_ext_kit_set` FOREIGN KEY (`set_kid`, `setid`) REFERENCES `kit_set` (`kid`, `setid`) ON DELETE CASCADE ON UPDATE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;";

    $multi[] = "DROP TABLE IF EXISTS `learnermap`;";
    $multi[] = "CREATE TABLE `learnermap` (
      `lmid` int unsigned NOT NULL AUTO_INCREMENT,
      `kid` int unsigned NOT NULL,
      `author` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
      `type` enum('draft','extend','fix','auto','feedback') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'draft',
      `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
      `data` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
      PRIMARY KEY (`lmid`) USING BTREE,
      KEY `fk_learnermap_kit_idx` (`kid`) USING BTREE /*!80000 INVISIBLE */,
      KEY `fk_learnermap_user` (`author`) USING BTREE /*!80000 INVISIBLE */,
      CONSTRAINT `fk_learnermap_kit` FOREIGN KEY (`kid`) REFERENCES `kit` (`kid`) ON DELETE CASCADE ON UPDATE CASCADE,
      CONSTRAINT `fk_learnermap_user` FOREIGN KEY (`author`) REFERENCES `user` (`username`) ON DELETE CASCADE ON UPDATE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci ROW_FORMAT=DYNAMIC;";

    $multi[] = "DROP TABLE IF EXISTS `learnermap_concept`;";
    $multi[] = "CREATE TABLE `learnermap_concept` (
      `lmid` int unsigned NOT NULL,
      `cmid` int unsigned NOT NULL,
      `cid` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
      `x` int DEFAULT NULL,
      `y` int DEFAULT NULL,
      `data` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
      PRIMARY KEY (`lmid`,`cmid`,`cid`) USING BTREE,
      KEY `fk_learnermap_concept_concept` (`cmid`,`cid`) USING BTREE /*!80000 INVISIBLE */,
      CONSTRAINT `fk_learnermap_concept_concept` FOREIGN KEY (`cmid`, `cid`) REFERENCES `concept` (`cmid`, `cid`) ON DELETE CASCADE ON UPDATE CASCADE,
      CONSTRAINT `fk_learnermap_concept_learnermap` FOREIGN KEY (`lmid`) REFERENCES `learnermap` (`lmid`) ON DELETE CASCADE ON UPDATE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci ROW_FORMAT=DYNAMIC;";

    $multi[] = "DROP TABLE IF EXISTS `learnermap_link`;";
    $multi[] = "CREATE TABLE `learnermap_link` (
      `lmid` int unsigned NOT NULL,
      `cmid` int unsigned NOT NULL,
      `lid` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
      `x` int DEFAULT NULL,
      `y` int DEFAULT NULL,
      `data` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
      `source_cmid` int unsigned DEFAULT NULL,
      `source_cid` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
      `source_data` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
      PRIMARY KEY (`lmid`,`cmid`,`lid`) USING BTREE,
      KEY `fk_learnermap_link_link` (`cmid`,`lid`) USING BTREE /*!80000 INVISIBLE */,
      CONSTRAINT `fk_learnermap_link_learnermap` FOREIGN KEY (`lmid`) REFERENCES `learnermap` (`lmid`) ON DELETE CASCADE ON UPDATE CASCADE,
      CONSTRAINT `fk_learnermap_link_link` FOREIGN KEY (`cmid`, `lid`) REFERENCES `link` (`cmid`, `lid`) ON DELETE CASCADE ON UPDATE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci ROW_FORMAT=DYNAMIC;";

    $multi[] = "DROP TABLE IF EXISTS `learnermap_linktarget`;";
    $multi[] = "CREATE TABLE `learnermap_linktarget` (
      `lmid` int unsigned NOT NULL,
      `cmid` int unsigned NOT NULL,
      `lid` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
      `target_cmid` int unsigned NOT NULL,
      `target_cid` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
      `target_data` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
      PRIMARY KEY (`lmid`,`cmid`,`lid`,`target_cmid`,`target_cid`) USING BTREE,
      KEY `fk_learnermap_linktarget_concept_idx` (`target_cid`,`target_cmid`) USING BTREE /*!80000 INVISIBLE */,
      KEY `fk_learnermap_linktarget_concept` (`target_cmid`,`target_cid`) USING BTREE /*!80000 INVISIBLE */,
      CONSTRAINT `fk_learnermap_linktarget_concept` FOREIGN KEY (`target_cmid`, `target_cid`) REFERENCES `concept` (`cmid`, `cid`) ON DELETE CASCADE ON UPDATE CASCADE,
      CONSTRAINT `fk_learnermap_linktarget_learnermap_link` FOREIGN KEY (`lmid`, `cmid`, `lid`) REFERENCES `learnermap_link` (`lmid`, `cmid`, `lid`) ON DELETE CASCADE ON UPDATE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci ROW_FORMAT=DYNAMIC;";

    $multi[] = "DROP TABLE IF EXISTS `link`;";
    $multi[] = "CREATE TABLE `link` (
      `cmid` int unsigned NOT NULL,
      `lid` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
      `label` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '-',
      `x` int NOT NULL DEFAULT '0',
      `y` int NOT NULL DEFAULT '0',
      `data` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
      `source_cmid` int unsigned DEFAULT NULL,
      `source_cid` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
      `source_data` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
      PRIMARY KEY (`cmid`,`lid`) USING BTREE,
      KEY `fk_link_conceptmap_idx` (`cmid`) USING BTREE /*!80000 INVISIBLE */,
      KEY `fk_link_concept_idx` (`source_cid`,`source_cmid`) USING BTREE /*!80000 INVISIBLE */,
      KEY `fk_link_concept` (`source_cmid`,`source_cid`) USING BTREE /*!80000 INVISIBLE */,
      CONSTRAINT `fk_link_concept` FOREIGN KEY (`source_cmid`, `source_cid`) REFERENCES `concept` (`cmid`, `cid`) ON DELETE CASCADE ON UPDATE CASCADE,
      CONSTRAINT `fk_link_conceptmap` FOREIGN KEY (`cmid`) REFERENCES `conceptmap` (`cmid`) ON DELETE CASCADE ON UPDATE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci ROW_FORMAT=DYNAMIC;";

    $multi[] = "DROP TABLE IF EXISTS `link_ext`;";
    $multi[] = "CREATE TABLE `link_ext` (
      `lmid` int unsigned NOT NULL,
      `lid` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
      `label` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '-',
      `x` int NOT NULL DEFAULT '0',
      `y` int NOT NULL DEFAULT '0',
      `data` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
      `source_cid` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
      `source_data` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
      PRIMARY KEY (`lmid`,`lid`) USING BTREE,
      KEY `fk_link_learnermap_idx` (`lmid`) USING BTREE /*!80000 INVISIBLE */,
      CONSTRAINT `fk_link_ext_learnermap` FOREIGN KEY (`lmid`) REFERENCES `learnermap` (`lmid`) ON DELETE CASCADE ON UPDATE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci ROW_FORMAT=DYNAMIC;";

    $multi[] = "DROP TABLE IF EXISTS `linktarget`;";
    $multi[] = "CREATE TABLE `linktarget` (
      `cmid` int unsigned NOT NULL,
      `lid` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
      `target_cmid` int unsigned NOT NULL,
      `target_cid` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
      `target_data` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
      PRIMARY KEY (`cmid`,`lid`,`target_cmid`,`target_cid`) USING BTREE,
      KEY `fk_linktarget_link_idx` (`lid`,`cmid`) USING BTREE /*!80000 INVISIBLE */,
      KEY `fk_linktarget_concept` (`target_cmid`,`target_cid`) USING BTREE /*!80000 INVISIBLE */,
      CONSTRAINT `fk_linktarget_concept` FOREIGN KEY (`target_cmid`, `target_cid`) REFERENCES `concept` (`cmid`, `cid`) ON DELETE CASCADE ON UPDATE CASCADE,
      CONSTRAINT `fk_linktarget_link` FOREIGN KEY (`cmid`, `lid`) REFERENCES `link` (`cmid`, `lid`) ON DELETE CASCADE ON UPDATE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci ROW_FORMAT=DYNAMIC;";

    $multi[] = "DROP TABLE IF EXISTS `linktarget_ext`;";
    $multi[] = "CREATE TABLE `linktarget_ext` (
      `lmid` int unsigned NOT NULL,
      `lid` varchar(10) COLLATE utf8mb4_general_ci NOT NULL,
      `target_cid` varchar(10) COLLATE utf8mb4_general_ci NOT NULL,
      `target_data` text COLLATE utf8mb4_general_ci,
      PRIMARY KEY (`lmid`,`lid`,`target_cid`),
      CONSTRAINT `fk_linktarget_ext_learnermap` FOREIGN KEY (`lmid`) REFERENCES `learnermap` (`lmid`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;";

    $multi[] = "DROP TABLE IF EXISTS `log`;";
    $multi[] = "CREATE TABLE `log` (
      `lid` int unsigned NOT NULL AUTO_INCREMENT,
      `username` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
      `seq` int unsigned NOT NULL DEFAULT '1',
      `tstamp` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      `tstampc` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      `canvasid` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
      `action` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
      `data` text COLLATE utf8mb4_general_ci,
      `sessid` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
      `ua` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
      PRIMARY KEY (`lid`),
      KEY `fk_log_user` (`username`) USING BTREE /*!80000 INVISIBLE */,
      CONSTRAINT `fk_log_user` FOREIGN KEY (`username`) REFERENCES `user` (`username`) ON DELETE CASCADE ON UPDATE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;";

    $multi[] = "DROP TABLE IF EXISTS `log_cmap`;";
    $multi[] = "CREATE TABLE `log_cmap` (
      `lid` int unsigned NOT NULL,
      `cmid` int unsigned NOT NULL,
      PRIMARY KEY (`lid`),
      KEY `fk_log_cmap_conceptmap` (`cmid`) USING BTREE /*!80000 INVISIBLE */,
      CONSTRAINT `fk_log_cmap_conceptmap` FOREIGN KEY (`cmid`) REFERENCES `conceptmap` (`cmid`) ON DELETE CASCADE ON UPDATE CASCADE,
      CONSTRAINT `fk_log_cmap_log` FOREIGN KEY (`lid`) REFERENCES `log` (`lid`) ON DELETE CASCADE ON UPDATE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;";

    $multi[] = "DROP TABLE IF EXISTS `log_cmap_state`;";
    $multi[] = "CREATE TABLE `log_cmap_state` (
      `lid` int unsigned NOT NULL,
      `concept` text COLLATE utf8mb4_general_ci,
      `link` text COLLATE utf8mb4_general_ci,
      `edge` text COLLATE utf8mb4_general_ci,
      `map` text COLLATE utf8mb4_general_ci,
      `proposition` text COLLATE utf8mb4_general_ci,
      `nc` smallint DEFAULT NULL,
      `nl` smallint DEFAULT NULL,
      `ne` smallint DEFAULT NULL,
      `np` smallint DEFAULT NULL,
      PRIMARY KEY (`lid`),
      CONSTRAINT `fk_log_cmap_state_log_cmap` FOREIGN KEY (`lid`) REFERENCES `log_cmap` (`lid`) ON DELETE CASCADE ON UPDATE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;";

    $multi[] = "DROP TABLE IF EXISTS `log_kitbuild`;";
    $multi[] = "CREATE TABLE `log_kitbuild` (
      `lid` int unsigned NOT NULL,
      `lmid` int unsigned NOT NULL,
      PRIMARY KEY (`lid`),
      KEY `fk_log_kitbuild_learnermap` (`lmid`) USING BTREE /*!80000 INVISIBLE */,
      CONSTRAINT `fk_log_kitbuild_learnermap` FOREIGN KEY (`lmid`) REFERENCES `learnermap` (`lmid`) ON DELETE CASCADE ON UPDATE CASCADE,
      CONSTRAINT `fk_log_kitbuild_log` FOREIGN KEY (`lid`) REFERENCES `log` (`lid`) ON DELETE CASCADE ON UPDATE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;";

    $multi[] = "DROP TABLE IF EXISTS `log_kitbuild_state`;";
    $multi[] = "CREATE TABLE `log_kitbuild_state` (
      `lid` int unsigned NOT NULL,
      `edge` text COLLATE utf8mb4_general_ci,
      `map` text COLLATE utf8mb4_general_ci,
      `proposition` text COLLATE utf8mb4_general_ci,
      `compare` text COLLATE utf8mb4_general_ci,
      `ne` smallint DEFAULT NULL,
      `np` smallint DEFAULT NULL,
      PRIMARY KEY (`lid`),
      CONSTRAINT `fk_log_kitbuild_state_log_kitbuild` FOREIGN KEY (`lid`) REFERENCES `log_kitbuild` (`lid`) ON DELETE CASCADE ON UPDATE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;";

    $multi[] = "DROP TABLE IF EXISTS `menu`;";
    $multi[] = "CREATE TABLE `menu` (
      `app` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
      `mid` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
      `label` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
      `url` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
      `icon` varchar(30) COLLATE utf8mb4_general_ci DEFAULT NULL,
      PRIMARY KEY (`app`,`mid`) USING BTREE,
      CONSTRAINT `fk_menu_app` FOREIGN KEY (`app`) REFERENCES `app` (`app`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci ROW_FORMAT=DYNAMIC;";

    $multi[] = "DROP TABLE IF EXISTS `role`;";
    $multi[] = "CREATE TABLE `role` (
      `rid` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
      `name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
      `inherit` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
      PRIMARY KEY (`rid`) USING BTREE,
      KEY `fk_role_role_idx` (`inherit`) USING BTREE /*!80000 INVISIBLE */,
      CONSTRAINT `fk_role_role` FOREIGN KEY (`inherit`) REFERENCES `role` (`rid`) ON DELETE CASCADE ON UPDATE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci ROW_FORMAT=DYNAMIC;";

    $multi[] = "DROP TABLE IF EXISTS `text`;";
    $multi[] = "CREATE TABLE `text` (
      `tid` int unsigned NOT NULL AUTO_INCREMENT,
      `title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
      `type` enum('plain','html','url','video','pdf','markdown') COLLATE utf8mb4_general_ci DEFAULT 'markdown',
      `created` datetime DEFAULT CURRENT_TIMESTAMP,
      `content` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
      `nlp` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
      `data` text COLLATE utf8mb4_general_ci,
      PRIMARY KEY (`tid`) USING BTREE
    ) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci ROW_FORMAT=DYNAMIC;";

    $multi[] = "DROP TABLE IF EXISTS `topic`;";
    $multi[] = "CREATE TABLE `topic` (
      `tid` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
      `title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
      `created` datetime DEFAULT CURRENT_TIMESTAMP,
      `enabled` tinyint unsigned NOT NULL DEFAULT '1',
      `text` int unsigned DEFAULT NULL,
      `data` text COLLATE utf8mb4_general_ci,
      PRIMARY KEY (`tid`) USING BTREE,
      KEY `fk_topic_text_idx` (`text`) USING BTREE /*!80000 INVISIBLE */,
      CONSTRAINT `fk_topic_text` FOREIGN KEY (`text`) REFERENCES `text` (`tid`) ON DELETE CASCADE ON UPDATE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci ROW_FORMAT=DYNAMIC;";

    $multi[] = "DROP TABLE IF EXISTS `user`;";
    $multi[] = "CREATE TABLE `user` (
      `username` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
      `password` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
      `name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
      `created` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (`username`) USING BTREE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci ROW_FORMAT=DYNAMIC;";

    $multi[] = "DROP TABLE IF EXISTS `user_role`;";
    $multi[] = "CREATE TABLE `user_role` (
      `username` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
      `rid` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
      PRIMARY KEY (`username`,`rid`) USING BTREE,
      KEY `fk_user_has_role_role_idx` (`rid`) USING BTREE /*!80000 INVISIBLE */,
      KEY `fk_user_has_role_user_idx` (`username`) USING BTREE /*!80000 INVISIBLE */,
      CONSTRAINT `fk_user_has_role_role` FOREIGN KEY (`rid`) REFERENCES `role` (`rid`) ON DELETE CASCADE ON UPDATE CASCADE,
      CONSTRAINT `fk_user_has_role_user` FOREIGN KEY (`username`) REFERENCES `user` (`username`) ON DELETE CASCADE ON UPDATE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci ROW_FORMAT=DYNAMIC;";
    
    $multi[] = "SET FOREIGN_KEY_CHECKS = 1;";
  
    // Execute!
    try {
      $db = self::instance($dbkey);
      $db->begin();
      foreach($multi as $sql) 
        $result = $db->query($sql);
      $db->commit();
      return $result;
    } catch (Exception $ex) {
      $db->rollback();
      throw CoreError::instance($ex->getMessage());
    }
  }

  function doSetupInitData($dbkey) {

    $multi[] = "INSERT IGNORE INTO `role` (`rid`, `name`, `inherit`) VALUES ('ADMINISTRATOR', 'Administrator', NULL);";
    $multi[] = "INSERT IGNORE INTO `role` (`rid`, `name`, `inherit`) VALUES ('GUEST', 'Guest', NULL);";
    $multi[] = "INSERT IGNORE INTO `role` (`rid`, `name`, `inherit`) VALUES ('LEARNER', 'Learner', NULL);";
    $multi[] = "INSERT IGNORE INTO `role` (`rid`, `name`, `inherit`) VALUES ('TEACHER', 'Teacher', NULL);";

    $multi[] = "INSERT INTO `user` (`username`, `password`, `name`) 
      VALUES ('admin', 'd41d8cd98f00b204e9800998ecf8427e', 'Administrator') 
      ON DUPLICATE KEY UPDATE `password` = VALUES(`password`);";

    $multi[] = "INSERT IGNORE INTO `user_role` (`username`, `rid`) VALUES ('admin', 'ADMINISTRATOR');";

    // Execute!
    try {
      $db = self::instance($dbkey);
      $db->begin();
      foreach($multi as $sql) 
        $result = $db->query($sql);
      $db->commit();
      return $result;
    } catch (Exception $ex) {
      $db->rollback();
      throw CoreError::instance($ex->getMessage());
    }
  }

}
-- phpMyAdmin SQL Dump
-- version 5.1.0
-- https://www.phpmyadmin.net/
--
-- Хост: 127.0.0.1:3306
-- Время создания: Июл 09 2021 г., 15:57
-- Версия сервера: 5.7.33-log
-- Версия PHP: 7.4.20

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- База данных: `jobspamer`
--

-- --------------------------------------------------------

--
-- Структура таблицы `order`
--

CREATE TABLE `order` (
  `id` int(11) NOT NULL,
  `portal` int(11) NOT NULL,
  `user_name` text COLLATE utf8mb4_unicode_ci,
  `last_name` text COLLATE utf8mb4_unicode_ci,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` tinyint(1) NOT NULL DEFAULT '0',
  `status_order` tinyint(1) NOT NULL DEFAULT '0',
  `target_link` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `file_mailing` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `all_links` int(11) NOT NULL DEFAULT '0',
  `send_links` int(11) NOT NULL DEFAULT '0',
  `fail_links` int(11) NOT NULL DEFAULT '0',
  `message` varchar(5000) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Дамп данных таблицы `order`
--

INSERT INTO `order` (`id`, `portal`, `user_name`, `last_name`, `password`, `email`, `status`, `status_order`, `target_link`, `file_mailing`, `all_links`, `send_links`, `fail_links`, `message`, `created_at`) VALUES
(14, 1, NULL, NULL, 'asdsa', 'test@gmail.com', 1, 0, '523324sad', 'uploads/index.php', 52, 71, 21, 'Task completed successfully', '2021-07-06 14:16:02'),
(15, 2, NULL, NULL, '12345', 'test@gmail.com', 0, 0, 'FREELANCEHUST', 'uploads/test.txt.txt', 0, 0, 0, NULL, '2021-07-06 14:21:49'),
(38, 1, NULL, NULL, '', '', 1, 0, 'testlink.com', 'uploads/test.txt.txt', 0, 0, 0, NULL, '2021-07-07 13:17:04'),
(39, 1, NULL, NULL, '12345', 'test@gmail.com', 0, 2, 'work.ua/jobs/by-company/21751/', 'uploads/testfile.odt', 52, 71, 21, 'Test message', '2021-07-08 06:49:34'),
(64, 1, '', '', '', '', 1, 0, '123412321', 'uploads/test.py', 512, 125, 412, 'Task completed successfully', '2021-07-09 08:11:21');

-- --------------------------------------------------------

--
-- Структура таблицы `portal`
--

CREATE TABLE `portal` (
  `id` int(11) NOT NULL,
  `alias` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_active` tinyint(1) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Дамп данных таблицы `portal`
--

INSERT INTO `portal` (`id`, `alias`, `name`, `is_active`, `created_at`) VALUES
(1, 'work.ua', 'Work', 1, '2021-07-05 14:33:29'),
(2, 'freelancehunt', 'FreeLance  2345325', 0, '2021-07-06 14:21:14'),
(3, 'fl.ru', 'FL.ru', 0, '2021-07-06 14:21:26'),
(4, 'TEST PORTAL', '3214124', 0, '2021-07-07 14:31:32'),
(5, '14213213', 'TEST', 1, '2021-07-09 11:47:09');

-- --------------------------------------------------------

--
-- Структура таблицы `proxy`
--

CREATE TABLE `proxy` (
  `proxy_id` int(11) NOT NULL,
  `protocol_proxy` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `host_proxy` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `port_proxy` int(11) NOT NULL,
  `username_proxy` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password_proxy` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `fail_request_proxy` int(11) NOT NULL DEFAULT '0',
  `success_request_proxy` int(11) NOT NULL DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Дамп данных таблицы `proxy`
--

INSERT INTO `proxy` (`proxy_id`, `protocol_proxy`, `host_proxy`, `port_proxy`, `username_proxy`, `password_proxy`, `is_active`, `fail_request_proxy`, `success_request_proxy`) VALUES
(1, 'sdasd213sda', '82.213.61.21', 19124, 'test_USERSEER', 'test', 0, 21, 0),
(2, '42513', '61.13.61.124', 14212, 'test_proxy', 'test_proxy', 1, 0, 0),
(3, '68124', '61.124.62.221', 42112, 'test1_proxy', 'test1_proxy', 0, 0, 0),
(4, 'sad2132sd', '41.51.62.123', 12341, 'TEST_USER', 'TEST_PASSWORD', 1, 0, 0),
(5, 'sad2132sd', '41.51.62.123', 12341, 'TEST_USER', 'TEST_PASSWORD', 1, 44, 0),
(6, 'sda76218sdaa', '41.213.51.21', 32432, '234234asdwqe', 'testpassword', 1, 1, 0);

-- --------------------------------------------------------

--
-- Структура таблицы `settings`
--

CREATE TABLE `settings` (
  `id` int(11) NOT NULL,
  `alias` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(5000) COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_active` tinyint(1) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Дамп данных таблицы `settings`
--

INSERT INTO `settings` (`id`, `alias`, `description`, `is_active`, `created_at`) VALUES
(1, 'is_update_proxy', 'Change proxy status (Enabled / Disabled)', 1, '2021-07-07 13:29:15'),
(2, 'proxy_test', 'text description', 0, '2021-07-07 13:52:42'),
(3, 'tesatar w', 'sadsadsaddsa sad sa', 1, '2021-07-09 11:46:41');

--
-- Индексы сохранённых таблиц
--

--
-- Индексы таблицы `order`
--
ALTER TABLE `order`
  ADD PRIMARY KEY (`id`),
  ADD KEY `portal` (`portal`);

--
-- Индексы таблицы `portal`
--
ALTER TABLE `portal`
  ADD PRIMARY KEY (`id`);

--
-- Индексы таблицы `proxy`
--
ALTER TABLE `proxy`
  ADD PRIMARY KEY (`proxy_id`);

--
-- Индексы таблицы `settings`
--
ALTER TABLE `settings`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT для сохранённых таблиц
--

--
-- AUTO_INCREMENT для таблицы `order`
--
ALTER TABLE `order`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=70;

--
-- AUTO_INCREMENT для таблицы `portal`
--
ALTER TABLE `portal`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT для таблицы `proxy`
--
ALTER TABLE `proxy`
  MODIFY `proxy_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT для таблицы `settings`
--
ALTER TABLE `settings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- Ограничения внешнего ключа сохраненных таблиц
--

--
-- Ограничения внешнего ключа таблицы `order`
--
ALTER TABLE `order`
  ADD CONSTRAINT `tmp_portal` FOREIGN KEY (`portal`) REFERENCES `portal` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

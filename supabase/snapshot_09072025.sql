SET session_replication_role = replica;

--
-- PostgreSQL database dump
--

-- Dumped from database version 17.4
-- Dumped by pg_dump version 17.4

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: audit_log_entries; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: flow_state; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: users; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: identities; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: instances; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: sessions; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: mfa_amr_claims; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: mfa_factors; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: mfa_challenges; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: one_time_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: refresh_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: sso_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: saml_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: saml_relay_states; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: sso_domains; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: rooms; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."rooms" ("id", "name", "description", "capacity", "color_base_hue", "is_active", "created_at", "updated_at") VALUES
	('1-21', 'AES Learnet Room 1-21', 'Main conference room with projector and whiteboard', 30, 0, true, '2025-06-24 17:17:06.666701+00', '2025-06-24 17:17:06.666701+00'),
	('1-17', 'AES Learnet Room 1-17', 'Training room with flexible seating arrangement', 25, 240, true, '2025-06-24 17:17:06.666701+00', '2025-06-24 17:17:06.666701+00');


--
-- Data for Name: events; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."events" ("id", "room_id", "event_name", "poc_name", "phone_number", "start_time", "end_time", "color_hue", "created_at", "updated_at") VALUES
	('2edc7836-9827-42a5-a252-60b16b9eb68c', '1-21', 'ACP Training Program', 'ME3 Kok Wai Chung, CPL Kaleb Nim', '84953150', '08:00:00', '17:30:00', 0, '2025-06-24 17:17:06.666701+00', '2025-06-24 17:17:06.666701+00'),
	('9775cd7c-5b2d-4c6f-aceb-f223a90cebc6', '1-21', 'Leadership Workshop', 'MSG John Tan', '91234567', '09:00:00', '16:00:00', 15, '2025-06-24 17:17:06.666701+00', '2025-06-24 17:17:06.666701+00'),
	('76b825df-9adc-439f-a72c-953c42406df1', '1-17', 'Technical Briefing', 'LTA Sarah Lim', '87654321', '07:30:00', '17:00:00', 240, '2025-06-24 17:17:06.666701+00', '2025-06-24 17:17:06.666701+00'),
	('19368776-1c74-4081-9558-c8cac4f7a28b', '1-17', 'Team Building Session', 'CPT Michael Wong', '98765432', '10:00:00', '15:00:00', 255, '2025-06-24 17:17:06.666701+00', '2025-06-24 17:17:06.666701+00'),
	('e33cb13a-5470-47b3-b55c-099785700322', '1-21', '202 RW Grad', 'ME3 Wilfred', NULL, '08:00:00', '17:30:00', 300, '2025-06-25 05:41:07.044559+00', '2025-06-25 05:41:07.044559+00'),
	('477190c1-d526-43e9-8001-591c7f2a8947', '1-21', 'GKS CSC', 'ME5 Chua SB', NULL, '08:00:00', '17:30:00', 330, '2025-06-25 05:42:33.236478+00', '2025-06-25 05:42:33.236478+00'),
	('4cf32366-c9c5-4fe5-86c2-ca326ee663fb', '1-21', 'F35 Engineering Seminar', 'ME5 Chua SB', NULL, '08:00:00', '17:30:00', 30, '2025-06-25 05:43:44.464839+00', '2025-06-25 05:43:44.464839+00'),
	('fc9c9934-a462-4501-a8fe-3e86e3a6c99e', '1-21', 'NS man seminar', 'CPL Kaleb', NULL, '08:00:00', '17:30:00', 12, '2025-06-25 05:47:53.868221+00', '2025-06-25 05:47:53.868221+00'),
	('365f1d49-3d34-4c54-a5d5-c08b0f567fe2', '1-21', 'NS man seminar', 'CPL Kaleb', NULL, '08:00:00', '17:30:00', 7, '2025-06-25 05:48:53.46533+00', '2025-06-25 05:48:53.46533+00'),
	('906d664f-a536-41bb-8648-c720a31ae25b', '1-21', '12th SQN CC Programme', 'ME3 Jonathan', NULL, '08:00:00', '17:30:00', 6, '2025-06-25 05:50:49.423026+00', '2025-06-25 05:50:49.423026+00'),
	('78f69e4f-4fa9-44bb-87f6-d2a3f894e1f1', '1-21', '12th SQN CC Programme', 'ME3 Jonathan', NULL, '08:00:00', '17:30:00', 352, '2025-06-25 05:51:04.409162+00', '2025-06-25 05:51:04.409162+00'),
	('e6ec20b9-f07c-4bb8-ad7d-54e0cf7e619a', '1-21', '12th SQN CC Programme', 'ME3 Jonathan', NULL, '08:00:00', '17:30:00', 20, '2025-06-25 05:51:56.227182+00', '2025-06-25 05:51:56.227182+00'),
	('07cffe44-9269-4cd2-9c17-ecba1de25ba9', '1-21', '202 FW Grad', 'ME3 ED Yeo', NULL, '08:00:00', '17:30:00', 352, '2025-06-25 05:53:53.866243+00', '2025-06-25 05:53:53.866243+00'),
	('8861d7c0-b33a-490b-ac97-9f7dbaa18dc1', '1-17', 'ACP', 'CPL Kaleb', NULL, '08:00:00', '17:30:00', 180, '2025-06-25 06:00:24.026366+00', '2025-06-25 06:00:24.026366+00'),
	('abdd910d-821e-4050-a819-5363d9f18134', '1-21', 'ACP', 'CPL Kaleb', NULL, '08:00:00', '17:30:00', 347, '2025-06-25 06:03:10.470309+00', '2025-06-25 06:03:10.470309+00'),
	('2613061a-b5dd-4412-b6f5-819fcfed6d90', '1-17', 'AMD ', 'ME3 Kok Wai Chung ', NULL, '08:00:00', '17:30:00', 210, '2025-06-30 05:16:12.310808+00', '2025-06-30 05:16:12.310808+00'),
	('34f0d898-1347-4910-8e49-d175f2499d14', '1-17', 'AMD ', 'ME3 Kok Wai Chung ', NULL, '08:00:00', '17:30:00', 270, '2025-06-30 05:16:58.033802+00', '2025-06-30 05:16:58.033802+00'),
	('a281d7c2-6b2f-48ff-9a32-c6ea785f92d7', '1-21', 'AMD ', 'ME3 Kok Wai Chung ', NULL, '08:00:00', '17:30:00', 14, '2025-06-30 05:30:19.910112+00', '2025-06-30 05:30:19.910112+00'),
	('e055d1d2-89cc-4411-99ab-3a7574fcbc80', '1-17', '202 RCEI Graduation', 'ME3 Jeff', NULL, '08:00:00', '12:00:00', 226, '2025-07-02 04:24:49.693214+00', '2025-07-02 04:24:49.693214+00'),
	('44f0b6b3-ec58-41c1-959e-f64e2c267116', '1-21', 'F35 Engineering Seminar', 'ME5 Chua Seong Bee', NULL, '08:00:00', '17:30:00', 3, '2025-07-04 07:00:37.303528+00', '2025-07-04 07:00:37.303528+00');


--
-- Data for Name: bookings; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."bookings" ("id", "event_id", "date", "created_at", "updated_at") VALUES
	('94e1044a-cf31-46aa-983c-0d41da057c0a', 'e33cb13a-5470-47b3-b55c-099785700322', '2025-08-14', '2025-06-25 05:41:07.222884+00', '2025-06-25 05:41:07.222884+00'),
	('9c7ba1a4-4fbd-419e-aa8b-00aed3fa8aec', '477190c1-d526-43e9-8001-591c7f2a8947', '2025-07-02', '2025-06-25 05:42:33.276847+00', '2025-06-25 05:42:33.276847+00'),
	('6675bfea-8a50-4d47-a3df-483632fdfa75', '477190c1-d526-43e9-8001-591c7f2a8947', '2025-07-03', '2025-06-25 05:42:33.276847+00', '2025-06-25 05:42:33.276847+00'),
	('d61a8206-1766-4394-ba13-a5692a8cc4d8', '477190c1-d526-43e9-8001-591c7f2a8947', '2025-07-04', '2025-06-25 05:42:33.276847+00', '2025-06-25 05:42:33.276847+00'),
	('05065020-cc1d-4602-854a-155a3f61418b', '4cf32366-c9c5-4fe5-86c2-ca326ee663fb', '2025-07-17', '2025-06-25 05:43:44.624042+00', '2025-06-25 05:43:44.624042+00'),
	('e87b2573-407f-4521-95ef-e57616ab6cfc', 'fc9c9934-a462-4501-a8fe-3e86e3a6c99e', '2025-07-07', '2025-06-25 05:47:53.904919+00', '2025-06-25 05:47:53.904919+00'),
	('22e6d21e-5b03-44a2-aac4-5e9cd6d275e7', 'fc9c9934-a462-4501-a8fe-3e86e3a6c99e', '2025-07-08', '2025-06-25 05:47:53.904919+00', '2025-06-25 05:47:53.904919+00'),
	('487a41b0-c138-4330-ae76-a4c034e7d8ea', 'fc9c9934-a462-4501-a8fe-3e86e3a6c99e', '2025-07-09', '2025-06-25 05:47:53.904919+00', '2025-06-25 05:47:53.904919+00'),
	('5ec6af20-4e01-44c0-8e1a-e88bfe1595d6', 'fc9c9934-a462-4501-a8fe-3e86e3a6c99e', '2025-07-10', '2025-06-25 05:47:53.904919+00', '2025-06-25 05:47:53.904919+00'),
	('ef7107f6-3686-41be-a543-d7cb2b09a811', 'fc9c9934-a462-4501-a8fe-3e86e3a6c99e', '2025-07-11', '2025-06-25 05:47:53.904919+00', '2025-06-25 05:47:53.904919+00'),
	('ef0f4d6d-b4d8-48c0-b1e3-97a873122287', '365f1d49-3d34-4c54-a5d5-c08b0f567fe2', '2025-07-28', '2025-06-25 05:48:53.507745+00', '2025-06-25 05:48:53.507745+00'),
	('1bf0ae4f-170a-4697-9813-2948d55ae3e1', '365f1d49-3d34-4c54-a5d5-c08b0f567fe2', '2025-07-29', '2025-06-25 05:48:53.507745+00', '2025-06-25 05:48:53.507745+00'),
	('b235db6a-8a1f-45f6-983b-9d99c702c81f', '365f1d49-3d34-4c54-a5d5-c08b0f567fe2', '2025-07-30', '2025-06-25 05:48:53.507745+00', '2025-06-25 05:48:53.507745+00'),
	('28765a25-db15-4af5-8424-f3609e932891', '365f1d49-3d34-4c54-a5d5-c08b0f567fe2', '2025-07-31', '2025-06-25 05:48:53.507745+00', '2025-06-25 05:48:53.507745+00'),
	('0c2e3363-5d0f-46bf-9c88-db21809daec4', '365f1d49-3d34-4c54-a5d5-c08b0f567fe2', '2025-08-01', '2025-06-25 05:48:53.507745+00', '2025-06-25 05:48:53.507745+00'),
	('2b6c1b31-b77e-417e-9aa5-dafffc62fca6', '906d664f-a536-41bb-8648-c720a31ae25b', '2025-08-13', '2025-06-25 05:50:49.588886+00', '2025-06-25 05:50:49.588886+00'),
	('03f27bb4-08d6-4671-9235-3e1c6b5a90af', '78f69e4f-4fa9-44bb-87f6-d2a3f894e1f1', '2025-08-15', '2025-06-25 05:51:04.540671+00', '2025-06-25 05:51:04.540671+00'),
	('2fd06550-baef-401e-a3e8-b10648f3cc6c', 'e6ec20b9-f07c-4bb8-ad7d-54e0cf7e619a', '2025-08-18', '2025-06-25 05:51:56.278909+00', '2025-06-25 05:51:56.278909+00'),
	('2cd70a4a-2c90-4136-ab8c-37139a282170', 'e6ec20b9-f07c-4bb8-ad7d-54e0cf7e619a', '2025-08-19', '2025-06-25 05:51:56.278909+00', '2025-06-25 05:51:56.278909+00'),
	('d6011f04-71ea-47c6-9db7-4f9d0aac98aa', 'e6ec20b9-f07c-4bb8-ad7d-54e0cf7e619a', '2025-08-20', '2025-06-25 05:51:56.278909+00', '2025-06-25 05:51:56.278909+00'),
	('6c531bdf-21f6-4bf0-a205-ebed85ca4e92', 'e6ec20b9-f07c-4bb8-ad7d-54e0cf7e619a', '2025-08-21', '2025-06-25 05:51:56.278909+00', '2025-06-25 05:51:56.278909+00'),
	('ecca7dbe-cee8-41d1-8c14-32e8bda3d6f1', 'e6ec20b9-f07c-4bb8-ad7d-54e0cf7e619a', '2025-08-22', '2025-06-25 05:51:56.278909+00', '2025-06-25 05:51:56.278909+00'),
	('299e3f92-df7e-4c13-97a9-a633c4c902bf', 'e6ec20b9-f07c-4bb8-ad7d-54e0cf7e619a', '2025-08-23', '2025-06-25 05:51:56.278909+00', '2025-06-25 05:51:56.278909+00'),
	('8dfb9442-0d18-4ad9-8c24-9bb192d7fc08', 'e6ec20b9-f07c-4bb8-ad7d-54e0cf7e619a', '2025-08-24', '2025-06-25 05:51:56.278909+00', '2025-06-25 05:51:56.278909+00'),
	('eb6fa15d-9409-48a3-b6f4-b74ebaced4ba', 'e6ec20b9-f07c-4bb8-ad7d-54e0cf7e619a', '2025-08-25', '2025-06-25 05:51:56.278909+00', '2025-06-25 05:51:56.278909+00'),
	('95a9a867-df54-43b3-9278-c913d1e40054', 'e6ec20b9-f07c-4bb8-ad7d-54e0cf7e619a', '2025-08-26', '2025-06-25 05:51:56.278909+00', '2025-06-25 05:51:56.278909+00'),
	('b4c5d136-0173-4172-a5f3-bcf0f6f678ed', 'e6ec20b9-f07c-4bb8-ad7d-54e0cf7e619a', '2025-08-27', '2025-06-25 05:51:56.278909+00', '2025-06-25 05:51:56.278909+00'),
	('d170f0e5-5107-49f0-b479-8ac3ca058705', 'e6ec20b9-f07c-4bb8-ad7d-54e0cf7e619a', '2025-08-28', '2025-06-25 05:51:56.278909+00', '2025-06-25 05:51:56.278909+00'),
	('26659fc9-2598-49c8-9c71-4842d802c207', 'e6ec20b9-f07c-4bb8-ad7d-54e0cf7e619a', '2025-08-29', '2025-06-25 05:51:56.278909+00', '2025-06-25 05:51:56.278909+00'),
	('4836cafd-c0a7-4e28-b9c2-50451f1578df', '07cffe44-9269-4cd2-9c17-ecba1de25ba9', '2025-07-15', '2025-06-25 05:53:54.052391+00', '2025-06-25 05:53:54.052391+00'),
	('eb346e59-4274-4af7-8386-b9766a30d6f6', '8861d7c0-b33a-490b-ac97-9f7dbaa18dc1', '2025-07-02', '2025-06-25 06:00:24.078914+00', '2025-06-25 06:00:24.078914+00'),
	('2aec7f22-52a2-4940-8c3c-466cdae2b4aa', '8861d7c0-b33a-490b-ac97-9f7dbaa18dc1', '2025-07-03', '2025-06-25 06:00:24.078914+00', '2025-06-25 06:00:24.078914+00'),
	('7d450162-2b47-42da-a8fb-835407760214', '8861d7c0-b33a-490b-ac97-9f7dbaa18dc1', '2025-07-04', '2025-06-25 06:00:24.078914+00', '2025-06-25 06:00:24.078914+00'),
	('4c3cb38e-4c43-4ffb-b28c-4f710e6c4ea4', 'abdd910d-821e-4050-a819-5363d9f18134', '2025-06-26', '2025-06-25 06:03:10.536388+00', '2025-06-25 06:03:10.536388+00'),
	('96484da3-2e4c-499f-a983-d4d0c29b1e7c', 'abdd910d-821e-4050-a819-5363d9f18134', '2025-06-27', '2025-06-25 06:03:10.536388+00', '2025-06-25 06:03:10.536388+00'),
	('41ec5fd0-26e0-438a-b458-771b21b76029', '2613061a-b5dd-4412-b6f5-819fcfed6d90', '2025-07-29', '2025-06-30 05:16:12.662777+00', '2025-06-30 05:16:12.662777+00'),
	('5e0e1656-15db-43f3-8406-711cac486375', '34f0d898-1347-4910-8e49-d175f2499d14', '2025-07-30', '2025-06-30 05:16:58.144838+00', '2025-06-30 05:16:58.144838+00'),
	('e47c21d8-4783-4b80-a594-8a2e3e0d1fe1', '34f0d898-1347-4910-8e49-d175f2499d14', '2025-07-31', '2025-06-30 05:16:58.144838+00', '2025-06-30 05:16:58.144838+00'),
	('37e9e744-272b-45b2-be83-d9e95c96119e', 'a281d7c2-6b2f-48ff-9a32-c6ea785f92d7', '2025-07-18', '2025-06-30 05:30:20.240923+00', '2025-06-30 05:30:20.240923+00'),
	('49b065d3-bedb-4031-9288-56adae703c47', 'e055d1d2-89cc-4411-99ab-3a7574fcbc80', '2025-08-06', '2025-07-02 04:24:50.023341+00', '2025-07-02 04:24:50.023341+00'),
	('fe7189fd-a2af-478a-b250-ff3db4f8ec18', '44f0b6b3-ec58-41c1-959e-f64e2c267116', '2025-07-16', '2025-07-04 07:00:37.555925+00', '2025-07-04 07:00:37.555925+00');


--
-- Data for Name: buckets; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: objects; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: s3_multipart_uploads; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: s3_multipart_uploads_parts; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE SET; Schema: auth; Owner: supabase_auth_admin
--

SELECT pg_catalog.setval('"auth"."refresh_tokens_id_seq"', 1, false);


--
-- PostgreSQL database dump complete
--

RESET ALL;
	
--
-- PostgreSQL database dump
--

-- Dumped from database version 9.6.15
-- Dumped by pg_dump version 9.6.15

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: plpgsql; Type: EXTENSION; Schema: -; Owner: 
--

CREATE EXTENSION IF NOT EXISTS plpgsql WITH SCHEMA pg_catalog;


--
-- Name: EXTENSION plpgsql; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION plpgsql IS 'PL/pgSQL procedural language';


SET default_tablespace = '';

SET default_with_oids = false;

--
-- Name: contacts; Type: TABLE; Schema: public; Owner: rtcnode
--

CREATE TABLE public.contacts (
    name text NOT NULL,
    number text NOT NULL,
    place text
);


ALTER TABLE public.contacts OWNER TO rtcnode;

--
-- Name: COLUMN contacts.name; Type: COMMENT; Schema: public; Owner: rtcnode
--

COMMENT ON COLUMN public.contacts.name IS 'Данные абонента';


--
-- Name: COLUMN contacts.number; Type: COMMENT; Schema: public; Owner: rtcnode
--

COMMENT ON COLUMN public.contacts.number IS 'Телефонный номер (номер для вызова)';


--
-- Name: COLUMN contacts.place; Type: COMMENT; Schema: public; Owner: rtcnode
--

COMMENT ON COLUMN public.contacts.place IS 'JSON-объект для соединения с абонентом';


--
-- Data for Name: contacts; Type: TABLE DATA; Schema: public; Owner: rtcnode
--

COPY public.contacts (name, number, place) FROM stdin;
Тарасов А.Н.	1356	техник 4отдела НИИИ
Карасев С.Н.	1357	СНС каф 41 АФСО
Миронов В.М.	1355	начальник НИГ4 НИИИ
\.


--
-- PostgreSQL database dump complete
--


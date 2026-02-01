--
-- PostgreSQL database cluster dump
--

\restrict dvTHYaSF8cjefhplN0RY91RNRg6QdsTURdRg5u0T0r5OewScMhAS4APeSWK2nsq

SET default_transaction_read_only = off;

SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;

--
-- Roles
--

CREATE ROLE anon;
ALTER ROLE anon WITH NOSUPERUSER INHERIT NOCREATEROLE NOCREATEDB NOLOGIN NOREPLICATION NOBYPASSRLS;
CREATE ROLE authenticated;
ALTER ROLE authenticated WITH NOSUPERUSER INHERIT NOCREATEROLE NOCREATEDB NOLOGIN NOREPLICATION NOBYPASSRLS;
CREATE ROLE authenticator;
ALTER ROLE authenticator WITH NOSUPERUSER NOINHERIT NOCREATEROLE NOCREATEDB LOGIN NOREPLICATION NOBYPASSRLS;
CREATE ROLE dashboard_user;
ALTER ROLE dashboard_user WITH NOSUPERUSER INHERIT CREATEROLE CREATEDB NOLOGIN REPLICATION NOBYPASSRLS;
CREATE ROLE pgbouncer;
ALTER ROLE pgbouncer WITH NOSUPERUSER INHERIT NOCREATEROLE NOCREATEDB LOGIN NOREPLICATION NOBYPASSRLS;
CREATE ROLE postgres;
ALTER ROLE postgres WITH NOSUPERUSER INHERIT CREATEROLE CREATEDB LOGIN REPLICATION BYPASSRLS;
CREATE ROLE service_role;
ALTER ROLE service_role WITH NOSUPERUSER INHERIT NOCREATEROLE NOCREATEDB NOLOGIN NOREPLICATION BYPASSRLS;
CREATE ROLE supabase_admin;
ALTER ROLE supabase_admin WITH SUPERUSER INHERIT CREATEROLE CREATEDB LOGIN REPLICATION BYPASSRLS;
CREATE ROLE supabase_auth_admin;
ALTER ROLE supabase_auth_admin WITH NOSUPERUSER NOINHERIT CREATEROLE NOCREATEDB LOGIN NOREPLICATION NOBYPASSRLS;
CREATE ROLE supabase_read_only_user;
ALTER ROLE supabase_read_only_user WITH NOSUPERUSER INHERIT NOCREATEROLE NOCREATEDB LOGIN NOREPLICATION BYPASSRLS;
CREATE ROLE supabase_realtime_admin;
ALTER ROLE supabase_realtime_admin WITH NOSUPERUSER NOINHERIT NOCREATEROLE NOCREATEDB NOLOGIN NOREPLICATION NOBYPASSRLS;
CREATE ROLE supabase_replication_admin;
ALTER ROLE supabase_replication_admin WITH NOSUPERUSER INHERIT NOCREATEROLE NOCREATEDB LOGIN REPLICATION NOBYPASSRLS;
CREATE ROLE supabase_storage_admin;
ALTER ROLE supabase_storage_admin WITH NOSUPERUSER NOINHERIT CREATEROLE NOCREATEDB LOGIN NOREPLICATION NOBYPASSRLS;

--
-- User Configurations
--

--
-- User Config "anon"
--

ALTER ROLE anon SET statement_timeout TO '3s';

--
-- User Config "authenticated"
--

ALTER ROLE authenticated SET statement_timeout TO '8s';

--
-- User Config "authenticator"
--

ALTER ROLE authenticator SET session_preload_libraries TO 'safeupdate';
ALTER ROLE authenticator SET statement_timeout TO '8s';
ALTER ROLE authenticator SET lock_timeout TO '8s';

--
-- User Config "postgres"
--

ALTER ROLE postgres SET search_path TO E'\\$user', 'public', 'extensions';

--
-- User Config "supabase_admin"
--

ALTER ROLE supabase_admin SET search_path TO '$user', 'public', 'auth', 'extensions';
ALTER ROLE supabase_admin SET log_statement TO 'none';

--
-- User Config "supabase_auth_admin"
--

ALTER ROLE supabase_auth_admin SET search_path TO 'auth';
ALTER ROLE supabase_auth_admin SET idle_in_transaction_session_timeout TO '60000';
ALTER ROLE supabase_auth_admin SET log_statement TO 'none';

--
-- User Config "supabase_storage_admin"
--

ALTER ROLE supabase_storage_admin SET search_path TO 'storage';
ALTER ROLE supabase_storage_admin SET log_statement TO 'none';


--
-- Role memberships
--

GRANT anon TO authenticator WITH INHERIT FALSE GRANTED BY supabase_admin;
GRANT anon TO postgres WITH ADMIN OPTION, INHERIT TRUE GRANTED BY supabase_admin;
GRANT authenticated TO authenticator WITH INHERIT FALSE GRANTED BY supabase_admin;
GRANT authenticated TO postgres WITH ADMIN OPTION, INHERIT TRUE GRANTED BY supabase_admin;
GRANT authenticator TO postgres WITH ADMIN OPTION, INHERIT TRUE GRANTED BY supabase_admin;
GRANT authenticator TO supabase_storage_admin WITH INHERIT FALSE GRANTED BY supabase_admin;
GRANT pg_create_subscription TO postgres WITH INHERIT TRUE GRANTED BY supabase_admin;
GRANT pg_monitor TO postgres WITH ADMIN OPTION, INHERIT TRUE GRANTED BY supabase_admin;
GRANT pg_read_all_data TO postgres WITH ADMIN OPTION, INHERIT TRUE GRANTED BY supabase_admin;
GRANT pg_read_all_data TO supabase_read_only_user WITH INHERIT TRUE GRANTED BY supabase_admin;
GRANT pg_signal_backend TO postgres WITH ADMIN OPTION, INHERIT TRUE GRANTED BY supabase_admin;
GRANT service_role TO authenticator WITH INHERIT FALSE GRANTED BY supabase_admin;
GRANT service_role TO postgres WITH ADMIN OPTION, INHERIT TRUE GRANTED BY supabase_admin;
GRANT supabase_realtime_admin TO postgres WITH INHERIT TRUE GRANTED BY supabase_admin;






\unrestrict dvTHYaSF8cjefhplN0RY91RNRg6QdsTURdRg5u0T0r5OewScMhAS4APeSWK2nsq

--
-- Databases
--

--
-- Database "template1" dump
--

\connect template1

--
-- PostgreSQL database dump
--

\restrict 7rPwe0pEoVVvMRuXLtoeWskI5ciFGtHn4nhKWnrdkWzv2maey4dHw9uIhLPgZCQ

-- Dumped from database version 17.4
-- Dumped by pg_dump version 17.6 (Debian 17.6-1.pgdg12+1)

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
-- PostgreSQL database dump complete
--

\unrestrict 7rPwe0pEoVVvMRuXLtoeWskI5ciFGtHn4nhKWnrdkWzv2maey4dHw9uIhLPgZCQ

--
-- Database "postgres" dump
--

\connect postgres

--
-- PostgreSQL database dump
--

\restrict Xs0XRs6OtHQMNVtmfQqW0DIjhQ8L7HeS4v9IpgAc2ECIXJafGO51h6pxceYW3Ux

-- Dumped from database version 17.4
-- Dumped by pg_dump version 17.6 (Debian 17.6-1.pgdg12+1)

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
-- Name: auth; Type: SCHEMA; Schema: -; Owner: supabase_admin
--

CREATE SCHEMA auth;


ALTER SCHEMA auth OWNER TO supabase_admin;

--
-- Name: extensions; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA extensions;


ALTER SCHEMA extensions OWNER TO postgres;

--
-- Name: graphql; Type: SCHEMA; Schema: -; Owner: supabase_admin
--

CREATE SCHEMA graphql;


ALTER SCHEMA graphql OWNER TO supabase_admin;

--
-- Name: graphql_public; Type: SCHEMA; Schema: -; Owner: supabase_admin
--

CREATE SCHEMA graphql_public;


ALTER SCHEMA graphql_public OWNER TO supabase_admin;

--
-- Name: pgbouncer; Type: SCHEMA; Schema: -; Owner: pgbouncer
--

CREATE SCHEMA pgbouncer;


ALTER SCHEMA pgbouncer OWNER TO pgbouncer;

--
-- Name: realtime; Type: SCHEMA; Schema: -; Owner: supabase_admin
--

CREATE SCHEMA realtime;


ALTER SCHEMA realtime OWNER TO supabase_admin;

--
-- Name: storage; Type: SCHEMA; Schema: -; Owner: supabase_admin
--

CREATE SCHEMA storage;


ALTER SCHEMA storage OWNER TO supabase_admin;

--
-- Name: vault; Type: SCHEMA; Schema: -; Owner: supabase_admin
--

CREATE SCHEMA vault;


ALTER SCHEMA vault OWNER TO supabase_admin;

--
-- Name: pg_graphql; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_graphql WITH SCHEMA graphql;


--
-- Name: EXTENSION pg_graphql; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pg_graphql IS 'pg_graphql: GraphQL support';


--
-- Name: pg_stat_statements; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_stat_statements WITH SCHEMA extensions;


--
-- Name: EXTENSION pg_stat_statements; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pg_stat_statements IS 'track planning and execution statistics of all SQL statements executed';


--
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;


--
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


--
-- Name: supabase_vault; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS supabase_vault WITH SCHEMA vault;


--
-- Name: EXTENSION supabase_vault; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION supabase_vault IS 'Supabase Vault Extension';


--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA extensions;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- Name: aal_level; Type: TYPE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TYPE auth.aal_level AS ENUM (
    'aal1',
    'aal2',
    'aal3'
);


ALTER TYPE auth.aal_level OWNER TO supabase_auth_admin;

--
-- Name: code_challenge_method; Type: TYPE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TYPE auth.code_challenge_method AS ENUM (
    's256',
    'plain'
);


ALTER TYPE auth.code_challenge_method OWNER TO supabase_auth_admin;

--
-- Name: factor_status; Type: TYPE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TYPE auth.factor_status AS ENUM (
    'unverified',
    'verified'
);


ALTER TYPE auth.factor_status OWNER TO supabase_auth_admin;

--
-- Name: factor_type; Type: TYPE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TYPE auth.factor_type AS ENUM (
    'totp',
    'webauthn',
    'phone'
);


ALTER TYPE auth.factor_type OWNER TO supabase_auth_admin;

--
-- Name: one_time_token_type; Type: TYPE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TYPE auth.one_time_token_type AS ENUM (
    'confirmation_token',
    'reauthentication_token',
    'recovery_token',
    'email_change_token_new',
    'email_change_token_current',
    'phone_change_token'
);


ALTER TYPE auth.one_time_token_type OWNER TO supabase_auth_admin;

--
-- Name: action; Type: TYPE; Schema: realtime; Owner: supabase_admin
--

CREATE TYPE realtime.action AS ENUM (
    'INSERT',
    'UPDATE',
    'DELETE',
    'TRUNCATE',
    'ERROR'
);


ALTER TYPE realtime.action OWNER TO supabase_admin;

--
-- Name: equality_op; Type: TYPE; Schema: realtime; Owner: supabase_admin
--

CREATE TYPE realtime.equality_op AS ENUM (
    'eq',
    'neq',
    'lt',
    'lte',
    'gt',
    'gte',
    'in'
);


ALTER TYPE realtime.equality_op OWNER TO supabase_admin;

--
-- Name: user_defined_filter; Type: TYPE; Schema: realtime; Owner: supabase_admin
--

CREATE TYPE realtime.user_defined_filter AS (
	column_name text,
	op realtime.equality_op,
	value text
);


ALTER TYPE realtime.user_defined_filter OWNER TO supabase_admin;

--
-- Name: wal_column; Type: TYPE; Schema: realtime; Owner: supabase_admin
--

CREATE TYPE realtime.wal_column AS (
	name text,
	type_name text,
	type_oid oid,
	value jsonb,
	is_pkey boolean,
	is_selectable boolean
);


ALTER TYPE realtime.wal_column OWNER TO supabase_admin;

--
-- Name: wal_rls; Type: TYPE; Schema: realtime; Owner: supabase_admin
--

CREATE TYPE realtime.wal_rls AS (
	wal jsonb,
	is_rls_enabled boolean,
	subscription_ids uuid[],
	errors text[]
);


ALTER TYPE realtime.wal_rls OWNER TO supabase_admin;

--
-- Name: email(); Type: FUNCTION; Schema: auth; Owner: supabase_auth_admin
--

CREATE FUNCTION auth.email() RETURNS text
    LANGUAGE sql STABLE
    AS $$
  select 
  coalesce(
    nullif(current_setting('request.jwt.claim.email', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'email')
  )::text
$$;


ALTER FUNCTION auth.email() OWNER TO supabase_auth_admin;

--
-- Name: FUNCTION email(); Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON FUNCTION auth.email() IS 'Deprecated. Use auth.jwt() -> ''email'' instead.';


--
-- Name: jwt(); Type: FUNCTION; Schema: auth; Owner: supabase_auth_admin
--

CREATE FUNCTION auth.jwt() RETURNS jsonb
    LANGUAGE sql STABLE
    AS $$
  select 
    coalesce(
        nullif(current_setting('request.jwt.claim', true), ''),
        nullif(current_setting('request.jwt.claims', true), '')
    )::jsonb
$$;


ALTER FUNCTION auth.jwt() OWNER TO supabase_auth_admin;

--
-- Name: role(); Type: FUNCTION; Schema: auth; Owner: supabase_auth_admin
--

CREATE FUNCTION auth.role() RETURNS text
    LANGUAGE sql STABLE
    AS $$
  select 
  coalesce(
    nullif(current_setting('request.jwt.claim.role', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'role')
  )::text
$$;


ALTER FUNCTION auth.role() OWNER TO supabase_auth_admin;

--
-- Name: FUNCTION role(); Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON FUNCTION auth.role() IS 'Deprecated. Use auth.jwt() -> ''role'' instead.';


--
-- Name: uid(); Type: FUNCTION; Schema: auth; Owner: supabase_auth_admin
--

CREATE FUNCTION auth.uid() RETURNS uuid
    LANGUAGE sql STABLE
    AS $$
  select 
  coalesce(
    nullif(current_setting('request.jwt.claim.sub', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub')
  )::uuid
$$;


ALTER FUNCTION auth.uid() OWNER TO supabase_auth_admin;

--
-- Name: FUNCTION uid(); Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON FUNCTION auth.uid() IS 'Deprecated. Use auth.jwt() -> ''sub'' instead.';


--
-- Name: grant_pg_cron_access(); Type: FUNCTION; Schema: extensions; Owner: supabase_admin
--

CREATE FUNCTION extensions.grant_pg_cron_access() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  IF EXISTS (
    SELECT
    FROM pg_event_trigger_ddl_commands() AS ev
    JOIN pg_extension AS ext
    ON ev.objid = ext.oid
    WHERE ext.extname = 'pg_cron'
  )
  THEN
    grant usage on schema cron to postgres with grant option;

    alter default privileges in schema cron grant all on tables to postgres with grant option;
    alter default privileges in schema cron grant all on functions to postgres with grant option;
    alter default privileges in schema cron grant all on sequences to postgres with grant option;

    alter default privileges for user supabase_admin in schema cron grant all
        on sequences to postgres with grant option;
    alter default privileges for user supabase_admin in schema cron grant all
        on tables to postgres with grant option;
    alter default privileges for user supabase_admin in schema cron grant all
        on functions to postgres with grant option;

    grant all privileges on all tables in schema cron to postgres with grant option;
    revoke all on table cron.job from postgres;
    grant select on table cron.job to postgres with grant option;
  END IF;
END;
$$;


ALTER FUNCTION extensions.grant_pg_cron_access() OWNER TO supabase_admin;

--
-- Name: FUNCTION grant_pg_cron_access(); Type: COMMENT; Schema: extensions; Owner: supabase_admin
--

COMMENT ON FUNCTION extensions.grant_pg_cron_access() IS 'Grants access to pg_cron';


--
-- Name: grant_pg_graphql_access(); Type: FUNCTION; Schema: extensions; Owner: supabase_admin
--

CREATE FUNCTION extensions.grant_pg_graphql_access() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $_$
DECLARE
    func_is_graphql_resolve bool;
BEGIN
    func_is_graphql_resolve = (
        SELECT n.proname = 'resolve'
        FROM pg_event_trigger_ddl_commands() AS ev
        LEFT JOIN pg_catalog.pg_proc AS n
        ON ev.objid = n.oid
    );

    IF func_is_graphql_resolve
    THEN
        -- Update public wrapper to pass all arguments through to the pg_graphql resolve func
        DROP FUNCTION IF EXISTS graphql_public.graphql;
        create or replace function graphql_public.graphql(
            "operationName" text default null,
            query text default null,
            variables jsonb default null,
            extensions jsonb default null
        )
            returns jsonb
            language sql
        as $$
            select graphql.resolve(
                query := query,
                variables := coalesce(variables, '{}'),
                "operationName" := "operationName",
                extensions := extensions
            );
        $$;

        -- This hook executes when `graphql.resolve` is created. That is not necessarily the last
        -- function in the extension so we need to grant permissions on existing entities AND
        -- update default permissions to any others that are created after `graphql.resolve`
        grant usage on schema graphql to postgres, anon, authenticated, service_role;
        grant select on all tables in schema graphql to postgres, anon, authenticated, service_role;
        grant execute on all functions in schema graphql to postgres, anon, authenticated, service_role;
        grant all on all sequences in schema graphql to postgres, anon, authenticated, service_role;
        alter default privileges in schema graphql grant all on tables to postgres, anon, authenticated, service_role;
        alter default privileges in schema graphql grant all on functions to postgres, anon, authenticated, service_role;
        alter default privileges in schema graphql grant all on sequences to postgres, anon, authenticated, service_role;

        -- Allow postgres role to allow granting usage on graphql and graphql_public schemas to custom roles
        grant usage on schema graphql_public to postgres with grant option;
        grant usage on schema graphql to postgres with grant option;
    END IF;

END;
$_$;


ALTER FUNCTION extensions.grant_pg_graphql_access() OWNER TO supabase_admin;

--
-- Name: FUNCTION grant_pg_graphql_access(); Type: COMMENT; Schema: extensions; Owner: supabase_admin
--

COMMENT ON FUNCTION extensions.grant_pg_graphql_access() IS 'Grants access to pg_graphql';


--
-- Name: grant_pg_net_access(); Type: FUNCTION; Schema: extensions; Owner: supabase_admin
--

CREATE FUNCTION extensions.grant_pg_net_access() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_event_trigger_ddl_commands() AS ev
    JOIN pg_extension AS ext
    ON ev.objid = ext.oid
    WHERE ext.extname = 'pg_net'
  )
  THEN
    IF NOT EXISTS (
      SELECT 1
      FROM pg_roles
      WHERE rolname = 'supabase_functions_admin'
    )
    THEN
      CREATE USER supabase_functions_admin NOINHERIT CREATEROLE LOGIN NOREPLICATION;
    END IF;

    GRANT USAGE ON SCHEMA net TO supabase_functions_admin, postgres, anon, authenticated, service_role;

    IF EXISTS (
      SELECT FROM pg_extension
      WHERE extname = 'pg_net'
      -- all versions in use on existing projects as of 2025-02-20
      -- version 0.12.0 onwards don't need these applied
      AND extversion IN ('0.2', '0.6', '0.7', '0.7.1', '0.8', '0.10.0', '0.11.0')
    ) THEN
      ALTER function net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) SECURITY DEFINER;
      ALTER function net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) SECURITY DEFINER;

      ALTER function net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) SET search_path = net;
      ALTER function net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) SET search_path = net;

      REVOKE ALL ON FUNCTION net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) FROM PUBLIC;
      REVOKE ALL ON FUNCTION net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) FROM PUBLIC;

      GRANT EXECUTE ON FUNCTION net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) TO supabase_functions_admin, postgres, anon, authenticated, service_role;
      GRANT EXECUTE ON FUNCTION net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) TO supabase_functions_admin, postgres, anon, authenticated, service_role;
    END IF;
  END IF;
END;
$$;


ALTER FUNCTION extensions.grant_pg_net_access() OWNER TO supabase_admin;

--
-- Name: FUNCTION grant_pg_net_access(); Type: COMMENT; Schema: extensions; Owner: supabase_admin
--

COMMENT ON FUNCTION extensions.grant_pg_net_access() IS 'Grants access to pg_net';


--
-- Name: pgrst_ddl_watch(); Type: FUNCTION; Schema: extensions; Owner: supabase_admin
--

CREATE FUNCTION extensions.pgrst_ddl_watch() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
  cmd record;
BEGIN
  FOR cmd IN SELECT * FROM pg_event_trigger_ddl_commands()
  LOOP
    IF cmd.command_tag IN (
      'CREATE SCHEMA', 'ALTER SCHEMA'
    , 'CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO', 'ALTER TABLE'
    , 'CREATE FOREIGN TABLE', 'ALTER FOREIGN TABLE'
    , 'CREATE VIEW', 'ALTER VIEW'
    , 'CREATE MATERIALIZED VIEW', 'ALTER MATERIALIZED VIEW'
    , 'CREATE FUNCTION', 'ALTER FUNCTION'
    , 'CREATE TRIGGER'
    , 'CREATE TYPE', 'ALTER TYPE'
    , 'CREATE RULE'
    , 'COMMENT'
    )
    -- don't notify in case of CREATE TEMP table or other objects created on pg_temp
    AND cmd.schema_name is distinct from 'pg_temp'
    THEN
      NOTIFY pgrst, 'reload schema';
    END IF;
  END LOOP;
END; $$;


ALTER FUNCTION extensions.pgrst_ddl_watch() OWNER TO supabase_admin;

--
-- Name: pgrst_drop_watch(); Type: FUNCTION; Schema: extensions; Owner: supabase_admin
--

CREATE FUNCTION extensions.pgrst_drop_watch() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
  obj record;
BEGIN
  FOR obj IN SELECT * FROM pg_event_trigger_dropped_objects()
  LOOP
    IF obj.object_type IN (
      'schema'
    , 'table'
    , 'foreign table'
    , 'view'
    , 'materialized view'
    , 'function'
    , 'trigger'
    , 'type'
    , 'rule'
    )
    AND obj.is_temporary IS false -- no pg_temp objects
    THEN
      NOTIFY pgrst, 'reload schema';
    END IF;
  END LOOP;
END; $$;


ALTER FUNCTION extensions.pgrst_drop_watch() OWNER TO supabase_admin;

--
-- Name: set_graphql_placeholder(); Type: FUNCTION; Schema: extensions; Owner: supabase_admin
--

CREATE FUNCTION extensions.set_graphql_placeholder() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $_$
    DECLARE
    graphql_is_dropped bool;
    BEGIN
    graphql_is_dropped = (
        SELECT ev.schema_name = 'graphql_public'
        FROM pg_event_trigger_dropped_objects() AS ev
        WHERE ev.schema_name = 'graphql_public'
    );

    IF graphql_is_dropped
    THEN
        create or replace function graphql_public.graphql(
            "operationName" text default null,
            query text default null,
            variables jsonb default null,
            extensions jsonb default null
        )
            returns jsonb
            language plpgsql
        as $$
            DECLARE
                server_version float;
            BEGIN
                server_version = (SELECT (SPLIT_PART((select version()), ' ', 2))::float);

                IF server_version >= 14 THEN
                    RETURN jsonb_build_object(
                        'errors', jsonb_build_array(
                            jsonb_build_object(
                                'message', 'pg_graphql extension is not enabled.'
                            )
                        )
                    );
                ELSE
                    RETURN jsonb_build_object(
                        'errors', jsonb_build_array(
                            jsonb_build_object(
                                'message', 'pg_graphql is only available on projects running Postgres 14 onwards.'
                            )
                        )
                    );
                END IF;
            END;
        $$;
    END IF;

    END;
$_$;


ALTER FUNCTION extensions.set_graphql_placeholder() OWNER TO supabase_admin;

--
-- Name: FUNCTION set_graphql_placeholder(); Type: COMMENT; Schema: extensions; Owner: supabase_admin
--

COMMENT ON FUNCTION extensions.set_graphql_placeholder() IS 'Reintroduces placeholder function for graphql_public.graphql';


--
-- Name: get_auth(text); Type: FUNCTION; Schema: pgbouncer; Owner: supabase_admin
--

CREATE FUNCTION pgbouncer.get_auth(p_usename text) RETURNS TABLE(username text, password text)
    LANGUAGE plpgsql SECURITY DEFINER
    AS $_$
begin
    raise debug 'PgBouncer auth request: %', p_usename;

    return query
    select 
        rolname::text, 
        case when rolvaliduntil < now() 
            then null 
            else rolpassword::text 
        end 
    from pg_authid 
    where rolname=$1 and rolcanlogin;
end;
$_$;


ALTER FUNCTION pgbouncer.get_auth(p_usename text) OWNER TO supabase_admin;

--
-- Name: apply_rls(jsonb, integer); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer DEFAULT (1024 * 1024)) RETURNS SETOF realtime.wal_rls
    LANGUAGE plpgsql
    AS $$
declare
-- Regclass of the table e.g. public.notes
entity_ regclass = (quote_ident(wal ->> 'schema') || '.' || quote_ident(wal ->> 'table'))::regclass;

-- I, U, D, T: insert, update ...
action realtime.action = (
    case wal ->> 'action'
        when 'I' then 'INSERT'
        when 'U' then 'UPDATE'
        when 'D' then 'DELETE'
        else 'ERROR'
    end
);

-- Is row level security enabled for the table
is_rls_enabled bool = relrowsecurity from pg_class where oid = entity_;

subscriptions realtime.subscription[] = array_agg(subs)
    from
        realtime.subscription subs
    where
        subs.entity = entity_;

-- Subscription vars
roles regrole[] = array_agg(distinct us.claims_role::text)
    from
        unnest(subscriptions) us;

working_role regrole;
claimed_role regrole;
claims jsonb;

subscription_id uuid;
subscription_has_access bool;
visible_to_subscription_ids uuid[] = '{}';

-- structured info for wal's columns
columns realtime.wal_column[];
-- previous identity values for update/delete
old_columns realtime.wal_column[];

error_record_exceeds_max_size boolean = octet_length(wal::text) > max_record_bytes;

-- Primary jsonb output for record
output jsonb;

begin
perform set_config('role', null, true);

columns =
    array_agg(
        (
            x->>'name',
            x->>'type',
            x->>'typeoid',
            realtime.cast(
                (x->'value') #>> '{}',
                coalesce(
                    (x->>'typeoid')::regtype, -- null when wal2json version <= 2.4
                    (x->>'type')::regtype
                )
            ),
            (pks ->> 'name') is not null,
            true
        )::realtime.wal_column
    )
    from
        jsonb_array_elements(wal -> 'columns') x
        left join jsonb_array_elements(wal -> 'pk') pks
            on (x ->> 'name') = (pks ->> 'name');

old_columns =
    array_agg(
        (
            x->>'name',
            x->>'type',
            x->>'typeoid',
            realtime.cast(
                (x->'value') #>> '{}',
                coalesce(
                    (x->>'typeoid')::regtype, -- null when wal2json version <= 2.4
                    (x->>'type')::regtype
                )
            ),
            (pks ->> 'name') is not null,
            true
        )::realtime.wal_column
    )
    from
        jsonb_array_elements(wal -> 'identity') x
        left join jsonb_array_elements(wal -> 'pk') pks
            on (x ->> 'name') = (pks ->> 'name');

for working_role in select * from unnest(roles) loop

    -- Update `is_selectable` for columns and old_columns
    columns =
        array_agg(
            (
                c.name,
                c.type_name,
                c.type_oid,
                c.value,
                c.is_pkey,
                pg_catalog.has_column_privilege(working_role, entity_, c.name, 'SELECT')
            )::realtime.wal_column
        )
        from
            unnest(columns) c;

    old_columns =
            array_agg(
                (
                    c.name,
                    c.type_name,
                    c.type_oid,
                    c.value,
                    c.is_pkey,
                    pg_catalog.has_column_privilege(working_role, entity_, c.name, 'SELECT')
                )::realtime.wal_column
            )
            from
                unnest(old_columns) c;

    if action <> 'DELETE' and count(1) = 0 from unnest(columns) c where c.is_pkey then
        return next (
            jsonb_build_object(
                'schema', wal ->> 'schema',
                'table', wal ->> 'table',
                'type', action
            ),
            is_rls_enabled,
            -- subscriptions is already filtered by entity
            (select array_agg(s.subscription_id) from unnest(subscriptions) as s where claims_role = working_role),
            array['Error 400: Bad Request, no primary key']
        )::realtime.wal_rls;

    -- The claims role does not have SELECT permission to the primary key of entity
    elsif action <> 'DELETE' and sum(c.is_selectable::int) <> count(1) from unnest(columns) c where c.is_pkey then
        return next (
            jsonb_build_object(
                'schema', wal ->> 'schema',
                'table', wal ->> 'table',
                'type', action
            ),
            is_rls_enabled,
            (select array_agg(s.subscription_id) from unnest(subscriptions) as s where claims_role = working_role),
            array['Error 401: Unauthorized']
        )::realtime.wal_rls;

    else
        output = jsonb_build_object(
            'schema', wal ->> 'schema',
            'table', wal ->> 'table',
            'type', action,
            'commit_timestamp', to_char(
                ((wal ->> 'timestamp')::timestamptz at time zone 'utc'),
                'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'
            ),
            'columns', (
                select
                    jsonb_agg(
                        jsonb_build_object(
                            'name', pa.attname,
                            'type', pt.typname
                        )
                        order by pa.attnum asc
                    )
                from
                    pg_attribute pa
                    join pg_type pt
                        on pa.atttypid = pt.oid
                where
                    attrelid = entity_
                    and attnum > 0
                    and pg_catalog.has_column_privilege(working_role, entity_, pa.attname, 'SELECT')
            )
        )
        -- Add "record" key for insert and update
        || case
            when action in ('INSERT', 'UPDATE') then
                jsonb_build_object(
                    'record',
                    (
                        select
                            jsonb_object_agg(
                                -- if unchanged toast, get column name and value from old record
                                coalesce((c).name, (oc).name),
                                case
                                    when (c).name is null then (oc).value
                                    else (c).value
                                end
                            )
                        from
                            unnest(columns) c
                            full outer join unnest(old_columns) oc
                                on (c).name = (oc).name
                        where
                            coalesce((c).is_selectable, (oc).is_selectable)
                            and ( not error_record_exceeds_max_size or (octet_length((c).value::text) <= 64))
                    )
                )
            else '{}'::jsonb
        end
        -- Add "old_record" key for update and delete
        || case
            when action = 'UPDATE' then
                jsonb_build_object(
                        'old_record',
                        (
                            select jsonb_object_agg((c).name, (c).value)
                            from unnest(old_columns) c
                            where
                                (c).is_selectable
                                and ( not error_record_exceeds_max_size or (octet_length((c).value::text) <= 64))
                        )
                    )
            when action = 'DELETE' then
                jsonb_build_object(
                    'old_record',
                    (
                        select jsonb_object_agg((c).name, (c).value)
                        from unnest(old_columns) c
                        where
                            (c).is_selectable
                            and ( not error_record_exceeds_max_size or (octet_length((c).value::text) <= 64))
                            and ( not is_rls_enabled or (c).is_pkey ) -- if RLS enabled, we can't secure deletes so filter to pkey
                    )
                )
            else '{}'::jsonb
        end;

        -- Create the prepared statement
        if is_rls_enabled and action <> 'DELETE' then
            if (select 1 from pg_prepared_statements where name = 'walrus_rls_stmt' limit 1) > 0 then
                deallocate walrus_rls_stmt;
            end if;
            execute realtime.build_prepared_statement_sql('walrus_rls_stmt', entity_, columns);
        end if;

        visible_to_subscription_ids = '{}';

        for subscription_id, claims in (
                select
                    subs.subscription_id,
                    subs.claims
                from
                    unnest(subscriptions) subs
                where
                    subs.entity = entity_
                    and subs.claims_role = working_role
                    and (
                        realtime.is_visible_through_filters(columns, subs.filters)
                        or (
                          action = 'DELETE'
                          and realtime.is_visible_through_filters(old_columns, subs.filters)
                        )
                    )
        ) loop

            if not is_rls_enabled or action = 'DELETE' then
                visible_to_subscription_ids = visible_to_subscription_ids || subscription_id;
            else
                -- Check if RLS allows the role to see the record
                perform
                    -- Trim leading and trailing quotes from working_role because set_config
                    -- doesn't recognize the role as valid if they are included
                    set_config('role', trim(both '"' from working_role::text), true),
                    set_config('request.jwt.claims', claims::text, true);

                execute 'execute walrus_rls_stmt' into subscription_has_access;

                if subscription_has_access then
                    visible_to_subscription_ids = visible_to_subscription_ids || subscription_id;
                end if;
            end if;
        end loop;

        perform set_config('role', null, true);

        return next (
            output,
            is_rls_enabled,
            visible_to_subscription_ids,
            case
                when error_record_exceeds_max_size then array['Error 413: Payload Too Large']
                else '{}'
            end
        )::realtime.wal_rls;

    end if;
end loop;

perform set_config('role', null, true);
end;
$$;


ALTER FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer) OWNER TO supabase_admin;

--
-- Name: broadcast_changes(text, text, text, text, text, record, record, text); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.broadcast_changes(topic_name text, event_name text, operation text, table_name text, table_schema text, new record, old record, level text DEFAULT 'ROW'::text) RETURNS void
    LANGUAGE plpgsql
    AS $$
DECLARE
    -- Declare a variable to hold the JSONB representation of the row
    row_data jsonb := '{}'::jsonb;
BEGIN
    IF level = 'STATEMENT' THEN
        RAISE EXCEPTION 'function can only be triggered for each row, not for each statement';
    END IF;
    -- Check the operation type and handle accordingly
    IF operation = 'INSERT' OR operation = 'UPDATE' OR operation = 'DELETE' THEN
        row_data := jsonb_build_object('old_record', OLD, 'record', NEW, 'operation', operation, 'table', table_name, 'schema', table_schema);
        PERFORM realtime.send (row_data, event_name, topic_name);
    ELSE
        RAISE EXCEPTION 'Unexpected operation type: %', operation;
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Failed to process the row: %', SQLERRM;
END;

$$;


ALTER FUNCTION realtime.broadcast_changes(topic_name text, event_name text, operation text, table_name text, table_schema text, new record, old record, level text) OWNER TO supabase_admin;

--
-- Name: build_prepared_statement_sql(text, regclass, realtime.wal_column[]); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) RETURNS text
    LANGUAGE sql
    AS $$
      /*
      Builds a sql string that, if executed, creates a prepared statement to
      tests retrive a row from *entity* by its primary key columns.
      Example
          select realtime.build_prepared_statement_sql('public.notes', '{"id"}'::text[], '{"bigint"}'::text[])
      */
          select
      'prepare ' || prepared_statement_name || ' as
          select
              exists(
                  select
                      1
                  from
                      ' || entity || '
                  where
                      ' || string_agg(quote_ident(pkc.name) || '=' || quote_nullable(pkc.value #>> '{}') , ' and ') || '
              )'
          from
              unnest(columns) pkc
          where
              pkc.is_pkey
          group by
              entity
      $$;


ALTER FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) OWNER TO supabase_admin;

--
-- Name: cast(text, regtype); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime."cast"(val text, type_ regtype) RETURNS jsonb
    LANGUAGE plpgsql IMMUTABLE
    AS $$
    declare
      res jsonb;
    begin
      execute format('select to_jsonb(%L::'|| type_::text || ')', val)  into res;
      return res;
    end
    $$;


ALTER FUNCTION realtime."cast"(val text, type_ regtype) OWNER TO supabase_admin;

--
-- Name: check_equality_op(realtime.equality_op, regtype, text, text); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) RETURNS boolean
    LANGUAGE plpgsql IMMUTABLE
    AS $$
      /*
      Casts *val_1* and *val_2* as type *type_* and check the *op* condition for truthiness
      */
      declare
          op_symbol text = (
              case
                  when op = 'eq' then '='
                  when op = 'neq' then '!='
                  when op = 'lt' then '<'
                  when op = 'lte' then '<='
                  when op = 'gt' then '>'
                  when op = 'gte' then '>='
                  when op = 'in' then '= any'
                  else 'UNKNOWN OP'
              end
          );
          res boolean;
      begin
          execute format(
              'select %L::'|| type_::text || ' ' || op_symbol
              || ' ( %L::'
              || (
                  case
                      when op = 'in' then type_::text || '[]'
                      else type_::text end
              )
              || ')', val_1, val_2) into res;
          return res;
      end;
      $$;


ALTER FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) OWNER TO supabase_admin;

--
-- Name: is_visible_through_filters(realtime.wal_column[], realtime.user_defined_filter[]); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) RETURNS boolean
    LANGUAGE sql IMMUTABLE
    AS $_$
    /*
    Should the record be visible (true) or filtered out (false) after *filters* are applied
    */
        select
            -- Default to allowed when no filters present
            $2 is null -- no filters. this should not happen because subscriptions has a default
            or array_length($2, 1) is null -- array length of an empty array is null
            or bool_and(
                coalesce(
                    realtime.check_equality_op(
                        op:=f.op,
                        type_:=coalesce(
                            col.type_oid::regtype, -- null when wal2json version <= 2.4
                            col.type_name::regtype
                        ),
                        -- cast jsonb to text
                        val_1:=col.value #>> '{}',
                        val_2:=f.value
                    ),
                    false -- if null, filter does not match
                )
            )
        from
            unnest(filters) f
            join unnest(columns) col
                on f.column_name = col.name;
    $_$;


ALTER FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) OWNER TO supabase_admin;

--
-- Name: list_changes(name, name, integer, integer); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) RETURNS SETOF realtime.wal_rls
    LANGUAGE sql
    SET log_min_messages TO 'fatal'
    AS $$
      with pub as (
        select
          concat_ws(
            ',',
            case when bool_or(pubinsert) then 'insert' else null end,
            case when bool_or(pubupdate) then 'update' else null end,
            case when bool_or(pubdelete) then 'delete' else null end
          ) as w2j_actions,
          coalesce(
            string_agg(
              realtime.quote_wal2json(format('%I.%I', schemaname, tablename)::regclass),
              ','
            ) filter (where ppt.tablename is not null and ppt.tablename not like '% %'),
            ''
          ) w2j_add_tables
        from
          pg_publication pp
          left join pg_publication_tables ppt
            on pp.pubname = ppt.pubname
        where
          pp.pubname = publication
        group by
          pp.pubname
        limit 1
      ),
      w2j as (
        select
          x.*, pub.w2j_add_tables
        from
          pub,
          pg_logical_slot_get_changes(
            slot_name, null, max_changes,
            'include-pk', 'true',
            'include-transaction', 'false',
            'include-timestamp', 'true',
            'include-type-oids', 'true',
            'format-version', '2',
            'actions', pub.w2j_actions,
            'add-tables', pub.w2j_add_tables
          ) x
      )
      select
        xyz.wal,
        xyz.is_rls_enabled,
        xyz.subscription_ids,
        xyz.errors
      from
        w2j,
        realtime.apply_rls(
          wal := w2j.data::jsonb,
          max_record_bytes := max_record_bytes
        ) xyz(wal, is_rls_enabled, subscription_ids, errors)
      where
        w2j.w2j_add_tables <> ''
        and xyz.subscription_ids[1] is not null
    $$;


ALTER FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) OWNER TO supabase_admin;

--
-- Name: quote_wal2json(regclass); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.quote_wal2json(entity regclass) RETURNS text
    LANGUAGE sql IMMUTABLE STRICT
    AS $$
      select
        (
          select string_agg('' || ch,'')
          from unnest(string_to_array(nsp.nspname::text, null)) with ordinality x(ch, idx)
          where
            not (x.idx = 1 and x.ch = '"')
            and not (
              x.idx = array_length(string_to_array(nsp.nspname::text, null), 1)
              and x.ch = '"'
            )
        )
        || '.'
        || (
          select string_agg('' || ch,'')
          from unnest(string_to_array(pc.relname::text, null)) with ordinality x(ch, idx)
          where
            not (x.idx = 1 and x.ch = '"')
            and not (
              x.idx = array_length(string_to_array(nsp.nspname::text, null), 1)
              and x.ch = '"'
            )
          )
      from
        pg_class pc
        join pg_namespace nsp
          on pc.relnamespace = nsp.oid
      where
        pc.oid = entity
    $$;


ALTER FUNCTION realtime.quote_wal2json(entity regclass) OWNER TO supabase_admin;

--
-- Name: send(jsonb, text, text, boolean); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.send(payload jsonb, event text, topic text, private boolean DEFAULT true) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
  BEGIN
    -- Set the topic configuration
    EXECUTE format('SET LOCAL realtime.topic TO %L', topic);

    -- Attempt to insert the message
    INSERT INTO realtime.messages (payload, event, topic, private, extension)
    VALUES (payload, event, topic, private, 'broadcast');
  EXCEPTION
    WHEN OTHERS THEN
      -- Capture and notify the error
      PERFORM pg_notify(
          'realtime:system',
          jsonb_build_object(
              'error', SQLERRM,
              'function', 'realtime.send',
              'event', event,
              'topic', topic,
              'private', private
          )::text
      );
  END;
END;
$$;


ALTER FUNCTION realtime.send(payload jsonb, event text, topic text, private boolean) OWNER TO supabase_admin;

--
-- Name: subscription_check_filters(); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.subscription_check_filters() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
    /*
    Validates that the user defined filters for a subscription:
    - refer to valid columns that the claimed role may access
    - values are coercable to the correct column type
    */
    declare
        col_names text[] = coalesce(
                array_agg(c.column_name order by c.ordinal_position),
                '{}'::text[]
            )
            from
                information_schema.columns c
            where
                format('%I.%I', c.table_schema, c.table_name)::regclass = new.entity
                and pg_catalog.has_column_privilege(
                    (new.claims ->> 'role'),
                    format('%I.%I', c.table_schema, c.table_name)::regclass,
                    c.column_name,
                    'SELECT'
                );
        filter realtime.user_defined_filter;
        col_type regtype;

        in_val jsonb;
    begin
        for filter in select * from unnest(new.filters) loop
            -- Filtered column is valid
            if not filter.column_name = any(col_names) then
                raise exception 'invalid column for filter %', filter.column_name;
            end if;

            -- Type is sanitized and safe for string interpolation
            col_type = (
                select atttypid::regtype
                from pg_catalog.pg_attribute
                where attrelid = new.entity
                      and attname = filter.column_name
            );
            if col_type is null then
                raise exception 'failed to lookup type for column %', filter.column_name;
            end if;

            -- Set maximum number of entries for in filter
            if filter.op = 'in'::realtime.equality_op then
                in_val = realtime.cast(filter.value, (col_type::text || '[]')::regtype);
                if coalesce(jsonb_array_length(in_val), 0) > 100 then
                    raise exception 'too many values for `in` filter. Maximum 100';
                end if;
            else
                -- raises an exception if value is not coercable to type
                perform realtime.cast(filter.value, col_type);
            end if;

        end loop;

        -- Apply consistent order to filters so the unique constraint on
        -- (subscription_id, entity, filters) can't be tricked by a different filter order
        new.filters = coalesce(
            array_agg(f order by f.column_name, f.op, f.value),
            '{}'
        ) from unnest(new.filters) f;

        return new;
    end;
    $$;


ALTER FUNCTION realtime.subscription_check_filters() OWNER TO supabase_admin;

--
-- Name: to_regrole(text); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.to_regrole(role_name text) RETURNS regrole
    LANGUAGE sql IMMUTABLE
    AS $$ select role_name::regrole $$;


ALTER FUNCTION realtime.to_regrole(role_name text) OWNER TO supabase_admin;

--
-- Name: topic(); Type: FUNCTION; Schema: realtime; Owner: supabase_realtime_admin
--

CREATE FUNCTION realtime.topic() RETURNS text
    LANGUAGE sql STABLE
    AS $$
select nullif(current_setting('realtime.topic', true), '')::text;
$$;


ALTER FUNCTION realtime.topic() OWNER TO supabase_realtime_admin;

--
-- Name: can_insert_object(text, text, uuid, jsonb); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.can_insert_object(bucketid text, name text, owner uuid, metadata jsonb) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
  INSERT INTO "storage"."objects" ("bucket_id", "name", "owner", "metadata") VALUES (bucketid, name, owner, metadata);
  -- hack to rollback the successful insert
  RAISE sqlstate 'PT200' using
  message = 'ROLLBACK',
  detail = 'rollback successful insert';
END
$$;


ALTER FUNCTION storage.can_insert_object(bucketid text, name text, owner uuid, metadata jsonb) OWNER TO supabase_storage_admin;

--
-- Name: extension(text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.extension(name text) RETURNS text
    LANGUAGE plpgsql
    AS $$
DECLARE
_parts text[];
_filename text;
BEGIN
	select string_to_array(name, '/') into _parts;
	select _parts[array_length(_parts,1)] into _filename;
	-- @todo return the last part instead of 2
	return reverse(split_part(reverse(_filename), '.', 1));
END
$$;


ALTER FUNCTION storage.extension(name text) OWNER TO supabase_storage_admin;

--
-- Name: filename(text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.filename(name text) RETURNS text
    LANGUAGE plpgsql
    AS $$
DECLARE
_parts text[];
BEGIN
	select string_to_array(name, '/') into _parts;
	return _parts[array_length(_parts,1)];
END
$$;


ALTER FUNCTION storage.filename(name text) OWNER TO supabase_storage_admin;

--
-- Name: foldername(text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.foldername(name text) RETURNS text[]
    LANGUAGE plpgsql
    AS $$
DECLARE
_parts text[];
BEGIN
	select string_to_array(name, '/') into _parts;
	return _parts[1:array_length(_parts,1)-1];
END
$$;


ALTER FUNCTION storage.foldername(name text) OWNER TO supabase_storage_admin;

--
-- Name: get_size_by_bucket(); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.get_size_by_bucket() RETURNS TABLE(size bigint, bucket_id text)
    LANGUAGE plpgsql
    AS $$
BEGIN
    return query
        select sum((metadata->>'size')::int) as size, obj.bucket_id
        from "storage".objects as obj
        group by obj.bucket_id;
END
$$;


ALTER FUNCTION storage.get_size_by_bucket() OWNER TO supabase_storage_admin;

--
-- Name: list_multipart_uploads_with_delimiter(text, text, text, integer, text, text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.list_multipart_uploads_with_delimiter(bucket_id text, prefix_param text, delimiter_param text, max_keys integer DEFAULT 100, next_key_token text DEFAULT ''::text, next_upload_token text DEFAULT ''::text) RETURNS TABLE(key text, id text, created_at timestamp with time zone)
    LANGUAGE plpgsql
    AS $_$
BEGIN
    RETURN QUERY EXECUTE
        'SELECT DISTINCT ON(key COLLATE "C") * from (
            SELECT
                CASE
                    WHEN position($2 IN substring(key from length($1) + 1)) > 0 THEN
                        substring(key from 1 for length($1) + position($2 IN substring(key from length($1) + 1)))
                    ELSE
                        key
                END AS key, id, created_at
            FROM
                storage.s3_multipart_uploads
            WHERE
                bucket_id = $5 AND
                key ILIKE $1 || ''%'' AND
                CASE
                    WHEN $4 != '''' AND $6 = '''' THEN
                        CASE
                            WHEN position($2 IN substring(key from length($1) + 1)) > 0 THEN
                                substring(key from 1 for length($1) + position($2 IN substring(key from length($1) + 1))) COLLATE "C" > $4
                            ELSE
                                key COLLATE "C" > $4
                            END
                    ELSE
                        true
                END AND
                CASE
                    WHEN $6 != '''' THEN
                        id COLLATE "C" > $6
                    ELSE
                        true
                    END
            ORDER BY
                key COLLATE "C" ASC, created_at ASC) as e order by key COLLATE "C" LIMIT $3'
        USING prefix_param, delimiter_param, max_keys, next_key_token, bucket_id, next_upload_token;
END;
$_$;


ALTER FUNCTION storage.list_multipart_uploads_with_delimiter(bucket_id text, prefix_param text, delimiter_param text, max_keys integer, next_key_token text, next_upload_token text) OWNER TO supabase_storage_admin;

--
-- Name: list_objects_with_delimiter(text, text, text, integer, text, text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.list_objects_with_delimiter(bucket_id text, prefix_param text, delimiter_param text, max_keys integer DEFAULT 100, start_after text DEFAULT ''::text, next_token text DEFAULT ''::text) RETURNS TABLE(name text, id uuid, metadata jsonb, updated_at timestamp with time zone)
    LANGUAGE plpgsql
    AS $_$
BEGIN
    RETURN QUERY EXECUTE
        'SELECT DISTINCT ON(name COLLATE "C") * from (
            SELECT
                CASE
                    WHEN position($2 IN substring(name from length($1) + 1)) > 0 THEN
                        substring(name from 1 for length($1) + position($2 IN substring(name from length($1) + 1)))
                    ELSE
                        name
                END AS name, id, metadata, updated_at
            FROM
                storage.objects
            WHERE
                bucket_id = $5 AND
                name ILIKE $1 || ''%'' AND
                CASE
                    WHEN $6 != '''' THEN
                    name COLLATE "C" > $6
                ELSE true END
                AND CASE
                    WHEN $4 != '''' THEN
                        CASE
                            WHEN position($2 IN substring(name from length($1) + 1)) > 0 THEN
                                substring(name from 1 for length($1) + position($2 IN substring(name from length($1) + 1))) COLLATE "C" > $4
                            ELSE
                                name COLLATE "C" > $4
                            END
                    ELSE
                        true
                END
            ORDER BY
                name COLLATE "C" ASC) as e order by name COLLATE "C" LIMIT $3'
        USING prefix_param, delimiter_param, max_keys, next_token, bucket_id, start_after;
END;
$_$;


ALTER FUNCTION storage.list_objects_with_delimiter(bucket_id text, prefix_param text, delimiter_param text, max_keys integer, start_after text, next_token text) OWNER TO supabase_storage_admin;

--
-- Name: operation(); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.operation() RETURNS text
    LANGUAGE plpgsql STABLE
    AS $$
BEGIN
    RETURN current_setting('storage.operation', true);
END;
$$;


ALTER FUNCTION storage.operation() OWNER TO supabase_storage_admin;

--
-- Name: search(text, text, integer, integer, integer, text, text, text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.search(prefix text, bucketname text, limits integer DEFAULT 100, levels integer DEFAULT 1, offsets integer DEFAULT 0, search text DEFAULT ''::text, sortcolumn text DEFAULT 'name'::text, sortorder text DEFAULT 'asc'::text) RETURNS TABLE(name text, id uuid, updated_at timestamp with time zone, created_at timestamp with time zone, last_accessed_at timestamp with time zone, metadata jsonb)
    LANGUAGE plpgsql STABLE
    AS $_$
declare
  v_order_by text;
  v_sort_order text;
begin
  case
    when sortcolumn = 'name' then
      v_order_by = 'name';
    when sortcolumn = 'updated_at' then
      v_order_by = 'updated_at';
    when sortcolumn = 'created_at' then
      v_order_by = 'created_at';
    when sortcolumn = 'last_accessed_at' then
      v_order_by = 'last_accessed_at';
    else
      v_order_by = 'name';
  end case;

  case
    when sortorder = 'asc' then
      v_sort_order = 'asc';
    when sortorder = 'desc' then
      v_sort_order = 'desc';
    else
      v_sort_order = 'asc';
  end case;

  v_order_by = v_order_by || ' ' || v_sort_order;

  return query execute
    'with folders as (
       select path_tokens[$1] as folder
       from storage.objects
         where objects.name ilike $2 || $3 || ''%''
           and bucket_id = $4
           and array_length(objects.path_tokens, 1) <> $1
       group by folder
       order by folder ' || v_sort_order || '
     )
     (select folder as "name",
            null as id,
            null as updated_at,
            null as created_at,
            null as last_accessed_at,
            null as metadata from folders)
     union all
     (select path_tokens[$1] as "name",
            id,
            updated_at,
            created_at,
            last_accessed_at,
            metadata
     from storage.objects
     where objects.name ilike $2 || $3 || ''%''
       and bucket_id = $4
       and array_length(objects.path_tokens, 1) = $1
     order by ' || v_order_by || ')
     limit $5
     offset $6' using levels, prefix, search, bucketname, limits, offsets;
end;
$_$;


ALTER FUNCTION storage.search(prefix text, bucketname text, limits integer, levels integer, offsets integer, search text, sortcolumn text, sortorder text) OWNER TO supabase_storage_admin;

--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW; 
END;
$$;


ALTER FUNCTION storage.update_updated_at_column() OWNER TO supabase_storage_admin;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: audit_log_entries; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.audit_log_entries (
    instance_id uuid,
    id uuid NOT NULL,
    payload json,
    created_at timestamp with time zone,
    ip_address character varying(64) DEFAULT ''::character varying NOT NULL
);


ALTER TABLE auth.audit_log_entries OWNER TO supabase_auth_admin;

--
-- Name: TABLE audit_log_entries; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.audit_log_entries IS 'Auth: Audit trail for user actions.';


--
-- Name: flow_state; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.flow_state (
    id uuid NOT NULL,
    user_id uuid,
    auth_code text NOT NULL,
    code_challenge_method auth.code_challenge_method NOT NULL,
    code_challenge text NOT NULL,
    provider_type text NOT NULL,
    provider_access_token text,
    provider_refresh_token text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    authentication_method text NOT NULL,
    auth_code_issued_at timestamp with time zone
);


ALTER TABLE auth.flow_state OWNER TO supabase_auth_admin;

--
-- Name: TABLE flow_state; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.flow_state IS 'stores metadata for pkce logins';


--
-- Name: identities; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.identities (
    provider_id text NOT NULL,
    user_id uuid NOT NULL,
    identity_data jsonb NOT NULL,
    provider text NOT NULL,
    last_sign_in_at timestamp with time zone,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    email text GENERATED ALWAYS AS (lower((identity_data ->> 'email'::text))) STORED,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


ALTER TABLE auth.identities OWNER TO supabase_auth_admin;

--
-- Name: TABLE identities; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.identities IS 'Auth: Stores identities associated to a user.';


--
-- Name: COLUMN identities.email; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON COLUMN auth.identities.email IS 'Auth: Email is a generated column that references the optional email property in the identity_data';


--
-- Name: instances; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.instances (
    id uuid NOT NULL,
    uuid uuid,
    raw_base_config text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone
);


ALTER TABLE auth.instances OWNER TO supabase_auth_admin;

--
-- Name: TABLE instances; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.instances IS 'Auth: Manages users across multiple sites.';


--
-- Name: mfa_amr_claims; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.mfa_amr_claims (
    session_id uuid NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    authentication_method text NOT NULL,
    id uuid NOT NULL
);


ALTER TABLE auth.mfa_amr_claims OWNER TO supabase_auth_admin;

--
-- Name: TABLE mfa_amr_claims; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.mfa_amr_claims IS 'auth: stores authenticator method reference claims for multi factor authentication';


--
-- Name: mfa_challenges; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.mfa_challenges (
    id uuid NOT NULL,
    factor_id uuid NOT NULL,
    created_at timestamp with time zone NOT NULL,
    verified_at timestamp with time zone,
    ip_address inet NOT NULL,
    otp_code text,
    web_authn_session_data jsonb
);


ALTER TABLE auth.mfa_challenges OWNER TO supabase_auth_admin;

--
-- Name: TABLE mfa_challenges; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.mfa_challenges IS 'auth: stores metadata about challenge requests made';


--
-- Name: mfa_factors; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.mfa_factors (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    friendly_name text,
    factor_type auth.factor_type NOT NULL,
    status auth.factor_status NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    secret text,
    phone text,
    last_challenged_at timestamp with time zone,
    web_authn_credential jsonb,
    web_authn_aaguid uuid
);


ALTER TABLE auth.mfa_factors OWNER TO supabase_auth_admin;

--
-- Name: TABLE mfa_factors; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.mfa_factors IS 'auth: stores metadata about factors';


--
-- Name: one_time_tokens; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.one_time_tokens (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    token_type auth.one_time_token_type NOT NULL,
    token_hash text NOT NULL,
    relates_to text NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    CONSTRAINT one_time_tokens_token_hash_check CHECK ((char_length(token_hash) > 0))
);


ALTER TABLE auth.one_time_tokens OWNER TO supabase_auth_admin;

--
-- Name: refresh_tokens; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.refresh_tokens (
    instance_id uuid,
    id bigint NOT NULL,
    token character varying(255),
    user_id character varying(255),
    revoked boolean,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    parent character varying(255),
    session_id uuid
);


ALTER TABLE auth.refresh_tokens OWNER TO supabase_auth_admin;

--
-- Name: TABLE refresh_tokens; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.refresh_tokens IS 'Auth: Store of tokens used to refresh JWT tokens once they expire.';


--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE; Schema: auth; Owner: supabase_auth_admin
--

CREATE SEQUENCE auth.refresh_tokens_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE auth.refresh_tokens_id_seq OWNER TO supabase_auth_admin;

--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE OWNED BY; Schema: auth; Owner: supabase_auth_admin
--

ALTER SEQUENCE auth.refresh_tokens_id_seq OWNED BY auth.refresh_tokens.id;


--
-- Name: saml_providers; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.saml_providers (
    id uuid NOT NULL,
    sso_provider_id uuid NOT NULL,
    entity_id text NOT NULL,
    metadata_xml text NOT NULL,
    metadata_url text,
    attribute_mapping jsonb,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    name_id_format text,
    CONSTRAINT "entity_id not empty" CHECK ((char_length(entity_id) > 0)),
    CONSTRAINT "metadata_url not empty" CHECK (((metadata_url = NULL::text) OR (char_length(metadata_url) > 0))),
    CONSTRAINT "metadata_xml not empty" CHECK ((char_length(metadata_xml) > 0))
);


ALTER TABLE auth.saml_providers OWNER TO supabase_auth_admin;

--
-- Name: TABLE saml_providers; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.saml_providers IS 'Auth: Manages SAML Identity Provider connections.';


--
-- Name: saml_relay_states; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.saml_relay_states (
    id uuid NOT NULL,
    sso_provider_id uuid NOT NULL,
    request_id text NOT NULL,
    for_email text,
    redirect_to text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    flow_state_id uuid,
    CONSTRAINT "request_id not empty" CHECK ((char_length(request_id) > 0))
);


ALTER TABLE auth.saml_relay_states OWNER TO supabase_auth_admin;

--
-- Name: TABLE saml_relay_states; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.saml_relay_states IS 'Auth: Contains SAML Relay State information for each Service Provider initiated login.';


--
-- Name: schema_migrations; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.schema_migrations (
    version character varying(255) NOT NULL
);


ALTER TABLE auth.schema_migrations OWNER TO supabase_auth_admin;

--
-- Name: TABLE schema_migrations; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.schema_migrations IS 'Auth: Manages updates to the auth system.';


--
-- Name: sessions; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.sessions (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    factor_id uuid,
    aal auth.aal_level,
    not_after timestamp with time zone,
    refreshed_at timestamp without time zone,
    user_agent text,
    ip inet,
    tag text
);


ALTER TABLE auth.sessions OWNER TO supabase_auth_admin;

--
-- Name: TABLE sessions; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.sessions IS 'Auth: Stores session data associated to a user.';


--
-- Name: COLUMN sessions.not_after; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON COLUMN auth.sessions.not_after IS 'Auth: Not after is a nullable column that contains a timestamp after which the session should be regarded as expired.';


--
-- Name: sso_domains; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.sso_domains (
    id uuid NOT NULL,
    sso_provider_id uuid NOT NULL,
    domain text NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    CONSTRAINT "domain not empty" CHECK ((char_length(domain) > 0))
);


ALTER TABLE auth.sso_domains OWNER TO supabase_auth_admin;

--
-- Name: TABLE sso_domains; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.sso_domains IS 'Auth: Manages SSO email address domain mapping to an SSO Identity Provider.';


--
-- Name: sso_providers; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.sso_providers (
    id uuid NOT NULL,
    resource_id text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    CONSTRAINT "resource_id not empty" CHECK (((resource_id = NULL::text) OR (char_length(resource_id) > 0)))
);


ALTER TABLE auth.sso_providers OWNER TO supabase_auth_admin;

--
-- Name: TABLE sso_providers; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.sso_providers IS 'Auth: Manages SSO identity provider information; see saml_providers for SAML.';


--
-- Name: COLUMN sso_providers.resource_id; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON COLUMN auth.sso_providers.resource_id IS 'Auth: Uniquely identifies a SSO provider according to a user-chosen resource ID (case insensitive), useful in infrastructure as code.';


--
-- Name: users; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.users (
    instance_id uuid,
    id uuid NOT NULL,
    aud character varying(255),
    role character varying(255),
    email character varying(255),
    encrypted_password character varying(255),
    email_confirmed_at timestamp with time zone,
    invited_at timestamp with time zone,
    confirmation_token character varying(255),
    confirmation_sent_at timestamp with time zone,
    recovery_token character varying(255),
    recovery_sent_at timestamp with time zone,
    email_change_token_new character varying(255),
    email_change character varying(255),
    email_change_sent_at timestamp with time zone,
    last_sign_in_at timestamp with time zone,
    raw_app_meta_data jsonb,
    raw_user_meta_data jsonb,
    is_super_admin boolean,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    phone text DEFAULT NULL::character varying,
    phone_confirmed_at timestamp with time zone,
    phone_change text DEFAULT ''::character varying,
    phone_change_token character varying(255) DEFAULT ''::character varying,
    phone_change_sent_at timestamp with time zone,
    confirmed_at timestamp with time zone GENERATED ALWAYS AS (LEAST(email_confirmed_at, phone_confirmed_at)) STORED,
    email_change_token_current character varying(255) DEFAULT ''::character varying,
    email_change_confirm_status smallint DEFAULT 0,
    banned_until timestamp with time zone,
    reauthentication_token character varying(255) DEFAULT ''::character varying,
    reauthentication_sent_at timestamp with time zone,
    is_sso_user boolean DEFAULT false NOT NULL,
    deleted_at timestamp with time zone,
    is_anonymous boolean DEFAULT false NOT NULL,
    CONSTRAINT users_email_change_confirm_status_check CHECK (((email_change_confirm_status >= 0) AND (email_change_confirm_status <= 2)))
);


ALTER TABLE auth.users OWNER TO supabase_auth_admin;

--
-- Name: TABLE users; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.users IS 'Auth: Stores user login data within a secure schema.';


--
-- Name: COLUMN users.is_sso_user; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON COLUMN auth.users.is_sso_user IS 'Auth: Set this column to true when the account comes from SSO. These accounts can have duplicate emails.';


--
-- Name: assets; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.assets (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    created_at timestamp with time zone DEFAULT now(),
    name text,
    type text,
    value numeric,
    loan numeric,
    nextduedate date,
    "interestRate" numeric,
    "loanStartDate" date,
    "nextDueDate" date,
    "purchaseDate" date,
    "purchasePrice" numeric,
    "termYears" numeric
);


ALTER TABLE public.assets OWNER TO postgres;

--
-- Name: bills; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.bills (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    created_at timestamp with time zone DEFAULT now(),
    name text,
    type text,
    amount numeric,
    frequency text,
    nextduedate date,
    "nextDueDate" date
);


ALTER TABLE public.bills OWNER TO postgres;

--
-- Name: budgets; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.budgets (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    month text NOT NULL,
    item_id uuid NOT NULL,
    item_type text NOT NULL,
    assigned_amount numeric DEFAULT 0,
    name text,
    category text,
    needed_amount numeric DEFAULT 0
);


ALTER TABLE public.budgets OWNER TO postgres;

--
-- Name: debts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.debts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    created_at timestamp with time zone DEFAULT now(),
    name text,
    type text,
    amount numeric,
    interestrate numeric,
    term integer,
    monthlypayment numeric,
    nextduedate date,
    "interestRate" numeric,
    "monthlyPayment" numeric,
    "nextDueDate" date
);


ALTER TABLE public.debts OWNER TO postgres;

--
-- Name: income; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.income (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    created_at timestamp with time zone DEFAULT now(),
    name text,
    type text,
    amount numeric,
    frequency text,
    nextduedate date,
    "nextDueDate" date
);


ALTER TABLE public.income OWNER TO postgres;

--
-- Name: investments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.investments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    created_at timestamp with time zone DEFAULT now(),
    name text,
    type text,
    value numeric,
    monthlycontribution numeric,
    annualreturn numeric,
    nextcontributiondate date,
    "startingBalance" numeric,
    "monthlyContribution" numeric,
    "annualReturn" numeric,
    "nextContributionDate" date
);


ALTER TABLE public.investments OWNER TO postgres;

--
-- Name: settings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.settings (
    user_id uuid NOT NULL,
    emergency_fund_goal numeric DEFAULT 0,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.settings OWNER TO postgres;

--
-- Name: snapshots; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.snapshots (
    user_id uuid NOT NULL,
    date date NOT NULL,
    networth numeric,
    created_at timestamp with time zone DEFAULT now(),
    "netWorth" numeric
);


ALTER TABLE public.snapshots OWNER TO postgres;

--
-- Name: messages; Type: TABLE; Schema: realtime; Owner: supabase_realtime_admin
--

CREATE TABLE realtime.messages (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL
)
PARTITION BY RANGE (inserted_at);


ALTER TABLE realtime.messages OWNER TO supabase_realtime_admin;

--
-- Name: schema_migrations; Type: TABLE; Schema: realtime; Owner: supabase_admin
--

CREATE TABLE realtime.schema_migrations (
    version bigint NOT NULL,
    inserted_at timestamp(0) without time zone
);


ALTER TABLE realtime.schema_migrations OWNER TO supabase_admin;

--
-- Name: subscription; Type: TABLE; Schema: realtime; Owner: supabase_admin
--

CREATE TABLE realtime.subscription (
    id bigint NOT NULL,
    subscription_id uuid NOT NULL,
    entity regclass NOT NULL,
    filters realtime.user_defined_filter[] DEFAULT '{}'::realtime.user_defined_filter[] NOT NULL,
    claims jsonb NOT NULL,
    claims_role regrole GENERATED ALWAYS AS (realtime.to_regrole((claims ->> 'role'::text))) STORED NOT NULL,
    created_at timestamp without time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);


ALTER TABLE realtime.subscription OWNER TO supabase_admin;

--
-- Name: subscription_id_seq; Type: SEQUENCE; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE realtime.subscription ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME realtime.subscription_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: buckets; Type: TABLE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TABLE storage.buckets (
    id text NOT NULL,
    name text NOT NULL,
    owner uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    public boolean DEFAULT false,
    avif_autodetection boolean DEFAULT false,
    file_size_limit bigint,
    allowed_mime_types text[],
    owner_id text
);


ALTER TABLE storage.buckets OWNER TO supabase_storage_admin;

--
-- Name: COLUMN buckets.owner; Type: COMMENT; Schema: storage; Owner: supabase_storage_admin
--

COMMENT ON COLUMN storage.buckets.owner IS 'Field is deprecated, use owner_id instead';


--
-- Name: migrations; Type: TABLE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TABLE storage.migrations (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    hash character varying(40) NOT NULL,
    executed_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE storage.migrations OWNER TO supabase_storage_admin;

--
-- Name: objects; Type: TABLE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TABLE storage.objects (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    bucket_id text,
    name text,
    owner uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    last_accessed_at timestamp with time zone DEFAULT now(),
    metadata jsonb,
    path_tokens text[] GENERATED ALWAYS AS (string_to_array(name, '/'::text)) STORED,
    version text,
    owner_id text,
    user_metadata jsonb
);


ALTER TABLE storage.objects OWNER TO supabase_storage_admin;

--
-- Name: COLUMN objects.owner; Type: COMMENT; Schema: storage; Owner: supabase_storage_admin
--

COMMENT ON COLUMN storage.objects.owner IS 'Field is deprecated, use owner_id instead';


--
-- Name: s3_multipart_uploads; Type: TABLE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TABLE storage.s3_multipart_uploads (
    id text NOT NULL,
    in_progress_size bigint DEFAULT 0 NOT NULL,
    upload_signature text NOT NULL,
    bucket_id text NOT NULL,
    key text NOT NULL COLLATE pg_catalog."C",
    version text NOT NULL,
    owner_id text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    user_metadata jsonb
);


ALTER TABLE storage.s3_multipart_uploads OWNER TO supabase_storage_admin;

--
-- Name: s3_multipart_uploads_parts; Type: TABLE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TABLE storage.s3_multipart_uploads_parts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    upload_id text NOT NULL,
    size bigint DEFAULT 0 NOT NULL,
    part_number integer NOT NULL,
    bucket_id text NOT NULL,
    key text NOT NULL COLLATE pg_catalog."C",
    etag text NOT NULL,
    owner_id text,
    version text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE storage.s3_multipart_uploads_parts OWNER TO supabase_storage_admin;

--
-- Name: refresh_tokens id; Type: DEFAULT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.refresh_tokens ALTER COLUMN id SET DEFAULT nextval('auth.refresh_tokens_id_seq'::regclass);


--
-- Data for Name: audit_log_entries; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.audit_log_entries (instance_id, id, payload, created_at, ip_address) FROM stdin;
00000000-0000-0000-0000-000000000000	69508a2e-9194-42bb-aa7e-10f83a6fc754	{"action":"user_confirmation_requested","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}	2025-06-18 11:50:55.440317+00	
00000000-0000-0000-0000-000000000000	99d1a590-8db5-4b21-b1aa-a0bd05e78618	{"action":"user_signedup","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"team"}	2025-06-18 11:52:23.528911+00	
00000000-0000-0000-0000-000000000000	39e5cf2a-9398-43bc-9164-b92ebdc3233b	{"action":"logout","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-06-18 12:15:01.131541+00	
00000000-0000-0000-0000-000000000000	a7535608-0c9b-4b77-86a6-fb3a1b6b9fba	{"action":"login","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-06-18 12:15:04.763998+00	
00000000-0000-0000-0000-000000000000	9bb08a7b-ef56-4225-a64e-7ecd5c2b339c	{"action":"logout","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-06-18 12:17:28.099969+00	
00000000-0000-0000-0000-000000000000	98e71288-46a7-407d-b50d-b70f6bc89fe4	{"action":"login","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-06-18 12:21:56.392714+00	
00000000-0000-0000-0000-000000000000	a05f2f0b-1f64-481a-8b8b-73260cbd7454	{"action":"logout","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-06-18 12:22:19.864784+00	
00000000-0000-0000-0000-000000000000	ff5309a8-8e3f-445a-ad61-ddcdb18bbfc2	{"action":"login","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-06-18 12:22:33.993411+00	
00000000-0000-0000-0000-000000000000	c5e629af-5bd8-482c-9ab4-d980d979f303	{"action":"user_modified","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"user"}	2025-06-18 12:25:07.131615+00	
00000000-0000-0000-0000-000000000000	346b6dee-b101-439f-bda9-0f8a5e1c635f	{"action":"logout","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-06-18 12:36:40.897556+00	
00000000-0000-0000-0000-000000000000	7858b604-a57d-4d7b-b580-bf9a9987fb66	{"action":"login","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-06-18 12:36:46.808833+00	
00000000-0000-0000-0000-000000000000	0149341a-a984-4c5f-ab05-9b13bffd1b9e	{"action":"logout","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-06-18 12:36:50.099776+00	
00000000-0000-0000-0000-000000000000	b59edb03-3c59-4624-b7fe-c319e600c62d	{"action":"login","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-06-18 12:37:16.860181+00	
00000000-0000-0000-0000-000000000000	028ee288-485a-4c08-9c58-dda4c1a856d6	{"action":"logout","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-06-18 12:40:30.910821+00	
00000000-0000-0000-0000-000000000000	1c189309-e75c-44bc-968c-f8548f3e7891	{"action":"login","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-06-18 12:46:57.501968+00	
00000000-0000-0000-0000-000000000000	83dae989-dc3d-4e3d-b0e2-5223dd739529	{"action":"logout","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-06-18 12:50:24.186435+00	
00000000-0000-0000-0000-000000000000	f68ec775-256c-4dd1-b932-5c33a2593501	{"action":"login","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-06-18 12:50:35.095563+00	
00000000-0000-0000-0000-000000000000	0ded3755-aa5a-491b-8fdf-51b88de54ad4	{"action":"logout","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-06-18 12:53:18.769064+00	
00000000-0000-0000-0000-000000000000	8d5c8557-6bc9-493f-9326-09b49a933cd5	{"action":"login","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-06-18 14:08:13.65286+00	
00000000-0000-0000-0000-000000000000	959c4a86-8c0e-4825-b69e-4d655b499aaa	{"action":"login","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-06-18 14:08:14.923055+00	
00000000-0000-0000-0000-000000000000	8d634a8c-4d0c-4a75-b729-0122a56fe165	{"action":"logout","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-06-18 14:09:47.201136+00	
00000000-0000-0000-0000-000000000000	896dcd3a-ca95-4c42-8f40-eac025e1aebc	{"action":"login","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-06-18 14:33:45.944781+00	
00000000-0000-0000-0000-000000000000	37d8ebde-2af4-457c-a957-af7c1284d7c8	{"action":"token_refreshed","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-06-18 15:32:06.446552+00	
00000000-0000-0000-0000-000000000000	fcbd26ef-716b-4bd2-a429-fbbd3b0a8e61	{"action":"token_revoked","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-06-18 15:32:06.448452+00	
00000000-0000-0000-0000-000000000000	c015a981-6993-4d06-aaf3-824b1165cdf7	{"action":"token_refreshed","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-06-18 16:30:51.993952+00	
00000000-0000-0000-0000-000000000000	427451bd-8b71-4675-b33d-7edb9489ab87	{"action":"token_revoked","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-06-18 16:30:51.996044+00	
00000000-0000-0000-0000-000000000000	1c4db7f6-a73a-4cf9-b9ad-ca222dec2ea5	{"action":"token_refreshed","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-06-18 17:29:10.345991+00	
00000000-0000-0000-0000-000000000000	f6c3906f-0009-4d85-b248-80e0468abaf3	{"action":"token_revoked","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-06-18 17:29:10.347886+00	
00000000-0000-0000-0000-000000000000	d6f3f632-437e-4215-9b71-8dbeb257390a	{"action":"token_refreshed","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-06-18 18:30:44.91017+00	
00000000-0000-0000-0000-000000000000	292b95b3-1937-4663-b2be-012bddead8b0	{"action":"token_revoked","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-06-18 18:30:44.912324+00	
00000000-0000-0000-0000-000000000000	6244e450-a23e-4732-82a7-865d8f3c307a	{"action":"token_refreshed","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-06-18 20:46:01.857706+00	
00000000-0000-0000-0000-000000000000	a0a16bd9-66f9-46bb-950f-6950f08128cd	{"action":"token_revoked","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-06-18 20:46:01.86056+00	
00000000-0000-0000-0000-000000000000	138da625-6b8d-4236-b807-1d8bab6468e1	{"action":"token_refreshed","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-06-19 00:55:32.042747+00	
00000000-0000-0000-0000-000000000000	60193d42-0ba6-4bb2-8e5f-b62f1b6197a3	{"action":"token_revoked","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-06-19 00:55:32.045217+00	
00000000-0000-0000-0000-000000000000	62b0d051-fa2d-441b-aa0c-bc6e59b3f3b5	{"action":"login","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-06-19 02:27:09.866351+00	
00000000-0000-0000-0000-000000000000	9de38c4e-d533-4c77-a0ed-a9d81319a055	{"action":"login","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-06-19 02:27:11.566448+00	
00000000-0000-0000-0000-000000000000	3ed994ff-5976-46ec-9e76-3ed238eb5227	{"action":"login","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-06-19 02:27:12.142147+00	
00000000-0000-0000-0000-000000000000	e432e665-c93c-405c-9a5b-82e5f724e384	{"action":"login","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-06-19 02:27:12.39838+00	
00000000-0000-0000-0000-000000000000	fcbb1b9b-9171-4fef-b0ca-4c4851f2dc35	{"action":"login","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-06-19 02:27:12.588765+00	
00000000-0000-0000-0000-000000000000	c3297744-61d5-4a88-bb2c-cc5128bd5f25	{"action":"login","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-06-19 02:27:12.761849+00	
00000000-0000-0000-0000-000000000000	c54aec15-53e1-4fb3-878a-50b223f8ccec	{"action":"token_refreshed","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-06-19 03:33:00.30065+00	
00000000-0000-0000-0000-000000000000	3c655316-bfa4-4405-a7b9-6b7d5f4535b3	{"action":"token_revoked","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-06-19 03:33:00.302604+00	
00000000-0000-0000-0000-000000000000	4489e951-1261-4e5c-821e-77dc9bbf0363	{"action":"token_refreshed","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-06-19 10:57:38.274234+00	
00000000-0000-0000-0000-000000000000	a24abf3f-b769-4ff3-bb5c-c400d3b3163b	{"action":"token_revoked","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-06-19 10:57:38.280896+00	
00000000-0000-0000-0000-000000000000	7409713a-63f6-4270-970b-99d0e9875262	{"action":"token_refreshed","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-06-19 12:39:59.965378+00	
00000000-0000-0000-0000-000000000000	df3e0c35-6190-4b2f-9ece-a64c0a45f1cb	{"action":"token_revoked","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-06-19 12:39:59.969055+00	
00000000-0000-0000-0000-000000000000	eb08eac4-c9e0-4ab0-92c9-8ed8ce4dc5e1	{"action":"token_refreshed","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-06-19 12:41:53.781235+00	
00000000-0000-0000-0000-000000000000	4ab308c3-7698-4375-9c36-dd271f93e0d4	{"action":"token_revoked","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-06-19 12:41:53.782633+00	
00000000-0000-0000-0000-000000000000	dee04215-4cc3-4ce5-b330-a8c60d9de938	{"action":"token_refreshed","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-06-19 13:41:00.156271+00	
00000000-0000-0000-0000-000000000000	4e99d068-ecea-4bab-8765-095e5991f2d8	{"action":"token_revoked","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-06-19 13:41:00.160859+00	
00000000-0000-0000-0000-000000000000	d4f6ac37-779d-4d13-96db-a1484dcc98bf	{"action":"token_refreshed","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-06-19 15:50:27.433037+00	
00000000-0000-0000-0000-000000000000	83edee5a-146e-47e9-9e91-1ea94ae7f5d3	{"action":"token_revoked","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-06-19 15:50:27.435418+00	
00000000-0000-0000-0000-000000000000	51ca0fa0-e61b-42da-9413-09e59d953ac8	{"action":"token_refreshed","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-06-19 19:58:54.249644+00	
00000000-0000-0000-0000-000000000000	14d23fd9-2160-45b7-911e-b3d132be2d4f	{"action":"token_revoked","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-06-19 19:58:54.251109+00	
00000000-0000-0000-0000-000000000000	20a29832-c076-4533-b76b-dfbd01f96fa7	{"action":"token_refreshed","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-06-20 00:35:08.946638+00	
00000000-0000-0000-0000-000000000000	90233e0d-9c9a-44c2-8a78-65cf8d3bf275	{"action":"token_revoked","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-06-20 00:35:08.948707+00	
00000000-0000-0000-0000-000000000000	1dae3b5a-ab24-4601-b591-22fd20b756b6	{"action":"token_refreshed","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-06-20 12:02:02.2582+00	
00000000-0000-0000-0000-000000000000	0507f026-612c-405b-93c8-20a2254e7763	{"action":"token_revoked","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-06-20 12:02:02.259922+00	
00000000-0000-0000-0000-000000000000	3422ee59-7c84-45d1-bac6-04868320b340	{"action":"token_refreshed","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-06-20 13:39:01.782165+00	
00000000-0000-0000-0000-000000000000	ef97560f-2984-4b16-9dfb-50ca198951c9	{"action":"token_revoked","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-06-20 13:39:01.786881+00	
00000000-0000-0000-0000-000000000000	2cfc76ca-df5d-4176-addb-2ba001bd4b3b	{"action":"token_refreshed","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-06-20 14:38:04.636971+00	
00000000-0000-0000-0000-000000000000	599f5172-e1cf-4df8-ac9e-64eebc1359bf	{"action":"token_revoked","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-06-20 14:38:04.638793+00	
00000000-0000-0000-0000-000000000000	2d13373f-e865-4075-b920-2b25f101e39b	{"action":"token_refreshed","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-06-20 16:11:23.067795+00	
00000000-0000-0000-0000-000000000000	d9196675-af86-4b48-9127-ad37a66cec11	{"action":"token_revoked","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-06-20 16:11:23.069277+00	
00000000-0000-0000-0000-000000000000	b8a313d1-f1d3-42ea-ae0b-e064232b1cb1	{"action":"token_refreshed","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-06-20 18:20:29.53002+00	
00000000-0000-0000-0000-000000000000	01f6f03e-3eca-4ad8-ae38-622d94f53cb6	{"action":"token_revoked","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-06-20 18:20:29.534075+00	
00000000-0000-0000-0000-000000000000	c962e3ca-0e1a-401b-bbce-f128978be5de	{"action":"token_refreshed","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-06-20 19:43:05.288491+00	
00000000-0000-0000-0000-000000000000	05668121-a70c-48ed-a369-6881e78ce5f3	{"action":"token_revoked","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-06-20 19:43:05.290259+00	
00000000-0000-0000-0000-000000000000	0dc3b788-20a7-441c-9708-27333947f798	{"action":"token_refreshed","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-06-21 16:34:45.625832+00	
00000000-0000-0000-0000-000000000000	39a8b5e4-73d5-4f40-b3ff-d3f0810752c9	{"action":"token_revoked","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-06-21 16:34:45.633625+00	
00000000-0000-0000-0000-000000000000	e6706804-6651-4607-8bc2-960e8380b252	{"action":"token_refreshed","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-06-23 10:43:32.346239+00	
00000000-0000-0000-0000-000000000000	67369bf2-7596-4313-8264-88f4c2967e6a	{"action":"token_revoked","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-06-23 10:43:32.349242+00	
00000000-0000-0000-0000-000000000000	c60118b0-793b-474e-96ae-64f878309c3a	{"action":"token_refreshed","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-06-23 12:02:10.073987+00	
00000000-0000-0000-0000-000000000000	5a4ace36-ddc1-4da8-8efe-73757c4b6391	{"action":"token_revoked","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-06-23 12:02:10.07602+00	
00000000-0000-0000-0000-000000000000	788fde0d-b9bf-4ebe-bf90-74675ee26f4e	{"action":"token_refreshed","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-06-23 13:06:12.565465+00	
00000000-0000-0000-0000-000000000000	1d575222-39bc-4014-a2ba-8de7090ec281	{"action":"token_revoked","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-06-23 13:06:12.567175+00	
00000000-0000-0000-0000-000000000000	a0b1ba34-0090-47de-b126-f101812d2b48	{"action":"token_refreshed","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-06-23 14:16:13.5011+00	
00000000-0000-0000-0000-000000000000	28b8bd70-5f0b-499f-b56a-e3792da3c3d0	{"action":"token_revoked","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-06-23 14:16:13.50303+00	
00000000-0000-0000-0000-000000000000	c73e596a-250a-4138-90d1-f10d0281429d	{"action":"token_refreshed","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-06-23 15:56:50.164227+00	
00000000-0000-0000-0000-000000000000	f4c77dfe-1375-43f2-858d-e8d5df02251d	{"action":"token_revoked","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-06-23 15:56:50.170302+00	
00000000-0000-0000-0000-000000000000	0a67d5b5-80b4-447d-9d3f-0d852f546e42	{"action":"token_refreshed","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-06-23 18:06:31.052351+00	
00000000-0000-0000-0000-000000000000	9bb2a608-b96a-4ea4-89f8-35961ceda97e	{"action":"token_revoked","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-06-23 18:06:31.054918+00	
00000000-0000-0000-0000-000000000000	9dd18656-75c5-4062-99fa-53c1f4bbf79e	{"action":"token_refreshed","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-06-24 10:58:38.441158+00	
00000000-0000-0000-0000-000000000000	958f90ea-ced1-46bb-b4e1-cf24921da6bf	{"action":"token_revoked","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-06-24 10:58:38.450107+00	
00000000-0000-0000-0000-000000000000	3dea9cb2-094d-47eb-a264-d34639537f28	{"action":"token_refreshed","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-06-24 12:07:02.271556+00	
00000000-0000-0000-0000-000000000000	6cf82318-2073-48f9-a345-d7af1352c663	{"action":"token_revoked","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-06-24 12:07:02.27262+00	
00000000-0000-0000-0000-000000000000	4ad707ea-2f9c-4174-879f-92eb44ca5bb2	{"action":"token_refreshed","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-06-25 14:07:15.302749+00	
00000000-0000-0000-0000-000000000000	646f1742-004e-4927-ae4c-9ebb96bb7161	{"action":"token_revoked","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-06-25 14:07:15.30964+00	
00000000-0000-0000-0000-000000000000	a8475ec8-406a-4a96-8894-c637475a0fd3	{"action":"token_refreshed","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-06-25 16:41:11.765449+00	
00000000-0000-0000-0000-000000000000	ca722e6f-e178-4b7a-b52b-4b7a7d42b964	{"action":"token_revoked","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-06-25 16:41:11.770253+00	
00000000-0000-0000-0000-000000000000	a39606f8-15d8-4a79-b936-20caa4cf195d	{"action":"token_refreshed","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-06-25 17:39:26.395652+00	
00000000-0000-0000-0000-000000000000	22ab1c65-adb8-40a0-9b09-9eb5603e711a	{"action":"token_revoked","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-06-25 17:39:26.410078+00	
00000000-0000-0000-0000-000000000000	6e9c6538-af2f-4638-bf1f-20e490b7e03a	{"action":"token_refreshed","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-06-25 18:38:25.059367+00	
00000000-0000-0000-0000-000000000000	4b08b541-dc72-4615-ba66-9746989b8c59	{"action":"token_revoked","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-06-25 18:38:25.063113+00	
00000000-0000-0000-0000-000000000000	9f05004f-6f38-4d7e-8a36-346f34839719	{"action":"token_refreshed","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-06-25 19:40:55.067738+00	
00000000-0000-0000-0000-000000000000	5c5204d4-dc3f-473e-8a78-5709032a18d1	{"action":"token_revoked","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-06-25 19:40:55.071773+00	
00000000-0000-0000-0000-000000000000	9ffc4a10-9394-4ac1-b6b0-c85f0367882b	{"action":"token_refreshed","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-06-25 20:39:20.314335+00	
00000000-0000-0000-0000-000000000000	070c2353-273b-4b97-9e19-4a96be03275f	{"action":"token_revoked","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-06-25 20:39:20.3235+00	
00000000-0000-0000-0000-000000000000	99e049cd-3037-4f80-b7c8-586592bf197f	{"action":"token_refreshed","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-06-26 12:32:33.695999+00	
00000000-0000-0000-0000-000000000000	2238d91b-e7ff-4fd7-8f72-7fe04bdd2094	{"action":"token_revoked","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-06-26 12:32:33.710371+00	
00000000-0000-0000-0000-000000000000	de6564a2-4989-4199-a57b-611ab489c3b7	{"action":"token_refreshed","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-06-26 14:03:40.639758+00	
00000000-0000-0000-0000-000000000000	bdd560ea-6789-4820-bbb6-ac6e537c7170	{"action":"token_revoked","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-06-26 14:03:40.643033+00	
00000000-0000-0000-0000-000000000000	c60163e1-af6e-42ab-83ba-cc08230e522e	{"action":"logout","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-06-26 14:31:54.176815+00	
00000000-0000-0000-0000-000000000000	b1911b2e-6b9d-4fbe-8912-966ce1ff08f9	{"action":"login","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-06-26 15:00:52.837725+00	
00000000-0000-0000-0000-000000000000	e6dbef3a-5354-435d-898c-38aa13d96128	{"action":"logout","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-06-26 15:04:49.566437+00	
00000000-0000-0000-0000-000000000000	40e445d3-0f42-43fe-bb89-2c040e05cf87	{"action":"login","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-06-26 15:42:27.668368+00	
00000000-0000-0000-0000-000000000000	dde9f3c0-95d9-49d0-8ebb-1cfd97088834	{"action":"logout","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-06-26 16:10:45.093941+00	
00000000-0000-0000-0000-000000000000	114fe404-fd97-4bf1-be57-9afaf8b20e28	{"action":"login","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-06-26 16:10:48.334866+00	
00000000-0000-0000-0000-000000000000	56e7f8d3-962f-4dbb-8061-6050e12165a8	{"action":"token_refreshed","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-06-26 17:09:45.131931+00	
00000000-0000-0000-0000-000000000000	f7435f5d-ec45-4ed6-a9ac-de03a2a708dc	{"action":"token_revoked","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-06-26 17:09:45.13873+00	
00000000-0000-0000-0000-000000000000	48270c26-d2b2-4b81-8457-eccbe7bed6ca	{"action":"token_refreshed","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-06-26 18:08:06.518764+00	
00000000-0000-0000-0000-000000000000	534c8144-4df0-4d78-bac5-eee4f47a7240	{"action":"token_revoked","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-06-26 18:08:06.520871+00	
00000000-0000-0000-0000-000000000000	2ee763ff-0d4a-48f5-b0a4-07d4c7f8af16	{"action":"token_refreshed","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-06-26 19:06:12.655742+00	
00000000-0000-0000-0000-000000000000	2bf07e7f-cbc0-4a96-9e5c-cddfe575066e	{"action":"token_revoked","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-06-26 19:06:12.658428+00	
00000000-0000-0000-0000-000000000000	ed786099-0666-4cd3-80cf-793d2f24bc8d	{"action":"token_refreshed","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-06-26 19:06:42.968747+00	
00000000-0000-0000-0000-000000000000	3a246212-72e1-4ba6-913b-39b9dc5cac1e	{"action":"token_refreshed","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-06-26 20:06:17.740134+00	
00000000-0000-0000-0000-000000000000	23113119-084c-4352-82d0-1f1107841fa0	{"action":"token_revoked","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-06-26 20:06:17.742045+00	
00000000-0000-0000-0000-000000000000	50e0b32b-bab9-4948-9205-e7f33e673523	{"action":"token_refreshed","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-06-26 23:20:59.772501+00	
00000000-0000-0000-0000-000000000000	d935f0db-94d1-45a6-8d77-78c6455755bc	{"action":"token_revoked","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-06-26 23:20:59.785238+00	
00000000-0000-0000-0000-000000000000	4fb0e089-c69a-4d84-a255-bbd55c6ef1fd	{"action":"token_refreshed","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-06-27 00:25:57.25077+00	
00000000-0000-0000-0000-000000000000	40be8cae-93b4-4352-aa0d-c59fb0243b12	{"action":"token_revoked","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-06-27 00:25:57.254159+00	
00000000-0000-0000-0000-000000000000	b347ae36-4c74-4844-be3d-baab59d952f6	{"action":"token_refreshed","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-06-27 10:16:11.713064+00	
00000000-0000-0000-0000-000000000000	62d1940f-21da-4880-8c0c-ddf8e77fd5ec	{"action":"token_revoked","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-06-27 10:16:11.722571+00	
00000000-0000-0000-0000-000000000000	194b417b-d5d0-4399-b9a3-f67f313e2b8f	{"action":"token_refreshed","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-06-27 12:22:34.140568+00	
00000000-0000-0000-0000-000000000000	5ceedd51-24ce-4b47-aae3-fe18f13aadbc	{"action":"token_revoked","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-06-27 12:22:34.14657+00	
00000000-0000-0000-0000-000000000000	9cd11aac-a337-4355-9718-edcb3fe7d48a	{"action":"token_refreshed","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-06-27 13:21:03.258953+00	
00000000-0000-0000-0000-000000000000	0a56bd28-e459-4037-a86a-9798110c9a96	{"action":"token_revoked","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-06-27 13:21:03.268248+00	
00000000-0000-0000-0000-000000000000	9e58a6d2-a207-46ed-8111-57ebda5eb400	{"action":"token_refreshed","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-06-27 14:19:24.791379+00	
00000000-0000-0000-0000-000000000000	415f4c80-f0cf-45ef-9293-658ce11ae327	{"action":"token_revoked","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-06-27 14:19:24.794827+00	
00000000-0000-0000-0000-000000000000	9afea42e-4ed1-4965-8103-86e4f902659c	{"action":"token_refreshed","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-06-27 15:22:03.513027+00	
00000000-0000-0000-0000-000000000000	9c4ca0fe-388a-4ba8-99f0-374f08a29ee2	{"action":"token_revoked","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-06-27 15:22:03.520517+00	
00000000-0000-0000-0000-000000000000	2f5786b5-cadd-474f-87b7-6974cb55f1b8	{"action":"logout","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-06-27 15:59:01.277671+00	
00000000-0000-0000-0000-000000000000	225deecf-1ebd-4448-b061-26352c16a25f	{"action":"login","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-06-27 15:59:12.103328+00	
00000000-0000-0000-0000-000000000000	50035d6f-69fe-46c7-9102-86258a5a807a	{"action":"login","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-06-27 19:27:19.325875+00	
00000000-0000-0000-0000-000000000000	d8f1792d-8e83-42fc-ad4d-2b65f9438eeb	{"action":"token_refreshed","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-06-27 22:17:02.234854+00	
00000000-0000-0000-0000-000000000000	e08250b7-247a-4e30-a289-ea94962b2751	{"action":"token_revoked","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-06-27 22:17:02.238955+00	
00000000-0000-0000-0000-000000000000	4559d652-1fb2-425e-bcc8-29f771370424	{"action":"token_refreshed","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-06-28 11:04:34.981429+00	
00000000-0000-0000-0000-000000000000	188544b3-ea66-4e8b-8e43-621998e67001	{"action":"token_revoked","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-06-28 11:04:34.996737+00	
00000000-0000-0000-0000-000000000000	ef726bd3-08e6-4125-957e-f15165b2cdf1	{"action":"user_confirmation_requested","actor_id":"1f376499-fc49-4444-970c-21b7f9039851","actor_username":"dhubach1@gmail.com","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}	2025-06-28 12:09:56.1657+00	
00000000-0000-0000-0000-000000000000	d82820ae-26ec-4291-9883-59a51fd0cc48	{"action":"user_signedup","actor_id":"1f376499-fc49-4444-970c-21b7f9039851","actor_username":"dhubach1@gmail.com","actor_via_sso":false,"log_type":"team"}	2025-06-28 12:11:11.84559+00	
00000000-0000-0000-0000-000000000000	bfd7158a-5b6a-441f-bbd9-d0566dabc7d4	{"action":"token_refreshed","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-06-28 12:56:08.551989+00	
00000000-0000-0000-0000-000000000000	6522d373-112e-41aa-8c1c-e0e4fd119d20	{"action":"token_revoked","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-06-28 12:56:08.554796+00	
00000000-0000-0000-0000-000000000000	d67a633c-43e6-4372-8c38-ccf40752007b	{"action":"token_refreshed","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-06-28 14:26:35.521211+00	
00000000-0000-0000-0000-000000000000	e70602d0-b85c-4ecc-9b6d-edfae3048aaa	{"action":"token_revoked","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-06-28 14:26:35.529003+00	
00000000-0000-0000-0000-000000000000	75dd469f-9003-4878-a7b7-564c6d0998a3	{"action":"login","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-06-28 17:37:47.326516+00	
00000000-0000-0000-0000-000000000000	8d62c681-e0a0-4e83-9ad4-58ba6a2f175f	{"action":"token_refreshed","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-06-28 19:32:36.064218+00	
00000000-0000-0000-0000-000000000000	587a89a9-260c-4c41-ada6-66efcb619bd5	{"action":"token_revoked","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-06-28 19:32:36.069924+00	
00000000-0000-0000-0000-000000000000	22b25e17-31c1-40ca-9e48-0b2552d369a3	{"action":"token_refreshed","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-06-29 22:28:20.424856+00	
00000000-0000-0000-0000-000000000000	62c0acaa-e326-4b40-a98f-c7c20f25bc01	{"action":"token_revoked","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-06-29 22:28:20.436188+00	
00000000-0000-0000-0000-000000000000	bfb7f715-91a6-4a5f-83c3-6f4308b754ed	{"action":"token_refreshed","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-06-30 01:43:59.15681+00	
00000000-0000-0000-0000-000000000000	39d2764c-3f05-41db-bb3d-de5a8120b491	{"action":"token_revoked","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-06-30 01:43:59.161013+00	
00000000-0000-0000-0000-000000000000	4e5ffb23-4b37-4cc5-ba2d-35a62292833c	{"action":"token_refreshed","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-06-30 12:32:36.49077+00	
00000000-0000-0000-0000-000000000000	8be0a07c-164a-4518-a581-734e2e471c6f	{"action":"token_revoked","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-06-30 12:32:36.496027+00	
00000000-0000-0000-0000-000000000000	3783a559-5523-4c62-9dae-5b98d1af1dce	{"action":"token_refreshed","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-06-30 15:40:34.583684+00	
00000000-0000-0000-0000-000000000000	c6e835b0-fae4-4f56-b6be-afe12ddbfaa9	{"action":"token_revoked","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-06-30 15:40:34.588541+00	
00000000-0000-0000-0000-000000000000	6b2631dd-7168-44aa-83d5-9abef573bda7	{"action":"token_refreshed","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-06-30 16:52:31.912637+00	
00000000-0000-0000-0000-000000000000	2a047995-0cd2-4cf9-98de-dbf625144337	{"action":"token_revoked","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-06-30 16:52:31.915419+00	
00000000-0000-0000-0000-000000000000	f46043f0-ce64-4b88-8936-01af0d97d797	{"action":"token_refreshed","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-06-30 18:45:57.53476+00	
00000000-0000-0000-0000-000000000000	5c96e04a-72dd-4f7c-b5be-30bcba17f6ed	{"action":"token_revoked","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-06-30 18:45:57.53859+00	
00000000-0000-0000-0000-000000000000	baf8b1e9-fe9d-4cab-b227-4489a94580a5	{"action":"token_refreshed","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-06-30 19:44:27.982535+00	
00000000-0000-0000-0000-000000000000	83ece13e-c848-437e-8048-3133c0423fd1	{"action":"token_revoked","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-06-30 19:44:27.985335+00	
00000000-0000-0000-0000-000000000000	f6a45d34-a8ae-4ae7-9294-982da15607da	{"action":"token_refreshed","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-07-01 10:14:57.435032+00	
00000000-0000-0000-0000-000000000000	7a83a2eb-bedb-4fb4-8188-fb52d543d302	{"action":"token_revoked","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-07-01 10:14:57.438647+00	
00000000-0000-0000-0000-000000000000	4423e55e-353c-4662-82a0-0aadb368cbd7	{"action":"token_refreshed","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-07-01 11:37:39.95559+00	
00000000-0000-0000-0000-000000000000	eb5775ed-b2da-40e1-89fc-69b20cb3c171	{"action":"token_revoked","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-07-01 11:37:39.959517+00	
00000000-0000-0000-0000-000000000000	8adac38d-2f83-45c4-9a78-028a5e16ff7c	{"action":"token_refreshed","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-07-01 12:04:58.649538+00	
00000000-0000-0000-0000-000000000000	ff42a54a-d144-4e2e-8dca-2e437fa7b3ff	{"action":"token_revoked","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-07-01 12:04:58.652152+00	
00000000-0000-0000-0000-000000000000	a9c879db-ed64-4dd1-9805-c56933c6d674	{"action":"token_refreshed","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-07-01 12:56:53.706668+00	
00000000-0000-0000-0000-000000000000	ce7e3569-e1f2-48c2-9344-611a1dbf48fc	{"action":"token_revoked","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-07-01 12:56:53.712541+00	
00000000-0000-0000-0000-000000000000	71742508-101f-4bf8-bad3-32d2a7142afb	{"action":"token_refreshed","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-07-01 13:04:18.989926+00	
00000000-0000-0000-0000-000000000000	c1a6f1d3-a493-4e97-a09e-e6b973887162	{"action":"token_revoked","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-07-01 13:04:18.992255+00	
00000000-0000-0000-0000-000000000000	249f5cb7-9688-4b03-9491-3dcdb47abd96	{"action":"token_refreshed","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-07-01 14:07:37.393751+00	
00000000-0000-0000-0000-000000000000	b7a70b40-d2be-44ac-8053-941c1d3cecff	{"action":"token_revoked","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-07-01 14:07:37.395567+00	
00000000-0000-0000-0000-000000000000	fae7aaa5-f94a-4e05-90b8-2b828577b9cb	{"action":"token_refreshed","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-07-02 10:31:42.507499+00	
00000000-0000-0000-0000-000000000000	6407de40-0132-471c-9041-21182b264b3c	{"action":"token_revoked","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-07-02 10:31:42.513316+00	
00000000-0000-0000-0000-000000000000	ea11317e-81ac-4681-8b7b-3ad99561fe9e	{"action":"token_refreshed","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-07-02 16:55:19.471878+00	
00000000-0000-0000-0000-000000000000	b8689c49-094f-4355-8b56-31003f0e1ac1	{"action":"token_revoked","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-07-02 16:55:19.474767+00	
00000000-0000-0000-0000-000000000000	1bc26d3e-65e6-4ff0-b4bf-5f3003d867e4	{"action":"token_refreshed","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-07-02 19:31:21.633271+00	
00000000-0000-0000-0000-000000000000	c9c79dd2-ed8f-46ca-a7d7-2faf2f821a47	{"action":"token_revoked","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-07-02 19:31:21.63463+00	
00000000-0000-0000-0000-000000000000	de2ef4b2-f588-45c2-b7be-c58e2e6fc450	{"action":"token_refreshed","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-07-03 10:27:24.100393+00	
00000000-0000-0000-0000-000000000000	7fb0b65e-36b1-4e3a-8b2b-13cfbad32402	{"action":"token_revoked","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-07-03 10:27:24.111997+00	
00000000-0000-0000-0000-000000000000	96143cd1-76f3-48ad-9ee9-d63763d17499	{"action":"token_refreshed","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-07-03 11:36:00.60523+00	
00000000-0000-0000-0000-000000000000	14f1d75f-e27e-40c6-9bae-97f0f93b2b75	{"action":"token_revoked","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-07-03 11:36:00.610964+00	
00000000-0000-0000-0000-000000000000	191e27c5-917a-4b82-b631-d4f7f7b7703a	{"action":"token_refreshed","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-07-03 12:34:04.463838+00	
00000000-0000-0000-0000-000000000000	65258f04-032d-46af-bf95-10da2d0d79c6	{"action":"token_revoked","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-07-03 12:34:04.465502+00	
00000000-0000-0000-0000-000000000000	cea744ea-f8fb-4f7e-8432-35c512a66638	{"action":"token_refreshed","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-07-03 13:32:34.613873+00	
00000000-0000-0000-0000-000000000000	c292ed1e-8537-4cf2-9645-278e2be8378b	{"action":"token_revoked","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-07-03 13:32:34.616555+00	
00000000-0000-0000-0000-000000000000	47346dae-9390-4493-8947-a358c1691139	{"action":"token_refreshed","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-07-03 14:30:44.545699+00	
00000000-0000-0000-0000-000000000000	ae79c769-be52-4a30-ac6d-6d4dc87f9cea	{"action":"token_revoked","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-07-03 14:30:44.547154+00	
00000000-0000-0000-0000-000000000000	ffae2689-3559-41a8-8d20-cc20d3baa578	{"action":"token_refreshed","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-07-03 15:29:00.739617+00	
00000000-0000-0000-0000-000000000000	7bd7e9b7-f3d8-4102-8948-3b6948a9ffb6	{"action":"token_revoked","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-07-03 15:29:00.741202+00	
00000000-0000-0000-0000-000000000000	c416a692-6ce0-4d60-b749-147951d67a19	{"action":"token_refreshed","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-07-03 16:28:36.950714+00	
00000000-0000-0000-0000-000000000000	79f12c57-bd86-4f61-9fc6-1bbc269019cf	{"action":"token_revoked","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-07-03 16:28:36.954259+00	
00000000-0000-0000-0000-000000000000	c664dea9-6551-4dbe-8c0e-c1003106da10	{"action":"token_refreshed","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-07-03 17:26:49.849389+00	
00000000-0000-0000-0000-000000000000	65c17486-33d5-48ee-9e3b-3530d89e63fd	{"action":"token_revoked","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-07-03 17:26:49.851718+00	
00000000-0000-0000-0000-000000000000	76722e98-5e2e-4b6d-b12e-96263955a06c	{"action":"token_refreshed","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-07-03 18:24:55.954802+00	
00000000-0000-0000-0000-000000000000	ab3ed5d4-3e3d-4813-903b-df6ef666def5	{"action":"token_revoked","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-07-03 18:24:55.958038+00	
00000000-0000-0000-0000-000000000000	e5274ac4-5eb9-499a-b478-bcda30e7fec3	{"action":"token_refreshed","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-07-03 19:42:48.544622+00	
00000000-0000-0000-0000-000000000000	48d0221c-d1d0-4dca-9f87-df54bc0d096e	{"action":"token_revoked","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-07-03 19:42:48.546723+00	
00000000-0000-0000-0000-000000000000	5ab4098d-f19d-4ed9-9d70-486609d2d636	{"action":"token_refreshed","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-07-04 10:59:38.717622+00	
00000000-0000-0000-0000-000000000000	2e53dab0-7bbd-4022-947c-56666c04ee1f	{"action":"token_revoked","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-07-04 10:59:38.72498+00	
00000000-0000-0000-0000-000000000000	d95034db-a566-439d-bedf-e52e4318a48f	{"action":"token_refreshed","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-07-04 23:12:00.983503+00	
00000000-0000-0000-0000-000000000000	44b6f22c-36a9-447e-b66d-3ab11ce8bf6d	{"action":"token_revoked","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-07-04 23:12:00.990629+00	
00000000-0000-0000-0000-000000000000	c411e4a0-a973-43bb-9d9e-84d33b4e9a6b	{"action":"token_refreshed","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-07-05 13:01:09.871368+00	
00000000-0000-0000-0000-000000000000	c1ab37d6-53bd-496d-9fb0-8a1b53d1d58f	{"action":"token_revoked","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-07-05 13:01:09.879311+00	
00000000-0000-0000-0000-000000000000	ce1f9ff1-e8cb-442d-a608-8a20992a77a8	{"action":"token_refreshed","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-07-06 12:08:28.864928+00	
00000000-0000-0000-0000-000000000000	06a1fdeb-853e-48ca-82f6-1e181e32b56d	{"action":"token_revoked","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-07-06 12:08:28.87579+00	
00000000-0000-0000-0000-000000000000	457d58ae-cea6-422c-ad28-56402a461bd6	{"action":"token_refreshed","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-07-06 13:06:38.45675+00	
00000000-0000-0000-0000-000000000000	8a54c5b0-8146-42d1-94b3-2985ef9cc2dd	{"action":"token_revoked","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-07-06 13:06:38.461014+00	
00000000-0000-0000-0000-000000000000	3df74839-5d45-4b4f-9397-9171d451125d	{"action":"token_refreshed","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-07-06 14:18:50.344358+00	
00000000-0000-0000-0000-000000000000	503fbf0b-3ffd-4293-8ec3-f8201f577778	{"action":"token_revoked","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-07-06 14:18:50.351062+00	
00000000-0000-0000-0000-000000000000	781b8118-060e-4462-a071-70d54aab985e	{"action":"token_refreshed","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-07-06 14:31:42.113507+00	
00000000-0000-0000-0000-000000000000	84149dd4-441a-4ccf-93b9-ce24db1a67e2	{"action":"token_revoked","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-07-06 14:31:42.11717+00	
00000000-0000-0000-0000-000000000000	20eb0969-c629-4c17-9701-b50cc5c276fa	{"action":"token_refreshed","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-07-07 01:44:38.623495+00	
00000000-0000-0000-0000-000000000000	94f793b1-ca5d-4b77-8289-9abc11e17823	{"action":"token_revoked","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-07-07 01:44:38.630263+00	
00000000-0000-0000-0000-000000000000	b3a94721-f701-4fbf-90fa-6622df1566d1	{"action":"token_refreshed","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-07-07 11:52:47.168909+00	
00000000-0000-0000-0000-000000000000	4ffbc958-80fe-4f50-8acc-d7891250e51d	{"action":"token_revoked","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-07-07 11:52:47.17914+00	
00000000-0000-0000-0000-000000000000	3393d094-bf2c-4443-ac20-5c58cc2542f9	{"action":"token_refreshed","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-07-07 12:51:38.524528+00	
00000000-0000-0000-0000-000000000000	0aba1ccd-a892-4e91-b316-3a285a3dc415	{"action":"token_revoked","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-07-07 12:51:38.529563+00	
00000000-0000-0000-0000-000000000000	24da68fd-b644-4c9d-abec-ad542ce037c5	{"action":"token_refreshed","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-07-07 13:49:46.75041+00	
00000000-0000-0000-0000-000000000000	bda7c83a-cbbf-49e6-a830-5ac7c13d31a5	{"action":"token_revoked","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-07-07 13:49:46.752082+00	
00000000-0000-0000-0000-000000000000	05cb0b98-1aef-42d8-a0db-5a87da776edf	{"action":"token_refreshed","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-07-07 15:15:15.755055+00	
00000000-0000-0000-0000-000000000000	e78d538a-1fa1-4d89-bb14-0acde262dafa	{"action":"token_revoked","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-07-07 15:15:15.758393+00	
00000000-0000-0000-0000-000000000000	790f2a6b-8bba-45c3-baa4-4dd19eaea0c1	{"action":"token_refreshed","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-07-07 16:13:18.418805+00	
00000000-0000-0000-0000-000000000000	c2e3333e-38de-4be9-98c6-9045e9147295	{"action":"token_revoked","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-07-07 16:13:18.421087+00	
00000000-0000-0000-0000-000000000000	edac9fbc-c8bc-42e7-a00c-c285b2484bec	{"action":"token_refreshed","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-07-08 01:13:41.697999+00	
00000000-0000-0000-0000-000000000000	33cf2a11-e182-423b-a92a-4ed2cf10707f	{"action":"token_revoked","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-07-08 01:13:41.713035+00	
00000000-0000-0000-0000-000000000000	31270a7b-db9a-44e1-92df-0381c8c4330d	{"action":"token_refreshed","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-07-08 19:47:05.289006+00	
00000000-0000-0000-0000-000000000000	1ab44a07-8f92-4c80-9d58-1ce51e50825c	{"action":"token_revoked","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-07-08 19:47:05.300831+00	
00000000-0000-0000-0000-000000000000	a9fd8bcb-a218-43eb-80af-3a83f912daca	{"action":"token_refreshed","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-07-08 20:45:11.465735+00	
00000000-0000-0000-0000-000000000000	c315587d-fa9a-4d79-ae60-56a0f6329dea	{"action":"token_revoked","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-07-08 20:45:11.473246+00	
00000000-0000-0000-0000-000000000000	67aacfb1-eae1-4284-872c-48623e8efb45	{"action":"token_refreshed","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-07-09 10:06:12.777999+00	
00000000-0000-0000-0000-000000000000	56697411-4d45-4d4f-961b-fc719e8f9527	{"action":"token_revoked","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-07-09 10:06:12.78409+00	
00000000-0000-0000-0000-000000000000	d9c505f1-2368-455f-bc06-783f2b979c3b	{"action":"token_refreshed","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-07-09 11:13:23.382441+00	
00000000-0000-0000-0000-000000000000	37465b60-8558-4f56-8d8e-108351f0a18e	{"action":"token_revoked","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-07-09 11:13:23.384064+00	
00000000-0000-0000-0000-000000000000	bfac0388-eec0-40be-b5aa-3a5177a231ff	{"action":"token_refreshed","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-07-09 12:40:33.724192+00	
00000000-0000-0000-0000-000000000000	5b16d98d-6d4c-45e8-9266-37d91e190957	{"action":"token_revoked","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-07-09 12:40:33.727466+00	
00000000-0000-0000-0000-000000000000	7380cc32-9f39-46c3-9d4f-7632a4ca57b6	{"action":"token_refreshed","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-07-09 13:38:36.745378+00	
00000000-0000-0000-0000-000000000000	372154b3-4852-450f-92b1-58a6c27f7fea	{"action":"token_revoked","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-07-09 13:38:36.755607+00	
00000000-0000-0000-0000-000000000000	14203657-4343-424c-b28a-208dad4b7d50	{"action":"token_refreshed","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-07-09 16:26:07.6932+00	
00000000-0000-0000-0000-000000000000	d39b1d6c-6f71-4da0-bb19-af4d5b5e9a0a	{"action":"token_revoked","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-07-09 16:26:07.697166+00	
00000000-0000-0000-0000-000000000000	02f5b91b-dbae-4232-863e-4a52690fe24a	{"action":"token_refreshed","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-07-09 17:24:13.383338+00	
00000000-0000-0000-0000-000000000000	3ba9ea1d-61d9-4fa7-93d6-1f2a6a6a4748	{"action":"token_revoked","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-07-09 17:24:13.386633+00	
00000000-0000-0000-0000-000000000000	23d9694a-19af-47e5-b6b5-f037c5288e88	{"action":"token_refreshed","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-07-09 20:56:53.748709+00	
00000000-0000-0000-0000-000000000000	e6948c7d-71c5-48aa-afbf-0b98d7f32286	{"action":"token_revoked","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-07-09 20:56:53.755387+00	
00000000-0000-0000-0000-000000000000	ca5c5bc2-d5c8-4855-ab19-557012c7a15a	{"action":"token_refreshed","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-07-09 23:41:16.175338+00	
00000000-0000-0000-0000-000000000000	7f847caa-77f5-4f4c-8c3e-eefc6b310cf0	{"action":"token_revoked","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-07-09 23:41:16.182263+00	
00000000-0000-0000-0000-000000000000	e0cd25f9-5adc-4122-a6c0-1655cea01c6b	{"action":"token_refreshed","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-07-10 00:35:25.373046+00	
00000000-0000-0000-0000-000000000000	0bf834fc-ba5f-4435-b8fd-40484736bf40	{"action":"token_revoked","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-07-10 00:35:25.377367+00	
00000000-0000-0000-0000-000000000000	1c8524ea-3b49-408b-9fb8-efe304cc377b	{"action":"token_refreshed","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-07-10 10:14:06.511668+00	
00000000-0000-0000-0000-000000000000	ae617152-5e99-4c0f-b702-306350bf9720	{"action":"token_revoked","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-07-10 10:14:06.523172+00	
00000000-0000-0000-0000-000000000000	4561ff81-b70d-4237-84c4-2e792e75b33f	{"action":"token_refreshed","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-07-10 11:44:58.094302+00	
00000000-0000-0000-0000-000000000000	96dccf57-881c-4042-b9d3-768e2a7fc020	{"action":"token_revoked","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-07-10 11:44:58.099137+00	
00000000-0000-0000-0000-000000000000	d0029954-6aa4-455a-80e4-896175dbd311	{"action":"token_refreshed","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-07-10 13:02:43.40321+00	
00000000-0000-0000-0000-000000000000	ce5b5929-086b-4a99-a903-9a8546a5ec5b	{"action":"token_revoked","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-07-10 13:02:43.409882+00	
00000000-0000-0000-0000-000000000000	bdfa5b94-97c7-4d88-bd68-43b1f9c8637c	{"action":"token_refreshed","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-07-10 14:15:50.883066+00	
00000000-0000-0000-0000-000000000000	0bf343d5-b4e5-4711-a06c-06c711a824c1	{"action":"token_revoked","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-07-10 14:15:50.885902+00	
00000000-0000-0000-0000-000000000000	42daa691-805c-42b6-a287-fb27b020a5d9	{"action":"token_refreshed","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-07-10 15:14:00.840399+00	
00000000-0000-0000-0000-000000000000	b0d839a4-ab4e-4ad1-8c85-5feb7e51a40a	{"action":"token_revoked","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-07-10 15:14:00.84547+00	
00000000-0000-0000-0000-000000000000	8259fe48-d144-4de2-80c3-b94f4afbefd2	{"action":"token_refreshed","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-07-10 16:28:02.573425+00	
00000000-0000-0000-0000-000000000000	817b7fc5-f71f-4ad6-bb84-ae035a321f63	{"action":"token_revoked","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-07-10 16:28:02.580214+00	
00000000-0000-0000-0000-000000000000	a423be77-8a96-49d2-8976-174464550b7f	{"action":"token_refreshed","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-07-10 18:04:44.327738+00	
00000000-0000-0000-0000-000000000000	ffbd9d56-6fd8-4c4d-815d-bba146191568	{"action":"token_revoked","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-07-10 18:04:44.332866+00	
00000000-0000-0000-0000-000000000000	b9e5fabb-d0f4-450a-9fbe-f147d9e055a3	{"action":"token_refreshed","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-07-10 21:47:03.790295+00	
00000000-0000-0000-0000-000000000000	dc3dd04e-03e0-45a3-b40b-421ea8e1faf3	{"action":"token_revoked","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-07-10 21:47:03.796089+00	
00000000-0000-0000-0000-000000000000	d0843fc7-f9f7-424e-aa2d-35e9007a8109	{"action":"token_refreshed","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-07-10 22:45:28.491112+00	
00000000-0000-0000-0000-000000000000	dd536f2c-489d-4136-b8ce-57ece6cc9b52	{"action":"token_revoked","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-07-10 22:45:28.493485+00	
00000000-0000-0000-0000-000000000000	9e195ef1-eeba-4c9b-aa9d-64157efbc42a	{"action":"token_refreshed","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-07-10 23:43:58.623348+00	
00000000-0000-0000-0000-000000000000	6a297c70-0dea-42bc-8a0a-59dfb342413c	{"action":"token_revoked","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-07-10 23:43:58.626674+00	
00000000-0000-0000-0000-000000000000	14b1b248-685d-496d-af86-821a3e7cd8cd	{"action":"token_refreshed","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-07-11 00:42:28.70317+00	
00000000-0000-0000-0000-000000000000	4d426a4c-a1f4-4e2c-b7ef-bf20da59e18f	{"action":"token_revoked","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-07-11 00:42:28.70554+00	
00000000-0000-0000-0000-000000000000	f82444a4-7eae-4346-b9a0-6584c6ef9486	{"action":"token_refreshed","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-07-11 01:40:58.826382+00	
00000000-0000-0000-0000-000000000000	cba9d84b-6ea7-4831-b6a8-34f7ef6a66a0	{"action":"token_revoked","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-07-11 01:40:58.830048+00	
00000000-0000-0000-0000-000000000000	bb546731-b778-4b9b-bef9-fef4e0ec11f3	{"action":"token_refreshed","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-07-11 02:17:50.757093+00	
00000000-0000-0000-0000-000000000000	dd9868fa-74a8-4b5b-932c-eaf28170cf28	{"action":"token_revoked","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-07-11 02:17:50.759306+00	
00000000-0000-0000-0000-000000000000	94d1bf05-b9f5-4e48-8bc6-11ab14a16289	{"action":"token_refreshed","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-07-11 02:39:28.942993+00	
00000000-0000-0000-0000-000000000000	f012fbf3-32a7-4da5-a6f9-55ae91de9f65	{"action":"token_revoked","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-07-11 02:39:28.945528+00	
00000000-0000-0000-0000-000000000000	55419515-0fa3-4626-8581-849fffd6b9f6	{"action":"token_refreshed","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-07-11 03:37:59.044827+00	
00000000-0000-0000-0000-000000000000	374d8655-d230-40c1-a91f-003dd503952a	{"action":"token_revoked","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-07-11 03:37:59.047963+00	
00000000-0000-0000-0000-000000000000	77719816-1356-454b-b0f0-c5ae4dc2854d	{"action":"token_refreshed","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-07-11 04:36:29.452748+00	
00000000-0000-0000-0000-000000000000	7d030981-e0b3-44f1-92fe-b77265c0b12a	{"action":"token_revoked","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-07-11 04:36:29.469947+00	
00000000-0000-0000-0000-000000000000	831ca7e1-1e59-4a1f-a7a8-99f92f2826f7	{"action":"token_refreshed","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-07-11 05:34:59.415669+00	
00000000-0000-0000-0000-000000000000	660e1615-e18a-43d0-95d3-f7aa6d00d7ca	{"action":"token_revoked","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-07-11 05:34:59.425132+00	
00000000-0000-0000-0000-000000000000	0c7ba8d0-50c1-4724-91e3-2f8cbed2d858	{"action":"token_refreshed","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-07-11 06:33:29.351793+00	
00000000-0000-0000-0000-000000000000	dee6db40-8f7e-4daa-86a9-c4fd5dc0a5b4	{"action":"token_revoked","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-07-11 06:33:29.355275+00	
00000000-0000-0000-0000-000000000000	eee651cc-2516-4a42-bf22-bbd2001e7af0	{"action":"token_refreshed","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-07-11 07:31:59.539787+00	
00000000-0000-0000-0000-000000000000	d0d648fe-7adc-4992-9d6b-ab9376a31c9d	{"action":"token_revoked","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-07-11 07:31:59.546552+00	
00000000-0000-0000-0000-000000000000	fcc14670-97b2-46cf-9b21-71a9c8c50e7e	{"action":"token_refreshed","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-07-11 08:30:29.577411+00	
00000000-0000-0000-0000-000000000000	b52fcfd1-ecf5-4091-bf4e-316aaf4d17da	{"action":"token_revoked","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-07-11 08:30:29.579879+00	
00000000-0000-0000-0000-000000000000	e42738f1-0871-4f5b-ad69-ab05c0d340fc	{"action":"token_refreshed","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-07-11 09:28:59.722631+00	
00000000-0000-0000-0000-000000000000	d96df9cc-c874-4dba-a86f-c8118889f170	{"action":"token_revoked","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-07-11 09:28:59.726694+00	
00000000-0000-0000-0000-000000000000	eee415f1-3ab3-4e61-9a67-87c0a89da90f	{"action":"token_refreshed","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-07-11 10:34:29.426591+00	
00000000-0000-0000-0000-000000000000	a9e4eab0-9bcc-4a3e-8110-8044f5cca0e4	{"action":"token_revoked","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-07-11 10:34:29.435118+00	
00000000-0000-0000-0000-000000000000	4e5398ab-d189-4009-affc-ce0e93cadd67	{"action":"token_refreshed","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-07-11 13:14:49.272889+00	
00000000-0000-0000-0000-000000000000	543fe959-9f98-472f-804a-87f4a6713946	{"action":"token_revoked","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-07-11 13:14:49.275938+00	
00000000-0000-0000-0000-000000000000	1366d587-8a2d-4a7f-824b-b6ba34004ca8	{"action":"token_refreshed","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-07-11 14:12:49.851618+00	
00000000-0000-0000-0000-000000000000	92a8a487-c40b-41b7-9ca4-3f70b342be35	{"action":"token_revoked","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-07-11 14:12:49.861617+00	
00000000-0000-0000-0000-000000000000	b8f4ab6b-016d-41ce-ab7e-e4ce7fa865e3	{"action":"token_refreshed","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-07-11 15:19:54.287162+00	
00000000-0000-0000-0000-000000000000	2910504f-4690-4011-bac6-945aa527f037	{"action":"token_revoked","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-07-11 15:19:54.291418+00	
00000000-0000-0000-0000-000000000000	b644fcce-1bf9-40d1-ab64-0fa3147ad7e4	{"action":"token_refreshed","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-07-11 18:04:54.249039+00	
00000000-0000-0000-0000-000000000000	80b66781-a66d-4abf-a24c-327e785142d0	{"action":"token_revoked","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-07-11 18:04:54.260112+00	
00000000-0000-0000-0000-000000000000	786f5285-6f10-4d6d-9a6b-bdf3fc83838d	{"action":"token_refreshed","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-07-14 02:46:02.451603+00	
00000000-0000-0000-0000-000000000000	f12e0354-51e1-476b-b6e0-447a8e6e2aec	{"action":"token_revoked","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-07-14 02:46:02.467118+00	
00000000-0000-0000-0000-000000000000	931036e0-0c7c-47c6-adc0-a24ba6228c1a	{"action":"token_refreshed","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-07-14 10:17:29.730797+00	
00000000-0000-0000-0000-000000000000	4649b80a-38e1-438c-bb9a-eefe741ae114	{"action":"token_revoked","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-07-14 10:17:29.736657+00	
00000000-0000-0000-0000-000000000000	f074a837-f614-4066-8798-d9ac6d379df3	{"action":"token_refreshed","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-07-14 10:41:48.092755+00	
00000000-0000-0000-0000-000000000000	df417802-4840-450f-a209-b5ab89342016	{"action":"token_revoked","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-07-14 10:41:48.099064+00	
00000000-0000-0000-0000-000000000000	f2381280-f75b-4436-8381-ad05e06109cc	{"action":"token_refreshed","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-07-14 11:40:19.782175+00	
00000000-0000-0000-0000-000000000000	14ed4422-ec93-4514-9ff8-e9adb337ec61	{"action":"token_revoked","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-07-14 11:40:19.784494+00	
00000000-0000-0000-0000-000000000000	fc3c1821-1f97-4b7f-9f35-552f7a4cd3b5	{"action":"token_refreshed","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-07-14 13:48:37.033152+00	
00000000-0000-0000-0000-000000000000	509e7353-442e-49ac-8991-2d5a71b3638f	{"action":"token_revoked","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-07-14 13:48:37.035304+00	
00000000-0000-0000-0000-000000000000	99c1e803-d8cb-4b24-b648-221e6e111066	{"action":"token_refreshed","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-07-14 15:45:12.603715+00	
00000000-0000-0000-0000-000000000000	da997a1d-89d8-4de6-a877-7840576e1ce3	{"action":"token_revoked","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-07-14 15:45:12.605231+00	
00000000-0000-0000-0000-000000000000	ee3590e2-0008-424e-b9d8-55f9f16fddb8	{"action":"token_refreshed","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-07-14 17:44:35.145376+00	
00000000-0000-0000-0000-000000000000	2992c5cd-5f46-45ce-b8bb-e6a624f861a3	{"action":"token_revoked","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-07-14 17:44:35.147704+00	
00000000-0000-0000-0000-000000000000	a83eb6a6-bf18-48f7-a104-0bdfc0cad70f	{"action":"token_refreshed","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-07-15 13:40:21.065148+00	
00000000-0000-0000-0000-000000000000	11f945cb-6f37-465a-bc47-26c223a5adbd	{"action":"token_revoked","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-07-15 13:40:21.070247+00	
00000000-0000-0000-0000-000000000000	4446f4b8-7495-4487-9338-63f53136e265	{"action":"token_refreshed","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-07-15 15:11:27.508884+00	
00000000-0000-0000-0000-000000000000	20a451fb-7170-4417-9724-f47ec2acaa5d	{"action":"token_revoked","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-07-15 15:11:27.510492+00	
00000000-0000-0000-0000-000000000000	38293c93-4f09-4602-b3f3-9b7f0326f7be	{"action":"token_refreshed","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-07-15 16:52:01.726556+00	
00000000-0000-0000-0000-000000000000	de2e1b67-c97f-483d-b916-a2cd6ce10555	{"action":"token_revoked","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-07-15 16:52:01.728771+00	
00000000-0000-0000-0000-000000000000	bea32e13-6dbe-43e5-b018-7d8e46a5bf1e	{"action":"token_refreshed","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-07-15 19:06:14.638529+00	
00000000-0000-0000-0000-000000000000	ceee836d-4d80-41e4-8042-85931bd556ba	{"action":"token_revoked","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-07-15 19:06:14.641139+00	
00000000-0000-0000-0000-000000000000	7d8427cd-a6d9-4edc-9051-08708b214df6	{"action":"token_refreshed","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-07-16 12:57:53.167696+00	
00000000-0000-0000-0000-000000000000	a6bb2ba0-4a7e-4a72-a9f2-e7e8a1ccc574	{"action":"token_revoked","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-07-16 12:57:53.178439+00	
00000000-0000-0000-0000-000000000000	af8402b7-863d-4e59-9d93-35e7c73eb1f4	{"action":"token_refreshed","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-07-16 19:00:05.575344+00	
00000000-0000-0000-0000-000000000000	6e0e5750-6964-4047-bba6-8d717a90fd2a	{"action":"token_revoked","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-07-16 19:00:05.581993+00	
00000000-0000-0000-0000-000000000000	3c3983f4-dc2a-4a2c-a32b-b06f8352fe17	{"action":"token_refreshed","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-07-16 20:27:00.564984+00	
00000000-0000-0000-0000-000000000000	49bebf87-53dc-480a-9bc4-040e5c24f8a9	{"action":"token_revoked","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-07-16 20:27:00.571123+00	
00000000-0000-0000-0000-000000000000	946a3372-a787-4fce-a781-869e3efe6a3d	{"action":"token_refreshed","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-07-17 11:33:21.033464+00	
00000000-0000-0000-0000-000000000000	e8ac352a-9c4b-4eea-b419-89e95fa682f2	{"action":"token_revoked","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-07-17 11:33:21.045091+00	
00000000-0000-0000-0000-000000000000	812d8b2f-e1d4-48e7-b34d-90cf1d6fadff	{"action":"token_refreshed","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-07-17 11:49:34.484355+00	
00000000-0000-0000-0000-000000000000	e9dc888c-c6c1-4917-b175-94c2aa9fe113	{"action":"token_revoked","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-07-17 11:49:34.486399+00	
00000000-0000-0000-0000-000000000000	0ef57e5a-0bda-4f92-8501-40311763531e	{"action":"token_refreshed","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-07-17 13:00:31.80753+00	
00000000-0000-0000-0000-000000000000	619b4a26-059e-4773-9127-bae9b82b7c8a	{"action":"token_revoked","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-07-17 13:00:31.81067+00	
00000000-0000-0000-0000-000000000000	8c27ac67-b4dc-46c6-af2b-952bd7ccb1f7	{"action":"token_refreshed","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-07-17 14:24:03.271603+00	
00000000-0000-0000-0000-000000000000	b1417a8f-651c-4121-b878-4f0246a4ffef	{"action":"token_revoked","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-07-17 14:24:03.274292+00	
00000000-0000-0000-0000-000000000000	7c7f7344-521c-4bb2-bbd2-a55781caed69	{"action":"token_refreshed","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-07-17 17:29:28.691931+00	
00000000-0000-0000-0000-000000000000	429ad363-5aff-43f7-b5ed-66454512460d	{"action":"token_revoked","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-07-17 17:29:28.701244+00	
00000000-0000-0000-0000-000000000000	44318785-27be-41e5-a173-8520e354cd4b	{"action":"token_refreshed","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-07-17 18:56:30.667099+00	
00000000-0000-0000-0000-000000000000	3d9db034-02b8-4d94-be51-75702d2ae7bb	{"action":"token_revoked","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-07-17 18:56:30.669342+00	
00000000-0000-0000-0000-000000000000	672cead0-7326-4022-a933-b5d7550e77ad	{"action":"token_refreshed","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-07-18 11:55:16.63881+00	
00000000-0000-0000-0000-000000000000	c7119aa8-2d4e-4529-9ee1-d586aa8b79b4	{"action":"token_revoked","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-07-18 11:55:16.651432+00	
00000000-0000-0000-0000-000000000000	65be27f9-17a3-4018-b256-f5094013dfce	{"action":"token_refreshed","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-07-18 14:10:59.639068+00	
00000000-0000-0000-0000-000000000000	f28264c8-d6d7-4939-b4f8-bfc410c6a6b7	{"action":"token_revoked","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-07-18 14:10:59.643545+00	
00000000-0000-0000-0000-000000000000	ccc33ee9-7c90-4776-a509-616fe039381f	{"action":"token_refreshed","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-07-21 10:34:48.560073+00	
00000000-0000-0000-0000-000000000000	93c9da20-6975-4db3-8a2d-c7f2f6cb191a	{"action":"token_revoked","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-07-21 10:34:48.568341+00	
00000000-0000-0000-0000-000000000000	22d3ee3c-ff1f-4538-adc6-4eb425a02527	{"action":"token_refreshed","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-07-21 11:29:47.971692+00	
00000000-0000-0000-0000-000000000000	5faaae2b-a6e5-4946-95ec-0a394b914e40	{"action":"token_revoked","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-07-21 11:29:47.977897+00	
00000000-0000-0000-0000-000000000000	db0b4ca1-9170-4acb-ad72-bb6fcac362a2	{"action":"token_refreshed","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-07-21 12:28:06.938799+00	
00000000-0000-0000-0000-000000000000	d3aa74c6-4204-4d84-b5d3-5b9b526fc1a8	{"action":"token_revoked","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-07-21 12:28:06.94199+00	
00000000-0000-0000-0000-000000000000	9aa50a36-7c46-46fc-8919-cda72ab5694e	{"action":"token_refreshed","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-07-21 13:26:13.081526+00	
00000000-0000-0000-0000-000000000000	e90b7092-e914-4bad-b20a-d42a1d39bd94	{"action":"token_revoked","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-07-21 13:26:13.088061+00	
00000000-0000-0000-0000-000000000000	51b15cb8-0b8e-4ece-9b4b-215ae7a6b9e9	{"action":"token_refreshed","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-07-21 14:24:27.100516+00	
00000000-0000-0000-0000-000000000000	90c77138-32ba-48d2-8c15-8ba66701a5bb	{"action":"token_revoked","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-07-21 14:24:27.105897+00	
00000000-0000-0000-0000-000000000000	39789fee-b73e-4751-a283-e5f95f19ff93	{"action":"token_refreshed","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-07-21 15:28:32.181957+00	
00000000-0000-0000-0000-000000000000	38d9b03d-621a-4e4b-af96-edc04c3d47d8	{"action":"token_revoked","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-07-21 15:28:32.186869+00	
00000000-0000-0000-0000-000000000000	9e039c3d-afb7-4cf1-9eb0-949a8015ef8b	{"action":"token_refreshed","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-07-21 18:39:06.414175+00	
00000000-0000-0000-0000-000000000000	6af05bdf-8f52-4287-95c6-ae5d580d6154	{"action":"token_revoked","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-07-21 18:39:06.425642+00	
00000000-0000-0000-0000-000000000000	77826a8a-3bc1-48cd-9220-c68387898cc5	{"action":"token_refreshed","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-07-21 20:02:40.620727+00	
00000000-0000-0000-0000-000000000000	982dda86-cced-43a3-bc0d-9d66daeacc0c	{"action":"token_revoked","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-07-21 20:02:40.62794+00	
00000000-0000-0000-0000-000000000000	70d8430b-0a5f-41b0-810c-4c4d6259bb03	{"action":"token_refreshed","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-07-22 10:53:32.35471+00	
00000000-0000-0000-0000-000000000000	b70268e1-015e-4c05-b2d7-247dae5d9158	{"action":"token_revoked","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-07-22 10:53:32.367808+00	
00000000-0000-0000-0000-000000000000	9860f597-a92e-4d12-8cfe-ac6c61cd6505	{"action":"login","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-22 10:53:47.032639+00	
00000000-0000-0000-0000-000000000000	263ca513-9f8e-4c30-a887-a32e9c76762f	{"action":"login","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-07-22 10:54:06.027745+00	
00000000-0000-0000-0000-000000000000	95bdf542-73c0-4f37-99be-18c3627e821f	{"action":"token_refreshed","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-07-22 11:02:17.286675+00	
00000000-0000-0000-0000-000000000000	d30e9aa1-42dc-4ecb-8477-c97e8429ce52	{"action":"token_revoked","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-07-22 11:02:17.288192+00	
00000000-0000-0000-0000-000000000000	348b2022-e97b-4ff8-9bfb-8895e4b4244a	{"action":"token_refreshed","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-07-22 12:00:30.416521+00	
00000000-0000-0000-0000-000000000000	58c54e58-d623-4e27-b024-ffc818360096	{"action":"token_revoked","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-07-22 12:00:30.424986+00	
00000000-0000-0000-0000-000000000000	2e964979-296f-46eb-af1c-fb719b0e51cf	{"action":"token_refreshed","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-07-22 12:58:34.978843+00	
00000000-0000-0000-0000-000000000000	2cb835e9-3abd-478d-ab69-01ec05f6930d	{"action":"token_revoked","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-07-22 12:58:34.983917+00	
00000000-0000-0000-0000-000000000000	aa406d08-4a32-4aaa-9bf1-7d1a9ead596a	{"action":"token_refreshed","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-07-22 15:33:26.187233+00	
00000000-0000-0000-0000-000000000000	459de8d3-d0e9-42f3-9606-54af61896b98	{"action":"token_revoked","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-07-22 15:33:26.193825+00	
00000000-0000-0000-0000-000000000000	33dcde27-b1ef-49b2-b47d-4e40c4cdc8fa	{"action":"token_refreshed","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-07-23 11:03:09.545626+00	
00000000-0000-0000-0000-000000000000	1c66e0ad-1644-49c3-9281-d52321c08739	{"action":"token_revoked","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-07-23 11:03:09.558438+00	
00000000-0000-0000-0000-000000000000	4f2ea3f6-4e32-4aff-8a35-78a31dae0cec	{"action":"token_refreshed","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-07-23 12:56:01.574244+00	
00000000-0000-0000-0000-000000000000	4fc303c0-55cd-4e38-9dca-95be1d1280fe	{"action":"token_revoked","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-07-23 12:56:01.578957+00	
00000000-0000-0000-0000-000000000000	5136b50b-075f-45a5-8346-bafbe04f7227	{"action":"token_refreshed","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-07-23 17:23:17.679801+00	
00000000-0000-0000-0000-000000000000	57c077ec-e37f-46d7-b5bf-450f045a1a5f	{"action":"token_revoked","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-07-23 17:23:17.692057+00	
00000000-0000-0000-0000-000000000000	bbcbbc85-6a16-4243-aa14-5360324d5b6a	{"action":"token_refreshed","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-07-23 17:54:20.492087+00	
00000000-0000-0000-0000-000000000000	025021d1-4212-4cd1-8590-f934e92fbc6a	{"action":"token_revoked","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-07-23 17:54:20.503586+00	
00000000-0000-0000-0000-000000000000	16f12b5d-6de8-4c95-94ce-026369532b9c	{"action":"token_refreshed","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-07-23 22:34:44.136211+00	
00000000-0000-0000-0000-000000000000	e4af2ab0-6269-4921-8ce6-1e62cf81978f	{"action":"token_revoked","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-07-23 22:34:44.147018+00	
00000000-0000-0000-0000-000000000000	aabaf658-0076-47d6-b1f5-23b27f0a2280	{"action":"token_refreshed","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-07-23 23:52:23.706202+00	
00000000-0000-0000-0000-000000000000	9006f863-2ba1-4d59-a0c5-006ebe1676fc	{"action":"token_revoked","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-07-23 23:52:23.711946+00	
00000000-0000-0000-0000-000000000000	97cf8fa8-a675-4a5f-aac2-4126ccaf5b5d	{"action":"token_refreshed","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-07-24 11:41:03.108526+00	
00000000-0000-0000-0000-000000000000	9da632e9-67d8-4461-b20f-e623818a55f5	{"action":"token_revoked","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-07-24 11:41:03.118276+00	
00000000-0000-0000-0000-000000000000	09d5203a-2311-4330-82ba-52449f330478	{"action":"token_refreshed","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-07-24 12:42:29.256327+00	
00000000-0000-0000-0000-000000000000	5ce6f2b7-d72e-4e30-a4bd-a984288dc0d6	{"action":"token_revoked","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-07-24 12:42:29.261179+00	
00000000-0000-0000-0000-000000000000	4f341fb1-5913-4988-b2fa-39456af187c1	{"action":"token_refreshed","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-07-24 16:48:41.649247+00	
00000000-0000-0000-0000-000000000000	714dbfc6-7fe8-40bb-b6ac-485ef248a609	{"action":"token_revoked","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-07-24 16:48:41.655351+00	
00000000-0000-0000-0000-000000000000	120b5b79-b214-4a3d-8521-3d6ae699fd41	{"action":"token_refreshed","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-07-25 01:09:50.870411+00	
00000000-0000-0000-0000-000000000000	bb25133d-b928-402b-9f6c-cfadfa4bd132	{"action":"token_revoked","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-07-25 01:09:50.879156+00	
00000000-0000-0000-0000-000000000000	70cd1350-50d8-4763-87a5-04cf582cdc5b	{"action":"token_refreshed","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-07-25 10:38:14.031062+00	
00000000-0000-0000-0000-000000000000	ac0ad6ea-01d0-4a4c-ab55-1e85e24ed7c4	{"action":"token_revoked","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-07-25 10:38:14.044318+00	
00000000-0000-0000-0000-000000000000	50182444-4d0b-46d6-89e4-60c2cf0d2dd7	{"action":"token_refreshed","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-07-25 12:10:05.763336+00	
00000000-0000-0000-0000-000000000000	fe138387-6369-4ba7-a0f9-f2df61733233	{"action":"token_revoked","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-07-25 12:10:05.769195+00	
00000000-0000-0000-0000-000000000000	c599cfb1-3f8c-4fc7-afa6-2170939c76ba	{"action":"token_refreshed","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-07-25 15:19:15.413976+00	
00000000-0000-0000-0000-000000000000	8e7e94a5-0207-4e2c-9902-b7c6d4514e56	{"action":"token_revoked","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-07-25 15:19:15.425523+00	
00000000-0000-0000-0000-000000000000	25cd949e-ec17-48d4-9f20-efabe6912bde	{"action":"token_refreshed","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-07-25 15:51:37.804334+00	
00000000-0000-0000-0000-000000000000	503e1db7-20fb-4ad5-a131-6e56ffa05a7c	{"action":"token_revoked","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-07-25 15:51:37.817145+00	
00000000-0000-0000-0000-000000000000	2e28f9cb-e7c4-4bfe-96af-5d259759d70e	{"action":"token_refreshed","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-07-28 14:36:59.416612+00	
00000000-0000-0000-0000-000000000000	18950322-a89b-4afe-b28e-2d6e33f1795c	{"action":"token_revoked","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-07-28 14:36:59.432442+00	
00000000-0000-0000-0000-000000000000	e1b1da8b-9904-410f-af00-a0d46d751b2d	{"action":"token_refreshed","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-07-28 19:06:40.832524+00	
00000000-0000-0000-0000-000000000000	4c0586a2-7c27-4b3a-a349-5279b4c3d6df	{"action":"token_revoked","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-07-28 19:06:40.835821+00	
00000000-0000-0000-0000-000000000000	513400d0-7fed-4b02-bcd5-b7c0e632c0f0	{"action":"token_refreshed","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-07-31 23:34:32.542503+00	
00000000-0000-0000-0000-000000000000	8ce03036-1b35-4051-bac9-a2f6df5533dd	{"action":"token_revoked","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-07-31 23:34:32.555765+00	
00000000-0000-0000-0000-000000000000	3148962f-c591-48bd-a5f6-4c893e38877b	{"action":"token_refreshed","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-08-01 02:05:30.661814+00	
00000000-0000-0000-0000-000000000000	f64096cc-1608-4730-83c1-f7eddc537eb8	{"action":"token_revoked","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-08-01 02:05:30.664616+00	
00000000-0000-0000-0000-000000000000	7bc5826b-2c33-431c-89eb-e99a4a6080ce	{"action":"token_refreshed","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-08-01 10:36:40.025591+00	
00000000-0000-0000-0000-000000000000	6829bca5-a042-40d2-82de-1459ce8f6bb9	{"action":"token_revoked","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-08-01 10:36:40.041136+00	
00000000-0000-0000-0000-000000000000	005aa68d-72f5-4cd8-bde7-0a48b940ff9f	{"action":"token_refreshed","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-08-07 19:21:53.289796+00	
00000000-0000-0000-0000-000000000000	d0c933db-6694-4a93-9955-ef8a179d4570	{"action":"token_revoked","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-08-07 19:21:53.314238+00	
00000000-0000-0000-0000-000000000000	6d996c1a-a828-4266-abd0-c2219fd8a911	{"action":"token_refreshed","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-08-07 20:28:12.819847+00	
00000000-0000-0000-0000-000000000000	cd322bd1-94ab-448a-a29f-ac5bdb6b09d1	{"action":"token_revoked","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-08-07 20:28:12.82294+00	
00000000-0000-0000-0000-000000000000	41e34465-af41-444a-9a60-c76c38a70732	{"action":"token_refreshed","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-08-07 21:26:42.448514+00	
00000000-0000-0000-0000-000000000000	b3da2226-5a00-417d-b952-45dd9cdf4fca	{"action":"token_revoked","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-08-07 21:26:42.452039+00	
00000000-0000-0000-0000-000000000000	66ace2fd-cb40-49c9-b5ac-c3a3dc6a4332	{"action":"token_refreshed","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-08-07 22:25:09.191685+00	
00000000-0000-0000-0000-000000000000	247a9bfd-08d3-472b-8ebc-142dbfc1fc34	{"action":"token_revoked","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-08-07 22:25:09.194145+00	
00000000-0000-0000-0000-000000000000	079e93b3-0547-4595-b8a1-ef8926aeb47a	{"action":"token_refreshed","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-08-08 12:09:34.855868+00	
00000000-0000-0000-0000-000000000000	623005f2-ef46-4ecc-b226-c4cfe7497d50	{"action":"token_revoked","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-08-08 12:09:34.869972+00	
00000000-0000-0000-0000-000000000000	421c697a-c2be-49d5-9518-f467d61e7177	{"action":"token_refreshed","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-08-08 13:50:08.26957+00	
00000000-0000-0000-0000-000000000000	2075080e-be60-45a8-bf7e-b69178f2642f	{"action":"token_revoked","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-08-08 13:50:08.279207+00	
00000000-0000-0000-0000-000000000000	6d858e4c-ca06-4ec2-965e-6014c517b140	{"action":"token_refreshed","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-08-08 16:12:09.766946+00	
00000000-0000-0000-0000-000000000000	c1dd14be-b0f9-408b-b698-6f936dd2d9c9	{"action":"token_revoked","actor_id":"82c2bbb6-05e1-4e13-aa53-04b49978d9c4","actor_username":"chubache85@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-08-08 16:12:09.770242+00	
\.


--
-- Data for Name: flow_state; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.flow_state (id, user_id, auth_code, code_challenge_method, code_challenge, provider_type, provider_access_token, provider_refresh_token, created_at, updated_at, authentication_method, auth_code_issued_at) FROM stdin;
\.


--
-- Data for Name: identities; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.identities (provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at, id) FROM stdin;
82c2bbb6-05e1-4e13-aa53-04b49978d9c4	82c2bbb6-05e1-4e13-aa53-04b49978d9c4	{"sub": "82c2bbb6-05e1-4e13-aa53-04b49978d9c4", "email": "chubache85@gmail.com", "email_verified": true, "phone_verified": false}	email	2025-06-18 11:50:55.437227+00	2025-06-18 11:50:55.437279+00	2025-06-18 11:50:55.437279+00	9d5f5516-bfa4-4b13-ac5c-b959e00b2ce7
1f376499-fc49-4444-970c-21b7f9039851	1f376499-fc49-4444-970c-21b7f9039851	{"sub": "1f376499-fc49-4444-970c-21b7f9039851", "email": "dhubach1@gmail.com", "last_name": "Hubacher", "first_name": "David", "email_verified": true, "phone_verified": false}	email	2025-06-28 12:09:56.156539+00	2025-06-28 12:09:56.156592+00	2025-06-28 12:09:56.156592+00	c52af910-174b-4db9-8613-b64f77f227ce
\.


--
-- Data for Name: instances; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.instances (id, uuid, raw_base_config, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: mfa_amr_claims; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.mfa_amr_claims (session_id, created_at, updated_at, authentication_method, id) FROM stdin;
a1ec2c9d-4ffd-48ba-9cc2-8c542ee78aa7	2025-06-27 15:59:12.125012+00	2025-06-27 15:59:12.125012+00	password	7fb17e1d-d887-46b2-a86e-42d7f5692e92
02c1f6c3-9252-4e65-a90f-dfb556e3c087	2025-06-27 19:27:19.367729+00	2025-06-27 19:27:19.367729+00	password	42e8a02e-d513-4347-823c-eb5d3609c76f
33b76812-4a60-4d7e-bc88-cf94d5816cf0	2025-06-28 12:11:11.868024+00	2025-06-28 12:11:11.868024+00	otp	e9540f58-7ff6-4cca-a09a-4e58df285113
eab4786f-ccd7-4489-b822-c81be3dbc3f0	2025-06-28 17:37:47.375179+00	2025-06-28 17:37:47.375179+00	password	b24cec16-d8c8-454a-a207-a4b80788fac3
995bce13-31c4-46a0-8863-78dbd39d1914	2025-07-22 10:53:47.046579+00	2025-07-22 10:53:47.046579+00	password	dd938bfb-5a29-42c2-a61e-ff27ab6653f3
04d53c0e-9f34-451f-8ddf-0b31ca5aaeed	2025-07-22 10:54:06.035247+00	2025-07-22 10:54:06.035247+00	password	854be283-302d-455e-8975-81d1a07466cb
\.


--
-- Data for Name: mfa_challenges; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.mfa_challenges (id, factor_id, created_at, verified_at, ip_address, otp_code, web_authn_session_data) FROM stdin;
\.


--
-- Data for Name: mfa_factors; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.mfa_factors (id, user_id, friendly_name, factor_type, status, created_at, updated_at, secret, phone, last_challenged_at, web_authn_credential, web_authn_aaguid) FROM stdin;
\.


--
-- Data for Name: one_time_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.one_time_tokens (id, user_id, token_type, token_hash, relates_to, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: refresh_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.refresh_tokens (instance_id, id, token, user_id, revoked, created_at, updated_at, parent, session_id) FROM stdin;
00000000-0000-0000-0000-000000000000	99	bkpd6yudoema	82c2bbb6-05e1-4e13-aa53-04b49978d9c4	t	2025-07-03 15:29:00.743592+00	2025-07-03 16:28:36.954833+00	rogdxdkj6blm	02c1f6c3-9252-4e65-a90f-dfb556e3c087
00000000-0000-0000-0000-000000000000	100	s5easvjhte7y	82c2bbb6-05e1-4e13-aa53-04b49978d9c4	t	2025-07-03 16:28:36.955552+00	2025-07-03 17:26:49.852309+00	bkpd6yudoema	02c1f6c3-9252-4e65-a90f-dfb556e3c087
00000000-0000-0000-0000-000000000000	101	vfivylc4egse	82c2bbb6-05e1-4e13-aa53-04b49978d9c4	t	2025-07-03 17:26:49.853959+00	2025-07-03 18:24:55.961747+00	s5easvjhte7y	02c1f6c3-9252-4e65-a90f-dfb556e3c087
00000000-0000-0000-0000-000000000000	102	r5n5c2r65gvb	82c2bbb6-05e1-4e13-aa53-04b49978d9c4	t	2025-07-03 18:24:55.963704+00	2025-07-03 19:42:48.547262+00	vfivylc4egse	02c1f6c3-9252-4e65-a90f-dfb556e3c087
00000000-0000-0000-0000-000000000000	88	t6knceh56o62	82c2bbb6-05e1-4e13-aa53-04b49978d9c4	t	2025-07-01 12:56:53.719473+00	2025-07-04 10:59:38.726762+00	ltzv6k7fv2k3	eab4786f-ccd7-4489-b822-c81be3dbc3f0
00000000-0000-0000-0000-000000000000	104	6mnbdymq5xns	82c2bbb6-05e1-4e13-aa53-04b49978d9c4	t	2025-07-04 10:59:38.734402+00	2025-07-04 23:12:00.99172+00	t6knceh56o62	eab4786f-ccd7-4489-b822-c81be3dbc3f0
00000000-0000-0000-0000-000000000000	103	br4ey3wl2ztf	82c2bbb6-05e1-4e13-aa53-04b49978d9c4	t	2025-07-03 19:42:48.548588+00	2025-07-05 13:01:09.880608+00	r5n5c2r65gvb	02c1f6c3-9252-4e65-a90f-dfb556e3c087
00000000-0000-0000-0000-000000000000	106	aa2r6k6xhpi3	82c2bbb6-05e1-4e13-aa53-04b49978d9c4	t	2025-07-05 13:01:09.890666+00	2025-07-06 12:08:28.876458+00	br4ey3wl2ztf	02c1f6c3-9252-4e65-a90f-dfb556e3c087
00000000-0000-0000-0000-000000000000	107	ysd7kojnimlr	82c2bbb6-05e1-4e13-aa53-04b49978d9c4	t	2025-07-06 12:08:28.881942+00	2025-07-06 13:06:38.461617+00	aa2r6k6xhpi3	02c1f6c3-9252-4e65-a90f-dfb556e3c087
00000000-0000-0000-0000-000000000000	105	k4p6woep6dt2	82c2bbb6-05e1-4e13-aa53-04b49978d9c4	t	2025-07-04 23:12:00.999506+00	2025-07-06 14:18:50.351737+00	6mnbdymq5xns	eab4786f-ccd7-4489-b822-c81be3dbc3f0
00000000-0000-0000-0000-000000000000	108	o5z3mblwl7gj	82c2bbb6-05e1-4e13-aa53-04b49978d9c4	t	2025-07-06 13:06:38.463973+00	2025-07-06 14:31:42.117959+00	ysd7kojnimlr	02c1f6c3-9252-4e65-a90f-dfb556e3c087
00000000-0000-0000-0000-000000000000	109	lku2mfwv7k6o	82c2bbb6-05e1-4e13-aa53-04b49978d9c4	t	2025-07-06 14:18:50.357075+00	2025-07-07 01:44:38.632199+00	k4p6woep6dt2	eab4786f-ccd7-4489-b822-c81be3dbc3f0
00000000-0000-0000-0000-000000000000	110	5x36vevgsu7i	82c2bbb6-05e1-4e13-aa53-04b49978d9c4	t	2025-07-06 14:31:42.122228+00	2025-07-07 11:52:47.181575+00	o5z3mblwl7gj	02c1f6c3-9252-4e65-a90f-dfb556e3c087
00000000-0000-0000-0000-000000000000	69	ftgx2v3rvrz7	82c2bbb6-05e1-4e13-aa53-04b49978d9c4	f	2025-06-27 15:59:12.120298+00	2025-06-27 15:59:12.120298+00	\N	a1ec2c9d-4ffd-48ba-9cc2-8c542ee78aa7
00000000-0000-0000-0000-000000000000	70	ofmalaetekq4	82c2bbb6-05e1-4e13-aa53-04b49978d9c4	t	2025-06-27 19:27:19.346581+00	2025-06-27 22:17:02.24022+00	\N	02c1f6c3-9252-4e65-a90f-dfb556e3c087
00000000-0000-0000-0000-000000000000	112	6it53e2mgl23	82c2bbb6-05e1-4e13-aa53-04b49978d9c4	t	2025-07-07 11:52:47.195729+00	2025-07-07 12:51:38.530204+00	5x36vevgsu7i	02c1f6c3-9252-4e65-a90f-dfb556e3c087
00000000-0000-0000-0000-000000000000	71	3sgc5zofee63	82c2bbb6-05e1-4e13-aa53-04b49978d9c4	t	2025-06-27 22:17:02.246388+00	2025-06-28 11:04:34.998557+00	ofmalaetekq4	02c1f6c3-9252-4e65-a90f-dfb556e3c087
00000000-0000-0000-0000-000000000000	73	tfj4ulp3jvgd	1f376499-fc49-4444-970c-21b7f9039851	f	2025-06-28 12:11:11.860711+00	2025-06-28 12:11:11.860711+00	\N	33b76812-4a60-4d7e-bc88-cf94d5816cf0
00000000-0000-0000-0000-000000000000	72	dzabky2un7ci	82c2bbb6-05e1-4e13-aa53-04b49978d9c4	t	2025-06-28 11:04:35.014589+00	2025-06-28 12:56:08.555386+00	3sgc5zofee63	02c1f6c3-9252-4e65-a90f-dfb556e3c087
00000000-0000-0000-0000-000000000000	113	xtqbyp3xn7wy	82c2bbb6-05e1-4e13-aa53-04b49978d9c4	t	2025-07-07 12:51:38.534292+00	2025-07-07 13:49:46.752674+00	6it53e2mgl23	02c1f6c3-9252-4e65-a90f-dfb556e3c087
00000000-0000-0000-0000-000000000000	74	zlccbb2kxqkk	82c2bbb6-05e1-4e13-aa53-04b49978d9c4	t	2025-06-28 12:56:08.557453+00	2025-06-28 14:26:35.530229+00	dzabky2un7ci	02c1f6c3-9252-4e65-a90f-dfb556e3c087
00000000-0000-0000-0000-000000000000	114	rwknbitsnrzu	82c2bbb6-05e1-4e13-aa53-04b49978d9c4	t	2025-07-07 13:49:46.753439+00	2025-07-07 15:15:15.758958+00	xtqbyp3xn7wy	02c1f6c3-9252-4e65-a90f-dfb556e3c087
00000000-0000-0000-0000-000000000000	76	qcgpi3d37qwp	82c2bbb6-05e1-4e13-aa53-04b49978d9c4	t	2025-06-28 17:37:47.351935+00	2025-06-28 19:32:36.070536+00	\N	eab4786f-ccd7-4489-b822-c81be3dbc3f0
00000000-0000-0000-0000-000000000000	75	tdknqiutrb5p	82c2bbb6-05e1-4e13-aa53-04b49978d9c4	t	2025-06-28 14:26:35.538665+00	2025-06-29 22:28:20.437237+00	zlccbb2kxqkk	02c1f6c3-9252-4e65-a90f-dfb556e3c087
00000000-0000-0000-0000-000000000000	115	kjtthbnx6lrc	82c2bbb6-05e1-4e13-aa53-04b49978d9c4	t	2025-07-07 15:15:15.759622+00	2025-07-07 16:13:18.42226+00	rwknbitsnrzu	02c1f6c3-9252-4e65-a90f-dfb556e3c087
00000000-0000-0000-0000-000000000000	77	dkqfr6hi5ikg	82c2bbb6-05e1-4e13-aa53-04b49978d9c4	t	2025-06-28 19:32:36.076733+00	2025-06-30 01:43:59.16156+00	qcgpi3d37qwp	eab4786f-ccd7-4489-b822-c81be3dbc3f0
00000000-0000-0000-0000-000000000000	78	qjaiki7zfboy	82c2bbb6-05e1-4e13-aa53-04b49978d9c4	t	2025-06-29 22:28:20.446705+00	2025-06-30 12:32:36.497751+00	tdknqiutrb5p	02c1f6c3-9252-4e65-a90f-dfb556e3c087
00000000-0000-0000-0000-000000000000	116	ujm6rk56ijes	82c2bbb6-05e1-4e13-aa53-04b49978d9c4	t	2025-07-07 16:13:18.424452+00	2025-07-08 01:13:41.714398+00	kjtthbnx6lrc	02c1f6c3-9252-4e65-a90f-dfb556e3c087
00000000-0000-0000-0000-000000000000	80	7x47kieulyr7	82c2bbb6-05e1-4e13-aa53-04b49978d9c4	t	2025-06-30 12:32:36.502615+00	2025-06-30 15:40:34.589151+00	qjaiki7zfboy	02c1f6c3-9252-4e65-a90f-dfb556e3c087
00000000-0000-0000-0000-000000000000	81	c23as677hcke	82c2bbb6-05e1-4e13-aa53-04b49978d9c4	t	2025-06-30 15:40:34.591202+00	2025-06-30 16:52:31.916144+00	7x47kieulyr7	02c1f6c3-9252-4e65-a90f-dfb556e3c087
00000000-0000-0000-0000-000000000000	117	yxl3gv5yzlv7	82c2bbb6-05e1-4e13-aa53-04b49978d9c4	t	2025-07-08 01:13:41.726328+00	2025-07-08 19:47:05.303207+00	ujm6rk56ijes	02c1f6c3-9252-4e65-a90f-dfb556e3c087
00000000-0000-0000-0000-000000000000	82	yyjkgdxddslj	82c2bbb6-05e1-4e13-aa53-04b49978d9c4	t	2025-06-30 16:52:31.918125+00	2025-06-30 18:45:57.539123+00	c23as677hcke	02c1f6c3-9252-4e65-a90f-dfb556e3c087
00000000-0000-0000-0000-000000000000	83	fgmot32jjgfc	82c2bbb6-05e1-4e13-aa53-04b49978d9c4	t	2025-06-30 18:45:57.541767+00	2025-06-30 19:44:27.991664+00	yyjkgdxddslj	02c1f6c3-9252-4e65-a90f-dfb556e3c087
00000000-0000-0000-0000-000000000000	118	lv4fmcqghxoj	82c2bbb6-05e1-4e13-aa53-04b49978d9c4	t	2025-07-08 19:47:05.312691+00	2025-07-08 20:45:11.473909+00	yxl3gv5yzlv7	02c1f6c3-9252-4e65-a90f-dfb556e3c087
00000000-0000-0000-0000-000000000000	84	neynxn4l5gzt	82c2bbb6-05e1-4e13-aa53-04b49978d9c4	t	2025-06-30 19:44:27.993301+00	2025-07-01 10:14:57.439252+00	fgmot32jjgfc	02c1f6c3-9252-4e65-a90f-dfb556e3c087
00000000-0000-0000-0000-000000000000	111	e32ihintfne3	82c2bbb6-05e1-4e13-aa53-04b49978d9c4	t	2025-07-07 01:44:38.638473+00	2025-07-09 23:41:16.182836+00	lku2mfwv7k6o	eab4786f-ccd7-4489-b822-c81be3dbc3f0
00000000-0000-0000-0000-000000000000	79	2al6bwli4ytf	82c2bbb6-05e1-4e13-aa53-04b49978d9c4	t	2025-06-30 01:43:59.165014+00	2025-07-01 11:37:39.960135+00	dkqfr6hi5ikg	eab4786f-ccd7-4489-b822-c81be3dbc3f0
00000000-0000-0000-0000-000000000000	85	rufschpxgpot	82c2bbb6-05e1-4e13-aa53-04b49978d9c4	t	2025-07-01 10:14:57.452815+00	2025-07-01 12:04:58.652782+00	neynxn4l5gzt	02c1f6c3-9252-4e65-a90f-dfb556e3c087
00000000-0000-0000-0000-000000000000	86	ltzv6k7fv2k3	82c2bbb6-05e1-4e13-aa53-04b49978d9c4	t	2025-07-01 11:37:39.961919+00	2025-07-01 12:56:53.713648+00	2al6bwli4ytf	eab4786f-ccd7-4489-b822-c81be3dbc3f0
00000000-0000-0000-0000-000000000000	87	hmkn7rxcqoxe	82c2bbb6-05e1-4e13-aa53-04b49978d9c4	t	2025-07-01 12:04:58.653938+00	2025-07-01 13:04:18.992857+00	rufschpxgpot	02c1f6c3-9252-4e65-a90f-dfb556e3c087
00000000-0000-0000-0000-000000000000	89	jzxifi6uca73	82c2bbb6-05e1-4e13-aa53-04b49978d9c4	t	2025-07-01 13:04:18.995494+00	2025-07-01 14:07:37.396135+00	hmkn7rxcqoxe	02c1f6c3-9252-4e65-a90f-dfb556e3c087
00000000-0000-0000-0000-000000000000	90	pimylbkpghva	82c2bbb6-05e1-4e13-aa53-04b49978d9c4	t	2025-07-01 14:07:37.398455+00	2025-07-02 10:31:42.514016+00	jzxifi6uca73	02c1f6c3-9252-4e65-a90f-dfb556e3c087
00000000-0000-0000-0000-000000000000	91	qgr7rtlcvmjk	82c2bbb6-05e1-4e13-aa53-04b49978d9c4	t	2025-07-02 10:31:42.521759+00	2025-07-02 16:55:19.475448+00	pimylbkpghva	02c1f6c3-9252-4e65-a90f-dfb556e3c087
00000000-0000-0000-0000-000000000000	92	njvp5x7dv2s6	82c2bbb6-05e1-4e13-aa53-04b49978d9c4	t	2025-07-02 16:55:19.478094+00	2025-07-02 19:31:21.635147+00	qgr7rtlcvmjk	02c1f6c3-9252-4e65-a90f-dfb556e3c087
00000000-0000-0000-0000-000000000000	93	cy6gq7p7eb2f	82c2bbb6-05e1-4e13-aa53-04b49978d9c4	t	2025-07-02 19:31:21.646365+00	2025-07-03 10:27:24.113278+00	njvp5x7dv2s6	02c1f6c3-9252-4e65-a90f-dfb556e3c087
00000000-0000-0000-0000-000000000000	94	63tntuxrdou7	82c2bbb6-05e1-4e13-aa53-04b49978d9c4	t	2025-07-03 10:27:24.128012+00	2025-07-03 11:36:00.612258+00	cy6gq7p7eb2f	02c1f6c3-9252-4e65-a90f-dfb556e3c087
00000000-0000-0000-0000-000000000000	95	ukrfiencbnbk	82c2bbb6-05e1-4e13-aa53-04b49978d9c4	t	2025-07-03 11:36:00.616995+00	2025-07-03 12:34:04.466072+00	63tntuxrdou7	02c1f6c3-9252-4e65-a90f-dfb556e3c087
00000000-0000-0000-0000-000000000000	96	laaesi74jewf	82c2bbb6-05e1-4e13-aa53-04b49978d9c4	t	2025-07-03 12:34:04.466856+00	2025-07-03 13:32:34.617098+00	ukrfiencbnbk	02c1f6c3-9252-4e65-a90f-dfb556e3c087
00000000-0000-0000-0000-000000000000	97	lz74cwb325vu	82c2bbb6-05e1-4e13-aa53-04b49978d9c4	t	2025-07-03 13:32:34.618401+00	2025-07-03 14:30:44.547701+00	laaesi74jewf	02c1f6c3-9252-4e65-a90f-dfb556e3c087
00000000-0000-0000-0000-000000000000	98	rogdxdkj6blm	82c2bbb6-05e1-4e13-aa53-04b49978d9c4	t	2025-07-03 14:30:44.550805+00	2025-07-03 15:29:00.742351+00	lz74cwb325vu	02c1f6c3-9252-4e65-a90f-dfb556e3c087
00000000-0000-0000-0000-000000000000	156	5p4qum4y3nx2	82c2bbb6-05e1-4e13-aa53-04b49978d9c4	t	2025-07-14 10:17:29.743707+00	2025-07-17 11:33:21.047585+00	px7oyal6p45y	eab4786f-ccd7-4489-b822-c81be3dbc3f0
00000000-0000-0000-0000-000000000000	119	au2nakjakd74	82c2bbb6-05e1-4e13-aa53-04b49978d9c4	t	2025-07-08 20:45:11.478533+00	2025-07-09 10:06:12.786023+00	lv4fmcqghxoj	02c1f6c3-9252-4e65-a90f-dfb556e3c087
00000000-0000-0000-0000-000000000000	168	mr7eutu2jc3z	82c2bbb6-05e1-4e13-aa53-04b49978d9c4	t	2025-07-16 20:27:00.579642+00	2025-07-17 11:49:34.487547+00	h32kuozs65h3	02c1f6c3-9252-4e65-a90f-dfb556e3c087
00000000-0000-0000-0000-000000000000	120	an3s3njzm6ah	82c2bbb6-05e1-4e13-aa53-04b49978d9c4	t	2025-07-09 10:06:12.793844+00	2025-07-09 11:13:23.385344+00	au2nakjakd74	02c1f6c3-9252-4e65-a90f-dfb556e3c087
00000000-0000-0000-0000-000000000000	121	nqc6mdahad7j	82c2bbb6-05e1-4e13-aa53-04b49978d9c4	t	2025-07-09 11:13:23.389703+00	2025-07-09 12:40:33.728016+00	an3s3njzm6ah	02c1f6c3-9252-4e65-a90f-dfb556e3c087
00000000-0000-0000-0000-000000000000	122	ixo6muvkihns	82c2bbb6-05e1-4e13-aa53-04b49978d9c4	t	2025-07-09 12:40:33.73102+00	2025-07-09 13:38:36.756697+00	nqc6mdahad7j	02c1f6c3-9252-4e65-a90f-dfb556e3c087
00000000-0000-0000-0000-000000000000	123	b6yuyj3epgyb	82c2bbb6-05e1-4e13-aa53-04b49978d9c4	t	2025-07-09 13:38:36.768323+00	2025-07-09 16:26:07.697754+00	ixo6muvkihns	02c1f6c3-9252-4e65-a90f-dfb556e3c087
00000000-0000-0000-0000-000000000000	124	hgkedrkw3ayt	82c2bbb6-05e1-4e13-aa53-04b49978d9c4	t	2025-07-09 16:26:07.700446+00	2025-07-09 17:24:13.387203+00	b6yuyj3epgyb	02c1f6c3-9252-4e65-a90f-dfb556e3c087
00000000-0000-0000-0000-000000000000	125	oxatazelbe4q	82c2bbb6-05e1-4e13-aa53-04b49978d9c4	t	2025-07-09 17:24:13.392127+00	2025-07-09 20:56:53.756656+00	hgkedrkw3ayt	02c1f6c3-9252-4e65-a90f-dfb556e3c087
00000000-0000-0000-0000-000000000000	126	x7fefb7gfcle	82c2bbb6-05e1-4e13-aa53-04b49978d9c4	t	2025-07-09 20:56:53.761357+00	2025-07-10 00:35:25.37798+00	oxatazelbe4q	02c1f6c3-9252-4e65-a90f-dfb556e3c087
00000000-0000-0000-0000-000000000000	128	hrglaig3dtj3	82c2bbb6-05e1-4e13-aa53-04b49978d9c4	t	2025-07-10 00:35:25.381668+00	2025-07-10 10:14:06.526459+00	x7fefb7gfcle	02c1f6c3-9252-4e65-a90f-dfb556e3c087
00000000-0000-0000-0000-000000000000	129	mcp2uf32aln6	82c2bbb6-05e1-4e13-aa53-04b49978d9c4	t	2025-07-10 10:14:06.541+00	2025-07-10 11:44:58.099846+00	hrglaig3dtj3	02c1f6c3-9252-4e65-a90f-dfb556e3c087
00000000-0000-0000-0000-000000000000	130	k3srtda4zvoe	82c2bbb6-05e1-4e13-aa53-04b49978d9c4	t	2025-07-10 11:44:58.104319+00	2025-07-10 13:02:43.410593+00	mcp2uf32aln6	02c1f6c3-9252-4e65-a90f-dfb556e3c087
00000000-0000-0000-0000-000000000000	131	yfvozjq2sp7x	82c2bbb6-05e1-4e13-aa53-04b49978d9c4	t	2025-07-10 13:02:43.416472+00	2025-07-10 14:15:50.886449+00	k3srtda4zvoe	02c1f6c3-9252-4e65-a90f-dfb556e3c087
00000000-0000-0000-0000-000000000000	132	hy2f4ptjht52	82c2bbb6-05e1-4e13-aa53-04b49978d9c4	t	2025-07-10 14:15:50.890983+00	2025-07-10 15:14:00.846817+00	yfvozjq2sp7x	02c1f6c3-9252-4e65-a90f-dfb556e3c087
00000000-0000-0000-0000-000000000000	133	7xb5x545hm2k	82c2bbb6-05e1-4e13-aa53-04b49978d9c4	t	2025-07-10 15:14:00.850549+00	2025-07-10 16:28:02.580882+00	hy2f4ptjht52	02c1f6c3-9252-4e65-a90f-dfb556e3c087
00000000-0000-0000-0000-000000000000	134	babase6hrtev	82c2bbb6-05e1-4e13-aa53-04b49978d9c4	t	2025-07-10 16:28:02.586092+00	2025-07-10 18:04:44.335919+00	7xb5x545hm2k	02c1f6c3-9252-4e65-a90f-dfb556e3c087
00000000-0000-0000-0000-000000000000	135	kg4s5ypb57qz	82c2bbb6-05e1-4e13-aa53-04b49978d9c4	t	2025-07-10 18:04:44.340229+00	2025-07-10 21:47:03.796764+00	babase6hrtev	02c1f6c3-9252-4e65-a90f-dfb556e3c087
00000000-0000-0000-0000-000000000000	136	fi6liuoob5np	82c2bbb6-05e1-4e13-aa53-04b49978d9c4	t	2025-07-10 21:47:03.811642+00	2025-07-10 22:45:28.49492+00	kg4s5ypb57qz	02c1f6c3-9252-4e65-a90f-dfb556e3c087
00000000-0000-0000-0000-000000000000	137	quwjavyqnb34	82c2bbb6-05e1-4e13-aa53-04b49978d9c4	t	2025-07-10 22:45:28.497883+00	2025-07-10 23:43:58.627871+00	fi6liuoob5np	02c1f6c3-9252-4e65-a90f-dfb556e3c087
00000000-0000-0000-0000-000000000000	138	exfmg5yytqb4	82c2bbb6-05e1-4e13-aa53-04b49978d9c4	t	2025-07-10 23:43:58.632846+00	2025-07-11 00:42:28.706131+00	quwjavyqnb34	02c1f6c3-9252-4e65-a90f-dfb556e3c087
00000000-0000-0000-0000-000000000000	139	tfk6hljjjquf	82c2bbb6-05e1-4e13-aa53-04b49978d9c4	t	2025-07-11 00:42:28.711249+00	2025-07-11 01:40:58.837327+00	exfmg5yytqb4	02c1f6c3-9252-4e65-a90f-dfb556e3c087
00000000-0000-0000-0000-000000000000	127	3dtlqtahonzl	82c2bbb6-05e1-4e13-aa53-04b49978d9c4	t	2025-07-09 23:41:16.190659+00	2025-07-11 02:17:50.759802+00	e32ihintfne3	eab4786f-ccd7-4489-b822-c81be3dbc3f0
00000000-0000-0000-0000-000000000000	140	kwbql3rp4my2	82c2bbb6-05e1-4e13-aa53-04b49978d9c4	t	2025-07-11 01:40:58.839887+00	2025-07-11 02:39:28.946049+00	tfk6hljjjquf	02c1f6c3-9252-4e65-a90f-dfb556e3c087
00000000-0000-0000-0000-000000000000	142	3tp7x3r4fvyg	82c2bbb6-05e1-4e13-aa53-04b49978d9c4	t	2025-07-11 02:39:28.947656+00	2025-07-11 03:37:59.048789+00	kwbql3rp4my2	02c1f6c3-9252-4e65-a90f-dfb556e3c087
00000000-0000-0000-0000-000000000000	143	gtgfrqeptevd	82c2bbb6-05e1-4e13-aa53-04b49978d9c4	t	2025-07-11 03:37:59.052575+00	2025-07-11 04:36:29.470648+00	3tp7x3r4fvyg	02c1f6c3-9252-4e65-a90f-dfb556e3c087
00000000-0000-0000-0000-000000000000	144	nrmqd24ssaxk	82c2bbb6-05e1-4e13-aa53-04b49978d9c4	t	2025-07-11 04:36:29.484131+00	2025-07-11 05:34:59.425773+00	gtgfrqeptevd	02c1f6c3-9252-4e65-a90f-dfb556e3c087
00000000-0000-0000-0000-000000000000	145	k5wgz5w7c5p5	82c2bbb6-05e1-4e13-aa53-04b49978d9c4	t	2025-07-11 05:34:59.432276+00	2025-07-11 06:33:29.35583+00	nrmqd24ssaxk	02c1f6c3-9252-4e65-a90f-dfb556e3c087
00000000-0000-0000-0000-000000000000	146	atd574upg44a	82c2bbb6-05e1-4e13-aa53-04b49978d9c4	t	2025-07-11 06:33:29.35997+00	2025-07-11 07:31:59.547151+00	k5wgz5w7c5p5	02c1f6c3-9252-4e65-a90f-dfb556e3c087
00000000-0000-0000-0000-000000000000	147	bflx3z2kxa4g	82c2bbb6-05e1-4e13-aa53-04b49978d9c4	t	2025-07-11 07:31:59.5525+00	2025-07-11 08:30:29.58057+00	atd574upg44a	02c1f6c3-9252-4e65-a90f-dfb556e3c087
00000000-0000-0000-0000-000000000000	148	easzjif73oit	82c2bbb6-05e1-4e13-aa53-04b49978d9c4	t	2025-07-11 08:30:29.583765+00	2025-07-11 09:28:59.727338+00	bflx3z2kxa4g	02c1f6c3-9252-4e65-a90f-dfb556e3c087
00000000-0000-0000-0000-000000000000	149	5tkl7u5bmdsw	82c2bbb6-05e1-4e13-aa53-04b49978d9c4	t	2025-07-11 09:28:59.731932+00	2025-07-11 10:34:29.435915+00	easzjif73oit	02c1f6c3-9252-4e65-a90f-dfb556e3c087
00000000-0000-0000-0000-000000000000	150	2wssuuves74b	82c2bbb6-05e1-4e13-aa53-04b49978d9c4	t	2025-07-11 10:34:29.441536+00	2025-07-11 13:14:49.276542+00	5tkl7u5bmdsw	02c1f6c3-9252-4e65-a90f-dfb556e3c087
00000000-0000-0000-0000-000000000000	151	6yijbf5k3aq6	82c2bbb6-05e1-4e13-aa53-04b49978d9c4	t	2025-07-11 13:14:49.280084+00	2025-07-11 14:12:49.862269+00	2wssuuves74b	02c1f6c3-9252-4e65-a90f-dfb556e3c087
00000000-0000-0000-0000-000000000000	152	ofuedhcgso6g	82c2bbb6-05e1-4e13-aa53-04b49978d9c4	t	2025-07-11 14:12:49.865638+00	2025-07-11 15:19:54.292102+00	6yijbf5k3aq6	02c1f6c3-9252-4e65-a90f-dfb556e3c087
00000000-0000-0000-0000-000000000000	153	qi2it5uap5vg	82c2bbb6-05e1-4e13-aa53-04b49978d9c4	t	2025-07-11 15:19:54.295695+00	2025-07-11 18:04:54.260826+00	ofuedhcgso6g	02c1f6c3-9252-4e65-a90f-dfb556e3c087
00000000-0000-0000-0000-000000000000	141	kttycbmunfkt	82c2bbb6-05e1-4e13-aa53-04b49978d9c4	t	2025-07-11 02:17:50.761439+00	2025-07-14 02:46:02.469716+00	3dtlqtahonzl	eab4786f-ccd7-4489-b822-c81be3dbc3f0
00000000-0000-0000-0000-000000000000	155	px7oyal6p45y	82c2bbb6-05e1-4e13-aa53-04b49978d9c4	t	2025-07-14 02:46:02.48544+00	2025-07-14 10:17:29.739017+00	kttycbmunfkt	eab4786f-ccd7-4489-b822-c81be3dbc3f0
00000000-0000-0000-0000-000000000000	154	o6q2nfk3e7q2	82c2bbb6-05e1-4e13-aa53-04b49978d9c4	t	2025-07-11 18:04:54.270407+00	2025-07-14 10:41:48.101174+00	qi2it5uap5vg	02c1f6c3-9252-4e65-a90f-dfb556e3c087
00000000-0000-0000-0000-000000000000	157	5jcnabs7q4xu	82c2bbb6-05e1-4e13-aa53-04b49978d9c4	t	2025-07-14 10:41:48.103342+00	2025-07-14 11:40:19.785726+00	o6q2nfk3e7q2	02c1f6c3-9252-4e65-a90f-dfb556e3c087
00000000-0000-0000-0000-000000000000	158	rckjbiklncqq	82c2bbb6-05e1-4e13-aa53-04b49978d9c4	t	2025-07-14 11:40:19.788434+00	2025-07-14 13:48:37.037164+00	5jcnabs7q4xu	02c1f6c3-9252-4e65-a90f-dfb556e3c087
00000000-0000-0000-0000-000000000000	159	v5zqkuxa3bqy	82c2bbb6-05e1-4e13-aa53-04b49978d9c4	t	2025-07-14 13:48:37.041963+00	2025-07-14 15:45:12.605749+00	rckjbiklncqq	02c1f6c3-9252-4e65-a90f-dfb556e3c087
00000000-0000-0000-0000-000000000000	160	k4zo4v6lebri	82c2bbb6-05e1-4e13-aa53-04b49978d9c4	t	2025-07-14 15:45:12.608697+00	2025-07-14 17:44:35.149717+00	v5zqkuxa3bqy	02c1f6c3-9252-4e65-a90f-dfb556e3c087
00000000-0000-0000-0000-000000000000	161	3pybv2kzy2i6	82c2bbb6-05e1-4e13-aa53-04b49978d9c4	t	2025-07-14 17:44:35.154852+00	2025-07-15 13:40:21.070806+00	k4zo4v6lebri	02c1f6c3-9252-4e65-a90f-dfb556e3c087
00000000-0000-0000-0000-000000000000	162	gwr3xwwoy4zf	82c2bbb6-05e1-4e13-aa53-04b49978d9c4	t	2025-07-15 13:40:21.07949+00	2025-07-15 15:11:27.510992+00	3pybv2kzy2i6	02c1f6c3-9252-4e65-a90f-dfb556e3c087
00000000-0000-0000-0000-000000000000	163	t7xnzwkibmqi	82c2bbb6-05e1-4e13-aa53-04b49978d9c4	t	2025-07-15 15:11:27.514356+00	2025-07-15 16:52:01.72931+00	gwr3xwwoy4zf	02c1f6c3-9252-4e65-a90f-dfb556e3c087
00000000-0000-0000-0000-000000000000	164	z5kanxjbpidi	82c2bbb6-05e1-4e13-aa53-04b49978d9c4	t	2025-07-15 16:52:01.731516+00	2025-07-15 19:06:14.641661+00	t7xnzwkibmqi	02c1f6c3-9252-4e65-a90f-dfb556e3c087
00000000-0000-0000-0000-000000000000	165	3h2b32xay7zi	82c2bbb6-05e1-4e13-aa53-04b49978d9c4	t	2025-07-15 19:06:14.646475+00	2025-07-16 12:57:53.181571+00	z5kanxjbpidi	02c1f6c3-9252-4e65-a90f-dfb556e3c087
00000000-0000-0000-0000-000000000000	166	65gg5siigcrc	82c2bbb6-05e1-4e13-aa53-04b49978d9c4	t	2025-07-16 12:57:53.187988+00	2025-07-16 19:00:05.587186+00	3h2b32xay7zi	02c1f6c3-9252-4e65-a90f-dfb556e3c087
00000000-0000-0000-0000-000000000000	167	h32kuozs65h3	82c2bbb6-05e1-4e13-aa53-04b49978d9c4	t	2025-07-16 19:00:05.592558+00	2025-07-16 20:27:00.574877+00	65gg5siigcrc	02c1f6c3-9252-4e65-a90f-dfb556e3c087
00000000-0000-0000-0000-000000000000	170	7h72cbgogvuh	82c2bbb6-05e1-4e13-aa53-04b49978d9c4	t	2025-07-17 11:49:34.490077+00	2025-07-17 13:00:31.81236+00	mr7eutu2jc3z	02c1f6c3-9252-4e65-a90f-dfb556e3c087
00000000-0000-0000-0000-000000000000	171	5tvibxeyyp2w	82c2bbb6-05e1-4e13-aa53-04b49978d9c4	t	2025-07-17 13:00:31.815635+00	2025-07-17 14:24:03.274878+00	7h72cbgogvuh	02c1f6c3-9252-4e65-a90f-dfb556e3c087
00000000-0000-0000-0000-000000000000	172	eut4gmphzj7k	82c2bbb6-05e1-4e13-aa53-04b49978d9c4	t	2025-07-17 14:24:03.278569+00	2025-07-17 17:29:28.702449+00	5tvibxeyyp2w	02c1f6c3-9252-4e65-a90f-dfb556e3c087
00000000-0000-0000-0000-000000000000	173	arbbreqmvzlp	82c2bbb6-05e1-4e13-aa53-04b49978d9c4	t	2025-07-17 17:29:28.705826+00	2025-07-17 18:56:30.669874+00	eut4gmphzj7k	02c1f6c3-9252-4e65-a90f-dfb556e3c087
00000000-0000-0000-0000-000000000000	174	afgmb234i6z3	82c2bbb6-05e1-4e13-aa53-04b49978d9c4	t	2025-07-17 18:56:30.673258+00	2025-07-18 11:55:16.655757+00	arbbreqmvzlp	02c1f6c3-9252-4e65-a90f-dfb556e3c087
00000000-0000-0000-0000-000000000000	175	uq6yk6zh3g7n	82c2bbb6-05e1-4e13-aa53-04b49978d9c4	t	2025-07-18 11:55:16.667726+00	2025-07-18 14:10:59.646207+00	afgmb234i6z3	02c1f6c3-9252-4e65-a90f-dfb556e3c087
00000000-0000-0000-0000-000000000000	169	oar6tp7impcp	82c2bbb6-05e1-4e13-aa53-04b49978d9c4	t	2025-07-17 11:33:21.05669+00	2025-07-21 10:34:48.568943+00	5p4qum4y3nx2	eab4786f-ccd7-4489-b822-c81be3dbc3f0
00000000-0000-0000-0000-000000000000	176	fi35ctghmpuw	82c2bbb6-05e1-4e13-aa53-04b49978d9c4	t	2025-07-18 14:10:59.650974+00	2025-07-21 11:29:47.979314+00	uq6yk6zh3g7n	02c1f6c3-9252-4e65-a90f-dfb556e3c087
00000000-0000-0000-0000-000000000000	178	ypxqcfg7p7bx	82c2bbb6-05e1-4e13-aa53-04b49978d9c4	t	2025-07-21 11:29:47.984212+00	2025-07-21 12:28:06.942542+00	fi35ctghmpuw	02c1f6c3-9252-4e65-a90f-dfb556e3c087
00000000-0000-0000-0000-000000000000	179	y4qbq3456nmn	82c2bbb6-05e1-4e13-aa53-04b49978d9c4	t	2025-07-21 12:28:06.944945+00	2025-07-21 13:26:13.089907+00	ypxqcfg7p7bx	02c1f6c3-9252-4e65-a90f-dfb556e3c087
00000000-0000-0000-0000-000000000000	180	64faqwbj6hzr	82c2bbb6-05e1-4e13-aa53-04b49978d9c4	t	2025-07-21 13:26:13.092136+00	2025-07-21 14:24:27.106883+00	y4qbq3456nmn	02c1f6c3-9252-4e65-a90f-dfb556e3c087
00000000-0000-0000-0000-000000000000	181	3zdkarqna2ox	82c2bbb6-05e1-4e13-aa53-04b49978d9c4	t	2025-07-21 14:24:27.112133+00	2025-07-21 15:28:32.187491+00	64faqwbj6hzr	02c1f6c3-9252-4e65-a90f-dfb556e3c087
00000000-0000-0000-0000-000000000000	182	5lx75fpdioeb	82c2bbb6-05e1-4e13-aa53-04b49978d9c4	t	2025-07-21 15:28:32.191391+00	2025-07-21 18:39:06.426926+00	3zdkarqna2ox	02c1f6c3-9252-4e65-a90f-dfb556e3c087
00000000-0000-0000-0000-000000000000	183	iwyq2zd5yk7t	82c2bbb6-05e1-4e13-aa53-04b49978d9c4	t	2025-07-21 18:39:06.438201+00	2025-07-21 20:02:40.629106+00	5lx75fpdioeb	02c1f6c3-9252-4e65-a90f-dfb556e3c087
00000000-0000-0000-0000-000000000000	177	3iskqpumma3h	82c2bbb6-05e1-4e13-aa53-04b49978d9c4	t	2025-07-21 10:34:48.580794+00	2025-07-22 10:53:32.372013+00	oar6tp7impcp	eab4786f-ccd7-4489-b822-c81be3dbc3f0
00000000-0000-0000-0000-000000000000	185	acf2dpcaqeaj	82c2bbb6-05e1-4e13-aa53-04b49978d9c4	f	2025-07-22 10:53:32.384176+00	2025-07-22 10:53:32.384176+00	3iskqpumma3h	eab4786f-ccd7-4489-b822-c81be3dbc3f0
00000000-0000-0000-0000-000000000000	186	tw4jaewjz6bu	82c2bbb6-05e1-4e13-aa53-04b49978d9c4	f	2025-07-22 10:53:47.043225+00	2025-07-22 10:53:47.043225+00	\N	995bce13-31c4-46a0-8863-78dbd39d1914
00000000-0000-0000-0000-000000000000	184	ypjg6xst227g	82c2bbb6-05e1-4e13-aa53-04b49978d9c4	t	2025-07-21 20:02:40.632838+00	2025-07-22 11:02:17.28882+00	iwyq2zd5yk7t	02c1f6c3-9252-4e65-a90f-dfb556e3c087
00000000-0000-0000-0000-000000000000	188	lpty4vnnv4qc	82c2bbb6-05e1-4e13-aa53-04b49978d9c4	t	2025-07-22 11:02:17.291515+00	2025-07-22 12:00:30.425644+00	ypjg6xst227g	02c1f6c3-9252-4e65-a90f-dfb556e3c087
00000000-0000-0000-0000-000000000000	189	oweovvbibnf6	82c2bbb6-05e1-4e13-aa53-04b49978d9c4	t	2025-07-22 12:00:30.441565+00	2025-07-22 12:58:34.984508+00	lpty4vnnv4qc	02c1f6c3-9252-4e65-a90f-dfb556e3c087
00000000-0000-0000-0000-000000000000	190	eoo4vk4h5n77	82c2bbb6-05e1-4e13-aa53-04b49978d9c4	t	2025-07-22 12:58:34.991317+00	2025-07-22 15:33:26.195374+00	oweovvbibnf6	02c1f6c3-9252-4e65-a90f-dfb556e3c087
00000000-0000-0000-0000-000000000000	187	5pjg5cbgtyca	82c2bbb6-05e1-4e13-aa53-04b49978d9c4	t	2025-07-22 10:54:06.032901+00	2025-07-23 11:03:09.559831+00	\N	04d53c0e-9f34-451f-8ddf-0b31ca5aaeed
00000000-0000-0000-0000-000000000000	191	kef6vacqsdxj	82c2bbb6-05e1-4e13-aa53-04b49978d9c4	t	2025-07-22 15:33:26.203223+00	2025-07-23 12:56:01.57962+00	eoo4vk4h5n77	02c1f6c3-9252-4e65-a90f-dfb556e3c087
00000000-0000-0000-0000-000000000000	192	tz65rtoswbfa	82c2bbb6-05e1-4e13-aa53-04b49978d9c4	t	2025-07-23 11:03:09.576354+00	2025-07-23 17:23:17.692735+00	5pjg5cbgtyca	04d53c0e-9f34-451f-8ddf-0b31ca5aaeed
00000000-0000-0000-0000-000000000000	193	xa4nlkqg7vvt	82c2bbb6-05e1-4e13-aa53-04b49978d9c4	t	2025-07-23 12:56:01.584443+00	2025-07-23 17:54:20.504235+00	kef6vacqsdxj	02c1f6c3-9252-4e65-a90f-dfb556e3c087
00000000-0000-0000-0000-000000000000	194	w7chhykjej5o	82c2bbb6-05e1-4e13-aa53-04b49978d9c4	t	2025-07-23 17:23:17.70866+00	2025-07-23 22:34:44.148356+00	tz65rtoswbfa	04d53c0e-9f34-451f-8ddf-0b31ca5aaeed
00000000-0000-0000-0000-000000000000	196	nl5nzn5tahmz	82c2bbb6-05e1-4e13-aa53-04b49978d9c4	t	2025-07-23 22:34:44.163326+00	2025-07-23 23:52:23.712626+00	w7chhykjej5o	04d53c0e-9f34-451f-8ddf-0b31ca5aaeed
00000000-0000-0000-0000-000000000000	195	3hi6xzzzovac	82c2bbb6-05e1-4e13-aa53-04b49978d9c4	t	2025-07-23 17:54:20.507943+00	2025-07-24 11:41:03.121069+00	xa4nlkqg7vvt	02c1f6c3-9252-4e65-a90f-dfb556e3c087
00000000-0000-0000-0000-000000000000	198	t4p2zmchxpsh	82c2bbb6-05e1-4e13-aa53-04b49978d9c4	t	2025-07-24 11:41:03.132818+00	2025-07-24 12:42:29.261858+00	3hi6xzzzovac	02c1f6c3-9252-4e65-a90f-dfb556e3c087
00000000-0000-0000-0000-000000000000	199	drqsvb5diuae	82c2bbb6-05e1-4e13-aa53-04b49978d9c4	t	2025-07-24 12:42:29.265721+00	2025-07-24 16:48:41.656005+00	t4p2zmchxpsh	02c1f6c3-9252-4e65-a90f-dfb556e3c087
00000000-0000-0000-0000-000000000000	200	krz66ntg66nn	82c2bbb6-05e1-4e13-aa53-04b49978d9c4	t	2025-07-24 16:48:41.665468+00	2025-07-25 01:09:50.881985+00	drqsvb5diuae	02c1f6c3-9252-4e65-a90f-dfb556e3c087
00000000-0000-0000-0000-000000000000	197	h2xgkxgeblm5	82c2bbb6-05e1-4e13-aa53-04b49978d9c4	t	2025-07-23 23:52:23.718501+00	2025-07-25 10:38:14.049847+00	nl5nzn5tahmz	04d53c0e-9f34-451f-8ddf-0b31ca5aaeed
00000000-0000-0000-0000-000000000000	201	6higahohgbqj	82c2bbb6-05e1-4e13-aa53-04b49978d9c4	t	2025-07-25 01:09:50.896093+00	2025-07-25 12:10:05.770521+00	krz66ntg66nn	02c1f6c3-9252-4e65-a90f-dfb556e3c087
00000000-0000-0000-0000-000000000000	203	oexivu62az7l	82c2bbb6-05e1-4e13-aa53-04b49978d9c4	t	2025-07-25 12:10:05.777715+00	2025-07-25 15:19:15.426192+00	6higahohgbqj	02c1f6c3-9252-4e65-a90f-dfb556e3c087
00000000-0000-0000-0000-000000000000	202	lppyxatu5upe	82c2bbb6-05e1-4e13-aa53-04b49978d9c4	t	2025-07-25 10:38:14.067973+00	2025-07-25 15:51:37.817863+00	h2xgkxgeblm5	04d53c0e-9f34-451f-8ddf-0b31ca5aaeed
00000000-0000-0000-0000-000000000000	205	wbawghbzrft4	82c2bbb6-05e1-4e13-aa53-04b49978d9c4	f	2025-07-25 15:51:37.827503+00	2025-07-25 15:51:37.827503+00	lppyxatu5upe	04d53c0e-9f34-451f-8ddf-0b31ca5aaeed
00000000-0000-0000-0000-000000000000	204	zncx47dnmhom	82c2bbb6-05e1-4e13-aa53-04b49978d9c4	t	2025-07-25 15:19:15.4383+00	2025-07-28 14:36:59.435559+00	oexivu62az7l	02c1f6c3-9252-4e65-a90f-dfb556e3c087
00000000-0000-0000-0000-000000000000	206	tdx2zmddzb7c	82c2bbb6-05e1-4e13-aa53-04b49978d9c4	t	2025-07-28 14:36:59.448477+00	2025-07-28 19:06:40.836412+00	zncx47dnmhom	02c1f6c3-9252-4e65-a90f-dfb556e3c087
00000000-0000-0000-0000-000000000000	207	54pqeffywopx	82c2bbb6-05e1-4e13-aa53-04b49978d9c4	t	2025-07-28 19:06:40.838862+00	2025-07-31 23:34:32.561575+00	tdx2zmddzb7c	02c1f6c3-9252-4e65-a90f-dfb556e3c087
00000000-0000-0000-0000-000000000000	208	fhdpqqfdvvr3	82c2bbb6-05e1-4e13-aa53-04b49978d9c4	t	2025-07-31 23:34:32.581375+00	2025-08-01 02:05:30.666735+00	54pqeffywopx	02c1f6c3-9252-4e65-a90f-dfb556e3c087
00000000-0000-0000-0000-000000000000	209	m6oyjcexn73z	82c2bbb6-05e1-4e13-aa53-04b49978d9c4	t	2025-08-01 02:05:30.671198+00	2025-08-01 10:36:40.044641+00	fhdpqqfdvvr3	02c1f6c3-9252-4e65-a90f-dfb556e3c087
00000000-0000-0000-0000-000000000000	210	oidcm7bqd6hk	82c2bbb6-05e1-4e13-aa53-04b49978d9c4	t	2025-08-01 10:36:40.054612+00	2025-08-07 19:21:53.316785+00	m6oyjcexn73z	02c1f6c3-9252-4e65-a90f-dfb556e3c087
00000000-0000-0000-0000-000000000000	211	sxwxulasxbp2	82c2bbb6-05e1-4e13-aa53-04b49978d9c4	t	2025-08-07 19:21:53.339167+00	2025-08-07 20:28:12.824225+00	oidcm7bqd6hk	02c1f6c3-9252-4e65-a90f-dfb556e3c087
00000000-0000-0000-0000-000000000000	212	r6qgro2krlsn	82c2bbb6-05e1-4e13-aa53-04b49978d9c4	t	2025-08-07 20:28:12.828102+00	2025-08-07 21:26:42.453318+00	sxwxulasxbp2	02c1f6c3-9252-4e65-a90f-dfb556e3c087
00000000-0000-0000-0000-000000000000	213	jtaqkn4uh6ve	82c2bbb6-05e1-4e13-aa53-04b49978d9c4	t	2025-08-07 21:26:42.46027+00	2025-08-07 22:25:09.194699+00	r6qgro2krlsn	02c1f6c3-9252-4e65-a90f-dfb556e3c087
00000000-0000-0000-0000-000000000000	214	n4ljs466xprv	82c2bbb6-05e1-4e13-aa53-04b49978d9c4	t	2025-08-07 22:25:09.197662+00	2025-08-08 12:09:34.873753+00	jtaqkn4uh6ve	02c1f6c3-9252-4e65-a90f-dfb556e3c087
00000000-0000-0000-0000-000000000000	215	dhgehkelx6b3	82c2bbb6-05e1-4e13-aa53-04b49978d9c4	t	2025-08-08 12:09:34.880194+00	2025-08-08 13:50:08.279987+00	n4ljs466xprv	02c1f6c3-9252-4e65-a90f-dfb556e3c087
00000000-0000-0000-0000-000000000000	216	3ms34gd5m7gd	82c2bbb6-05e1-4e13-aa53-04b49978d9c4	t	2025-08-08 13:50:08.289476+00	2025-08-08 16:12:09.773193+00	dhgehkelx6b3	02c1f6c3-9252-4e65-a90f-dfb556e3c087
00000000-0000-0000-0000-000000000000	217	kt6tppm7llug	82c2bbb6-05e1-4e13-aa53-04b49978d9c4	f	2025-08-08 16:12:09.778763+00	2025-08-08 16:12:09.778763+00	3ms34gd5m7gd	02c1f6c3-9252-4e65-a90f-dfb556e3c087
\.


--
-- Data for Name: saml_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.saml_providers (id, sso_provider_id, entity_id, metadata_xml, metadata_url, attribute_mapping, created_at, updated_at, name_id_format) FROM stdin;
\.


--
-- Data for Name: saml_relay_states; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.saml_relay_states (id, sso_provider_id, request_id, for_email, redirect_to, created_at, updated_at, flow_state_id) FROM stdin;
\.


--
-- Data for Name: schema_migrations; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.schema_migrations (version) FROM stdin;
20171026211738
20171026211808
20171026211834
20180103212743
20180108183307
20180119214651
20180125194653
00
20210710035447
20210722035447
20210730183235
20210909172000
20210927181326
20211122151130
20211124214934
20211202183645
20220114185221
20220114185340
20220224000811
20220323170000
20220429102000
20220531120530
20220614074223
20220811173540
20221003041349
20221003041400
20221011041400
20221020193600
20221021073300
20221021082433
20221027105023
20221114143122
20221114143410
20221125140132
20221208132122
20221215195500
20221215195800
20221215195900
20230116124310
20230116124412
20230131181311
20230322519590
20230402418590
20230411005111
20230508135423
20230523124323
20230818113222
20230914180801
20231027141322
20231114161723
20231117164230
20240115144230
20240214120130
20240306115329
20240314092811
20240427152123
20240612123726
20240729123726
20240802193726
20240806073726
20241009103726
\.


--
-- Data for Name: sessions; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.sessions (id, user_id, created_at, updated_at, factor_id, aal, not_after, refreshed_at, user_agent, ip, tag) FROM stdin;
eab4786f-ccd7-4489-b822-c81be3dbc3f0	82c2bbb6-05e1-4e13-aa53-04b49978d9c4	2025-06-28 17:37:47.34112+00	2025-07-22 10:53:32.393369+00	\N	aal1	\N	2025-07-22 10:53:32.393275	Mozilla/5.0 (iPhone; CPU iPhone OS 18_5_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/138.0.7204.156 Mobile/15E148 Safari/604.1	108.17.64.237	\N
995bce13-31c4-46a0-8863-78dbd39d1914	82c2bbb6-05e1-4e13-aa53-04b49978d9c4	2025-07-22 10:53:47.034671+00	2025-07-22 10:53:47.034671+00	\N	aal1	\N	\N	Mozilla/5.0 (iPhone; CPU iPhone OS 18_5_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/138.0.7204.156 Mobile/15E148 Safari/604.1	108.17.64.237	\N
a1ec2c9d-4ffd-48ba-9cc2-8c542ee78aa7	82c2bbb6-05e1-4e13-aa53-04b49978d9c4	2025-06-27 15:59:12.114757+00	2025-06-27 15:59:12.114757+00	\N	aal1	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	108.17.64.237	\N
33b76812-4a60-4d7e-bc88-cf94d5816cf0	1f376499-fc49-4444-970c-21b7f9039851	2025-06-28 12:11:11.853998+00	2025-06-28 12:11:11.853998+00	\N	aal1	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36 Edg/138.0.0.0	149.120.32.4	\N
02c1f6c3-9252-4e65-a90f-dfb556e3c087	82c2bbb6-05e1-4e13-aa53-04b49978d9c4	2025-06-27 19:27:19.338119+00	2025-08-08 16:12:09.782087+00	\N	aal1	\N	2025-08-08 16:12:09.782003	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36	108.17.64.237	\N
04d53c0e-9f34-451f-8ddf-0b31ca5aaeed	82c2bbb6-05e1-4e13-aa53-04b49978d9c4	2025-07-22 10:54:06.03093+00	2025-07-25 15:51:37.841639+00	\N	aal1	\N	2025-07-25 15:51:37.841567	Mozilla/5.0 (iPhone; CPU iPhone OS 18_5_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/138.0.7204.156 Mobile/15E148 Safari/604.1	108.17.64.237	\N
\.


--
-- Data for Name: sso_domains; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.sso_domains (id, sso_provider_id, domain, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: sso_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.sso_providers (id, resource_id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, invited_at, confirmation_token, confirmation_sent_at, recovery_token, recovery_sent_at, email_change_token_new, email_change, email_change_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, is_super_admin, created_at, updated_at, phone, phone_confirmed_at, phone_change, phone_change_token, phone_change_sent_at, email_change_token_current, email_change_confirm_status, banned_until, reauthentication_token, reauthentication_sent_at, is_sso_user, deleted_at, is_anonymous) FROM stdin;
00000000-0000-0000-0000-000000000000	1f376499-fc49-4444-970c-21b7f9039851	authenticated	authenticated	dhubach1@gmail.com	$2a$10$9xiZp2mzYhn2c9O56HCfAOq.tDxvZEF51dGGIltj1TaKtlEbzb27C	2025-06-28 12:11:11.847138+00	\N		2025-06-28 12:09:56.170066+00		\N			\N	2025-06-28 12:11:11.85349+00	{"provider": "email", "providers": ["email"]}	{"sub": "1f376499-fc49-4444-970c-21b7f9039851", "email": "dhubach1@gmail.com", "last_name": "Hubacher", "first_name": "David", "email_verified": true, "phone_verified": false}	\N	2025-06-28 12:09:56.136807+00	2025-06-28 12:11:11.867476+00	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	82c2bbb6-05e1-4e13-aa53-04b49978d9c4	authenticated	authenticated	chubache85@gmail.com	$2a$10$dKp0TEXUbCSo5r51DvnwruzZSpca158gqej5AE1ISbLW/geM7650a	2025-06-18 11:52:23.531696+00	\N		2025-06-18 11:50:55.442455+00		\N			\N	2025-07-22 10:54:06.030842+00	{"provider": "email", "providers": ["email"]}	{"sub": "82c2bbb6-05e1-4e13-aa53-04b49978d9c4", "email": "chubache85@gmail.com", "last_name": "Hubacher", "first_name": "Carl", "email_verified": true, "phone_verified": false}	\N	2025-06-18 11:50:55.423749+00	2025-08-08 16:12:09.779995+00	\N	\N			\N		0	\N		\N	f	\N	f
\.


--
-- Data for Name: assets; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.assets (id, user_id, created_at, name, type, value, loan, nextduedate, "interestRate", "loanStartDate", "nextDueDate", "purchaseDate", "purchasePrice", "termYears") FROM stdin;
e27f137f-153c-4eb9-af30-7c46533c9102	82c2bbb6-05e1-4e13-aa53-04b49978d9c4	2025-06-25 20:00:08.733972+00	BMW X5	vehicle	85000	44320	\N	9.6	2020-03-27	2025-07-14	\N	\N	\N
5a93ed58-b768-4d60-883c-a61a22fb5a69	82c2bbb6-05e1-4e13-aa53-04b49978d9c4	2025-06-25 20:00:08.733972+00	2700 Bingham Drive	realEstate	288100	246544.53	\N	6.5	\N	2025-07-01	2025-04-30	270000	30
\.


--
-- Data for Name: bills; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.bills (id, user_id, created_at, name, type, amount, frequency, nextduedate, "nextDueDate") FROM stdin;
720b3101-5e22-47d6-8f6c-46830fbe6ded	82c2bbb6-05e1-4e13-aa53-04b49978d9c4	2025-06-25 20:00:08.96572+00	People's Gas	Utility	85.86	Monthly	\N	2025-07-07
62ffbad6-ffb7-4ec5-821b-6d03ee712637	82c2bbb6-05e1-4e13-aa53-04b49978d9c4	2025-06-25 20:00:08.96572+00	American Water	Utility	107.03	Monthly	\N	2025-07-04
045ff7c2-ba33-4853-95f7-4f3bb1e6a377	82c2bbb6-05e1-4e13-aa53-04b49978d9c4	2025-06-25 20:00:08.96572+00	West Penn Power	Utility	106.36	Monthly	\N	2025-07-07
f4abace2-ea11-42e8-bf58-7d1f1ca9083d	82c2bbb6-05e1-4e13-aa53-04b49978d9c4	2025-06-25 20:00:08.96572+00	Verizon Wireless	Other	197.77	Monthly	\N	2025-06-21
c9761fe6-ab6a-4b59-852d-dbc8549549c9	82c2bbb6-05e1-4e13-aa53-04b49978d9c4	2025-06-25 20:00:08.96572+00	BMW Lease	Other	1053.69	Monthly	\N	2025-07-04
8e5210d0-2845-4958-99bd-98947c298d35	82c2bbb6-05e1-4e13-aa53-04b49978d9c4	2025-06-25 20:00:08.96572+00	Turbo Tax	Other	322	Monthly	\N	2025-06-20
47fbb866-2751-4a5e-b113-2bc531de5fc6	82c2bbb6-05e1-4e13-aa53-04b49978d9c4	2025-06-30 17:09:09.03302+00	HOA Fees	Other	170	Monthly	\N	2025-07-01
b21448d7-58d7-4f6d-8a2b-dfe066f40f01	82c2bbb6-05e1-4e13-aa53-04b49978d9c4	2025-06-25 20:00:08.96572+00	Sewage	Utility	162.25	Monthly	\N	2025-07-01
\.


--
-- Data for Name: budgets; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.budgets (id, user_id, month, item_id, item_type, assigned_amount, name, category, needed_amount) FROM stdin;
03080511-bcfe-4b86-af1e-07f6cb90b239	82c2bbb6-05e1-4e13-aa53-04b49978d9c4	2025-06	b21448d7-58d7-4f6d-8a2b-dfe066f40f01	bill	13.69	\N	\N	0
37d5d738-94e2-43c6-86a0-0dc41b7c9579	82c2bbb6-05e1-4e13-aa53-04b49978d9c4	2025-06	720b3101-5e22-47d6-8f6c-46830fbe6ded	bill	85.86	\N	\N	0
90fd203e-2f50-4f2f-9f21-7a31fcb67515	82c2bbb6-05e1-4e13-aa53-04b49978d9c4	2025-06	62ffbad6-ffb7-4ec5-821b-6d03ee712637	bill	107.03	\N	\N	0
819e81b4-6a25-41a3-bf71-6a17ff65f4a6	82c2bbb6-05e1-4e13-aa53-04b49978d9c4	2025-06	045ff7c2-ba33-4853-95f7-4f3bb1e6a377	bill	150	\N	\N	0
07b73e78-274e-4093-97f8-bbbc024dbe7e	82c2bbb6-05e1-4e13-aa53-04b49978d9c4	2025-06	f4abace2-ea11-42e8-bf58-7d1f1ca9083d	bill	197.77	\N	\N	0
be8f69f6-f473-4bc5-97a1-71f06b65cbd8	82c2bbb6-05e1-4e13-aa53-04b49978d9c4	2025-06	c9761fe6-ab6a-4b59-852d-dbc8549549c9	bill	500	\N	\N	0
b135909f-0849-46c0-9a2a-445212016980	82c2bbb6-05e1-4e13-aa53-04b49978d9c4	2025-07	720b3101-5e22-47d6-8f6c-46830fbe6ded	bill	85.86	\N	\N	0
c1607122-64f4-41df-8fd6-92fe88909b6b	82c2bbb6-05e1-4e13-aa53-04b49978d9c4	2025-07	62ffbad6-ffb7-4ec5-821b-6d03ee712637	bill	50	\N	\N	0
\.


--
-- Data for Name: debts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.debts (id, user_id, created_at, name, type, amount, interestrate, term, monthlypayment, nextduedate, "interestRate", "monthlyPayment", "nextDueDate") FROM stdin;
e4e6dd47-9c7d-4646-bf30-28aef0e92af6	82c2bbb6-05e1-4e13-aa53-04b49978d9c4	2025-06-25 20:00:08.890658+00	Capital One	Credit Card	957.69	\N	1	\N	\N	28.98	200	2025-06-16
fae53b26-9789-41fc-8266-276162def8ae	82c2bbb6-05e1-4e13-aa53-04b49978d9c4	2025-06-25 20:00:08.890658+00	Chase Sapphire Reserve	Credit Card	0	\N	1	\N	\N	13	0	2025-07-18
b7e1f37c-4532-4017-b5b6-833d29ca5732	82c2bbb6-05e1-4e13-aa53-04b49978d9c4	2025-06-25 20:00:08.890658+00	Robinhood Credit Card	Credit Card	8842.04	\N	1	\N	\N	13	500	2025-07-01
\.


--
-- Data for Name: income; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.income (id, user_id, created_at, name, type, amount, frequency, nextduedate, "nextDueDate") FROM stdin;
d973de4a-0dc1-4616-9b9c-4c5feab6bda3	82c2bbb6-05e1-4e13-aa53-04b49978d9c4	2025-06-25 20:00:09.043705+00	Huntington Ingalls	W2	3569	Bi-Weekly	\N	2025-06-20
7d5c35b3-1706-40cf-9585-16334eba45a3	82c2bbb6-05e1-4e13-aa53-04b49978d9c4	2025-06-25 20:00:09.043705+00	FERC	1099	5700	Monthly	\N	2025-08-08
\.


--
-- Data for Name: investments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.investments (id, user_id, created_at, name, type, value, monthlycontribution, annualreturn, nextcontributiondate, "startingBalance", "monthlyContribution", "annualReturn", "nextContributionDate") FROM stdin;
a7fd20fa-263b-4ec0-b517-447fa2cbbb27	82c2bbb6-05e1-4e13-aa53-04b49978d9c4	2025-06-25 20:00:08.823225+00	Brittany 401k	401(k)	108592	\N	\N	\N	102645.05	300	8	2025-06-27
d8a778a8-d216-44ec-85db-41515043b496	82c2bbb6-05e1-4e13-aa53-04b49978d9c4	2025-06-25 20:00:08.823225+00	Matt 401k	401(k)	80434.15	\N	\N	\N	74370	12	8	2025-07-18
bcf53d9b-9cb0-4754-96e5-96247e8614a5	82c2bbb6-05e1-4e13-aa53-04b49978d9c4	2025-06-25 20:00:08.823225+00	Emergency Fund	Other	10000	\N	\N	\N	7000	200	1.5	2025-07-25
34150730-c2fb-46c3-b4e4-aab31ec2dcc9	82c2bbb6-05e1-4e13-aa53-04b49978d9c4	2025-06-25 20:00:08.823225+00	Robinhood	Crypto	8775.97	\N	\N	\N	5940	1000	15	2025-07-11
c5a29c93-6d2e-4718-8b79-69ef20b648bc	82c2bbb6-05e1-4e13-aa53-04b49978d9c4	2025-06-25 20:00:08.823225+00	GME	Stock	6719.15	\N	\N	\N	6419.78	0	15	\N
\.


--
-- Data for Name: settings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.settings (user_id, emergency_fund_goal, created_at) FROM stdin;
82c2bbb6-05e1-4e13-aa53-04b49978d9c4	30000	2025-06-27 15:58:02.85126+00
\.


--
-- Data for Name: snapshots; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.snapshots (user_id, date, networth, created_at, "netWorth") FROM stdin;
82c2bbb6-05e1-4e13-aa53-04b49978d9c4	2025-06-16	\N	2025-06-25 20:00:09.116541+00	247278
82c2bbb6-05e1-4e13-aa53-04b49978d9c4	2025-06-18	\N	2025-06-25 20:00:09.116541+00	252388.25999999995
82c2bbb6-05e1-4e13-aa53-04b49978d9c4	2025-06-19	\N	2025-06-25 20:00:09.116541+00	255423.26
82c2bbb6-05e1-4e13-aa53-04b49978d9c4	2025-06-20	\N	2025-06-25 20:00:09.116541+00	265023.26
82c2bbb6-05e1-4e13-aa53-04b49978d9c4	2025-06-21	\N	2025-06-25 20:00:09.116541+00	264925.25999999995
82c2bbb6-05e1-4e13-aa53-04b49978d9c4	2025-06-23	\N	2025-06-25 20:00:09.116541+00	263913.2
82c2bbb6-05e1-4e13-aa53-04b49978d9c4	2025-06-24	\N	2025-06-25 20:00:09.116541+00	264230.22
82c2bbb6-05e1-4e13-aa53-04b49978d9c4	2025-07-11	\N	2025-07-11 00:42:29.038892+00	282379.23
82c2bbb6-05e1-4e13-aa53-04b49978d9c4	2025-07-14	\N	2025-07-14 02:46:03.206349+00	282718.30000000005
82c2bbb6-05e1-4e13-aa53-04b49978d9c4	2025-07-03	\N	2025-07-03 10:35:10.040834+00	278234.52
82c2bbb6-05e1-4e13-aa53-04b49978d9c4	2025-07-07	\N	2025-07-07 01:44:41.657869+00	280026.26
82c2bbb6-05e1-4e13-aa53-04b49978d9c4	2025-06-27	\N	2025-06-27 12:22:58.326606+00	272245.95
82c2bbb6-05e1-4e13-aa53-04b49978d9c4	2025-06-25	\N	2025-06-25 20:00:09.116541+00	266465.93
82c2bbb6-05e1-4e13-aa53-04b49978d9c4	2025-07-21	\N	2025-07-21 10:34:49.423885+00	284725.31000000006
82c2bbb6-05e1-4e13-aa53-04b49978d9c4	2025-07-15	\N	2025-07-15 13:40:21.625176+00	282718.30000000005
82c2bbb6-05e1-4e13-aa53-04b49978d9c4	2025-07-08	\N	2025-07-08 01:13:42.178959+00	280026.26
82c2bbb6-05e1-4e13-aa53-04b49978d9c4	2025-07-16	\N	2025-07-16 12:57:53.711073+00	282718.30000000005
82c2bbb6-05e1-4e13-aa53-04b49978d9c4	2025-06-26	\N	2025-06-26 13:07:39.493525+00	267933.09
82c2bbb6-05e1-4e13-aa53-04b49978d9c4	2025-07-01	\N	2025-07-01 10:14:58.074711+00	277619.88000000006
82c2bbb6-05e1-4e13-aa53-04b49978d9c4	2025-06-28	\N	2025-06-28 11:04:35.67078+00	272411.54
82c2bbb6-05e1-4e13-aa53-04b49978d9c4	2025-07-04	\N	2025-07-04 10:59:39.203789+00	278913.79000000004
82c2bbb6-05e1-4e13-aa53-04b49978d9c4	2025-06-29	\N	2025-06-29 22:28:20.93183+00	272462.56
82c2bbb6-05e1-4e13-aa53-04b49978d9c4	2025-08-07	\N	2025-08-07 19:21:54.080037+00	286890.35
82c2bbb6-05e1-4e13-aa53-04b49978d9c4	2025-07-02	\N	2025-07-02 10:31:43.060165+00	277619.88000000006
82c2bbb6-05e1-4e13-aa53-04b49978d9c4	2025-07-05	\N	2025-07-05 13:01:10.466047+00	278913.79000000004
82c2bbb6-05e1-4e13-aa53-04b49978d9c4	2025-08-08	\N	2025-08-08 12:09:35.653832+00	286890.35
82c2bbb6-05e1-4e13-aa53-04b49978d9c4	2025-07-22	\N	2025-07-22 11:02:17.750596+00	284887.56000000006
82c2bbb6-05e1-4e13-aa53-04b49978d9c4	2025-07-06	\N	2025-07-06 12:08:29.480579+00	278913.79000000004
82c2bbb6-05e1-4e13-aa53-04b49978d9c4	2025-06-30	\N	2025-06-30 01:43:59.72853+00	274929.39
82c2bbb6-05e1-4e13-aa53-04b49978d9c4	2025-07-10	\N	2025-07-10 00:35:25.859527+00	280777.06
82c2bbb6-05e1-4e13-aa53-04b49978d9c4	2025-07-23	\N	2025-07-23 11:03:10.286338+00	285615.99
82c2bbb6-05e1-4e13-aa53-04b49978d9c4	2025-07-09	\N	2025-07-09 10:06:13.260977+00	280205.96
82c2bbb6-05e1-4e13-aa53-04b49978d9c4	2025-07-17	\N	2025-07-17 11:33:21.720686+00	283152.89
82c2bbb6-05e1-4e13-aa53-04b49978d9c4	2025-07-24	\N	2025-07-24 11:41:03.680203+00	286498.82
82c2bbb6-05e1-4e13-aa53-04b49978d9c4	2025-07-25	\N	2025-07-25 01:09:51.215434+00	286498.82
82c2bbb6-05e1-4e13-aa53-04b49978d9c4	2025-07-18	\N	2025-07-18 11:55:17.168228+00	283366.89
82c2bbb6-05e1-4e13-aa53-04b49978d9c4	2025-07-28	\N	2025-07-28 14:37:00.070539+00	286498.82
82c2bbb6-05e1-4e13-aa53-04b49978d9c4	2025-07-31	\N	2025-07-31 23:34:33.295995+00	286498.82
82c2bbb6-05e1-4e13-aa53-04b49978d9c4	2025-08-01	\N	2025-08-01 02:05:31.190154+00	286498.82
\.


--
-- Data for Name: schema_migrations; Type: TABLE DATA; Schema: realtime; Owner: supabase_admin
--

COPY realtime.schema_migrations (version, inserted_at) FROM stdin;
20211116024918	2025-06-17 12:31:35
20211116045059	2025-06-17 12:31:38
20211116050929	2025-06-17 12:31:41
20211116051442	2025-06-17 12:31:43
20211116212300	2025-06-17 12:31:45
20211116213355	2025-06-17 12:31:47
20211116213934	2025-06-17 12:31:50
20211116214523	2025-06-17 12:31:53
20211122062447	2025-06-17 12:31:55
20211124070109	2025-06-17 12:31:57
20211202204204	2025-06-17 12:31:59
20211202204605	2025-06-17 12:32:01
20211210212804	2025-06-17 12:32:08
20211228014915	2025-06-17 12:32:10
20220107221237	2025-06-17 12:32:13
20220228202821	2025-06-17 12:32:15
20220312004840	2025-06-17 12:32:17
20220603231003	2025-06-17 12:32:20
20220603232444	2025-06-17 12:32:23
20220615214548	2025-06-17 12:32:25
20220712093339	2025-06-17 12:32:27
20220908172859	2025-06-17 12:32:30
20220916233421	2025-06-17 12:32:32
20230119133233	2025-06-17 12:32:34
20230128025114	2025-06-17 12:32:37
20230128025212	2025-06-17 12:32:39
20230227211149	2025-06-17 12:32:41
20230228184745	2025-06-17 12:32:43
20230308225145	2025-06-17 12:32:46
20230328144023	2025-06-17 12:32:48
20231018144023	2025-06-17 12:32:50
20231204144023	2025-06-17 12:32:54
20231204144024	2025-06-17 12:32:56
20231204144025	2025-06-17 12:32:58
20240108234812	2025-06-17 12:33:00
20240109165339	2025-06-17 12:33:03
20240227174441	2025-06-17 12:33:06
20240311171622	2025-06-17 12:33:09
20240321100241	2025-06-17 12:33:14
20240401105812	2025-06-17 12:33:20
20240418121054	2025-06-17 12:33:23
20240523004032	2025-06-17 12:33:31
20240618124746	2025-06-17 12:33:33
20240801235015	2025-06-17 12:33:36
20240805133720	2025-06-17 12:33:38
20240827160934	2025-06-17 12:33:40
20240919163303	2025-06-17 12:33:43
20240919163305	2025-06-17 12:33:45
20241019105805	2025-06-17 12:33:47
20241030150047	2025-06-17 12:33:55
20241108114728	2025-06-17 12:33:59
20241121104152	2025-06-17 12:34:01
20241130184212	2025-06-17 12:34:03
20241220035512	2025-06-17 12:34:05
20241220123912	2025-06-17 12:34:08
20241224161212	2025-06-17 12:34:10
20250107150512	2025-06-17 12:34:12
20250110162412	2025-06-17 12:34:14
20250123174212	2025-06-17 12:34:16
20250128220012	2025-06-17 12:34:18
20250506224012	2025-06-17 12:34:20
20250523164012	2025-06-17 12:34:22
\.


--
-- Data for Name: subscription; Type: TABLE DATA; Schema: realtime; Owner: supabase_admin
--

COPY realtime.subscription (id, subscription_id, entity, filters, claims, created_at) FROM stdin;
\.


--
-- Data for Name: buckets; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY storage.buckets (id, name, owner, created_at, updated_at, public, avif_autodetection, file_size_limit, allowed_mime_types, owner_id) FROM stdin;
\.


--
-- Data for Name: migrations; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY storage.migrations (id, name, hash, executed_at) FROM stdin;
0	create-migrations-table	e18db593bcde2aca2a408c4d1100f6abba2195df	2025-06-17 12:31:33.965995
1	initialmigration	6ab16121fbaa08bbd11b712d05f358f9b555d777	2025-06-17 12:31:33.972403
2	storage-schema	5c7968fd083fcea04050c1b7f6253c9771b99011	2025-06-17 12:31:33.984135
3	pathtoken-column	2cb1b0004b817b29d5b0a971af16bafeede4b70d	2025-06-17 12:31:34.046733
4	add-migrations-rls	427c5b63fe1c5937495d9c635c263ee7a5905058	2025-06-17 12:31:34.058973
5	add-size-functions	79e081a1455b63666c1294a440f8ad4b1e6a7f84	2025-06-17 12:31:34.062999
6	change-column-name-in-get-size	f93f62afdf6613ee5e7e815b30d02dc990201044	2025-06-17 12:31:34.068008
7	add-rls-to-buckets	e7e7f86adbc51049f341dfe8d30256c1abca17aa	2025-06-17 12:31:34.072408
8	add-public-to-buckets	fd670db39ed65f9d08b01db09d6202503ca2bab3	2025-06-17 12:31:34.078521
9	fix-search-function	3a0af29f42e35a4d101c259ed955b67e1bee6825	2025-06-17 12:31:34.082809
10	search-files-search-function	68dc14822daad0ffac3746a502234f486182ef6e	2025-06-17 12:31:34.088
11	add-trigger-to-auto-update-updated_at-column	7425bdb14366d1739fa8a18c83100636d74dcaa2	2025-06-17 12:31:34.10857
12	add-automatic-avif-detection-flag	8e92e1266eb29518b6a4c5313ab8f29dd0d08df9	2025-06-17 12:31:34.141414
13	add-bucket-custom-limits	cce962054138135cd9a8c4bcd531598684b25e7d	2025-06-17 12:31:34.145322
14	use-bytes-for-max-size	941c41b346f9802b411f06f30e972ad4744dad27	2025-06-17 12:31:34.15002
15	add-can-insert-object-function	934146bc38ead475f4ef4b555c524ee5d66799e5	2025-06-17 12:31:34.190174
16	add-version	76debf38d3fd07dcfc747ca49096457d95b1221b	2025-06-17 12:31:34.202215
17	drop-owner-foreign-key	f1cbb288f1b7a4c1eb8c38504b80ae2a0153d101	2025-06-17 12:31:34.206147
18	add_owner_id_column_deprecate_owner	e7a511b379110b08e2f214be852c35414749fe66	2025-06-17 12:31:34.216446
19	alter-default-value-objects-id	02e5e22a78626187e00d173dc45f58fa66a4f043	2025-06-17 12:31:34.229156
20	list-objects-with-delimiter	cd694ae708e51ba82bf012bba00caf4f3b6393b7	2025-06-17 12:31:34.240214
21	s3-multipart-uploads	8c804d4a566c40cd1e4cc5b3725a664a9303657f	2025-06-17 12:31:34.25114
22	s3-multipart-uploads-big-ints	9737dc258d2397953c9953d9b86920b8be0cdb73	2025-06-17 12:31:34.266646
23	optimize-search-function	9d7e604cddc4b56a5422dc68c9313f4a1b6f132c	2025-06-17 12:31:34.277017
24	operation-function	8312e37c2bf9e76bbe841aa5fda889206d2bf8aa	2025-06-17 12:31:34.283006
25	custom-metadata	d974c6057c3db1c1f847afa0e291e6165693b990	2025-06-17 12:31:34.290256
\.


--
-- Data for Name: objects; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY storage.objects (id, bucket_id, name, owner, created_at, updated_at, last_accessed_at, metadata, version, owner_id, user_metadata) FROM stdin;
\.


--
-- Data for Name: s3_multipart_uploads; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY storage.s3_multipart_uploads (id, in_progress_size, upload_signature, bucket_id, key, version, owner_id, created_at, user_metadata) FROM stdin;
\.


--
-- Data for Name: s3_multipart_uploads_parts; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY storage.s3_multipart_uploads_parts (id, upload_id, size, part_number, bucket_id, key, etag, owner_id, version, created_at) FROM stdin;
\.


--
-- Data for Name: secrets; Type: TABLE DATA; Schema: vault; Owner: supabase_admin
--

COPY vault.secrets (id, name, description, secret, key_id, nonce, created_at, updated_at) FROM stdin;
\.


--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE SET; Schema: auth; Owner: supabase_auth_admin
--

SELECT pg_catalog.setval('auth.refresh_tokens_id_seq', 217, true);


--
-- Name: subscription_id_seq; Type: SEQUENCE SET; Schema: realtime; Owner: supabase_admin
--

SELECT pg_catalog.setval('realtime.subscription_id_seq', 1, false);


--
-- Name: mfa_amr_claims amr_id_pk; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_amr_claims
    ADD CONSTRAINT amr_id_pk PRIMARY KEY (id);


--
-- Name: audit_log_entries audit_log_entries_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.audit_log_entries
    ADD CONSTRAINT audit_log_entries_pkey PRIMARY KEY (id);


--
-- Name: flow_state flow_state_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.flow_state
    ADD CONSTRAINT flow_state_pkey PRIMARY KEY (id);


--
-- Name: identities identities_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.identities
    ADD CONSTRAINT identities_pkey PRIMARY KEY (id);


--
-- Name: identities identities_provider_id_provider_unique; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.identities
    ADD CONSTRAINT identities_provider_id_provider_unique UNIQUE (provider_id, provider);


--
-- Name: instances instances_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.instances
    ADD CONSTRAINT instances_pkey PRIMARY KEY (id);


--
-- Name: mfa_amr_claims mfa_amr_claims_session_id_authentication_method_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_amr_claims
    ADD CONSTRAINT mfa_amr_claims_session_id_authentication_method_pkey UNIQUE (session_id, authentication_method);


--
-- Name: mfa_challenges mfa_challenges_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_challenges
    ADD CONSTRAINT mfa_challenges_pkey PRIMARY KEY (id);


--
-- Name: mfa_factors mfa_factors_last_challenged_at_key; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_factors
    ADD CONSTRAINT mfa_factors_last_challenged_at_key UNIQUE (last_challenged_at);


--
-- Name: mfa_factors mfa_factors_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_factors
    ADD CONSTRAINT mfa_factors_pkey PRIMARY KEY (id);


--
-- Name: one_time_tokens one_time_tokens_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.one_time_tokens
    ADD CONSTRAINT one_time_tokens_pkey PRIMARY KEY (id);


--
-- Name: refresh_tokens refresh_tokens_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.refresh_tokens
    ADD CONSTRAINT refresh_tokens_pkey PRIMARY KEY (id);


--
-- Name: refresh_tokens refresh_tokens_token_unique; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.refresh_tokens
    ADD CONSTRAINT refresh_tokens_token_unique UNIQUE (token);


--
-- Name: saml_providers saml_providers_entity_id_key; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.saml_providers
    ADD CONSTRAINT saml_providers_entity_id_key UNIQUE (entity_id);


--
-- Name: saml_providers saml_providers_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.saml_providers
    ADD CONSTRAINT saml_providers_pkey PRIMARY KEY (id);


--
-- Name: saml_relay_states saml_relay_states_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.saml_relay_states
    ADD CONSTRAINT saml_relay_states_pkey PRIMARY KEY (id);


--
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);


--
-- Name: sessions sessions_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (id);


--
-- Name: sso_domains sso_domains_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.sso_domains
    ADD CONSTRAINT sso_domains_pkey PRIMARY KEY (id);


--
-- Name: sso_providers sso_providers_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.sso_providers
    ADD CONSTRAINT sso_providers_pkey PRIMARY KEY (id);


--
-- Name: users users_phone_key; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.users
    ADD CONSTRAINT users_phone_key UNIQUE (phone);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: assets assets_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.assets
    ADD CONSTRAINT assets_pkey PRIMARY KEY (id);


--
-- Name: bills bills_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bills
    ADD CONSTRAINT bills_pkey PRIMARY KEY (id);


--
-- Name: budgets budgets_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.budgets
    ADD CONSTRAINT budgets_pkey PRIMARY KEY (id);


--
-- Name: budgets budgets_user_id_month_item_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.budgets
    ADD CONSTRAINT budgets_user_id_month_item_id_key UNIQUE (user_id, month, item_id);


--
-- Name: debts debts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.debts
    ADD CONSTRAINT debts_pkey PRIMARY KEY (id);


--
-- Name: income income_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.income
    ADD CONSTRAINT income_pkey PRIMARY KEY (id);


--
-- Name: investments investments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.investments
    ADD CONSTRAINT investments_pkey PRIMARY KEY (id);


--
-- Name: settings settings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.settings
    ADD CONSTRAINT settings_pkey PRIMARY KEY (user_id);


--
-- Name: snapshots snapshots_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.snapshots
    ADD CONSTRAINT snapshots_pkey PRIMARY KEY (user_id, date);


--
-- Name: messages messages_pkey; Type: CONSTRAINT; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER TABLE ONLY realtime.messages
    ADD CONSTRAINT messages_pkey PRIMARY KEY (id, inserted_at);


--
-- Name: subscription pk_subscription; Type: CONSTRAINT; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE ONLY realtime.subscription
    ADD CONSTRAINT pk_subscription PRIMARY KEY (id);


--
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE ONLY realtime.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);


--
-- Name: buckets buckets_pkey; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.buckets
    ADD CONSTRAINT buckets_pkey PRIMARY KEY (id);


--
-- Name: migrations migrations_name_key; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.migrations
    ADD CONSTRAINT migrations_name_key UNIQUE (name);


--
-- Name: migrations migrations_pkey; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.migrations
    ADD CONSTRAINT migrations_pkey PRIMARY KEY (id);


--
-- Name: objects objects_pkey; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.objects
    ADD CONSTRAINT objects_pkey PRIMARY KEY (id);


--
-- Name: s3_multipart_uploads_parts s3_multipart_uploads_parts_pkey; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.s3_multipart_uploads_parts
    ADD CONSTRAINT s3_multipart_uploads_parts_pkey PRIMARY KEY (id);


--
-- Name: s3_multipart_uploads s3_multipart_uploads_pkey; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.s3_multipart_uploads
    ADD CONSTRAINT s3_multipart_uploads_pkey PRIMARY KEY (id);


--
-- Name: audit_logs_instance_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX audit_logs_instance_id_idx ON auth.audit_log_entries USING btree (instance_id);


--
-- Name: confirmation_token_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX confirmation_token_idx ON auth.users USING btree (confirmation_token) WHERE ((confirmation_token)::text !~ '^[0-9 ]*$'::text);


--
-- Name: email_change_token_current_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX email_change_token_current_idx ON auth.users USING btree (email_change_token_current) WHERE ((email_change_token_current)::text !~ '^[0-9 ]*$'::text);


--
-- Name: email_change_token_new_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX email_change_token_new_idx ON auth.users USING btree (email_change_token_new) WHERE ((email_change_token_new)::text !~ '^[0-9 ]*$'::text);


--
-- Name: factor_id_created_at_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX factor_id_created_at_idx ON auth.mfa_factors USING btree (user_id, created_at);


--
-- Name: flow_state_created_at_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX flow_state_created_at_idx ON auth.flow_state USING btree (created_at DESC);


--
-- Name: identities_email_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX identities_email_idx ON auth.identities USING btree (email text_pattern_ops);


--
-- Name: INDEX identities_email_idx; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON INDEX auth.identities_email_idx IS 'Auth: Ensures indexed queries on the email column';


--
-- Name: identities_user_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX identities_user_id_idx ON auth.identities USING btree (user_id);


--
-- Name: idx_auth_code; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX idx_auth_code ON auth.flow_state USING btree (auth_code);


--
-- Name: idx_user_id_auth_method; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX idx_user_id_auth_method ON auth.flow_state USING btree (user_id, authentication_method);


--
-- Name: mfa_challenge_created_at_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX mfa_challenge_created_at_idx ON auth.mfa_challenges USING btree (created_at DESC);


--
-- Name: mfa_factors_user_friendly_name_unique; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX mfa_factors_user_friendly_name_unique ON auth.mfa_factors USING btree (friendly_name, user_id) WHERE (TRIM(BOTH FROM friendly_name) <> ''::text);


--
-- Name: mfa_factors_user_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX mfa_factors_user_id_idx ON auth.mfa_factors USING btree (user_id);


--
-- Name: one_time_tokens_relates_to_hash_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX one_time_tokens_relates_to_hash_idx ON auth.one_time_tokens USING hash (relates_to);


--
-- Name: one_time_tokens_token_hash_hash_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX one_time_tokens_token_hash_hash_idx ON auth.one_time_tokens USING hash (token_hash);


--
-- Name: one_time_tokens_user_id_token_type_key; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX one_time_tokens_user_id_token_type_key ON auth.one_time_tokens USING btree (user_id, token_type);


--
-- Name: reauthentication_token_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX reauthentication_token_idx ON auth.users USING btree (reauthentication_token) WHERE ((reauthentication_token)::text !~ '^[0-9 ]*$'::text);


--
-- Name: recovery_token_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX recovery_token_idx ON auth.users USING btree (recovery_token) WHERE ((recovery_token)::text !~ '^[0-9 ]*$'::text);


--
-- Name: refresh_tokens_instance_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX refresh_tokens_instance_id_idx ON auth.refresh_tokens USING btree (instance_id);


--
-- Name: refresh_tokens_instance_id_user_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX refresh_tokens_instance_id_user_id_idx ON auth.refresh_tokens USING btree (instance_id, user_id);


--
-- Name: refresh_tokens_parent_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX refresh_tokens_parent_idx ON auth.refresh_tokens USING btree (parent);


--
-- Name: refresh_tokens_session_id_revoked_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX refresh_tokens_session_id_revoked_idx ON auth.refresh_tokens USING btree (session_id, revoked);


--
-- Name: refresh_tokens_updated_at_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX refresh_tokens_updated_at_idx ON auth.refresh_tokens USING btree (updated_at DESC);


--
-- Name: saml_providers_sso_provider_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX saml_providers_sso_provider_id_idx ON auth.saml_providers USING btree (sso_provider_id);


--
-- Name: saml_relay_states_created_at_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX saml_relay_states_created_at_idx ON auth.saml_relay_states USING btree (created_at DESC);


--
-- Name: saml_relay_states_for_email_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX saml_relay_states_for_email_idx ON auth.saml_relay_states USING btree (for_email);


--
-- Name: saml_relay_states_sso_provider_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX saml_relay_states_sso_provider_id_idx ON auth.saml_relay_states USING btree (sso_provider_id);


--
-- Name: sessions_not_after_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX sessions_not_after_idx ON auth.sessions USING btree (not_after DESC);


--
-- Name: sessions_user_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX sessions_user_id_idx ON auth.sessions USING btree (user_id);


--
-- Name: sso_domains_domain_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX sso_domains_domain_idx ON auth.sso_domains USING btree (lower(domain));


--
-- Name: sso_domains_sso_provider_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX sso_domains_sso_provider_id_idx ON auth.sso_domains USING btree (sso_provider_id);


--
-- Name: sso_providers_resource_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX sso_providers_resource_id_idx ON auth.sso_providers USING btree (lower(resource_id));


--
-- Name: unique_phone_factor_per_user; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX unique_phone_factor_per_user ON auth.mfa_factors USING btree (user_id, phone);


--
-- Name: user_id_created_at_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX user_id_created_at_idx ON auth.sessions USING btree (user_id, created_at);


--
-- Name: users_email_partial_key; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX users_email_partial_key ON auth.users USING btree (email) WHERE (is_sso_user = false);


--
-- Name: INDEX users_email_partial_key; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON INDEX auth.users_email_partial_key IS 'Auth: A partial unique index that applies only when is_sso_user is false';


--
-- Name: users_instance_id_email_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX users_instance_id_email_idx ON auth.users USING btree (instance_id, lower((email)::text));


--
-- Name: users_instance_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX users_instance_id_idx ON auth.users USING btree (instance_id);


--
-- Name: users_is_anonymous_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX users_is_anonymous_idx ON auth.users USING btree (is_anonymous);


--
-- Name: ix_realtime_subscription_entity; Type: INDEX; Schema: realtime; Owner: supabase_admin
--

CREATE INDEX ix_realtime_subscription_entity ON realtime.subscription USING btree (entity);


--
-- Name: subscription_subscription_id_entity_filters_key; Type: INDEX; Schema: realtime; Owner: supabase_admin
--

CREATE UNIQUE INDEX subscription_subscription_id_entity_filters_key ON realtime.subscription USING btree (subscription_id, entity, filters);


--
-- Name: bname; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE UNIQUE INDEX bname ON storage.buckets USING btree (name);


--
-- Name: bucketid_objname; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE UNIQUE INDEX bucketid_objname ON storage.objects USING btree (bucket_id, name);


--
-- Name: idx_multipart_uploads_list; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE INDEX idx_multipart_uploads_list ON storage.s3_multipart_uploads USING btree (bucket_id, key, created_at);


--
-- Name: idx_objects_bucket_id_name; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE INDEX idx_objects_bucket_id_name ON storage.objects USING btree (bucket_id, name COLLATE "C");


--
-- Name: name_prefix_search; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE INDEX name_prefix_search ON storage.objects USING btree (name text_pattern_ops);


--
-- Name: subscription tr_check_filters; Type: TRIGGER; Schema: realtime; Owner: supabase_admin
--

CREATE TRIGGER tr_check_filters BEFORE INSERT OR UPDATE ON realtime.subscription FOR EACH ROW EXECUTE FUNCTION realtime.subscription_check_filters();


--
-- Name: objects update_objects_updated_at; Type: TRIGGER; Schema: storage; Owner: supabase_storage_admin
--

CREATE TRIGGER update_objects_updated_at BEFORE UPDATE ON storage.objects FOR EACH ROW EXECUTE FUNCTION storage.update_updated_at_column();


--
-- Name: identities identities_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.identities
    ADD CONSTRAINT identities_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: mfa_amr_claims mfa_amr_claims_session_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_amr_claims
    ADD CONSTRAINT mfa_amr_claims_session_id_fkey FOREIGN KEY (session_id) REFERENCES auth.sessions(id) ON DELETE CASCADE;


--
-- Name: mfa_challenges mfa_challenges_auth_factor_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_challenges
    ADD CONSTRAINT mfa_challenges_auth_factor_id_fkey FOREIGN KEY (factor_id) REFERENCES auth.mfa_factors(id) ON DELETE CASCADE;


--
-- Name: mfa_factors mfa_factors_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_factors
    ADD CONSTRAINT mfa_factors_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: one_time_tokens one_time_tokens_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.one_time_tokens
    ADD CONSTRAINT one_time_tokens_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: refresh_tokens refresh_tokens_session_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.refresh_tokens
    ADD CONSTRAINT refresh_tokens_session_id_fkey FOREIGN KEY (session_id) REFERENCES auth.sessions(id) ON DELETE CASCADE;


--
-- Name: saml_providers saml_providers_sso_provider_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.saml_providers
    ADD CONSTRAINT saml_providers_sso_provider_id_fkey FOREIGN KEY (sso_provider_id) REFERENCES auth.sso_providers(id) ON DELETE CASCADE;


--
-- Name: saml_relay_states saml_relay_states_flow_state_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.saml_relay_states
    ADD CONSTRAINT saml_relay_states_flow_state_id_fkey FOREIGN KEY (flow_state_id) REFERENCES auth.flow_state(id) ON DELETE CASCADE;


--
-- Name: saml_relay_states saml_relay_states_sso_provider_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.saml_relay_states
    ADD CONSTRAINT saml_relay_states_sso_provider_id_fkey FOREIGN KEY (sso_provider_id) REFERENCES auth.sso_providers(id) ON DELETE CASCADE;


--
-- Name: sessions sessions_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.sessions
    ADD CONSTRAINT sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: sso_domains sso_domains_sso_provider_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.sso_domains
    ADD CONSTRAINT sso_domains_sso_provider_id_fkey FOREIGN KEY (sso_provider_id) REFERENCES auth.sso_providers(id) ON DELETE CASCADE;


--
-- Name: assets assets_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.assets
    ADD CONSTRAINT assets_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: bills bills_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bills
    ADD CONSTRAINT bills_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: budgets budgets_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.budgets
    ADD CONSTRAINT budgets_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: debts debts_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.debts
    ADD CONSTRAINT debts_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: income income_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.income
    ADD CONSTRAINT income_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: investments investments_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.investments
    ADD CONSTRAINT investments_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: settings settings_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.settings
    ADD CONSTRAINT settings_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: snapshots snapshots_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.snapshots
    ADD CONSTRAINT snapshots_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: objects objects_bucketId_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.objects
    ADD CONSTRAINT "objects_bucketId_fkey" FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id);


--
-- Name: s3_multipart_uploads s3_multipart_uploads_bucket_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.s3_multipart_uploads
    ADD CONSTRAINT s3_multipart_uploads_bucket_id_fkey FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id);


--
-- Name: s3_multipart_uploads_parts s3_multipart_uploads_parts_bucket_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.s3_multipart_uploads_parts
    ADD CONSTRAINT s3_multipart_uploads_parts_bucket_id_fkey FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id);


--
-- Name: s3_multipart_uploads_parts s3_multipart_uploads_parts_upload_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.s3_multipart_uploads_parts
    ADD CONSTRAINT s3_multipart_uploads_parts_upload_id_fkey FOREIGN KEY (upload_id) REFERENCES storage.s3_multipart_uploads(id) ON DELETE CASCADE;


--
-- Name: audit_log_entries; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.audit_log_entries ENABLE ROW LEVEL SECURITY;

--
-- Name: flow_state; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.flow_state ENABLE ROW LEVEL SECURITY;

--
-- Name: identities; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.identities ENABLE ROW LEVEL SECURITY;

--
-- Name: instances; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.instances ENABLE ROW LEVEL SECURITY;

--
-- Name: mfa_amr_claims; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.mfa_amr_claims ENABLE ROW LEVEL SECURITY;

--
-- Name: mfa_challenges; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.mfa_challenges ENABLE ROW LEVEL SECURITY;

--
-- Name: mfa_factors; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.mfa_factors ENABLE ROW LEVEL SECURITY;

--
-- Name: one_time_tokens; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.one_time_tokens ENABLE ROW LEVEL SECURITY;

--
-- Name: refresh_tokens; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.refresh_tokens ENABLE ROW LEVEL SECURITY;

--
-- Name: saml_providers; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.saml_providers ENABLE ROW LEVEL SECURITY;

--
-- Name: saml_relay_states; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.saml_relay_states ENABLE ROW LEVEL SECURITY;

--
-- Name: schema_migrations; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.schema_migrations ENABLE ROW LEVEL SECURITY;

--
-- Name: sessions; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.sessions ENABLE ROW LEVEL SECURITY;

--
-- Name: sso_domains; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.sso_domains ENABLE ROW LEVEL SECURITY;

--
-- Name: sso_providers; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.sso_providers ENABLE ROW LEVEL SECURITY;

--
-- Name: users; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

--
-- Name: assets Enable all access for users based on user_id; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Enable all access for users based on user_id" ON public.assets USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));


--
-- Name: bills Enable all access for users based on user_id; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Enable all access for users based on user_id" ON public.bills USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));


--
-- Name: budgets Enable all access for users based on user_id; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Enable all access for users based on user_id" ON public.budgets USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));


--
-- Name: debts Enable all access for users based on user_id; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Enable all access for users based on user_id" ON public.debts USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));


--
-- Name: income Enable all access for users based on user_id; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Enable all access for users based on user_id" ON public.income USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));


--
-- Name: investments Enable all access for users based on user_id; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Enable all access for users based on user_id" ON public.investments USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));


--
-- Name: settings Enable all access for users based on user_id; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Enable all access for users based on user_id" ON public.settings USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));


--
-- Name: snapshots Enable all access for users based on user_id; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Enable all access for users based on user_id" ON public.snapshots USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));


--
-- Name: assets; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;

--
-- Name: bills; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.bills ENABLE ROW LEVEL SECURITY;

--
-- Name: budgets; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;

--
-- Name: debts; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.debts ENABLE ROW LEVEL SECURITY;

--
-- Name: income; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.income ENABLE ROW LEVEL SECURITY;

--
-- Name: investments; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.investments ENABLE ROW LEVEL SECURITY;

--
-- Name: settings; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

--
-- Name: snapshots; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.snapshots ENABLE ROW LEVEL SECURITY;

--
-- Name: messages; Type: ROW SECURITY; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER TABLE realtime.messages ENABLE ROW LEVEL SECURITY;

--
-- Name: buckets; Type: ROW SECURITY; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE storage.buckets ENABLE ROW LEVEL SECURITY;

--
-- Name: migrations; Type: ROW SECURITY; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE storage.migrations ENABLE ROW LEVEL SECURITY;

--
-- Name: objects; Type: ROW SECURITY; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

--
-- Name: s3_multipart_uploads; Type: ROW SECURITY; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE storage.s3_multipart_uploads ENABLE ROW LEVEL SECURITY;

--
-- Name: s3_multipart_uploads_parts; Type: ROW SECURITY; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE storage.s3_multipart_uploads_parts ENABLE ROW LEVEL SECURITY;

--
-- Name: supabase_realtime; Type: PUBLICATION; Schema: -; Owner: postgres
--

CREATE PUBLICATION supabase_realtime WITH (publish = 'insert, update, delete, truncate');


ALTER PUBLICATION supabase_realtime OWNER TO postgres;

--
-- Name: SCHEMA auth; Type: ACL; Schema: -; Owner: supabase_admin
--

GRANT USAGE ON SCHEMA auth TO anon;
GRANT USAGE ON SCHEMA auth TO authenticated;
GRANT USAGE ON SCHEMA auth TO service_role;
GRANT ALL ON SCHEMA auth TO supabase_auth_admin;
GRANT ALL ON SCHEMA auth TO dashboard_user;
GRANT USAGE ON SCHEMA auth TO postgres;


--
-- Name: SCHEMA extensions; Type: ACL; Schema: -; Owner: postgres
--

GRANT USAGE ON SCHEMA extensions TO anon;
GRANT USAGE ON SCHEMA extensions TO authenticated;
GRANT USAGE ON SCHEMA extensions TO service_role;
GRANT ALL ON SCHEMA extensions TO dashboard_user;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: pg_database_owner
--

GRANT USAGE ON SCHEMA public TO postgres;
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO service_role;


--
-- Name: SCHEMA realtime; Type: ACL; Schema: -; Owner: supabase_admin
--

GRANT USAGE ON SCHEMA realtime TO postgres;
GRANT USAGE ON SCHEMA realtime TO anon;
GRANT USAGE ON SCHEMA realtime TO authenticated;
GRANT USAGE ON SCHEMA realtime TO service_role;
GRANT ALL ON SCHEMA realtime TO supabase_realtime_admin;


--
-- Name: SCHEMA storage; Type: ACL; Schema: -; Owner: supabase_admin
--

GRANT USAGE ON SCHEMA storage TO postgres;
GRANT USAGE ON SCHEMA storage TO anon;
GRANT USAGE ON SCHEMA storage TO authenticated;
GRANT USAGE ON SCHEMA storage TO service_role;
GRANT ALL ON SCHEMA storage TO supabase_storage_admin;
GRANT ALL ON SCHEMA storage TO dashboard_user;


--
-- Name: SCHEMA vault; Type: ACL; Schema: -; Owner: supabase_admin
--

GRANT USAGE ON SCHEMA vault TO postgres WITH GRANT OPTION;
GRANT USAGE ON SCHEMA vault TO service_role;


--
-- Name: FUNCTION email(); Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON FUNCTION auth.email() TO dashboard_user;


--
-- Name: FUNCTION jwt(); Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON FUNCTION auth.jwt() TO postgres;
GRANT ALL ON FUNCTION auth.jwt() TO dashboard_user;


--
-- Name: FUNCTION role(); Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON FUNCTION auth.role() TO dashboard_user;


--
-- Name: FUNCTION uid(); Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON FUNCTION auth.uid() TO dashboard_user;


--
-- Name: FUNCTION armor(bytea); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.armor(bytea) FROM postgres;
GRANT ALL ON FUNCTION extensions.armor(bytea) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.armor(bytea) TO dashboard_user;


--
-- Name: FUNCTION armor(bytea, text[], text[]); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.armor(bytea, text[], text[]) FROM postgres;
GRANT ALL ON FUNCTION extensions.armor(bytea, text[], text[]) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.armor(bytea, text[], text[]) TO dashboard_user;


--
-- Name: FUNCTION crypt(text, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.crypt(text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.crypt(text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.crypt(text, text) TO dashboard_user;


--
-- Name: FUNCTION dearmor(text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.dearmor(text) FROM postgres;
GRANT ALL ON FUNCTION extensions.dearmor(text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.dearmor(text) TO dashboard_user;


--
-- Name: FUNCTION decrypt(bytea, bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.decrypt(bytea, bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.decrypt(bytea, bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.decrypt(bytea, bytea, text) TO dashboard_user;


--
-- Name: FUNCTION decrypt_iv(bytea, bytea, bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.decrypt_iv(bytea, bytea, bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.decrypt_iv(bytea, bytea, bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.decrypt_iv(bytea, bytea, bytea, text) TO dashboard_user;


--
-- Name: FUNCTION digest(bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.digest(bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.digest(bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.digest(bytea, text) TO dashboard_user;


--
-- Name: FUNCTION digest(text, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.digest(text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.digest(text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.digest(text, text) TO dashboard_user;


--
-- Name: FUNCTION encrypt(bytea, bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.encrypt(bytea, bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.encrypt(bytea, bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.encrypt(bytea, bytea, text) TO dashboard_user;


--
-- Name: FUNCTION encrypt_iv(bytea, bytea, bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.encrypt_iv(bytea, bytea, bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.encrypt_iv(bytea, bytea, bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.encrypt_iv(bytea, bytea, bytea, text) TO dashboard_user;


--
-- Name: FUNCTION gen_random_bytes(integer); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.gen_random_bytes(integer) FROM postgres;
GRANT ALL ON FUNCTION extensions.gen_random_bytes(integer) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.gen_random_bytes(integer) TO dashboard_user;


--
-- Name: FUNCTION gen_random_uuid(); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.gen_random_uuid() FROM postgres;
GRANT ALL ON FUNCTION extensions.gen_random_uuid() TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.gen_random_uuid() TO dashboard_user;


--
-- Name: FUNCTION gen_salt(text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.gen_salt(text) FROM postgres;
GRANT ALL ON FUNCTION extensions.gen_salt(text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.gen_salt(text) TO dashboard_user;


--
-- Name: FUNCTION gen_salt(text, integer); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.gen_salt(text, integer) FROM postgres;
GRANT ALL ON FUNCTION extensions.gen_salt(text, integer) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.gen_salt(text, integer) TO dashboard_user;


--
-- Name: FUNCTION grant_pg_cron_access(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

REVOKE ALL ON FUNCTION extensions.grant_pg_cron_access() FROM supabase_admin;
GRANT ALL ON FUNCTION extensions.grant_pg_cron_access() TO supabase_admin WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.grant_pg_cron_access() TO dashboard_user;


--
-- Name: FUNCTION grant_pg_graphql_access(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.grant_pg_graphql_access() TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION grant_pg_net_access(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

REVOKE ALL ON FUNCTION extensions.grant_pg_net_access() FROM supabase_admin;
GRANT ALL ON FUNCTION extensions.grant_pg_net_access() TO supabase_admin WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.grant_pg_net_access() TO dashboard_user;


--
-- Name: FUNCTION hmac(bytea, bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.hmac(bytea, bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.hmac(bytea, bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.hmac(bytea, bytea, text) TO dashboard_user;


--
-- Name: FUNCTION hmac(text, text, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.hmac(text, text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.hmac(text, text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.hmac(text, text, text) TO dashboard_user;


--
-- Name: FUNCTION pg_stat_statements(showtext boolean, OUT userid oid, OUT dbid oid, OUT toplevel boolean, OUT queryid bigint, OUT query text, OUT plans bigint, OUT total_plan_time double precision, OUT min_plan_time double precision, OUT max_plan_time double precision, OUT mean_plan_time double precision, OUT stddev_plan_time double precision, OUT calls bigint, OUT total_exec_time double precision, OUT min_exec_time double precision, OUT max_exec_time double precision, OUT mean_exec_time double precision, OUT stddev_exec_time double precision, OUT rows bigint, OUT shared_blks_hit bigint, OUT shared_blks_read bigint, OUT shared_blks_dirtied bigint, OUT shared_blks_written bigint, OUT local_blks_hit bigint, OUT local_blks_read bigint, OUT local_blks_dirtied bigint, OUT local_blks_written bigint, OUT temp_blks_read bigint, OUT temp_blks_written bigint, OUT shared_blk_read_time double precision, OUT shared_blk_write_time double precision, OUT local_blk_read_time double precision, OUT local_blk_write_time double precision, OUT temp_blk_read_time double precision, OUT temp_blk_write_time double precision, OUT wal_records bigint, OUT wal_fpi bigint, OUT wal_bytes numeric, OUT jit_functions bigint, OUT jit_generation_time double precision, OUT jit_inlining_count bigint, OUT jit_inlining_time double precision, OUT jit_optimization_count bigint, OUT jit_optimization_time double precision, OUT jit_emission_count bigint, OUT jit_emission_time double precision, OUT jit_deform_count bigint, OUT jit_deform_time double precision, OUT stats_since timestamp with time zone, OUT minmax_stats_since timestamp with time zone); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pg_stat_statements(showtext boolean, OUT userid oid, OUT dbid oid, OUT toplevel boolean, OUT queryid bigint, OUT query text, OUT plans bigint, OUT total_plan_time double precision, OUT min_plan_time double precision, OUT max_plan_time double precision, OUT mean_plan_time double precision, OUT stddev_plan_time double precision, OUT calls bigint, OUT total_exec_time double precision, OUT min_exec_time double precision, OUT max_exec_time double precision, OUT mean_exec_time double precision, OUT stddev_exec_time double precision, OUT rows bigint, OUT shared_blks_hit bigint, OUT shared_blks_read bigint, OUT shared_blks_dirtied bigint, OUT shared_blks_written bigint, OUT local_blks_hit bigint, OUT local_blks_read bigint, OUT local_blks_dirtied bigint, OUT local_blks_written bigint, OUT temp_blks_read bigint, OUT temp_blks_written bigint, OUT shared_blk_read_time double precision, OUT shared_blk_write_time double precision, OUT local_blk_read_time double precision, OUT local_blk_write_time double precision, OUT temp_blk_read_time double precision, OUT temp_blk_write_time double precision, OUT wal_records bigint, OUT wal_fpi bigint, OUT wal_bytes numeric, OUT jit_functions bigint, OUT jit_generation_time double precision, OUT jit_inlining_count bigint, OUT jit_inlining_time double precision, OUT jit_optimization_count bigint, OUT jit_optimization_time double precision, OUT jit_emission_count bigint, OUT jit_emission_time double precision, OUT jit_deform_count bigint, OUT jit_deform_time double precision, OUT stats_since timestamp with time zone, OUT minmax_stats_since timestamp with time zone) FROM postgres;
GRANT ALL ON FUNCTION extensions.pg_stat_statements(showtext boolean, OUT userid oid, OUT dbid oid, OUT toplevel boolean, OUT queryid bigint, OUT query text, OUT plans bigint, OUT total_plan_time double precision, OUT min_plan_time double precision, OUT max_plan_time double precision, OUT mean_plan_time double precision, OUT stddev_plan_time double precision, OUT calls bigint, OUT total_exec_time double precision, OUT min_exec_time double precision, OUT max_exec_time double precision, OUT mean_exec_time double precision, OUT stddev_exec_time double precision, OUT rows bigint, OUT shared_blks_hit bigint, OUT shared_blks_read bigint, OUT shared_blks_dirtied bigint, OUT shared_blks_written bigint, OUT local_blks_hit bigint, OUT local_blks_read bigint, OUT local_blks_dirtied bigint, OUT local_blks_written bigint, OUT temp_blks_read bigint, OUT temp_blks_written bigint, OUT shared_blk_read_time double precision, OUT shared_blk_write_time double precision, OUT local_blk_read_time double precision, OUT local_blk_write_time double precision, OUT temp_blk_read_time double precision, OUT temp_blk_write_time double precision, OUT wal_records bigint, OUT wal_fpi bigint, OUT wal_bytes numeric, OUT jit_functions bigint, OUT jit_generation_time double precision, OUT jit_inlining_count bigint, OUT jit_inlining_time double precision, OUT jit_optimization_count bigint, OUT jit_optimization_time double precision, OUT jit_emission_count bigint, OUT jit_emission_time double precision, OUT jit_deform_count bigint, OUT jit_deform_time double precision, OUT stats_since timestamp with time zone, OUT minmax_stats_since timestamp with time zone) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pg_stat_statements(showtext boolean, OUT userid oid, OUT dbid oid, OUT toplevel boolean, OUT queryid bigint, OUT query text, OUT plans bigint, OUT total_plan_time double precision, OUT min_plan_time double precision, OUT max_plan_time double precision, OUT mean_plan_time double precision, OUT stddev_plan_time double precision, OUT calls bigint, OUT total_exec_time double precision, OUT min_exec_time double precision, OUT max_exec_time double precision, OUT mean_exec_time double precision, OUT stddev_exec_time double precision, OUT rows bigint, OUT shared_blks_hit bigint, OUT shared_blks_read bigint, OUT shared_blks_dirtied bigint, OUT shared_blks_written bigint, OUT local_blks_hit bigint, OUT local_blks_read bigint, OUT local_blks_dirtied bigint, OUT local_blks_written bigint, OUT temp_blks_read bigint, OUT temp_blks_written bigint, OUT shared_blk_read_time double precision, OUT shared_blk_write_time double precision, OUT local_blk_read_time double precision, OUT local_blk_write_time double precision, OUT temp_blk_read_time double precision, OUT temp_blk_write_time double precision, OUT wal_records bigint, OUT wal_fpi bigint, OUT wal_bytes numeric, OUT jit_functions bigint, OUT jit_generation_time double precision, OUT jit_inlining_count bigint, OUT jit_inlining_time double precision, OUT jit_optimization_count bigint, OUT jit_optimization_time double precision, OUT jit_emission_count bigint, OUT jit_emission_time double precision, OUT jit_deform_count bigint, OUT jit_deform_time double precision, OUT stats_since timestamp with time zone, OUT minmax_stats_since timestamp with time zone) TO dashboard_user;


--
-- Name: FUNCTION pg_stat_statements_info(OUT dealloc bigint, OUT stats_reset timestamp with time zone); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pg_stat_statements_info(OUT dealloc bigint, OUT stats_reset timestamp with time zone) FROM postgres;
GRANT ALL ON FUNCTION extensions.pg_stat_statements_info(OUT dealloc bigint, OUT stats_reset timestamp with time zone) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pg_stat_statements_info(OUT dealloc bigint, OUT stats_reset timestamp with time zone) TO dashboard_user;


--
-- Name: FUNCTION pg_stat_statements_reset(userid oid, dbid oid, queryid bigint, minmax_only boolean); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pg_stat_statements_reset(userid oid, dbid oid, queryid bigint, minmax_only boolean) FROM postgres;
GRANT ALL ON FUNCTION extensions.pg_stat_statements_reset(userid oid, dbid oid, queryid bigint, minmax_only boolean) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pg_stat_statements_reset(userid oid, dbid oid, queryid bigint, minmax_only boolean) TO dashboard_user;


--
-- Name: FUNCTION pgp_armor_headers(text, OUT key text, OUT value text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_armor_headers(text, OUT key text, OUT value text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_armor_headers(text, OUT key text, OUT value text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_armor_headers(text, OUT key text, OUT value text) TO dashboard_user;


--
-- Name: FUNCTION pgp_key_id(bytea); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_key_id(bytea) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_key_id(bytea) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_key_id(bytea) TO dashboard_user;


--
-- Name: FUNCTION pgp_pub_decrypt(bytea, bytea); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea) TO dashboard_user;


--
-- Name: FUNCTION pgp_pub_decrypt(bytea, bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_pub_decrypt(bytea, bytea, text, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea, text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea, text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea, text, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_pub_decrypt_bytea(bytea, bytea); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea) TO dashboard_user;


--
-- Name: FUNCTION pgp_pub_decrypt_bytea(bytea, bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_pub_decrypt_bytea(bytea, bytea, text, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea, text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea, text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea, text, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_pub_encrypt(text, bytea); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_encrypt(text, bytea) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt(text, bytea) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt(text, bytea) TO dashboard_user;


--
-- Name: FUNCTION pgp_pub_encrypt(text, bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_encrypt(text, bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt(text, bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt(text, bytea, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_pub_encrypt_bytea(bytea, bytea); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_encrypt_bytea(bytea, bytea) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt_bytea(bytea, bytea) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt_bytea(bytea, bytea) TO dashboard_user;


--
-- Name: FUNCTION pgp_pub_encrypt_bytea(bytea, bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_encrypt_bytea(bytea, bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt_bytea(bytea, bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt_bytea(bytea, bytea, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_sym_decrypt(bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_sym_decrypt(bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt(bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt(bytea, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_sym_decrypt(bytea, text, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_sym_decrypt(bytea, text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt(bytea, text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt(bytea, text, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_sym_decrypt_bytea(bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_sym_decrypt_bytea(bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt_bytea(bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt_bytea(bytea, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_sym_decrypt_bytea(bytea, text, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_sym_decrypt_bytea(bytea, text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt_bytea(bytea, text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt_bytea(bytea, text, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_sym_encrypt(text, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_sym_encrypt(text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt(text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt(text, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_sym_encrypt(text, text, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_sym_encrypt(text, text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt(text, text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt(text, text, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_sym_encrypt_bytea(bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_sym_encrypt_bytea(bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt_bytea(bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt_bytea(bytea, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_sym_encrypt_bytea(bytea, text, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_sym_encrypt_bytea(bytea, text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt_bytea(bytea, text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt_bytea(bytea, text, text) TO dashboard_user;


--
-- Name: FUNCTION pgrst_ddl_watch(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgrst_ddl_watch() TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION pgrst_drop_watch(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgrst_drop_watch() TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION set_graphql_placeholder(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.set_graphql_placeholder() TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION uuid_generate_v1(); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.uuid_generate_v1() FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_generate_v1() TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_generate_v1() TO dashboard_user;


--
-- Name: FUNCTION uuid_generate_v1mc(); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.uuid_generate_v1mc() FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_generate_v1mc() TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_generate_v1mc() TO dashboard_user;


--
-- Name: FUNCTION uuid_generate_v3(namespace uuid, name text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.uuid_generate_v3(namespace uuid, name text) FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_generate_v3(namespace uuid, name text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_generate_v3(namespace uuid, name text) TO dashboard_user;


--
-- Name: FUNCTION uuid_generate_v4(); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.uuid_generate_v4() FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_generate_v4() TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_generate_v4() TO dashboard_user;


--
-- Name: FUNCTION uuid_generate_v5(namespace uuid, name text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.uuid_generate_v5(namespace uuid, name text) FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_generate_v5(namespace uuid, name text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_generate_v5(namespace uuid, name text) TO dashboard_user;


--
-- Name: FUNCTION uuid_nil(); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.uuid_nil() FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_nil() TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_nil() TO dashboard_user;


--
-- Name: FUNCTION uuid_ns_dns(); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.uuid_ns_dns() FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_ns_dns() TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_ns_dns() TO dashboard_user;


--
-- Name: FUNCTION uuid_ns_oid(); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.uuid_ns_oid() FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_ns_oid() TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_ns_oid() TO dashboard_user;


--
-- Name: FUNCTION uuid_ns_url(); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.uuid_ns_url() FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_ns_url() TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_ns_url() TO dashboard_user;


--
-- Name: FUNCTION uuid_ns_x500(); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.uuid_ns_x500() FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_ns_x500() TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_ns_x500() TO dashboard_user;


--
-- Name: FUNCTION graphql("operationName" text, query text, variables jsonb, extensions jsonb); Type: ACL; Schema: graphql_public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION graphql_public.graphql("operationName" text, query text, variables jsonb, extensions jsonb) TO postgres;
GRANT ALL ON FUNCTION graphql_public.graphql("operationName" text, query text, variables jsonb, extensions jsonb) TO anon;
GRANT ALL ON FUNCTION graphql_public.graphql("operationName" text, query text, variables jsonb, extensions jsonb) TO authenticated;
GRANT ALL ON FUNCTION graphql_public.graphql("operationName" text, query text, variables jsonb, extensions jsonb) TO service_role;


--
-- Name: FUNCTION get_auth(p_usename text); Type: ACL; Schema: pgbouncer; Owner: supabase_admin
--

REVOKE ALL ON FUNCTION pgbouncer.get_auth(p_usename text) FROM PUBLIC;
GRANT ALL ON FUNCTION pgbouncer.get_auth(p_usename text) TO pgbouncer;
GRANT ALL ON FUNCTION pgbouncer.get_auth(p_usename text) TO postgres;


--
-- Name: FUNCTION apply_rls(wal jsonb, max_record_bytes integer); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer) TO postgres;
GRANT ALL ON FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer) TO dashboard_user;
GRANT ALL ON FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer) TO anon;
GRANT ALL ON FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer) TO authenticated;
GRANT ALL ON FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer) TO service_role;
GRANT ALL ON FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer) TO supabase_realtime_admin;


--
-- Name: FUNCTION broadcast_changes(topic_name text, event_name text, operation text, table_name text, table_schema text, new record, old record, level text); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.broadcast_changes(topic_name text, event_name text, operation text, table_name text, table_schema text, new record, old record, level text) TO postgres;
GRANT ALL ON FUNCTION realtime.broadcast_changes(topic_name text, event_name text, operation text, table_name text, table_schema text, new record, old record, level text) TO dashboard_user;


--
-- Name: FUNCTION build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) TO postgres;
GRANT ALL ON FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) TO dashboard_user;
GRANT ALL ON FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) TO anon;
GRANT ALL ON FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) TO authenticated;
GRANT ALL ON FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) TO service_role;
GRANT ALL ON FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) TO supabase_realtime_admin;


--
-- Name: FUNCTION "cast"(val text, type_ regtype); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime."cast"(val text, type_ regtype) TO postgres;
GRANT ALL ON FUNCTION realtime."cast"(val text, type_ regtype) TO dashboard_user;
GRANT ALL ON FUNCTION realtime."cast"(val text, type_ regtype) TO anon;
GRANT ALL ON FUNCTION realtime."cast"(val text, type_ regtype) TO authenticated;
GRANT ALL ON FUNCTION realtime."cast"(val text, type_ regtype) TO service_role;
GRANT ALL ON FUNCTION realtime."cast"(val text, type_ regtype) TO supabase_realtime_admin;


--
-- Name: FUNCTION check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) TO postgres;
GRANT ALL ON FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) TO dashboard_user;
GRANT ALL ON FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) TO anon;
GRANT ALL ON FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) TO authenticated;
GRANT ALL ON FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) TO service_role;
GRANT ALL ON FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) TO supabase_realtime_admin;


--
-- Name: FUNCTION is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) TO postgres;
GRANT ALL ON FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) TO dashboard_user;
GRANT ALL ON FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) TO anon;
GRANT ALL ON FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) TO authenticated;
GRANT ALL ON FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) TO service_role;
GRANT ALL ON FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) TO supabase_realtime_admin;


--
-- Name: FUNCTION list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) TO postgres;
GRANT ALL ON FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) TO dashboard_user;
GRANT ALL ON FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) TO anon;
GRANT ALL ON FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) TO authenticated;
GRANT ALL ON FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) TO service_role;
GRANT ALL ON FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) TO supabase_realtime_admin;


--
-- Name: FUNCTION quote_wal2json(entity regclass); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.quote_wal2json(entity regclass) TO postgres;
GRANT ALL ON FUNCTION realtime.quote_wal2json(entity regclass) TO dashboard_user;
GRANT ALL ON FUNCTION realtime.quote_wal2json(entity regclass) TO anon;
GRANT ALL ON FUNCTION realtime.quote_wal2json(entity regclass) TO authenticated;
GRANT ALL ON FUNCTION realtime.quote_wal2json(entity regclass) TO service_role;
GRANT ALL ON FUNCTION realtime.quote_wal2json(entity regclass) TO supabase_realtime_admin;


--
-- Name: FUNCTION send(payload jsonb, event text, topic text, private boolean); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.send(payload jsonb, event text, topic text, private boolean) TO postgres;
GRANT ALL ON FUNCTION realtime.send(payload jsonb, event text, topic text, private boolean) TO dashboard_user;


--
-- Name: FUNCTION subscription_check_filters(); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.subscription_check_filters() TO postgres;
GRANT ALL ON FUNCTION realtime.subscription_check_filters() TO dashboard_user;
GRANT ALL ON FUNCTION realtime.subscription_check_filters() TO anon;
GRANT ALL ON FUNCTION realtime.subscription_check_filters() TO authenticated;
GRANT ALL ON FUNCTION realtime.subscription_check_filters() TO service_role;
GRANT ALL ON FUNCTION realtime.subscription_check_filters() TO supabase_realtime_admin;


--
-- Name: FUNCTION to_regrole(role_name text); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.to_regrole(role_name text) TO postgres;
GRANT ALL ON FUNCTION realtime.to_regrole(role_name text) TO dashboard_user;
GRANT ALL ON FUNCTION realtime.to_regrole(role_name text) TO anon;
GRANT ALL ON FUNCTION realtime.to_regrole(role_name text) TO authenticated;
GRANT ALL ON FUNCTION realtime.to_regrole(role_name text) TO service_role;
GRANT ALL ON FUNCTION realtime.to_regrole(role_name text) TO supabase_realtime_admin;


--
-- Name: FUNCTION topic(); Type: ACL; Schema: realtime; Owner: supabase_realtime_admin
--

GRANT ALL ON FUNCTION realtime.topic() TO postgres;
GRANT ALL ON FUNCTION realtime.topic() TO dashboard_user;


--
-- Name: FUNCTION _crypto_aead_det_decrypt(message bytea, additional bytea, key_id bigint, context bytea, nonce bytea); Type: ACL; Schema: vault; Owner: supabase_admin
--

GRANT ALL ON FUNCTION vault._crypto_aead_det_decrypt(message bytea, additional bytea, key_id bigint, context bytea, nonce bytea) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION vault._crypto_aead_det_decrypt(message bytea, additional bytea, key_id bigint, context bytea, nonce bytea) TO service_role;


--
-- Name: FUNCTION create_secret(new_secret text, new_name text, new_description text, new_key_id uuid); Type: ACL; Schema: vault; Owner: supabase_admin
--

GRANT ALL ON FUNCTION vault.create_secret(new_secret text, new_name text, new_description text, new_key_id uuid) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION vault.create_secret(new_secret text, new_name text, new_description text, new_key_id uuid) TO service_role;


--
-- Name: FUNCTION update_secret(secret_id uuid, new_secret text, new_name text, new_description text, new_key_id uuid); Type: ACL; Schema: vault; Owner: supabase_admin
--

GRANT ALL ON FUNCTION vault.update_secret(secret_id uuid, new_secret text, new_name text, new_description text, new_key_id uuid) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION vault.update_secret(secret_id uuid, new_secret text, new_name text, new_description text, new_key_id uuid) TO service_role;


--
-- Name: TABLE audit_log_entries; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.audit_log_entries TO dashboard_user;
GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.audit_log_entries TO postgres;
GRANT SELECT ON TABLE auth.audit_log_entries TO postgres WITH GRANT OPTION;


--
-- Name: TABLE flow_state; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.flow_state TO postgres;
GRANT SELECT ON TABLE auth.flow_state TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.flow_state TO dashboard_user;


--
-- Name: TABLE identities; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.identities TO postgres;
GRANT SELECT ON TABLE auth.identities TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.identities TO dashboard_user;


--
-- Name: TABLE instances; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.instances TO dashboard_user;
GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.instances TO postgres;
GRANT SELECT ON TABLE auth.instances TO postgres WITH GRANT OPTION;


--
-- Name: TABLE mfa_amr_claims; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.mfa_amr_claims TO postgres;
GRANT SELECT ON TABLE auth.mfa_amr_claims TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.mfa_amr_claims TO dashboard_user;


--
-- Name: TABLE mfa_challenges; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.mfa_challenges TO postgres;
GRANT SELECT ON TABLE auth.mfa_challenges TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.mfa_challenges TO dashboard_user;


--
-- Name: TABLE mfa_factors; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.mfa_factors TO postgres;
GRANT SELECT ON TABLE auth.mfa_factors TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.mfa_factors TO dashboard_user;


--
-- Name: TABLE one_time_tokens; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.one_time_tokens TO postgres;
GRANT SELECT ON TABLE auth.one_time_tokens TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.one_time_tokens TO dashboard_user;


--
-- Name: TABLE refresh_tokens; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.refresh_tokens TO dashboard_user;
GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.refresh_tokens TO postgres;
GRANT SELECT ON TABLE auth.refresh_tokens TO postgres WITH GRANT OPTION;


--
-- Name: SEQUENCE refresh_tokens_id_seq; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON SEQUENCE auth.refresh_tokens_id_seq TO dashboard_user;
GRANT ALL ON SEQUENCE auth.refresh_tokens_id_seq TO postgres;


--
-- Name: TABLE saml_providers; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.saml_providers TO postgres;
GRANT SELECT ON TABLE auth.saml_providers TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.saml_providers TO dashboard_user;


--
-- Name: TABLE saml_relay_states; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.saml_relay_states TO postgres;
GRANT SELECT ON TABLE auth.saml_relay_states TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.saml_relay_states TO dashboard_user;


--
-- Name: TABLE schema_migrations; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT SELECT ON TABLE auth.schema_migrations TO postgres WITH GRANT OPTION;


--
-- Name: TABLE sessions; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.sessions TO postgres;
GRANT SELECT ON TABLE auth.sessions TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.sessions TO dashboard_user;


--
-- Name: TABLE sso_domains; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.sso_domains TO postgres;
GRANT SELECT ON TABLE auth.sso_domains TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.sso_domains TO dashboard_user;


--
-- Name: TABLE sso_providers; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.sso_providers TO postgres;
GRANT SELECT ON TABLE auth.sso_providers TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.sso_providers TO dashboard_user;


--
-- Name: TABLE users; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.users TO dashboard_user;
GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.users TO postgres;
GRANT SELECT ON TABLE auth.users TO postgres WITH GRANT OPTION;


--
-- Name: TABLE pg_stat_statements; Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON TABLE extensions.pg_stat_statements FROM postgres;
GRANT ALL ON TABLE extensions.pg_stat_statements TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE extensions.pg_stat_statements TO dashboard_user;


--
-- Name: TABLE pg_stat_statements_info; Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON TABLE extensions.pg_stat_statements_info FROM postgres;
GRANT ALL ON TABLE extensions.pg_stat_statements_info TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE extensions.pg_stat_statements_info TO dashboard_user;


--
-- Name: TABLE assets; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.assets TO anon;
GRANT ALL ON TABLE public.assets TO authenticated;
GRANT ALL ON TABLE public.assets TO service_role;


--
-- Name: TABLE bills; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.bills TO anon;
GRANT ALL ON TABLE public.bills TO authenticated;
GRANT ALL ON TABLE public.bills TO service_role;


--
-- Name: TABLE budgets; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.budgets TO anon;
GRANT ALL ON TABLE public.budgets TO authenticated;
GRANT ALL ON TABLE public.budgets TO service_role;


--
-- Name: TABLE debts; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.debts TO anon;
GRANT ALL ON TABLE public.debts TO authenticated;
GRANT ALL ON TABLE public.debts TO service_role;


--
-- Name: TABLE income; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.income TO anon;
GRANT ALL ON TABLE public.income TO authenticated;
GRANT ALL ON TABLE public.income TO service_role;


--
-- Name: TABLE investments; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.investments TO anon;
GRANT ALL ON TABLE public.investments TO authenticated;
GRANT ALL ON TABLE public.investments TO service_role;


--
-- Name: TABLE settings; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.settings TO anon;
GRANT ALL ON TABLE public.settings TO authenticated;
GRANT ALL ON TABLE public.settings TO service_role;


--
-- Name: TABLE snapshots; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.snapshots TO anon;
GRANT ALL ON TABLE public.snapshots TO authenticated;
GRANT ALL ON TABLE public.snapshots TO service_role;


--
-- Name: TABLE messages; Type: ACL; Schema: realtime; Owner: supabase_realtime_admin
--

GRANT ALL ON TABLE realtime.messages TO postgres;
GRANT ALL ON TABLE realtime.messages TO dashboard_user;
GRANT SELECT,INSERT,UPDATE ON TABLE realtime.messages TO anon;
GRANT SELECT,INSERT,UPDATE ON TABLE realtime.messages TO authenticated;
GRANT SELECT,INSERT,UPDATE ON TABLE realtime.messages TO service_role;


--
-- Name: TABLE schema_migrations; Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON TABLE realtime.schema_migrations TO postgres;
GRANT ALL ON TABLE realtime.schema_migrations TO dashboard_user;
GRANT SELECT ON TABLE realtime.schema_migrations TO anon;
GRANT SELECT ON TABLE realtime.schema_migrations TO authenticated;
GRANT SELECT ON TABLE realtime.schema_migrations TO service_role;
GRANT ALL ON TABLE realtime.schema_migrations TO supabase_realtime_admin;


--
-- Name: TABLE subscription; Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON TABLE realtime.subscription TO postgres;
GRANT ALL ON TABLE realtime.subscription TO dashboard_user;
GRANT SELECT ON TABLE realtime.subscription TO anon;
GRANT SELECT ON TABLE realtime.subscription TO authenticated;
GRANT SELECT ON TABLE realtime.subscription TO service_role;
GRANT ALL ON TABLE realtime.subscription TO supabase_realtime_admin;


--
-- Name: SEQUENCE subscription_id_seq; Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON SEQUENCE realtime.subscription_id_seq TO postgres;
GRANT ALL ON SEQUENCE realtime.subscription_id_seq TO dashboard_user;
GRANT USAGE ON SEQUENCE realtime.subscription_id_seq TO anon;
GRANT USAGE ON SEQUENCE realtime.subscription_id_seq TO authenticated;
GRANT USAGE ON SEQUENCE realtime.subscription_id_seq TO service_role;
GRANT ALL ON SEQUENCE realtime.subscription_id_seq TO supabase_realtime_admin;


--
-- Name: TABLE buckets; Type: ACL; Schema: storage; Owner: supabase_storage_admin
--

GRANT ALL ON TABLE storage.buckets TO anon;
GRANT ALL ON TABLE storage.buckets TO authenticated;
GRANT ALL ON TABLE storage.buckets TO service_role;
GRANT ALL ON TABLE storage.buckets TO postgres;


--
-- Name: TABLE objects; Type: ACL; Schema: storage; Owner: supabase_storage_admin
--

GRANT ALL ON TABLE storage.objects TO anon;
GRANT ALL ON TABLE storage.objects TO authenticated;
GRANT ALL ON TABLE storage.objects TO service_role;
GRANT ALL ON TABLE storage.objects TO postgres;


--
-- Name: TABLE s3_multipart_uploads; Type: ACL; Schema: storage; Owner: supabase_storage_admin
--

GRANT ALL ON TABLE storage.s3_multipart_uploads TO service_role;
GRANT SELECT ON TABLE storage.s3_multipart_uploads TO authenticated;
GRANT SELECT ON TABLE storage.s3_multipart_uploads TO anon;


--
-- Name: TABLE s3_multipart_uploads_parts; Type: ACL; Schema: storage; Owner: supabase_storage_admin
--

GRANT ALL ON TABLE storage.s3_multipart_uploads_parts TO service_role;
GRANT SELECT ON TABLE storage.s3_multipart_uploads_parts TO authenticated;
GRANT SELECT ON TABLE storage.s3_multipart_uploads_parts TO anon;


--
-- Name: TABLE secrets; Type: ACL; Schema: vault; Owner: supabase_admin
--

GRANT SELECT,REFERENCES,DELETE,TRUNCATE ON TABLE vault.secrets TO postgres WITH GRANT OPTION;
GRANT SELECT,DELETE ON TABLE vault.secrets TO service_role;


--
-- Name: TABLE decrypted_secrets; Type: ACL; Schema: vault; Owner: supabase_admin
--

GRANT SELECT,REFERENCES,DELETE,TRUNCATE ON TABLE vault.decrypted_secrets TO postgres WITH GRANT OPTION;
GRANT SELECT,DELETE ON TABLE vault.decrypted_secrets TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: auth; Owner: supabase_auth_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_auth_admin IN SCHEMA auth GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_auth_admin IN SCHEMA auth GRANT ALL ON SEQUENCES TO dashboard_user;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: auth; Owner: supabase_auth_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_auth_admin IN SCHEMA auth GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_auth_admin IN SCHEMA auth GRANT ALL ON FUNCTIONS TO dashboard_user;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: auth; Owner: supabase_auth_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_auth_admin IN SCHEMA auth GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_auth_admin IN SCHEMA auth GRANT ALL ON TABLES TO dashboard_user;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: extensions; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA extensions GRANT ALL ON SEQUENCES TO postgres WITH GRANT OPTION;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: extensions; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA extensions GRANT ALL ON FUNCTIONS TO postgres WITH GRANT OPTION;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: extensions; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA extensions GRANT ALL ON TABLES TO postgres WITH GRANT OPTION;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: graphql; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON SEQUENCES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON SEQUENCES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON SEQUENCES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: graphql; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON FUNCTIONS TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON FUNCTIONS TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON FUNCTIONS TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: graphql; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON TABLES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: graphql_public; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON SEQUENCES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON SEQUENCES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON SEQUENCES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: graphql_public; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON FUNCTIONS TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON FUNCTIONS TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON FUNCTIONS TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: graphql_public; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON TABLES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: public; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: public; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON FUNCTIONS TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON FUNCTIONS TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON FUNCTIONS TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON TABLES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: realtime; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA realtime GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA realtime GRANT ALL ON SEQUENCES TO dashboard_user;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: realtime; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA realtime GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA realtime GRANT ALL ON FUNCTIONS TO dashboard_user;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: realtime; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA realtime GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA realtime GRANT ALL ON TABLES TO dashboard_user;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: storage; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON SEQUENCES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON SEQUENCES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON SEQUENCES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: storage; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON FUNCTIONS TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON FUNCTIONS TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON FUNCTIONS TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: storage; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON TABLES TO service_role;


--
-- Name: issue_graphql_placeholder; Type: EVENT TRIGGER; Schema: -; Owner: supabase_admin
--

CREATE EVENT TRIGGER issue_graphql_placeholder ON sql_drop
         WHEN TAG IN ('DROP EXTENSION')
   EXECUTE FUNCTION extensions.set_graphql_placeholder();


ALTER EVENT TRIGGER issue_graphql_placeholder OWNER TO supabase_admin;

--
-- Name: issue_pg_cron_access; Type: EVENT TRIGGER; Schema: -; Owner: supabase_admin
--

CREATE EVENT TRIGGER issue_pg_cron_access ON ddl_command_end
         WHEN TAG IN ('CREATE EXTENSION')
   EXECUTE FUNCTION extensions.grant_pg_cron_access();


ALTER EVENT TRIGGER issue_pg_cron_access OWNER TO supabase_admin;

--
-- Name: issue_pg_graphql_access; Type: EVENT TRIGGER; Schema: -; Owner: supabase_admin
--

CREATE EVENT TRIGGER issue_pg_graphql_access ON ddl_command_end
         WHEN TAG IN ('CREATE FUNCTION')
   EXECUTE FUNCTION extensions.grant_pg_graphql_access();


ALTER EVENT TRIGGER issue_pg_graphql_access OWNER TO supabase_admin;

--
-- Name: issue_pg_net_access; Type: EVENT TRIGGER; Schema: -; Owner: supabase_admin
--

CREATE EVENT TRIGGER issue_pg_net_access ON ddl_command_end
         WHEN TAG IN ('CREATE EXTENSION')
   EXECUTE FUNCTION extensions.grant_pg_net_access();


ALTER EVENT TRIGGER issue_pg_net_access OWNER TO supabase_admin;

--
-- Name: pgrst_ddl_watch; Type: EVENT TRIGGER; Schema: -; Owner: supabase_admin
--

CREATE EVENT TRIGGER pgrst_ddl_watch ON ddl_command_end
   EXECUTE FUNCTION extensions.pgrst_ddl_watch();


ALTER EVENT TRIGGER pgrst_ddl_watch OWNER TO supabase_admin;

--
-- Name: pgrst_drop_watch; Type: EVENT TRIGGER; Schema: -; Owner: supabase_admin
--

CREATE EVENT TRIGGER pgrst_drop_watch ON sql_drop
   EXECUTE FUNCTION extensions.pgrst_drop_watch();


ALTER EVENT TRIGGER pgrst_drop_watch OWNER TO supabase_admin;

--
-- PostgreSQL database dump complete
--

\unrestrict Xs0XRs6OtHQMNVtmfQqW0DIjhQ8L7HeS4v9IpgAc2ECIXJafGO51h6pxceYW3Ux

--
-- PostgreSQL database cluster dump complete
--


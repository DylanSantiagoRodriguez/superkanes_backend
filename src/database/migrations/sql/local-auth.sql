CREATE SCHEMA auth;
REVOKE ALL ON SCHEMA auth FROM PUBLIC;
GRANT USAGE ON SCHEMA auth TO superkanes_app;

-- La identidad local usa un namespace fijo; no depende de la URL del despliegue.
CREATE UNIQUE INDEX usuario_local_email ON vet.usuario(lower(btrim(email)))
  WHERE proveedor_identidad = 'local';

CREATE TABLE auth.credential (
  usuario_id uuid PRIMARY KEY REFERENCES vet.usuario(id) ON DELETE RESTRICT,
  password_hash text NOT NULL CHECK(password_hash LIKE '$argon2id$%'),
  version integer NOT NULL DEFAULT 1 CHECK(version > 0),
  platform_admin boolean NOT NULL DEFAULT false,
  changed_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE auth.session (
  id uuid PRIMARY KEY,
  usuario_id uuid NOT NULL REFERENCES auth.credential(usuario_id),
  credential_version integer NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL,
  revoked_at timestamptz,
  CHECK(expires_at > created_at)
);
CREATE INDEX session_usuario ON auth.session(usuario_id);
CREATE INDEX session_expiry ON auth.session(expires_at);
CREATE TABLE auth.refresh_token (
  token_hash char(64) PRIMARY KEY,
  session_id uuid NOT NULL REFERENCES auth.session(id) ON DELETE CASCADE,
  consumed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX refresh_session ON auth.refresh_token(session_id);
CREATE TABLE auth.password_reset (
  token_hash char(64) PRIMARY KEY,
  usuario_id uuid NOT NULL REFERENCES auth.credential(usuario_id),
  expires_at timestamptz NOT NULL,
  used_at timestamptz
);
CREATE INDEX password_reset_usuario ON auth.password_reset(usuario_id);
CREATE TABLE auth.login_bucket (
  key char(64) PRIMARY KEY,
  attempts integer NOT NULL CHECK(attempts > 0),
  expires_at timestamptz NOT NULL
);
CREATE INDEX login_bucket_expiry ON auth.login_bucket(expires_at);
CREATE TABLE auth.security_event (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id uuid REFERENCES vet.usuario(id),
  actor_usuario_id uuid REFERENCES vet.usuario(id),
  action text NOT NULL,
  occurred_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX security_event_time ON auth.security_event(occurred_at);

GRANT SELECT,INSERT ON auth.credential TO superkanes_app;
GRANT UPDATE(password_hash,version,changed_at) ON auth.credential TO superkanes_app;
GRANT SELECT,INSERT,UPDATE,DELETE ON auth.session,auth.refresh_token,auth.password_reset,auth.login_bucket TO superkanes_app;
GRANT INSERT ON auth.security_event TO superkanes_app;

CREATE FUNCTION auth.find_login(input_email text)
RETURNS TABLE(usuario_id uuid,password_hash text,version integer,activo boolean)
LANGUAGE sql SECURITY DEFINER STABLE SET search_path=pg_catalog,auth,vet AS $$
 SELECT u.id,c.password_hash,c.version,u.activo FROM vet.usuario u
 JOIN auth.credential c ON c.usuario_id=u.id
 WHERE u.proveedor_identidad='local' AND lower(btrim(u.email))=input_email
$$;
CREATE FUNCTION auth.resolve_session(input_session uuid,input_user uuid)
RETURNS TABLE(usuario_id uuid,platform_admin boolean)
LANGUAGE sql SECURITY DEFINER STABLE SET search_path=pg_catalog,auth,vet AS $$
 SELECT u.id,c.platform_admin FROM auth.session s
 JOIN auth.credential c ON c.usuario_id=s.usuario_id
 JOIN vet.usuario u ON u.id=c.usuario_id
 WHERE s.id=input_session AND s.usuario_id=input_user AND u.activo
 AND u.proveedor_identidad='local' AND u.identificador_externo=u.id::text
 AND s.revoked_at IS NULL AND s.expires_at>now() AND s.credential_version=c.version
$$;
CREATE FUNCTION auth.active_local_user(input_user uuid) RETURNS boolean
LANGUAGE sql SECURITY DEFINER STABLE SET search_path=pg_catalog,vet AS $$
 SELECT EXISTS(SELECT 1 FROM vet.usuario WHERE id=input_user AND activo AND proveedor_identidad='local' AND identificador_externo=id::text)
$$;
REVOKE ALL ON FUNCTION auth.find_login(text),auth.resolve_session(uuid,uuid),auth.active_local_user(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION auth.find_login(text),auth.resolve_session(uuid,uuid),auth.active_local_user(uuid) TO superkanes_app;

-- Una vez vinculadas credenciales, el CRUD no puede trasladar su identidad.
CREATE FUNCTION auth.protect_identity() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog,auth AS $$
BEGIN
 IF EXISTS(SELECT 1 FROM auth.credential WHERE usuario_id=OLD.id) AND
 (NEW.proveedor_identidad IS DISTINCT FROM OLD.proveedor_identidad OR NEW.identificador_externo IS DISTINCT FROM OLD.identificador_externo) THEN
   RAISE EXCEPTION 'La identidad con credenciales locales no puede trasladarse';
 END IF;
 RETURN NEW;
END $$;
REVOKE ALL ON FUNCTION auth.protect_identity() FROM PUBLIC;
CREATE TRIGGER a_local_identity BEFORE UPDATE ON vet.usuario FOR EACH ROW EXECUTE FUNCTION auth.protect_identity();

CREATE FUNCTION auth.my_organizations() RETURNS TABLE(id uuid,nombre text)
LANGUAGE sql SECURITY DEFINER STABLE SET search_path=pg_catalog,vet AS $$
 SELECT o.id,o.nombre FROM vet.membresia m JOIN vet.organizacion o ON o.id=m.organizacion_id
 WHERE m.usuario_id=nullif(current_setting('app.usuario_id',true),'')::uuid AND m.activo AND o.estado='activa'
$$;
REVOKE ALL ON FUNCTION auth.my_organizations() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION auth.my_organizations() TO superkanes_app;

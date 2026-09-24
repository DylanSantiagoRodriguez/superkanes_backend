-- Las funciones de identidad exponen solo lo requerido por la API autenticada.
CREATE FUNCTION vet.resolve_api_identity(issuer text, subject text) RETURNS TABLE(id uuid)
LANGUAGE sql SECURITY DEFINER STABLE SET search_path=pg_catalog,vet AS $$
  SELECT u.id FROM vet.usuario u WHERE u.proveedor_identidad=issuer
    AND u.identificador_externo=subject AND u.activo
$$;
REVOKE ALL ON FUNCTION vet.resolve_api_identity(text,text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION vet.resolve_api_identity(text,text) TO superkanes_app;

GRANT SELECT,INSERT,UPDATE,DELETE ON vet.usuario,vet.organizacion,vet.permiso TO superkanes_app;
ALTER TABLE vet.usuario ENABLE ROW LEVEL SECURITY;
ALTER TABLE vet.organizacion ENABLE ROW LEVEL SECURITY;
ALTER TABLE vet.permiso ENABLE ROW LEVEL SECURITY;
CREATE POLICY usuario_read ON vet.usuario FOR SELECT USING (
  current_setting('app.platform_admin',true)='true' OR id=nullif(current_setting('app.usuario_id',true),'')::uuid
  OR EXISTS (SELECT 1 FROM vet.membresia m WHERE m.usuario_id=usuario.id
    AND m.organizacion_id=nullif(current_setting('app.organizacion_id',true),'')::uuid)
);
CREATE POLICY organizacion_read ON vet.organizacion FOR SELECT USING (
  current_setting('app.platform_admin',true)='true' OR id=nullif(current_setting('app.organizacion_id',true),'')::uuid
);
CREATE POLICY permiso_read ON vet.permiso FOR SELECT USING (
  nullif(current_setting('app.usuario_id',true),'') IS NOT NULL
);
CREATE POLICY usuario_platform ON vet.usuario FOR ALL USING (current_setting('app.platform_admin',true)='true') WITH CHECK (current_setting('app.platform_admin',true)='true');
CREATE POLICY organizacion_platform ON vet.organizacion FOR ALL USING (current_setting('app.platform_admin',true)='true') WITH CHECK (current_setting('app.platform_admin',true)='true');
CREATE POLICY permiso_platform ON vet.permiso FOR ALL USING (current_setting('app.platform_admin',true)='true') WITH CHECK (current_setting('app.platform_admin',true)='true');

CREATE FUNCTION vet.record_api_access(resource text, record uuid, operation text) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog,vet AS $$
BEGIN
  IF operation NOT IN ('READ','LIST','INSERT_GLOBAL','UPDATE_GLOBAL','DELETE_GLOBAL') THEN
    RAISE EXCEPTION 'Operacion de auditoria no permitida';
  END IF;
  INSERT INTO vet.evento_auditoria(organizacion_id,actor_usuario_id,accion,entidad,registro_id,request_id)
  VALUES(nullif(current_setting('app.organizacion_id',true),'')::uuid,
    nullif(current_setting('app.usuario_id',true),'')::uuid,operation,resource,record,
    nullif(current_setting('app.request_id',true),'')::uuid);
END $$;
REVOKE ALL ON FUNCTION vet.record_api_access(text,uuid,text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION vet.record_api_access(text,uuid,text) TO superkanes_app;

CREATE SCHEMA api;
REVOKE ALL ON SCHEMA api FROM PUBLIC;
GRANT USAGE ON SCHEMA api TO superkanes_app;
CREATE TABLE api.idempotency (
  organizacion_id uuid NOT NULL REFERENCES vet.organizacion(id),
  usuario_id uuid NOT NULL REFERENCES vet.usuario(id),
  key uuid NOT NULL,
  resource text NOT NULL,
  request_hash char(64) NOT NULL,
  response jsonb NOT NULL,
  expires_at timestamptz NOT NULL DEFAULT now()+interval '24 hours',
  PRIMARY KEY(organizacion_id,usuario_id,key)
);
CREATE INDEX idempotency_expiry ON api.idempotency(expires_at);
ALTER TABLE api.idempotency ENABLE ROW LEVEL SECURITY;
CREATE POLICY idempotency_scope ON api.idempotency USING (
  organizacion_id=nullif(current_setting('app.organizacion_id',true),'')::uuid
  AND usuario_id=nullif(current_setting('app.usuario_id',true),'')::uuid
) WITH CHECK (
  organizacion_id=nullif(current_setting('app.organizacion_id',true),'')::uuid
  AND usuario_id=nullif(current_setting('app.usuario_id',true),'')::uuid
);
GRANT SELECT,INSERT,DELETE ON api.idempotency TO superkanes_app;

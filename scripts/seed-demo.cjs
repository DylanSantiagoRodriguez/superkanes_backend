// Datos sintéticos locales. Sin cambios de esquema, credenciales ni registros existentes.
// Uso: npm run seed:demo -- --apply. Sin --apply se valida y revierte la transacción.
const { createHash } = require('node:crypto');
const { parseArgs } = require('node:util');
const source = require('../dist/database/migration-data-source').default;
const model = require('../src/resources/resource-model.generated.json');
source.setOptions({ logging: false });
const { values } = parseArgs({ options: {
  apply: { type: 'boolean', default: false },
  email: { type: 'string', default: 'admin@superkanes.local' },
  organization: { type: 'string' },
} });
const rollback = new Error('DEMO_DRY_RUN');
async function main() {
  if (process.env.NODE_ENV === 'production' || !['127.0.0.1', 'localhost'].includes(source.options.host)) throw new Error('Este script solo admite la base local de desarrollo.');
  await source.initialize();
  const summary = {};
  let context;
  try {
    await source.transaction(async manager => {
      await manager.query("SELECT pg_advisory_xact_lock(hashtextextended('superkanes-demo-v1',0))");
      const accounts = await manager.query(`SELECT u.id user_id, u.nombre, m.id member_id, o.id organization_id, o.nombre organization_name
        FROM vet.usuario u JOIN vet.membresia m ON m.usuario_id=u.id JOIN vet.organizacion o ON o.id=m.organizacion_id
        WHERE lower(u.email)=lower($1) AND u.activo AND m.activo AND o.estado='activa'`, [values.email]);
      const selected = values.organization ? accounts.filter(a => a.organization_id === values.organization) : accounts;
      if (selected.length !== 1) throw new Error('Se requiere una única organización activa; especifique --organization si hay varias.');
      context = selected[0];
      await manager.query("SELECT set_config('app.usuario_id',$1,true),set_config('app.organizacion_id',$2,true)", [context.user_id, context.organization_id]);
      const id = (table, index) => {
        const hex = createHash('sha256').update(`superkanes-demo-v1:${context.organization_id}:${table}:${index}`).digest('hex');
        return `${hex.slice(0,8)}-${hex.slice(8,12)}-4${hex.slice(13,16)}-a${hex.slice(17,20)}-${hex.slice(20,32)}`;
      };
      const insert = async (table, index, input) => {
        const resource = model.find(r => r.name === table);
        if (!resource) throw new Error('Recurso no reconocido');
        const row = { id: id(table,index), ...(resource.tenant ? { organizacion_id: context.organization_id } : {}), ...input };
        if (resource.columns.some(c => c.name === 'creado_por')) row.creado_por = context.user_id;
        const columns = Object.keys(row);
        if (columns.some(c => !resource.columns.some(field => field.name === c))) throw new Error(`Campo no reconocido en ${table}`);
        const result = await manager.query(`INSERT INTO vet."${table}" (${columns.map(c => `"${c}"`).join(',')}) VALUES (${columns.map((_,i)=>`$${i+1}`).join(',')}) ON CONFLICT (id) DO NOTHING RETURNING id`, Object.values(row));
        summary[table] ??= { creados: 0, existentes: 0 };
        summary[table][result.length ? 'creados' : 'existentes']++;
        return row.id;
      };
      const existingProfessional = await manager.query('SELECT id FROM vet.profesional WHERE organizacion_id=$1 AND membresia_id=$2', [context.organization_id,context.member_id]);
      const adminProfessional = existingProfessional[0]?.id ?? id('profesional',1);
      const names = ['Luna', 'Milo', 'Nala'];
      const tutors = ['Ana', 'Carlos', 'Lucía'];
      const species = ['Canino', 'Felino', 'Conejo'];
      const date = '2026-10-20';
      const instant = `${date}T09:00:00-05:00`;
      for (let i=1; i<=3; i++) {
        const user = i===1 ? context.user_id : id('usuario',i);
        const member = i===1 ? context.member_id : id('membresia',i);
        if (i>1) {
          await insert('usuario',i,{proveedor_identidad:'demo',identificador_externo:user,nombre:`Profesional DEMO ${i}`,email:`profesional${i}.${context.organization_id.slice(0,8)}@example.test`});
          await insert('membresia',i,{usuario_id:user});
          // Los perfiles auxiliares no reciben contraseñas ni acceso por roles.
          await insert('rol',i,{nombre:`Consulta DEMO ${i}`});
        }
        if (i===1 && existingProfessional.length) summary.profesional={creados:0,existentes:1};
        else await insert('profesional',i,{membresia_id:member,nombre_profesional:i===1?'Administrador · DEMO (tu usuario)':`Profesional DEMO ${i}`,especialidad:'Perfil de demostración'});
        await insert('sede',i,{nombre:`Sede DEMO ${['Centro','Norte','Sur'][i-1]}`,codigo:`DEMO-0${i}`});
        await insert('tutor',i,{nombres:`${tutors[i-1]} DEMO`,apellidos:'Datos de ejemplo',email:`tutor${i}.${context.organization_id.slice(0,8)}@example.test`,ciudad:'Bogotá',observaciones:'Registro sintético para pruebas de la aplicación.'});
        await insert('telefono_tutor',i,{tutor_id:id('tutor',i),numero:`+57000000000${i}`});
        await insert('preferencia_comunicacion',i,{tutor_id:id('tutor',i),canal:'email',finalidad:'recordatorios',estado:'aceptada',fuente:'presencial'});
        await insert('especie',i,{nombre:`${species[i-1]} DEMO`});
        await insert('raza',i,{especie_id:id('especie',i),nombre:`Mestizo DEMO ${i}`});
        await insert('mascota',i,{codigo:`DEMO-M00${i}`,nombre:`${names[i-1]} DEMO`,especie_id:id('especie',i),raza_id:id('raza',i)});
        // Las restricciones diferidas comprueban al final de la transacción el tutor principal.
        await insert('mascota_tutor',i,{mascota_id:id('mascota',i),tutor_id:id('tutor',i),es_principal:true,vigente_desde:date,autorizado_consentir:true});
        await insert('alerta_mascota',i,{mascota_id:id('mascota',i),tipo:'alergia',descripcion:'DEMO: alerta ficticia, sin valor clínico.',severidad:'moderada'});
        await insert('laboratorio',i,{nombre:`Laboratorio DEMO ${i}`});
        await insert('medicamento',i,{nombre_comercial:`Producto ficticio DEMO ${i}`,principio_activo:'No aplica: dato sintético',concentracion:'Solo demostración',forma_farmaceutica:'tableta',presentacion:'Ejemplo',laboratorio_id:id('laboratorio',i)});
        await insert('vacuna',i,{nombre:`Vacuna ficticia DEMO ${i}`,laboratorio_id:id('laboratorio',i)});
        await insert('vacunacion',i,{mascota_id:id('mascota',i),sede_id:id('sede',i),vacuna_id:id('vacuna',i),aplicada_en:instant,peso_kg:String(3+i),aplicada_por:adminProfessional,lote:`DEMO-${i}`,descripcion_vacuna_emitida:'Registro sintético. No representa una aplicación real.'});
        await insert('pendiente_vacunal',i,{mascota_id:id('mascota',i),vacunacion_origen_id:id('vacunacion',i),vacuna_prevista_id:id('vacuna',i),indicacion:'DEMO: pendiente para probar formularios.',fecha_objetivo:'2026-11-20'});
        await insert('cita',i,{mascota_id:id('mascota',i),sede_id:id('sede',i),tutor_contacto_id:id('tutor',i),tipo:'clinica',inicio:`2026-10-21T${String(8+i).padStart(2,'0')}:00:00-05:00`,fin:`2026-10-21T${String(8+i).padStart(2,'0')}:30:00-05:00`,responsable_id:context.member_id,notas:'Cita DEMO para probar nuevas atenciones.'});
        await insert('recordatorio',i,{tutor_id:id('tutor',i),cita_id:id('cita',i),canal:'email',programado_en:'2026-10-21T07:00:00-05:00',clave_idempotencia:id('recordatorio-clave',i)});
        // Se dejan las citas sin atención asociada para que puedan usarse desde el formulario.
        await insert('atencion_clinica',i,{mascota_id:id('mascota',i),sede_id:id('sede',i),fecha_atencion:instant,profesional_id:adminProfessional,tutor_presente_id:id('tutor',i)});
        await insert('revision_clinica',i,{atencion_id:id('atencion_clinica',i),numero:1,motivo_consulta:'DEMO: revisión sintética de funcionamiento.'});
        await insert('tipo_seccion_clinica',i,{codigo:`DEMO-SEC-${i}`,nombre:`Evaluación DEMO ${i}`});
        await insert('plantilla_seccion',i,{tipo_seccion_id:id('tipo_seccion_clinica',i),numero_version:1,esquema_validacion:{type:'object',properties:{observaciones:{type:'string'}},required:['observaciones'],additionalProperties:false},publicada_en:instant});
        await insert('seccion_clinica',i,{revision_id:id('revision_clinica',i),tipo_seccion_id:id('tipo_seccion_clinica',i),plantilla_id:id('plantilla_seccion',i),datos_estructurados:{observaciones:'DEMO: contenido sin valor clínico.'}});
        await insert('medicion_clinica',i,{revision_id:id('revision_clinica',i),tipo:'peso',valor:String(3+i),unidad:'kg',medida_en:instant});
        await insert('diagnostico',i,{nombre:`Diagnóstico ficticio DEMO ${i}`});
        await insert('diagnostico_atencion',i,{revision_id:id('revision_clinica',i),diagnostico_id:id('diagnostico',i),clasificacion:'confirmado'});
        await insert('prescripcion',i,{revision_id:id('revision_clinica',i),profesional_id:adminProfessional});
        await insert('prescripcion_item',i,{prescripcion_id:id('prescripcion',i),medicamento_id:id('medicamento',i),descripcion_emitida:'DEMO: no constituye una prescripción real.',via:'oral',frecuencia:'Solo demostración',duracion:'Solo demostración',instrucciones:'Dato sintético. No utilizar como indicación clínica.'});
        await insert('tipo_servicio',i,{nombre:`${['Baño','Corte','Cuidado de uñas'][i-1]} DEMO`});
        await insert('servicio_peluqueria',i,{mascota_id:id('mascota',i),sede_id:id('sede',i),fecha_servicio:date,responsable_id:context.member_id,tutor_contacto_id:id('tutor',i),telefono_contacto_servicio:`+57000000000${i}`});
        await insert('peluqueria_item',i,{servicio_id:id('servicio_peluqueria',i),tipo_servicio_id:id('tipo_servicio',i)});
        await insert('plantilla_consentimiento',i,{nombre:`Plantilla DEMO ${i}`,numero_version:1,contenido:'Documento de ejemplo para probar el catálogo. No representa un consentimiento real.',publicada_en:instant});
      }
      await manager.query('SET CONSTRAINTS ALL IMMEDIATE');
      if (!values.apply) throw rollback;
    });
  } catch(error) {
    if (error !== rollback) throw error;
  } finally { await source.destroy(); }
  console.log(values.apply ? 'Datos DEMO confirmados.' : 'Validación completa; transacción revertida. Use --apply para guardar.');
  console.log('Organización:',context.organization_name);
  console.table(summary);
  console.log('Para crear atenciones, seleccione el profesional asociado a su cuenta administrativa.');
  console.log('No se generan firmas, reportes, archivos inexistentes ni eventos de envío ficticios.');
}
main().catch(error=>{console.error('No se guardaron cambios:',error.message);process.exitCode=1});

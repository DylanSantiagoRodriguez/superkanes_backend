import { UsuarioEntity } from './usuario/entities/usuario.entity';
import { OrganizacionEntity } from './organizacion/entities/organizacion.entity';
import { SedeEntity } from './sede/entities/sede.entity';
import { MembresiaEntity } from './membresia/entities/membresia.entity';
import { ProfesionalEntity } from './profesional/entities/profesional.entity';
import { RolEntity } from './rol/entities/rol.entity';
import { PermisoEntity } from './permiso/entities/permiso.entity';
import { RolPermisoEntity } from './rol-permiso/entities/rol-permiso.entity';
import { AsignacionRolEntity } from './asignacion-rol/entities/asignacion-rol.entity';
import { ArchivoEntity } from './archivo/entities/archivo.entity';
import { TutorEntity } from './tutor/entities/tutor.entity';
import { TelefonoTutorEntity } from './telefono-tutor/entities/telefono-tutor.entity';
import { PreferenciaComunicacionEntity } from './preferencia-comunicacion/entities/preferencia-comunicacion.entity';
import { EspecieEntity } from './especie/entities/especie.entity';
import { RazaEntity } from './raza/entities/raza.entity';
import { MascotaEntity } from './mascota/entities/mascota.entity';
import { MascotaTutorEntity } from './mascota-tutor/entities/mascota-tutor.entity';
import { AlertaMascotaEntity } from './alerta-mascota/entities/alerta-mascota.entity';
import { LaboratorioEntity } from './laboratorio/entities/laboratorio.entity';
import { MedicamentoEntity } from './medicamento/entities/medicamento.entity';
import { VacunaEntity } from './vacuna/entities/vacuna.entity';
import { VacunacionEntity } from './vacunacion/entities/vacunacion.entity';
import { PendienteVacunalEntity } from './pendiente-vacunal/entities/pendiente-vacunal.entity';
import { CitaEntity } from './cita/entities/cita.entity';
import { RecordatorioEntity } from './recordatorio/entities/recordatorio.entity';
import { AtencionClinicaEntity } from './atencion-clinica/entities/atencion-clinica.entity';
import { RevisionClinicaEntity } from './revision-clinica/entities/revision-clinica.entity';
import { TipoSeccionClinicaEntity } from './tipo-seccion-clinica/entities/tipo-seccion-clinica.entity';
import { PlantillaSeccionEntity } from './plantilla-seccion/entities/plantilla-seccion.entity';
import { SeccionClinicaEntity } from './seccion-clinica/entities/seccion-clinica.entity';
import { MedicionClinicaEntity } from './medicion-clinica/entities/medicion-clinica.entity';
import { DiagnosticoEntity } from './diagnostico/entities/diagnostico.entity';
import { DiagnosticoAtencionEntity } from './diagnostico-atencion/entities/diagnostico-atencion.entity';
import { PrescripcionEntity } from './prescripcion/entities/prescripcion.entity';
import { PrescripcionItemEntity } from './prescripcion-item/entities/prescripcion-item.entity';
import { TipoServicioEntity } from './tipo-servicio/entities/tipo-servicio.entity';
import { ServicioPeluqueriaEntity } from './servicio-peluqueria/entities/servicio-peluqueria.entity';
import { PeluqueriaItemEntity } from './peluqueria-item/entities/peluqueria-item.entity';
import { PlantillaConsentimientoEntity } from './plantilla-consentimiento/entities/plantilla-consentimiento.entity';
import { ConsentimientoEntity } from './consentimiento/entities/consentimiento.entity';
import { FirmaConsentimientoEntity } from './firma-consentimiento/entities/firma-consentimiento.entity';
import { AdjuntoClinicoEntity } from './adjunto-clinico/entities/adjunto-clinico.entity';
import { AdjuntoVacunacionEntity } from './adjunto-vacunacion/entities/adjunto-vacunacion.entity';
import { AdjuntoPeluqueriaEntity } from './adjunto-peluqueria/entities/adjunto-peluqueria.entity';
import { ReporteEmitidoEntity } from './reporte-emitido/entities/reporte-emitido.entity';
import { EventoAuditoriaEntity } from './evento-auditoria/entities/evento-auditoria.entity';
import { EventoSalidaEntity } from './evento-salida/entities/evento-salida.entity';

export const domainEntities = [
  UsuarioEntity,
  OrganizacionEntity,
  SedeEntity,
  MembresiaEntity,
  ProfesionalEntity,
  RolEntity,
  PermisoEntity,
  RolPermisoEntity,
  AsignacionRolEntity,
  ArchivoEntity,
  TutorEntity,
  TelefonoTutorEntity,
  PreferenciaComunicacionEntity,
  EspecieEntity,
  RazaEntity,
  MascotaEntity,
  MascotaTutorEntity,
  AlertaMascotaEntity,
  LaboratorioEntity,
  MedicamentoEntity,
  VacunaEntity,
  VacunacionEntity,
  PendienteVacunalEntity,
  CitaEntity,
  RecordatorioEntity,
  AtencionClinicaEntity,
  RevisionClinicaEntity,
  TipoSeccionClinicaEntity,
  PlantillaSeccionEntity,
  SeccionClinicaEntity,
  MedicionClinicaEntity,
  DiagnosticoEntity,
  DiagnosticoAtencionEntity,
  PrescripcionEntity,
  PrescripcionItemEntity,
  TipoServicioEntity,
  ServicioPeluqueriaEntity,
  PeluqueriaItemEntity,
  PlantillaConsentimientoEntity,
  ConsentimientoEntity,
  FirmaConsentimientoEntity,
  AdjuntoClinicoEntity,
  AdjuntoVacunacionEntity,
  AdjuntoPeluqueriaEntity,
  ReporteEmitidoEntity,
  EventoAuditoriaEntity,
  EventoSalidaEntity,
];

export const entitiesByTable = {
  usuario: UsuarioEntity,
  organizacion: OrganizacionEntity,
  sede: SedeEntity,
  membresia: MembresiaEntity,
  profesional: ProfesionalEntity,
  rol: RolEntity,
  permiso: PermisoEntity,
  rol_permiso: RolPermisoEntity,
  asignacion_rol: AsignacionRolEntity,
  archivo: ArchivoEntity,
  tutor: TutorEntity,
  telefono_tutor: TelefonoTutorEntity,
  preferencia_comunicacion: PreferenciaComunicacionEntity,
  especie: EspecieEntity,
  raza: RazaEntity,
  mascota: MascotaEntity,
  mascota_tutor: MascotaTutorEntity,
  alerta_mascota: AlertaMascotaEntity,
  laboratorio: LaboratorioEntity,
  medicamento: MedicamentoEntity,
  vacuna: VacunaEntity,
  vacunacion: VacunacionEntity,
  pendiente_vacunal: PendienteVacunalEntity,
  cita: CitaEntity,
  recordatorio: RecordatorioEntity,
  atencion_clinica: AtencionClinicaEntity,
  revision_clinica: RevisionClinicaEntity,
  tipo_seccion_clinica: TipoSeccionClinicaEntity,
  plantilla_seccion: PlantillaSeccionEntity,
  seccion_clinica: SeccionClinicaEntity,
  medicion_clinica: MedicionClinicaEntity,
  diagnostico: DiagnosticoEntity,
  diagnostico_atencion: DiagnosticoAtencionEntity,
  prescripcion: PrescripcionEntity,
  prescripcion_item: PrescripcionItemEntity,
  tipo_servicio: TipoServicioEntity,
  servicio_peluqueria: ServicioPeluqueriaEntity,
  peluqueria_item: PeluqueriaItemEntity,
  plantilla_consentimiento: PlantillaConsentimientoEntity,
  consentimiento: ConsentimientoEntity,
  firma_consentimiento: FirmaConsentimientoEntity,
  adjunto_clinico: AdjuntoClinicoEntity,
  adjunto_vacunacion: AdjuntoVacunacionEntity,
  adjunto_peluqueria: AdjuntoPeluqueriaEntity,
  reporte_emitido: ReporteEmitidoEntity,
  evento_auditoria: EventoAuditoriaEntity,
  evento_salida: EventoSalidaEntity,
};

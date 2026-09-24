import { Module } from '@nestjs/common';
import { UsuarioModule } from './usuario/usuario.module';
import { OrganizacionModule } from './organizacion/organizacion.module';
import { SedeModule } from './sede/sede.module';
import { MembresiaModule } from './membresia/membresia.module';
import { ProfesionalModule } from './profesional/profesional.module';
import { RolModule } from './rol/rol.module';
import { PermisoModule } from './permiso/permiso.module';
import { RolPermisoModule } from './rol-permiso/rol-permiso.module';
import { AsignacionRolModule } from './asignacion-rol/asignacion-rol.module';
import { ArchivoModule } from './archivo/archivo.module';
import { TutorModule } from './tutor/tutor.module';
import { TelefonoTutorModule } from './telefono-tutor/telefono-tutor.module';
import { PreferenciaComunicacionModule } from './preferencia-comunicacion/preferencia-comunicacion.module';
import { EspecieModule } from './especie/especie.module';
import { RazaModule } from './raza/raza.module';
import { MascotaModule } from './mascota/mascota.module';
import { MascotaTutorModule } from './mascota-tutor/mascota-tutor.module';
import { AlertaMascotaModule } from './alerta-mascota/alerta-mascota.module';
import { LaboratorioModule } from './laboratorio/laboratorio.module';
import { MedicamentoModule } from './medicamento/medicamento.module';
import { VacunaModule } from './vacuna/vacuna.module';
import { VacunacionModule } from './vacunacion/vacunacion.module';
import { PendienteVacunalModule } from './pendiente-vacunal/pendiente-vacunal.module';
import { CitaModule } from './cita/cita.module';
import { RecordatorioModule } from './recordatorio/recordatorio.module';
import { AtencionClinicaModule } from './atencion-clinica/atencion-clinica.module';
import { RevisionClinicaModule } from './revision-clinica/revision-clinica.module';
import { TipoSeccionClinicaModule } from './tipo-seccion-clinica/tipo-seccion-clinica.module';
import { PlantillaSeccionModule } from './plantilla-seccion/plantilla-seccion.module';
import { SeccionClinicaModule } from './seccion-clinica/seccion-clinica.module';
import { MedicionClinicaModule } from './medicion-clinica/medicion-clinica.module';
import { DiagnosticoModule } from './diagnostico/diagnostico.module';
import { DiagnosticoAtencionModule } from './diagnostico-atencion/diagnostico-atencion.module';
import { PrescripcionModule } from './prescripcion/prescripcion.module';
import { PrescripcionItemModule } from './prescripcion-item/prescripcion-item.module';
import { TipoServicioModule } from './tipo-servicio/tipo-servicio.module';
import { ServicioPeluqueriaModule } from './servicio-peluqueria/servicio-peluqueria.module';
import { PeluqueriaItemModule } from './peluqueria-item/peluqueria-item.module';
import { PlantillaConsentimientoModule } from './plantilla-consentimiento/plantilla-consentimiento.module';
import { ConsentimientoModule } from './consentimiento/consentimiento.module';
import { FirmaConsentimientoModule } from './firma-consentimiento/firma-consentimiento.module';
import { AdjuntoClinicoModule } from './adjunto-clinico/adjunto-clinico.module';
import { AdjuntoVacunacionModule } from './adjunto-vacunacion/adjunto-vacunacion.module';
import { AdjuntoPeluqueriaModule } from './adjunto-peluqueria/adjunto-peluqueria.module';
import { ReporteEmitidoModule } from './reporte-emitido/reporte-emitido.module';
import { EventoAuditoriaModule } from './evento-auditoria/evento-auditoria.module';
import { EventoSalidaModule } from './evento-salida/evento-salida.module';

@Module({
  imports: [
    UsuarioModule,
    OrganizacionModule,
    SedeModule,
    MembresiaModule,
    ProfesionalModule,
    RolModule,
    PermisoModule,
    RolPermisoModule,
    AsignacionRolModule,
    ArchivoModule,
    TutorModule,
    TelefonoTutorModule,
    PreferenciaComunicacionModule,
    EspecieModule,
    RazaModule,
    MascotaModule,
    MascotaTutorModule,
    AlertaMascotaModule,
    LaboratorioModule,
    MedicamentoModule,
    VacunaModule,
    VacunacionModule,
    PendienteVacunalModule,
    CitaModule,
    RecordatorioModule,
    AtencionClinicaModule,
    RevisionClinicaModule,
    TipoSeccionClinicaModule,
    PlantillaSeccionModule,
    SeccionClinicaModule,
    MedicionClinicaModule,
    DiagnosticoModule,
    DiagnosticoAtencionModule,
    PrescripcionModule,
    PrescripcionItemModule,
    TipoServicioModule,
    ServicioPeluqueriaModule,
    PeluqueriaItemModule,
    PlantillaConsentimientoModule,
    ConsentimientoModule,
    FirmaConsentimientoModule,
    AdjuntoClinicoModule,
    AdjuntoVacunacionModule,
    AdjuntoPeluqueriaModule,
    ReporteEmitidoModule,
    EventoAuditoriaModule,
    EventoSalidaModule,
  ],
})
export class DomainModule {}

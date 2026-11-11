// Carga solicitada de personas y pacientes ficticios con nombres naturales.
// La procedencia y los IDs quedan en un manifiesto privado, fuera del repositorio.
// No crea consentimientos de comunicación, envíos, tratamientos ni firmas.
const fs = require('node:fs');
const path = require('node:path');
const { parseArgs } = require('node:util');
const { randomUUID } = require('node:crypto');
const { values } = parseArgs({ options: {
  api: { type: 'string' }, organization: { type: 'string' },
  email: { type: 'string', default: 'admin@superkanes.local' },
  'password-file': { type: 'string' }, manifest: { type: 'string' },
  apply: { type: 'boolean', default: false },
} });
async function main() {
  if (!values.apply || !values.api || !values.organization || !values['password-file'] || !values.manifest)
    throw new Error('Use --apply --api URL --organization UUID --password-file RUTA --manifest RUTA_PRIVADA');
  const base = values.api.replace(/\/$/, '');
  const url = new URL(base);
  if (url.protocol !== 'https:' && !['127.0.0.1', 'localhost'].includes(url.hostname)) throw new Error('Use HTTPS');
  const destination = path.resolve(values.manifest);
  fs.mkdirSync(path.dirname(destination), { recursive: true, mode: 0o700 });
  const state = fs.existsSync(destination) ? JSON.parse(fs.readFileSync(destination, 'utf8')) : {
    source: 'Fictional data requested by the workspace owner; not patient care evidence',
    api: base, organization: values.organization,
    day: new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Bogota', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date()),
    createdAt: new Date().toISOString(), operations: {},
  };
  if (state.api !== base || state.organization !== values.organization) throw new Error('El manifiesto pertenece a otro destino');
  function save() { fs.writeFileSync(destination + '.tmp', JSON.stringify(state, null, 2), { mode: 0o600 }); fs.renameSync(destination + '.tmp', destination); }
  save();
  let token;
  const summary = {};
  async function call(route, method = 'GET', body, key) {
    const response = await fetch(base + route, {
      method, headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}`, 'X-Organization-Id': values.organization } : {}), ...(key ? { 'Idempotency-Key': key } : {}) },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }), signal: AbortSignal.timeout(30000),
    });
    const result = response.status === 204 ? null : await response.json();
    if (!response.ok) throw new Error(`${method} ${route}: ${response.status} ${JSON.stringify(result)}`);
    return result;
  }
  async function list(resource) {
    const rows = []; let after;
    do { const result = await call('/resources/' + resource + '?limit=100' + (after ? '&after=' + encodeURIComponent(after) : '')); rows.push(...result.data); after = result.page.next; } while (after);
    return rows;
  }
  async function create(resource, name, input) {
    const operation = resource + ':' + name;
    const existing = state.operations[operation];
    summary[resource] ??= { created: 0, existing: 0 };
    if (existing?.id) { summary[resource].existing++; return (await call(`/resources/${resource}/${existing.id}`)).data; }
    const pending = existing ?? { key: randomUUID(), input };
    state.operations[operation] = pending; save();
    const row = (await call('/resources/' + resource, 'POST', pending.input, pending.key)).data;
    pending.id = row.id; pending.savedAt = new Date().toISOString(); save();
    summary[resource].created++;
    return row;
  }
  function day(offset) { const date = new Date(state.day + 'T12:00:00Z'); date.setUTCDate(date.getUTCDate() + offset); return date.toISOString().slice(0, 10); }
  try {
    const login = await call('/auth/login', 'POST', { email: values.email, password: fs.readFileSync(values['password-file'], 'utf8').trim(), client: 'native' });
    token = login.accessToken;
    const profile = await call('/auth/me');
    if (!profile.organizations.some(org => org.id === values.organization)) throw new Error('Organización no disponible para esta cuenta');
    const members = await list('membresia');
    const member = members.find(row => row.usuario_id === profile.id && row.activo);
    if (!member) throw new Error('Falta la membresía activa');
    const sites = await list('sede');
    const principal = sites.find(row => row.activa);
    if (!principal) throw new Error('Falta una sede activa');
    const north = sites.find(row => row.codigo === 'CHAPINERO') ?? await create('sede', 'chapinero', { nombre: 'Sede Chapinero', codigo: 'CHAPINERO', direccion: 'Chapinero, Bogotá' });
    const species = await list('especie');
    const dog = species.find(row => row.nombre === 'Canino') ?? await create('especie', 'canino', { nombre: 'Canino' });
    const cat = species.find(row => row.nombre === 'Felino') ?? await create('especie', 'felino', { nombre: 'Felino' });
    const breeds = await list('raza');
    const breedsByName = {};
    for (const [name, speciesId] of [['Labrador retriever', dog.id], ['Golden retriever', dog.id], ['Beagle', dog.id], ['Schnauzer miniatura', dog.id], ['Mestizo canino', dog.id], ['Criollo de pelo corto', cat.id], ['Persa', cat.id]]) {
      breedsByName[name] = breeds.find(row => row.nombre === name && row.especie_id === speciesId) ?? await create('raza', name, { nombre: name, especie_id: speciesId });
    }
    const services = await list('tipo_servicio');
    for (const name of ['Baño y secado', 'Corte de pelo', 'Corte de uñas']) if (!services.some(row => row.nombre === name)) await create('tipo_servicio', name, { nombre: name });
    const guardians = [];
    for (const [index, [nombres, apellidos, email]] of [
      ['Valentina', 'Ríos Mendoza', 'valentina.rios'], ['Andrés Felipe', 'Cárdenas Ruiz', 'andres.cardenas'],
      ['Camila', 'Torres Salazar', 'camila.torres'], ['Sebastián', 'Vargas López', 'sebastian.vargas'],
      ['Mariana', 'Castro Beltrán', 'mariana.castro'], ['Daniel', 'Pineda Herrera', 'daniel.pineda'],
      ['Isabella', 'Moreno Acosta', 'isabella.moreno'], ['Nicolás', 'Ramírez Solano', 'nicolas.ramirez'],
    ].entries()) guardians.push(await create('tutor', String(index), { nombres, apellidos, email: email + '@example.test', ciudad: 'Bogotá' }));
    const definitions = [
      ['Bruno', 'Labrador retriever', 'macho', '2022-04-18', 'Dorado', 0],
      ['Luna', 'Criollo de pelo corto', 'hembra', '2023-09-07', 'Gris atigrado', 0],
      ['Milo', 'Beagle', 'macho', '2021-11-23', 'Tricolor', 1],
      ['Nala', 'Golden retriever', 'hembra', '2024-01-15', 'Dorado claro', 2],
      ['Toby', 'Schnauzer miniatura', 'macho', '2020-08-12', 'Sal y pimienta', 3],
      ['Kira', 'Mestizo canino', 'hembra', '2023-03-25', 'Negro y blanco', 4],
      ['Simón', 'Criollo de pelo corto', 'macho', '2022-07-04', 'Naranja atigrado', 4],
      ['Olivia', 'Persa', 'hembra', '2024-05-09', 'Blanco', 5],
      ['Max', 'Labrador retriever', 'macho', '2021-06-30', 'Chocolate', 6],
      ['Coco', 'Criollo de pelo corto', 'macho', '2025-02-14', 'Negro', 6],
      ['Alma', 'Mestizo canino', 'hembra', '2024-10-03', 'Canela', 7],
      ['Rocky', 'Beagle', 'macho', '2022-12-08', 'Tricolor', 7],
    ];
    const patients = [];
    const existingPets = await list('mascota');
    for (const [i, [nombre, breed, sexo, fecha_nacimiento, color, guardianIndex]] of definitions.entries()) {
      const raza = breedsByName[breed];
      let number = 101 + i; while (existingPets.some(p => p.codigo === `SK-${String(number).padStart(4, '0')}`)) number += 100;
      patients.push(await create('mascota', String(i), { codigo: `SK-${String(number).padStart(4, '0')}`, nombre, especie_id: raza.especie_id, raza_id: raza.id, sexo, fecha_nacimiento, color, tutor_principal_id: guardians[guardianIndex].id }));
    }
    const appointments = await list('cita');
    const times = ['09:00', '10:30', '12:00', '14:30'];
    const offsets = [0, 1, 2, 4, 7, 14];
    for (let i = 0; i < 24; i++) {
      const index = i % patients.length;
      const type = ['clinica', 'peluqueria', 'clinica', 'vacunacion'][i % 4];
      let start = new Date(`${day(offsets[Math.floor(i / 4)])}T${times[i % 4]}:00-05:00`);
      const conflicts = () => appointments.some(row => row.responsable_id === member.id && !['cancelada', 'no_asistio'].includes(row.estado) && Date.parse(row.inicio) < start.getTime() + 45 * 60000 && Date.parse(row.fin) > start.getTime());
      while (conflicts()) start = new Date(start.getTime() + 60 * 60000);
      const row = await create('cita', String(i), { mascota_id: patients[index].id, sede_id: i % 2 ? north.id : principal.id, tutor_contacto_id: guardians[definitions[index][5]].id, tipo: type, inicio: start.toISOString(), fin: new Date(start.getTime() + 45 * 60000).toISOString(), responsable_id: member.id, notas: type === 'peluqueria' ? 'Baño, secado y revisión de uñas' : type === 'vacunacion' ? 'Revisión del carné y esquema de vacunación' : i >= 12 ? 'Control de seguimiento y toma de peso' : 'Consulta general y valoración inicial' });
      if (!appointments.some(a => a.id === row.id)) appointments.push(row);
    }
    for (let i = 0; i < 6; i++) await create('pendiente_vacunal', String(i), { mascota_id: patients[i * 2].id, indicacion: 'Revisar carné de vacunación y definir próximos refuerzos en consulta', fecha_objetivo: day([0, 1, 3, 7, 14, 21][i]) });
    state.completedAt = new Date().toISOString(); save();
    console.table(summary);
    console.log('Carga completada. Manifiesto privado actualizado; no se modificaron registros previos.');
  } finally { if (token) await call('/auth/logout', 'POST').catch(() => {}); }
}
main().catch(error => { console.error(error.message); process.exitCode = 1; });

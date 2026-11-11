const assert = require('node:assert/strict');
const { randomUUID } = require('node:crypto');
module.exports = async function calendar({ request, owner, org, otherOrg, ids, staffToken, base, adminToken, user }) {
  const create = async (resource, body) => (await request('POST', '/' + resource, body, 201)).data;
  const body = { mascota_id: ids.mascota, sede_id: ids.sede, tutor_contacto_id: ids.tutor, tipo: 'clinica', responsable_id: ids.rootMembership };
  const overnight = await create('cita', { ...body, inicio: '2029-01-01T23:30:00-05:00', fin: '2029-01-02T00:30:00-05:00', notas: 'Control de seguimiento' });
  const appointment = await create('cita', { ...body, inicio: '2029-01-02T12:00:00-05:00', fin: '2029-01-02T12:30:00-05:00' });
  await create('pendiente_vacunal', { mascota_id: ids.mascota, indicacion: 'Revisar esquema vacunal', fecha_objetivo: '2029-01-02' });
  await create('servicio_peluqueria', { mascota_id: ids.mascota, sede_id: ids.sede, tutor_contacto_id: ids.tutor, responsable_id: ids.rootMembership, fecha_servicio: '2029-01-02', telefono_contacto_servicio: '+57000000000' });
  await create('recordatorio', { tutor_id: ids.tutor, cita_id: appointment.id, canal: 'email', programado_en: '2029-01-02T08:00:00-05:00', clave_idempotencia: randomUUID() });
  const path = '/clinica/calendario?from=2029-01-02&to=2029-01-02&timeZone=America%2FBogota';
  const page = await request('GET', path);
  assert.equal(page.data.length, 5);
  assert.deepEqual(new Set(page.data.map(e => e.resource)), new Set(['cita', 'pendiente_vacunal', 'servicio_peluqueria', 'recordatorio']));
  assert.ok(page.data.some(e => e.id === overnight.id));
  assert.ok(page.data.filter(e => e.allDay).every(e => e.start === '2029-01-02'));
  assert.ok(page.data.filter(e => e.petId).every(e => e.petName === 'Luna'));
  assert.equal((await request('GET', path.replaceAll('2029-01-02', '2029-01-03'))).data.length, 0);
  assert.equal((await request('GET', path, undefined, 200, { 'X-Organization-Id': otherOrg })).data.length, 0);
  await request('GET', path, undefined, 403, { Authorization: `Bearer ${staffToken}` });
  await request('GET', path, undefined, 401, { Authorization: '' });
  for (const suffix of ['&limit=0', '&limit=101', '&after=invalid']) await request('GET', path + suffix, undefined, 400);
  await request('GET', path.replace('America%2FBogota', 'Invalid/Zone'), undefined, 400);
  await request('GET', path.replace('to=2029-01-02', 'to=2029-04-02'), undefined, 400);
  await request('GET', path.replace('to=2029-01-02', 'to=2029-01-01'), undefined, 400);
  const all = []; let after;
  do { const result = await request('GET', path + '&limit=1' + (after ? '&after=' + after : '')); all.push(...result.data); after = result.page.next; assert.ok(all.length <= 5); } while (after);
  assert.deepEqual(all.map(e => e.id), page.data.map(e => e.id));
  // Date-only events must keep their date even in a positive UTC offset.
  const tokyo = await request('GET', path.replace('America%2FBogota', 'Asia%2FTokyo'));
  assert.equal(tokyo.data.filter(e => e.allDay && e.start === '2029-01-02').length, 2);
  const site = await create('sede', { nombre: 'Otra sede calendario', codigo: 'CAL-OTHER' });
  const hidden = await create('cita', { ...body, sede_id: site.id, inicio: '2029-01-02T14:00:00-05:00', fin: '2029-01-02T14:30:00-05:00' });
  const role = await create('rol', { nombre: 'Lectura calendario por sede' });
  const [permission] = await owner.query("SELECT id FROM vet.permiso WHERE codigo='cita.read'");
  await create('rol_permiso', { rol_id: role.id, permiso_id: permission.id });
  const assignment = await create('asignacion_rol', { membresia_id: ids.membresia, rol_id: role.id, sede_id: ids.sede });
  try {
    const limited = await request('GET', path, undefined, 200, { Authorization: `Bearer ${staffToken}` });
    assert.ok(limited.data.every(e => e.resource === 'cita' && e.id !== hidden.id));
    assert.equal(limited.data.length, 2);
    assert.equal(limited.unavailable.length, 3);
    if (process.env.TEST_BROWSER === 'true') await require('../../superkanes_frontend/test/calendar-browser.cjs')({ base, adminToken, staffToken, user });
  } finally { await request('DELETE', '/asignacion_rol/' + assignment.id, undefined, 204, { 'If-Match': `"${assignment.version}"` }); }
  console.log('OK: calendario unificado, medianoche, fechas sin hora, zonas horarias, paginación, permisos y aislamiento por sede/organización.');
};

# Plan
AuthService.me establece contexto transaccional de plataforma desde Identity verificada.
Para admin consulta vet.organizacion activa con orden nombre/id; usuarios ordinarios
siguen usando auth.my_organizations. Reutilizar RLS y ResourceAccessService sin migraciones.
AppShell: estado local persistido de contracción, iconos accesibles, atajo a organización,
estilos responsive. ThemeSelect se sustituye por ThemeToggle, conservando preferencia y
suscripción a media/storage. Tests de auth existentes y theme-browser adaptados.

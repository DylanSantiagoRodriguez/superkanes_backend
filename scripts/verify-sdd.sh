#!/usr/bin/env bash
set -euo pipefail
backend="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)"
root="$(dirname -- "$backend")"
if [[ "$(node -p 'process.versions.node.split(".")[0]')" != 24 ]]; then
  echo 'Se requiere Node 24 en PATH para verificar Superkanes.' >&2
  exit 1
fi
(
  cd "$backend"
  export SPECIFY_FEATURE_DIRECTORY="${SPECIFY_FEATURE_DIRECTORY:-specs/007-busqueda-documentos}"
  bash .specify/scripts/bash/check-prerequisites.sh --json --require-spec --require-tasks --include-tasks
)
for repo in "$backend" "$root/superkanes_frontend"; do
  git -C "$repo" diff --check
done
(cd "$root/superkanes_backend" && npm run build && npm run lint && npm test -- --runInBand && npm run test:e2e -- --runInBand)
(cd "$root/superkanes_frontend" && npm run build && npm run lint)
if [[ "${SDD_INTEGRATION:-false}" == true ]]; then
  (cd "$root/superkanes_backend" && npm run test:auth && TEST_STORAGE=true TEST_BROWSER=true TEST_FRONTEND_URL="${TEST_FRONTEND_URL:-http://localhost:5174}" npm run test:crud)
else
  echo 'Integración PostgreSQL/MinIO/Chromium no ejecutada. Usar SDD_INTEGRATION=true con servicios locales.'
fi

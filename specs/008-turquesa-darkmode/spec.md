# Feature Specification: SUPERKANES — Turquesa y modo oscuro

**Feature Branch**: feature/008-turquesa-darkmode
**Created**: 2026-11-17
**Status**: Especificado para implementación
**Input**: Sustituir el azul oscuro por #00B4D8 de la imagen, conservar el blanco/claro y acomodar darkmode.

## Alcance del cambio
- Área: apariencia de acceso, navegación, formularios, calendario, usuarios y clínica.
- Actor: personal que utiliza la aplicación, con o sin sesión iniciada.
- Actual: paleta azul, fondos claros y sin selector de apariencia ni tema oscuro.
- Esperado: acentos turquesa exactos #00B4D8, modo claro con superficies blancas
  conservadas y modo oscuro coherente y legible.
- Incluye: Claro/Oscuro/Sistema, preferencia recordada y cambio de sistema en vivo.
- Fuera de alcance: permisos, API, datos clínicos, PDF y colores escritos dentro del documento.

## User Scenarios & Testing *(mandatory)*
### User Story 1 - Personalizar apariencia (Priority: P1)
Como usuario quiero elegir la apariencia sin perder datos del formulario ni sesión.
**Why this priority**: identidad solicitada y comodidad de lectura.
**Independent Test**: cambiar apariencia en acceso y workspace, recargar y revisar.
**Acceptance Scenarios**:
1. En Claro, los botones principales usan #00B4D8 y las tarjetas siguen blancas.
2. En Oscuro, fondos, formularios, calendarios, diálogos y estados se adaptan con texto legible.
3. Recargar conserva la opción. Sistema sigue la preferencia del dispositivo en vivo.
4. Cambiar apariencia conserva entradas y permite operar por teclado y en móvil.
### Edge Cases
Almacenamiento del navegador bloqueado: el cambio funciona durante la sesión.
Preferencia inválida: usar Sistema. Los documentos clínicos conservan su hoja blanca
para no alterar el contraste del contenido formateado que el usuario ya guardó.

## Requirements *(mandatory)*
### Functional Requirements
- FR-001: aplicar #00B4D8 en acentos y acciones principales; conservar fondos blancos en Claro.
- FR-002: permitir Claro, Oscuro y Sistema desde acceso y aplicación autenticada.
- FR-003: recordar solo la preferencia visual, sin almacenar información clínica o credenciales.
- FR-004: ajustar textos, fondos, bordes, selección, hover, errores y controles nativos en Oscuro.
- FR-005: no modificar contenido documental ni contratos funcionales; no reiniciar formularios.
### Key Entities
Preferencia local de apariencia: claro, oscuro o sistema; sin entidades de negocio nuevas.

## Success Criteria *(mandatory)*
### Measurable Outcomes
- SC-001: los tres modos funcionan, la elección persiste y Sistema responde al dispositivo.
- SC-002: contraste mínimo 4.5:1 para texto normal en superficies y botones principales.
- SC-003: sin desbordamiento horizontal a 390 px; formularios conservan sus valores al cambiar.
- SC-004: build/lint y comprobación en navegador aprobados.

## Assumptions
Sistema es la opción inicial. El turquesa requiere texto oscuro sobre botones;
los enlaces sobre blanco usan una variante turquesa más oscura para legibilidad.
La hoja clínica blanca representa el documento y se conserva incluso en modo oscuro.

## Ajuste visual solicitado: login con tarjeta lateral de vidrio

El usuario aporta referencias de una tarjeta lateral y una superficie translúcida con
desenfoque. Conservar textos, ilustración de mascotas, turquesa #00B4D8, campos y
funciones del acceso; presentar el formulario en una tarjeta a la derecha con margen,
borde redondeado, transparencia, blur y sombra suave. Fondo compartido con luz turquesa.
En móvil, apilar la tarjeta sin desbordamientos. Adaptar el vidrio al tema claro/oscuro,
con fondo opaco de respaldo cuando no haya soporte de desenfoque. No añadir registro
público, accesos sociales ni los colores/contenidos de las imágenes de referencia.
Aceptación: tarjeta lateral visible en escritorio, legibilidad en ambos temas, login
y selector conservados, ancho 390 px sin scroll horizontal.

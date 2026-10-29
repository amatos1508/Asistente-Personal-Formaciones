# Seguridad y protección de datos

Este documento define las salvaguardas mínimas para el Asistente Personal de Formaciones. No sustituye el análisis jurídico del responsable del tratamiento ni los contratos con los proveedores.

## Estado y límites actuales

- Vercel Authentication debe permanecer habilitada para **All Deployments** en el proyecto, tanto para producción como para las URL de previsualización. No crear excepciones públicas ni compartir enlaces de bypass.
- La interfaz de esta versión guarda reuniones, tareas y fichas en `localStorage`. Ese almacenamiento no tiene cifrado propio, vive en el perfil del navegador y no ofrece control de acceso por registro.
- Hasta que exista almacenamiento de servidor con autenticación y controles de acceso revisados, se utilizarán exclusivamente datos ficticios. No guardar nombres, correos, asistencia, notas identificativas, resultados o códigos de certificación de alumnos.
- La conexión actual con Neon se usa únicamente para una comprobación de salud. No se considera que la aplicación tenga persistencia segura de las fichas.
- El esquema de `db/001_initial_schema.sql` es una propuesta, no una migración aprobada. No ejecutarla ni conectar funciones de escritura hasta completar la puerta de seguridad de base de datos descrita abajo.

## Clasificación y minimización

Tratar como información restringida cualquier dato que identifique o pueda identificar a alumnos, instructores o contactos: nombres, correos, asistencia, calificaciones, resultados, códigos de certificación, notas y enlaces privados de reuniones.

Antes de incorporar datos reales:

1. Documentar la finalidad específica y la base jurídica de cada categoría de datos.
2. Recoger únicamente los datos necesarios para esa finalidad.
3. Informar a las personas de forma transparente y definir el proceso para acceso, rectificación, supresión y demás derechos aplicables.
4. Definir plazos de conservación y borrado por categoría. No conservar datos «por si acaso».
5. Revisar los contratos de encargado, ubicaciones y transferencias de Vercel, Neon y cualquier servicio futuro de IA o correo.
6. Valorar si el tratamiento requiere una evaluación de impacto antes de empezar.

## Acceso, aplicación y almacenamiento

- Mantener Vercel Authentication con alcance **All Deployments** y dar acceso al proyecto solo a las cuentas necesarias.
- No publicar una excepción, una URL de bypass ni un enlace compartido para datos reales.
- La aplicación debe exigir una identidad autenticada antes de mostrar o modificar fichas.
- No guardar contraseñas, tokens de sesión, claves API ni secretos en el navegador, en `localStorage`, en el repositorio o en variables `NEXT_PUBLIC_*`.
- Para producción, guardar datos en el servidor, con cifrado en tránsito, cifrado de almacenamiento gestionado por el proveedor, copias de seguridad y un proceso probado de recuperación.
- Las fichas del navegador de esta versión son solo de prueba. Usar **Borrar datos de prueba** al terminar una prueba o al dejar un dispositivo compartido.
- La política CSP con nonce, HSTS, protección contra iframes, control de tipo MIME, política de referente y permisos del navegador deben permanecer activas. Si se añaden analítica, fuentes, almacenamiento, Webex o IA externos, revisar y limitar las directivas antes del despliegue.

## Base de datos: puerta obligatoria antes de guardar datos personales

Antes de aplicar una migración o implementar lecturas/escrituras:

- Habilitar autenticación en la aplicación y validar la sesión en el servidor para cada ruta y operación.
- Añadir una relación de propietario para cada registro y establecer políticas de seguridad por fila que impidan leer o cambiar datos de otra persona.
- Usar una credencial de base de datos de privilegio mínimo, solo en el servidor; separar credenciales de desarrollo, previsualización y producción.
- Revisar permisos SQL, copias de seguridad, restauración, eliminación y retención.
- Probar explícitamente que un usuario sin sesión recibe rechazo y que un usuario no puede leer, editar ni borrar registros de otro propietario.
- No confiar solo en controles de interfaz o en filtros enviados por el cliente.

## Secretos y dependencias

- Guardar `DATABASE_URL`, `HEALTH_CHECK_TOKEN` y futuros secretos en el gestor de variables cifradas de Vercel, separados por entorno. Nunca subir sus valores a GitHub ni incluirlos en logs.
- La ruta `/api/health/db` debe responder solo a una cabecera `Authorization: Bearer` válida. Sin `HEALTH_CHECK_TOKEN` configurado, debe permanecer cerrada. No devolver errores SQL, URLs, credenciales ni detalles de conexión.
- Revisar actualizaciones de dependencias mediante Dependabot y mantener una revisión de seguridad al menos semanal. Añadir un `package-lock.json` antes de depender de instalaciones reproducibles o promover cambios a producción.
- No desplegar una dependencia afectada por un aviso de seguridad conocido; actualizar a una versión parcheada y conservar evidencia de revisión.

## Revisión y despliegue

- Trabajar en ramas y revisar cambios mediante Pull Request; no hacer cambios directos a producción.
- Confirmar que la previsualización compila y revisar la protección de Vercel, las cabeceras y las rutas antes de promover a producción.
- No exponer source maps ni variables de entorno en bundles o logs.
- Revisar permisos de colaborador y configuración de protección cada trimestre y al cambiar de equipo o proveedor.
- Documentar cada cambio relevante y actualizar este protocolo cuando se habiliten base de datos, importación de Webex, IA o correo.

## Gestión de incidentes de datos

Ante una pérdida, acceso, divulgación, alteración o destrucción no autorizada:

1. **Contener:** restringir el despliegue afectado, revocar sesiones o enlaces expuestos y rotar los secretos comprometidos. Preservar registros y evidencias pertinentes.
2. **Evaluar:** avisar inmediatamente a la persona responsable del tratamiento; determinar qué datos y personas están afectados, el alcance, duración, origen y riesgo.
3. **Corregir y recuperar:** eliminar la causa, restaurar los datos cuando corresponda y verificar las medidas antes de reabrir el servicio.
4. **Documentar:** registrar todos los incidentes y las decisiones, incluso cuando se concluya que no hace falta notificar.
5. **Notificar:** si la brecha probablemente entraña un riesgo para los derechos y libertades, el responsable debe notificar a la autoridad de control sin dilación indebida y, cuando sea posible, dentro de las 72 horas desde que tiene constancia. Si el riesgo para las personas es alto, valorar también la comunicación a las personas afectadas.

La persona responsable del tratamiento debe usar el procedimiento y las herramientas vigentes de la autoridad competente. En España, consultar la guía de brechas de la AEPD: https://www.aepd.es/derechos-y-deberes/cumple-tus-deberes/medidas-de-cumplimiento/brechas-de-datos-personales-notificacion

## Referencias de diseño

Este protocolo toma como referencias los principios de minimización y limitación de finalidad y las medidas de seguridad apropiadas al riesgo de los artículos 5, 25 y 32 del RGPD, junto con los controles técnicos de OWASP ASVS. La aplicabilidad y las obligaciones concretas deben evaluarse para el tratamiento real.

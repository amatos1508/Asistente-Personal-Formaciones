# Seguridad y protección de datos

Este documento define las salvaguardas mínimas para el Asistente Personal de Formaciones. No sustituye el análisis jurídico del responsable del tratamiento ni los contratos con los proveedores.

## Estado y límites actuales

- Vercel Authentication y Neon Auth protegen el acceso; la aplicación además limita el acceso a la dirección configurada en `AETHELTIME_ALLOWED_EMAIL`.
- La Preview de `security/privacy-hardening` usa la rama `development` de Neon a través de la variable privada `DATABASE_URL` ya gestionada por la integración. No se creó una segunda variable global ni se modificó Producción.
- La API del servidor obtiene el propietario de la sesión autenticada; nunca acepta un identificador de propietario desde el navegador. La tabla `public.aethel_workspace` guarda el espacio en una fila JSONB por usuario. La política RLS está habilitada y forzada en desarrollo, y el rol `aethel_app_dev` tiene permisos de lectura e inserción/actualización limitados a esa tabla y a su fila.
- Los datos anteriores del navegador solo se suben si el usuario pulsa **Importar mis datos**. La aplicación conserva por ahora esa copia local; no se borra automáticamente. El guardado sincronizado debe comprobarse en la sesión real antes de incorporar datos identificativos.
- La base de Producción (`main`) todavía no tiene esta migración ni se ha probado con esta versión. La aplicación no está lista para promoverse a Producción.
- La vista de Programadas, Agenda, Catálogo y Automatización no usa las tablas del esquema heredado para equipos; no se incorpora planificación de formadores compartida.

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

## Base de datos y controles pendientes

La Preview dispone de lectura y escritura autenticadas, parámetro SQL por separado, comprobación de origen, límite de tamaño de carga, política RLS basada en el ID autenticado y una credencial de aplicación propia para la rama de desarrollo. La tabla se creó vacía; no se han cargado registros de usuario desde este cambio.

Antes de promover el código o guardar datos personales reales:

1. Probar en la Preview el inicio de sesión, la importación explícita, el guardado, la recarga y la lectura con la misma cuenta; comprobar el rechazo de una sesión no autenticada.
2. Crear y aplicar una migración equivalente en `main` con un rol de aplicación específico para Producción y revisar permisos/RLS allí. No reutilizar el rol ni la conexión de desarrollo.
3. Mantener la conexión privada de base de datos solo en el servidor; verificar accesos, copias de seguridad, restauración y retención.
4. Decidir y probar el borrado de la copia de `localStorage` después de confirmar que la copia de Neon está completa.
5. Revisar minimización, base jurídica, transparencia, contratos de encargado, retención y gestión de derechos antes de cargar datos de alumnos.

Las comprobaciones de compilación y del rol/RLS en la base de desarrollo no equivalen a una prueba de extremo a extremo con una sesión de usuario ni a una auditoría de seguridad.

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

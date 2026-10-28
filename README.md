# Asistente Personal de Formaciones

Aplicación privada de uso individual para ayudar a organizar el trabajo diario, las formaciones asignadas y sus documentos. No es una herramienta de coordinación de equipos.

## Alcance funcional

### 1. Panel personal
- Resumen de reuniones próximas, formaciones activas, tareas pendientes y cierres por completar.
- Acceso rápido a las fichas y documentos de cada formación.

### 2. Agenda manual y recordatorios
- Crear, editar y eliminar reuniones y otros compromisos manualmente; no se requiere sincronización con Outlook, Teams ni Google Calendar.
- Campos previstos: título, fecha, hora, duración, ubicación o enlace, notas y recordatorio.
- Vistas de día, semana y mes.
- Preferencia acordada: recordatorios solo dentro de la aplicación, con 15 minutos de antelación por defecto.
- El recordatorio debe mostrarse dentro de la aplicación cuando esté abierta. No se presupone que haya avisos mientras la aplicación esté cerrada.
- Permitir ajustar la antelación por reunión en una fase posterior si resulta útil.

### 3. Seguimiento individual de formaciones
- Registrar formaciones asignadas, cliente, fechas, duración prevista y real, estado y sesiones.
- Guardar notas y observaciones por sesión y adjuntar los archivos relevantes.
- Crear tareas asociadas a una formación, como preparar material, revisar asistencia o enviar el cierre.
- No incluir planificación de disponibilidad de otros formadores ni coordinación de cuentas compartidas.

### 4. Importación y consolidación de asistencia de Webex
- Permitir importar múltiples archivos de asistencia de una formación.
- Generar un único archivo Excel descargable con una hoja inicial de resumen que muestre el total de horas asistidas por alumno.
- Crear una pestaña separada por cada archivo/jornada importada, conservando el detalle de origen.
- Normalizar nombres con cuidado y avisar de posibles coincidencias ambiguas; no fusionar alumnos de forma silenciosa.
- Evitar duplicar registros y dejar claro cómo se calculan las horas.
- Conservar los archivos originales para poder revisar los resultados.

### 5. Certificaciones y resultados
- Registrar por alumno el código de certificación asignado y el resultado (aprobado/no aprobado).
- Exportar un archivo con nombres, códigos y resultados asociado a la formación correspondiente.

### 6. Asistente para el cierre de formación
- Usar las notas registradas para preparar un borrador de correo de cierre.
- Contemplar desarrollo de la formación, satisfacción o comentarios de los alumnos, dudas, cumplimiento de objetivos, propuestas de otras formaciones e interés en otros productos.
- No inventar datos ni conclusiones que no estén en las notas.
- El correo siempre queda para revisión del usuario antes de enviarse.

## Principios técnicos y de privacidad
- Proyecto independiente: no modificar ni reutilizar el repositorio o la base de datos del Gestor de Formaciones anterior.
- Acceso privado y autenticación segura antes de incorporar datos reales de alumnos.
- Proteger datos personales y guardar secretos fuera del código fuente.
- Desarrollo por fases y pruebas antes de desplegar.
- La especificación no implica que todas las funciones estén ya implementadas; deben desarrollarse y verificarse por etapas.

## Fases propuestas
1. Resolver y verificar el acceso privado.
2. Panel personal, agenda manual, tareas y recordatorios dentro de la aplicación.
3. Fichas de formaciones, sesiones y notas.
4. Importación y consolidación de Excel de asistencia.
5. Certificaciones, resultados y borradores de correos de cierre.

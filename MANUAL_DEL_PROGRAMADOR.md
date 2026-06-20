# Manual del Programador

## 1. Descripcion general

`IA en la Mochila` es una plataforma web educativa orientada a la divulgacion y uso pedagogico de herramientas de inteligencia artificial. El sistema incluye:

- autenticacion de usuarios con Supabase
- navegacion por vistas educativas
- catalogo filtrable de herramientas de IA
- evaluacion interactiva
- generacion de certificado en PDF
- perfil de usuario con acceso posterior al certificado aprobado

El proyecto esta construido como una aplicacion web estatica enriquecida con JavaScript del lado del cliente.

## 2. Estructura del proyecto

Archivos principales:

- [index.html](C:\Users\DELL\Documents\IA en la Mochila\index.html)
  Contiene la estructura base de la interfaz, las vistas principales y los contenedores del sistema.

- [Style.CSS](C:\Users\DELL\Documents\IA en la Mochila\Style.CSS)
  Define toda la apariencia visual, la responsividad, la navegacion, el perfil, la evaluacion y el certificado.

- [Actions.js](C:\Users\DELL\Documents\IA en la Mochila\Actions.js)
  Centraliza la logica de autenticacion, navegacion, catalogo, evaluacion, perfil y generacion del certificado.

- [Recursos](C:\Users\DELL\Documents\IA en la Mochila\Recursos)
  Carpeta que almacena logos, imagenes institucionales, fotos del equipo y la plantilla oficial del certificado.

## 3. Arquitectura funcional

La aplicacion trabaja bajo una arquitectura simple de cliente:

1. `index.html` carga la estructura general.
2. `Style.CSS` aplica el diseño institucional y responsive.
3. `Actions.js` reconstruye algunas vistas dinamicas, conecta eventos y controla el estado.
4. Supabase maneja autenticacion y metadatos del usuario.

No existe un backend propio tradicional. La persistencia se reparte entre:

- `Supabase Auth` para inicio de sesion y metadatos del usuario
- `localStorage` para datos locales como perfil y navegacion
- `sessionStorage` para recordar la vista abierta mientras la pestaña siga activa

## 4. Flujo principal de la aplicacion

### 4.1 Inicio de sesion

La autenticacion se realiza con Supabase usando correo y contraseña. Al iniciar sesion:

- se recupera la sesion actual
- se reconstruye el perfil del usuario
- se habilita la navegacion de la aplicacion

Funciones clave en [Actions.js](C:\Users\DELL\Documents\IA en la Mochila\Actions.js):

- `handleLogin()`
- `handleRegister()`
- `syncSessionFromSupabase()`
- `mapSupabaseUser()`

### 4.2 Navegacion

La interfaz trabaja por vistas internas. Cada seccion se muestra u oculta sin recargar la pagina.

Vistas principales:

- `dashboardView`
- `profileView`
- `iaEducacionView`
- `aplicacionesView`
- `recursosView`
- `evaluacionView`
- `resultsView`
- `notebooklmView`
- `equipoView`

Funciones clave:

- `showDashboard()`
- `showView()`
- `handleAppNavigation()`
- `activateDashboardNav()`

### 4.3 Catalogo de herramientas

El catalogo se define mediante el arreglo `tools` en [Actions.js](C:\Users\DELL\Documents\IA en la Mochila\Actions.js).

Cada herramienta contiene:

- categoria principal
- sitio oficial
- identificador de video de YouTube
- nombre
- descripcion
- siglas
- etiqueta visible
- clase visual
- gradiente del icono

El filtrado se hace por especialidad principal para evitar duplicaciones entre categorias.

Funciones clave:

- `bindCatalogEvents()`
- `renderToolCard()`
- `updateCount()`

## 5. Sistema de evaluacion

La evaluacion utiliza un banco de preguntas definido en `allQuestions`.

Proceso:

1. Se mezclan preguntas y opciones.
2. El usuario responde todas las preguntas.
3. El sistema calcula puntaje y porcentaje.
4. Si el puntaje es igual o superior a `80%`, se habilita el certificado.

Funciones clave:

- `initializeQuiz()`
- `prepareQuestionForQuiz()`
- `renderQuiz()`
- `submitQuiz()`
- `showResults()`
- `showDetailedResults()`

## 6. Certificado digital

El certificado se genera usando la plantilla oficial ubicada en:

- [Certificado de Participación Módulo IA Educación UPTC.png](C:\Users\DELL\Documents\IA en la Mochila\Recursos\Certificado de Participación Módulo IA Educación UPTC.png)

La estrategia actual no reconstruye el certificado desde cero. En su lugar:

1. Se carga la plantilla institucional.
2. Se dibujan encima los datos variables.
3. Se exporta el resultado como PDF usando `jsPDF`.

Datos variables usados:

- nombre del participante
- documento de identidad
- fecha de emision

Funciones clave:

- `drawCertificateOnCanvas()`
- `buildCertificatePdf()`
- `generateCertificatePdfUrl()`
- `shareCertificateByEmail()`

## 7. Certificado guardado en el perfil

Cuando el usuario aprueba la evaluacion:

- se genera un registro de certificado
- se guarda en `state.currentUser`
- se persiste localmente
- se sincroniza con los metadatos del usuario en Supabase

Esto permite que el participante vuelva a:

- ver el certificado
- descargar el PDF
- enviarlo al correo

sin repetir la evaluacion.

Funciones clave:

- `persistCertificateRecord()`
- `getCurrentCertificateRecord()`
- `updateProfileCertificateSection()`
- `bindCertificateEvents()`

## 8. Perfil del usuario

El perfil muestra:

- nombre completo
- correo institucional
- estado academico
- programa
- institucion
- certificado aprobado
- foto de perfil local

La imagen del perfil se conserva localmente en el navegador.

Funciones clave:

- `renderProfileAvatar()`
- `handleProfileImageChange()`
- `showProfilePanel()`

## 9. Dependencias externas

La aplicacion usa librerias cargadas por CDN:

- `@supabase/supabase-js`
- `Chart.js`
- `jsPDF`

Estas se referencian en [index.html](C:\Users\DELL\Documents\IA en la Mochila\index.html).

## 10. Consideraciones de mantenimiento

### 10.1 Cuando modificar el catalogo

Debes editar el arreglo `tools` en [Actions.js](C:\Users\DELL\Documents\IA en la Mochila\Actions.js).

Si agregas una nueva herramienta, define:

- categoria principal
- URL
- video
- descripcion
- siglas
- etiqueta

### 10.2 Cuando modificar preguntas

Debes editar `allQuestions` en [Actions.js](C:\Users\DELL\Documents\IA en la Mochila\Actions.js).

Se recomienda:

- mantener categorias claras
- evitar respuestas ambiguas
- revisar que las opciones sigan teniendo una correcta definida

### 10.3 Cuando modificar el certificado

Debes ajustar coordenadas en:

- `drawCertificateOnCanvas()`

Se recomienda no redibujar el diseño completo, sino mantener la plantilla oficial y mover solo:

- nombre
- documento
- fecha

## 11. Publicacion

El proyecto esta pensado para publicarse como frontend en Vercel, usando Supabase como proveedor de autenticacion.

Flujo recomendado:

1. modificar archivos locales
2. subir cambios a GitHub
3. Vercel redepliega automaticamente
4. Supabase mantiene autenticacion y metadatos

## 12. Mejoras futuras sugeridas

- base de datos propia para guardar resultados historicos
- panel de administracion
- exportacion de reportes
- trazabilidad de evaluaciones por usuario
- carga real de foto de perfil persistida en nube
- certificados con validacion publica

## 13. Recomendacion tecnica final

El archivo mas sensible del proyecto es [Actions.js](C:\Users\DELL\Documents\IA en la Mochila\Actions.js), porque concentra autenticacion, vistas, evaluacion y certificado. Cualquier cambio importante debe probarse sobre:

- inicio de sesion
- navegacion
- filtros del catalogo
- evaluacion
- perfil
- generacion de PDF

Antes de desplegar, conviene validar al menos esos seis puntos.

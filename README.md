# IA en la Mochila

Plataforma educativa enfocada en inteligencia artificial aplicada a la educacion. El proyecto incluye contenidos formativos, un catalogo de herramientas, una evaluacion interactiva y generacion de certificado.

## Estado actual

La version actual funciona como SPA estatica con `index.html`, `Style.CSS` y `Actions.js`. En esta iteracion se corrigieron problemas base de estructura:

- La logica principal de la aplicacion fue extraida a `Actions.js`.
- Se eliminaron scripts inline duplicados en `index.html`.
- Se corrigieron rutas rotas de recursos y favicon.
- Se ajusto la configuracion de depuracion de VS Code.
- Se agregaron mejoras basicas de enfoque accesible en CSS.

## Estructura

- `index.html`: interfaz principal y contenido.
- `Style.CSS`: estilos globales.
- `Actions.js`: autenticacion local, navegacion, catalogo, quiz, resultados y certificado.
- `Recursos/`: imagenes y recursos visuales.

## Limites actuales

Todavia no es un proyecto con nivel de tesis. Las brechas principales siguen siendo:

- No hay backend ni base de datos.
- La autenticacion es local y no segura para produccion.
- El contenido sigue embebido en el HTML.
- No existen pruebas automatizadas.
- No hay analitica, seguimiento de progreso ni evidencia de impacto pedagogico.

## Hoja de ruta para nivel tesis

### Fase 1. Refactorizacion tecnica

- Separar contenido, datos y logica en modulos.
- Llevar preguntas, herramientas y unidades a JSON.
- Organizar la interfaz por secciones reutilizables.

### Fase 2. Persistencia y gestion

- Crear backend con API para usuarios, progreso, intentos y certificados.
- Incorporar base de datos para trazabilidad academica.
- Agregar panel administrativo para editar contenido y revisar resultados.

### Fase 3. Capa investigativa

- Incorporar pretest y postest.
- Registrar tiempos, intentos, desempeno por categoria y progreso por estudiante.
- Exportar resultados para analisis estadistico.
- Definir indicadores de impacto pedagogico.

### Fase 4. Aporte original

Opciones defendibles para tesis:

- Recomendador de herramientas de IA segun perfil docente y objetivo didactico.
- Tutor adaptativo que sugiera rutas de aprendizaje segun resultados.
- Sistema de evaluacion adaptativa con retroalimentacion personalizada.

## Siguiente iteracion recomendada

La siguiente version deberia crear una estructura como esta:

```text
/data
  apps.json
  quiz.json
/js
  app.js
  auth.js
  quiz.js
  catalog.js
  certificate.js
/docs
  arquitectura.md
  metodologia.md
  plan-investigacion.md
```

## Como ejecutar el proyecto

Para que el registro y el inicio de sesion funcionen en cualquier navegador del mismo equipo, ya no debes abrir `index.html` directamente con doble clic.

1. La forma mas simple es ejecutar [abrir-app.bat](C:\Users\DELL\Documents\IA en la Mochila\abrir-app.bat).
2. Si prefieres hacerlo manual, ejecuta [start-server.bat](C:\Users\DELL\Documents\IA en la Mochila\start-server.bat) o corre `powershell -ExecutionPolicy Bypass -File .\server.ps1`.
3. Abre [http://localhost:8080](http://localhost:8080) en el navegador.
4. Si registras un usuario en Chrome, ese mismo usuario podra iniciar sesion en Edge o Firefox mientras usen esta misma aplicacion local.

## Autenticacion actual

- El frontend ya no guarda el registro completo en `localStorage`.
- Las cuentas se guardan en [data/users.json](C:\Users\DELL\Documents\IA en la Mochila\data\users.json).
- El backend local expone `POST /api/register` y `POST /api/login`.
- El navegador solo conserva el usuario activo para mantener la sesion local.

## Nota tecnica

Esta solucion resuelve el problema entre navegadores en el mismo equipo porque todos consultan el mismo servidor local. Si quieres que funcione tambien entre distintos computadores o desde internet, el siguiente paso es mover ese backend a un hosting o a una base de datos remota.
## Criterio academico

Para que el proyecto pueda sostenerse como reemplazo de tesis, no basta con que se vea bien. Debe demostrar:

- problema claramente formulado,
- aporte original,
- metodologia de evaluacion,
- datos medibles,
- trazabilidad tecnica,
- consideraciones eticas y de privacidad.

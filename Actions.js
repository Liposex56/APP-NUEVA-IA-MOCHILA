(() => {
  // Claves de almacenamiento usadas para sesión local, perfil y navegación.
  const STORAGE_KEYS = { currentUser: "iam_current_user", profileImage: "iam_profile_image", currentView: "iam_current_view" };
  const SUPABASE_URL = "https://bxxudrezbaxrmwekeyoe.supabase.co";
  const SUPABASE_KEY = "sb_publishable_SnBuzPXugGRag9uAP4NbpQ_HzPhP6BK";
  const supabaseClient = window.supabase?.createClient(SUPABASE_URL, SUPABASE_KEY);
  const elements = {};
  // Estado central de la aplicación: autenticación, evaluación y resultados.
  const state = { isLoginMode: true, currentUser: null, authPending: false, evaluationUserData: { name: "", email: "", documentId: "" }, currentQuestions: [], userAnswers: [], resultsChartInstance: null };

  const allQuestions = [
    { category: "Asistentes", question: "¿Qué herramienta se integra mejor con Microsoft 365?", options: ["ChatGPT", "Copilot", "Claude", "Perplexity"], correct: 1 },
    { category: "Asistentes", question: "¿Qué herramienta responde con fuentes citadas en procesos de investigación?", options: ["Perplexity", "Gemini", "Canva IA", "Kahoot!"], correct: 0 },
    { category: "Docencia", question: "¿Qué plataforma destaca en calificación asistida y análisis de exámenes?", options: ["Gradescope", "SlidesAI", "Pictory", "Designer"], correct: 0 },
    { category: "Docencia", question: "¿Qué plataforma ofrece utilidades pensadas específicamente para docentes?", options: ["Magic School AI", "ElevenLabs", "Lumen5", "DALL·E"], correct: 0 },
    { category: "Redacción", question: "¿Qué herramienta se usa para corregir gramática y estilo?", options: ["Grammarly", "Tome", "Canva IA", "Socratic"], correct: 0 },
    { category: "Redacción", question: "¿Qué herramienta sirve para parafrasear y reformular textos?", options: ["QuillBot", "Formative", "Kahoot!", "Descript"], correct: 0 },
    { category: "Multimedia", question: "¿Qué herramienta convierte texto en diapositivas automáticamente?", options: ["SlidesAI", "Grammarly", "Pictory", "Socratic"], correct: 0 },
    { category: "Multimedia", question: "¿Qué herramienta es fuerte para edición de audio y video mediante transcripción?", options: ["Descript", "Gemini", "Perplexity", "QuillBot"], correct: 0 },
    { category: "Multimedia", question: "¿Qué plataforma es útil para presentaciones narrativas interactivas?", options: ["Tome", "Gradescope", "ElevenLabs", "Formative"], correct: 0 },
    { category: "Multimedia", question: "¿Qué herramienta sirve para crear narraciones de voz realista?", options: ["ElevenLabs", "Kahoot!", "Socratic", "SlidesAI"], correct: 0 },
  ];

  // Catálogo base de herramientas: categoría principal, URL, video, nombre, descripción y estilo visual.
  const tools = [
    ["asistentes", "https://chat.openai.com", "hbwGYI0Nuoc", "ChatGPT", "Asistente general para explicar conceptos, redactar borradores y construir actividades.", "GPT", "Asistente", "c-chat", "#8b6a1b,#ccb15d"],
    ["investigacion", "https://gemini.google.com", "nqzzI5Pwnxc", "Gemini", "Especialmente útil para búsqueda inicial, síntesis y trabajo con el ecosistema de Google.", "GEM", "Investigación", "c-chat", "#244a7d,#6793d6"],
    ["asistentes", "https://copilot.microsoft.com", "zhFDhnTb0Gc", "Copilot", "Asistente de productividad y síntesis integrado con Microsoft 365.", "CP", "Asistente", "c-chat", "#173b71,#3f74c5"],
    ["escritura", "https://claude.ai", "eNcWAoj_sRI", "Claude", "Muy fuerte en documentos largos, escritura guiada y respuestas estructuradas.", "CL", "Escritura", "c-edu", "#874a23,#d28c57"],
    ["investigacion", "https://www.perplexity.ai", "oD91YfNd1Lo", "Perplexity", "Buscador conversacional con citas y fuentes para investigación.", "PX", "Investigación", "c-chat", "#155953,#349d95"],
    ["diseno", "https://www.canva.com", "fmmn808Fg74", "Canva IA", "Suite visual para presentaciones, piezas de aula e infografías.", "CV", "Diseño", "c-tools", "#1f5d86,#45a4c8"],
    ["imagen", "https://stability.ai", "TIrb1p_Slz4", "Stable Diffusion", "Generación de imágenes para ilustraciones y apoyos visuales.", "SD", "Imagen", "c-img", "#4a3368,#7552aa"],
    ["imagen", "https://openai.com/dall-e", "T7VdxsjPNU4", "DALL·E", "Generador visual para recursos creativos y ejemplos didácticos.", "DAL", "Imagen", "c-img", "#2c7869,#4bb09b"],
    ["diseno", "https://designer.microsoft.com", "vCiuBCIBABo", "Designer", "Diseño gráfico rápido con apoyo de IA para piezas visuales.", "MD", "Diseño", "c-tools", "#275487,#7caed8"],
    ["diseno", "https://www.adobe.com/express", "FcDobHGXwtA", "Adobe Express", "Creación de piezas visuales, publicaciones y clips breves.", "AE", "Diseño", "c-tools", "#9b4f2b,#d98d56"],
    ["audio", "https://www.descript.com", "rqtryU4PEFA", "Descript", "Edición de audio y video mediante transcripción.", "DS", "Audio", "c-audio", "#874a69,#ca81a4"],
    ["audio", "https://elevenlabs.io", "E3pzsdjKosk", "ElevenLabs", "Síntesis de voz y narraciones para accesibilidad y locución.", "EL", "Audio", "c-audio", "#5b4b91,#8f7cc7"],
    ["video", "https://lumen5.com", "5rNlV9houhg", "Lumen5", "Convierte texto en video de forma automatizada.", "L5", "Video", "c-video", "#2d7d45,#59bb7a"],
    ["video", "https://pictory.ai", "Y0qJdZAgkRA", "Pictory", "Transforma artículos o guiones en videos cortos.", "PT", "Video", "c-video", "#33724d,#4ea675"],
    ["escritura", "https://www.grammarly.com", "7I9L5y620O0", "Grammarly", "Corrección de gramática, claridad, tono y reescritura.", "GM", "Escritura", "c-edu", "#236b62,#3db3a1"],
    ["escritura", "https://quillbot.com", "COpaNErKhM4", "QuillBot", "Paráfrasis, reformulación y mejora de redacción.", "QB", "Escritura", "c-edu", "#95601a,#d29b4f"],
    ["docencia", "https://kahoot.com", "zaXwCWcwOOA", "Kahoot!", "Gamificación para repasos, participación y dinámicas de aula.", "KH", "Docencia", "c-edu", "#5c4994,#8e76d4"],
    ["docencia", "https://socratic.org", "kqz2TV21otI", "Socratic", "Apoyo al estudiante para resolver dudas paso a paso.", "SC", "Docencia", "c-edu", "#2f6f87,#4da8c1"],
    ["diseno", "https://www.slidesai.io", "w-Nkh4pPtEI", "SlidesAI", "Genera presentaciones desde texto con estructura inicial.", "SA", "Diseño", "c-tools", "#2a5382,#6193d0"],
    ["diseno", "https://tome.app", "zxicPhPzYl0", "Tome", "Presentaciones narrativas con enfoque editorial y storytelling.", "TO", "Diseño", "c-tools", "#68578d,#ad90c8"],
    ["docencia", "https://www.gradescope.com", "bNzIhOV6pQk", "Gradescope", "Calificación asistida y análisis de respuestas.", "GS", "Docencia", "c-edu", "#3b7b4b,#58b26d"],
    ["docencia", "https://www.formative.com", "zU3vOTrfzYA", "Formative", "Seguimiento en tiempo real y evaluación formativa.", "FM", "Docencia", "c-edu", "#94611f,#d9a04d"],
    ["docencia", "https://www.magicschool.ai", "gvf34OICdrQ", "Magic School AI", "Herramientas de IA pensadas para planeación, rúbricas y apoyo docente.", "MS", "Docencia", "c-edu", "#74477b,#b46dc3"],
    ["diseno", "https://genially.com/", "ZeVR4FOpe0g", "Genially", "Creación de presentaciones, infografías y experiencias interactivas con funciones de inteligencia artificial.", "GEN", "Diseño", "c-tools", "#7d3ac1,#e34c8c"],
  ];

  document.addEventListener("DOMContentLoaded", () => { init().catch((error) => console.error(error)); });

  async function init() {
    // Las vistas dinámicas se reconstruyen al iniciar para mantener el contenido sincronizado con este archivo.
    rebuildViews();
    cacheDom();
    applyStaticCopy();
    setAppShellVisible(false);
    bindAuthEvents();
    bindNavigationEvents();
    bindCatalogEvents();
    bindQuizEvents();
    bindCertificateEvents();
    updateCount();
    if (!supabaseClient) {
      showAlert("No fue posible inicializar la autenticación de Supabase.", "error");
      return;
    }
    await syncSessionFromSupabase();
    supabaseClient.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        state.currentUser = mapSupabaseUser(session.user);
        persistCurrentUser();
        restoreAppLocation();
      } else {
        state.currentUser = null;
        localStorage.removeItem(STORAGE_KEYS.currentUser);
        showView("loginView");
      }
    });
  }

  function rebuildViews() {
    // Estas vistas se generan desde JavaScript para centralizar textos, filtros y contenido multimedia.
    setView("iaEducacionView", `<header class="header"><div class="header-content"><button class="btn-back" data-back="dashboardView">Volver</button><button class="btn-logout" id="logoutBtn2">Salir</button></div></header><div class="content-container"><section class="content-section academic-hero"><span class="section-kicker">Fundamentos</span><h1 class="section-title">Qué es la inteligencia artificial</h1><p class="section-text">La inteligencia artificial desarrolla sistemas capaces de aprender de datos, reconocer patrones, procesar lenguaje y apoyar decisiones. En educación, su valor depende del criterio humano y del objetivo pedagógico que orienta su uso.</p></section><section class="feature-grid"><article class="feature-card"><div class="feature-icon">01</div><h3 class="feature-title">Disciplina científica</h3><p class="feature-text">Integra aprendizaje automático, visión por computador y procesamiento del lenguaje natural.</p></article><article class="feature-card"><div class="feature-icon">02</div><h3 class="feature-title">Aprende desde datos</h3><p class="feature-text">Los modelos encuentran regularidades para clasificar, predecir y generar contenido.</p></article><article class="feature-card"><div class="feature-icon">03</div><h3 class="feature-title">Exige validación</h3><p class="feature-text">Toda salida debe revisarse con criterio humano, verificación y pertinencia académica.</p></article></section><section class="content-section"><h2 class="section-subtitle">Capacidades principales</h2><ul class="section-list"><li>Analizar grandes volúmenes de información en poco tiempo.</li><li>Reconocer patrones en texto, imagen, audio y video.</li><li>Generar borradores, explicaciones, tablas y materiales de apoyo.</li><li>Personalizar rutas de aprendizaje a partir de necesidades concretas.</li></ul></section><section class="content-section emphasis-panel"><h2 class="section-subtitle">Criterio académico</h2><p class="section-text">La IA no reemplaza al docente ni garantiza exactitud por sí sola. Funciona mejor como apoyo para investigar, explicar y crear recursos cuando existe verificación de fuentes, propósito pedagógico y mediación humana.</p></section></div>`);
    setView("aplicacionesView", `<header class="header"><div class="header-content"><button class="btn-back" data-back="dashboardView">Volver</button><button class="btn-logout" id="logoutBtn3">Salir</button></div></header><div class="content-container"><section class="content-section academic-hero"><span class="section-kicker">Aplicación pedagógica</span><h1 class="section-title">IA en educación</h1><p class="section-text">La IA puede fortalecer la planeación, la producción de materiales, la atención a la diversidad y la evaluación formativa. Su incorporación debe responder a objetivos de aprendizaje claros y a principios éticos explícitos.</p></section><section class="feature-grid"><article class="feature-card"><div class="feature-icon">A</div><h3 class="feature-title">Planeación académica</h3><p class="feature-text">Apoya secuencias didácticas, rúbricas, actividades y ajustes de nivel.</p></article><article class="feature-card"><div class="feature-icon">B</div><h3 class="feature-title">Producción de recursos</h3><p class="feature-text">Facilita guías, resúmenes, presentaciones y cuestionarios.</p></article><article class="feature-card"><div class="feature-icon">C</div><h3 class="feature-title">Seguimiento formativo</h3><p class="feature-text">Permite detectar errores frecuentes y orientar apoyos pedagógicos.</p></article></section><section class="content-section"><h2 class="section-subtitle">Escenarios de uso</h2><div class="academic-list"><div class="academic-item"><h3>Antes de clase</h3><p>Sirve para organizar contenidos, ajustar niveles y anticipar preguntas frecuentes.</p></div><div class="academic-item"><h3>Durante la clase</h3><p>Ayuda a explicar conceptos, generar ejemplos y proponer actividades dinámicas.</p></div><div class="academic-item"><h3>Después de la clase</h3><p>Apoya la retroalimentación, el repaso y la construcción de materiales de profundización.</p></div></div></section></div>`);
    setView("recursosView", `<header class="header"><div class="header-content"><button class="btn-back" data-back="dashboardView">Volver</button><button class="btn-logout" id="logoutBtn4">Salir</button></div></header><div class="content-container"><section class="content-section academic-hero"><span class="section-kicker">Selección orientada</span><h1 class="section-title">Herramientas IA para estudio y docencia</h1><p class="section-text">Este catálogo organiza cada herramienta por su especialidad principal para evitar repeticiones entre filtros. La idea no es usarlas todas, sino elegir la que mejor responda a la necesidad pedagógica del momento.</p></section><section class="content-section compact-panel"><div class="tools-overview"><div><h2 class="section-subtitle">Cómo leer el catálogo</h2><p class="section-text">Filtra por especialidad principal y compara fortalezas según el propósito didáctico. También se añadieron videos explicativos de apoyo donde ya encontramos tutoriales útiles.</p></div><div class="tools-metrics"><div class="metric-card"><span class="metric-number">${tools.length}</span><span class="metric-label">herramientas curadas</span></div><div class="metric-card"><span class="metric-number" id="appCount">${tools.length}</span><span class="metric-label">visibles en pantalla</span></div></div></div></section><nav class="filters"><button class="filter-btn active" data-filter="all">Todas</button><button class="filter-btn" data-filter="asistentes">Asistentes</button><button class="filter-btn" data-filter="investigacion">Investigación</button><button class="filter-btn" data-filter="diseno">Diseño</button><button class="filter-btn" data-filter="imagen">Imagen</button><button class="filter-btn" data-filter="video">Video</button><button class="filter-btn" data-filter="audio">Audio</button><button class="filter-btn" data-filter="escritura">Escritura</button><button class="filter-btn" data-filter="docencia">Docencia</button></nav><section class="periodic" id="tabla">${tools.map(renderToolCard).join("")}</section></div>`);
    setView("notebooklmView", `<header class="header"><div class="header-content"><button class="btn-back" data-back="dashboardView">Volver</button><button class="btn-logout" id="logoutBtn6">Salir</button></div></header><div class="content-container"><section class="content-section academic-hero"><span class="section-kicker">Investigación asistida</span><h1 class="section-title">NotebookLM</h1><p class="section-text">NotebookLM trabaja con documentos propios. Permite resumir, comparar y organizar información a partir de fuentes seleccionadas por el docente o el estudiante.</p></section><section class="content-section"><h2 class="section-subtitle">Video explicativo</h2><div class="video-embed-container"><iframe src="https://www.youtube.com/embed/MvFXcIIb8EI" title="Video de NotebookLM" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe></div></section><section class="content-section"><h2 class="section-subtitle">Usos recomendados</h2><div class="academic-list"><div class="academic-item"><h3>Resumir documentos</h3><p>Extrae ideas centrales de textos académicos y materiales de clase.</p></div><div class="academic-item"><h3>Preparar explicaciones</h3><p>Convierte fuentes complejas en versiones más claras para estudiantes.</p></div><div class="academic-item"><h3>Comparar fuentes</h3><p>Encuentra coincidencias, diferencias y conceptos clave entre documentos.</p></div><div class="academic-item"><h3>Organizar estudio</h3><p>Ayuda a construir guías, preguntas de repaso y rutas de lectura.</p></div></div></section><section class="content-section"><h2 class="section-subtitle">Buenas prácticas</h2><ul class="section-list"><li>Sube documentos confiables y recientes para evitar conclusiones débiles.</li><li>Usa sus resúmenes como punto de partida, no como sustituto de la lectura.</li><li>Contrasta citas, conceptos y fechas antes de llevarlos al aula.</li><li>Combina la herramienta con preguntas del docente para profundizar.</li></ul></section></div>`);
    setView("equipoView", `<header class="header"><div class="header-content"><button class="btn-back" data-back="dashboardView">Volver</button><button class="btn-logout" id="logoutBtn7">Salir</button></div></header><div class="content-container"><section class="content-section academic-hero"><span class="section-kicker">Equipo del proyecto</span><h1 class="section-title">Desarrolladores y dirección académica</h1><p class="section-text">Esta propuesta fue construida desde la Licenciatura en Informática de la UPTC para acercar la inteligencia artificial a procesos reales de aprendizaje.</p></section><div class="developers-section"><h2 class="developers-title">Equipo</h2><div class="developers-grid"><div class="developer-card"><div class="developer-avatar"><img src="Recursos/SHARON.JPG" alt="Sharon Valentina Rodríguez Peña"></div><h3 class="developer-name">Sharon Valentina Rodríguez Peña</h3><p class="developer-role">Desarrolladora Web</p><p class="developer-institution">Universidad Pedagógica y Tecnológica de Colombia</p><p class="developer-contact">sharon.rodriguez@uptc.edu.co</p></div><div class="developer-card"><div class="developer-avatar"><img src="Recursos/CRISTIAN.JPG" alt="Cristian Felipe Gómez Iguavita"></div><h3 class="developer-name">Cristian Felipe Gómez Iguavita</h3><p class="developer-role">Desarrollador Web</p><p class="developer-institution">Universidad Pedagógica y Tecnológica de Colombia</p><p class="developer-contact">cristian.gomez17@uptc.edu.co</p></div><div class="developer-card"><div class="developer-avatar"><img src="Recursos/Profe.jpg" alt="Yenny Carolina Riaño Castellanos"></div><h3 class="developer-name">Yenny Carolina Riaño Castellanos</h3><p class="developer-role">Directora del Proyecto</p><p class="developer-institution">Universidad Pedagógica y Tecnológica de Colombia</p><p class="developer-contact">yennycarolina.riano@uptc.edu.co</p></div></div></div><section class="research-groups-section" aria-labelledby="researchGroupsTitle"><div class="research-groups-heading"><span class="section-kicker">Grupos aliados</span><h2 class="section-title" id="researchGroupsTitle">Investigación que respalda el proyecto</h2></div><div class="research-groups-grid"><article class="research-group-card research-group-card-dark"><div class="research-group-logo-frame"><img class="research-group-logo research-group-logo-giace" src="Recursos/logoGiace.png" alt="Grupo de Investigación Ambientes Computacionales Educativos, GIACE"></div><h3>GIACE</h3><p>Grupo de Investigación Ambientes Computacionales Educativos</p></article><article class="research-group-card"><div class="research-group-logo-frame"><img class="research-group-logo research-group-logo-ave" src="Recursos/grupo%20ave%20sencillo.jpeg" alt="Grupo AVE"></div><h3>Grupo AVE</h3><p>Investigación e innovación educativa con inteligencia artificial</p></article><article class="research-group-card"><div class="research-group-logo-frame"><img class="research-group-logo research-group-logo-cetin" src="Recursos/cetin_logo-removebg-preview.png" alt="Grupo de Investigación CETIN"></div><h3>CETIN</h3><p>Ciencia y Educación en Tecnología e Informática</p></article></div></section></div>`);
  }

  function renderToolCard([cat, url, video, name, desc, initials, label, dot, gradient]) { return `<button class="app" data-cat="${cat}" data-url="${url}" data-video="${video}" data-name="${name}" data-desc="${desc}"><div class="logo" style="background:linear-gradient(135deg,${gradient})">${initials}</div><div class="meta"><div class="name">${name}</div><div class="cat"><span class="cat-dot ${dot}"></span>${label}</div></div></button>`; }
  function setView(id, html) { const view = document.getElementById(id); if (view) view.innerHTML = html; }
  function setText(node, text) { if (node) node.textContent = text; }

  function cacheDom() {
    elements.views = document.querySelectorAll(".view");
    elements.loginView = document.getElementById("loginView");
    elements.dashboardView = document.getElementById("dashboardView");
    elements.appHeader = document.getElementById("appHeader");
    elements.unitCards = document.querySelectorAll(".unit-card");
    elements.backButtons = document.querySelectorAll(".btn-back");
    elements.logoutButtons = document.querySelectorAll('[id^="logoutBtn"]');
    elements.userName = document.getElementById("userName");
    elements.profileMenuBtn = document.getElementById("profileMenuBtn");
    elements.profileDropdown = document.getElementById("profileDropdown");
    elements.profileInitials = document.getElementById("profileInitials");
    elements.profileSummaryAvatar = document.getElementById("profileSummaryAvatar");
    elements.profileSummaryName = document.getElementById("profileSummaryName");
    elements.profileSummaryEmail = document.getElementById("profileSummaryEmail");
    elements.profilePanel = document.getElementById("profilePanel");
    elements.profilePanelAvatar = document.getElementById("profilePanelAvatar");
    elements.profilePanelName = document.getElementById("profilePanelName");
    elements.profilePanelEmail = document.getElementById("profilePanelEmail");
    elements.profileImageInput = document.getElementById("profileImageInput");
    elements.profileUploadPreview = document.getElementById("profileUploadPreview");
    elements.profileCertificateSection = document.getElementById("profileCertificateSection");
    elements.profileCertificateStatus = document.getElementById("profileCertificateStatus");
    elements.profileCertificateMessage = document.getElementById("profileCertificateMessage");
    elements.profilePreviewCertificateBtn = document.getElementById("profilePreviewCertificateBtn");
    elements.profileDownloadCertificateBtn = document.getElementById("profileDownloadCertificateBtn");
    elements.profileEmailCertificateBtn = document.getElementById("profileEmailCertificateBtn");
    elements.dashboardNavLinks = document.querySelectorAll(".top-nav-link");
    elements.profileDropdownLinks = document.querySelectorAll(".profile-dropdown-link");
    elements.emailInput = document.getElementById("emailInput");
    elements.passwordInput = document.getElementById("passwordInput");
    elements.confirmPasswordInput = document.getElementById("confirmPasswordInput");
    elements.nameInput = document.getElementById("nameInput");
    elements.submitBtn = document.getElementById("submitBtn");
    elements.toggleFormBtn = document.getElementById("toggleFormBtn");
    elements.toggleText = document.getElementById("toggleText");
    elements.loginTitle = document.getElementById("loginTitle");
    elements.loginSubtitle = document.getElementById("loginSubtitle");
    elements.nameGroup = document.getElementById("nameGroup");
    elements.confirmPasswordGroup = document.getElementById("confirmPasswordGroup");
    elements.alertContainer = document.getElementById("alertContainer");
    elements.toggleBtn1 = document.getElementById("toggleBtn1");
    elements.toggleBtn2 = document.getElementById("toggleBtn2");
    elements.filterButtons = document.querySelectorAll(".filter-btn");
    elements.apps = document.querySelectorAll(".app");
    elements.appCount = document.getElementById("appCount");
    elements.videoModal = document.getElementById("videoModal");
    elements.closeModal = document.getElementById("closeModal");
    elements.modalTitle = document.getElementById("modalTitle");
    elements.modalDescription = document.getElementById("modalDescription");
    elements.modalVideo = document.getElementById("modalVideo");
    elements.videoContainer = document.getElementById("videoContainer");
    elements.visitSiteBtn = document.getElementById("visitSiteBtn");
    elements.quizContainer = document.getElementById("quizContainer");
    elements.submitQuizBtn = document.getElementById("submitQuizBtn");
    elements.resetQuizBtn = document.getElementById("resetQuizBtn");
    elements.userNameHeaderResults = document.getElementById("userNameHeaderResults");
    elements.scoreDisplay = document.getElementById("scoreDisplay");
    elements.resultMessage = document.getElementById("resultMessage");
    elements.certificateSection = document.getElementById("certificateSection");
    elements.resultsChart = document.getElementById("resultsChart");
    elements.detailedResults = document.getElementById("detailedResults");
    elements.previewCertificateBtn = document.getElementById("previewCertificateBtn");
    elements.downloadCertificateBtn = document.getElementById("downloadCertificateBtn");
    elements.emailCertificateBtn = document.getElementById("emailCertificateBtn");
    elements.certificateCanvas = document.getElementById("certificateCanvas");
    elements.certificatePreviewModal = document.getElementById("certificatePreviewModal");
    elements.certificatePreviewFrame = document.getElementById("certificatePreviewFrame");
    elements.closeCertificatePreviewBtn = document.getElementById("closeCertificatePreviewBtn");
  }

  function applyStaticCopy() {
    setText(elements.loginTitle, "Iniciar sesión");
    setText(elements.loginSubtitle, "Ingresa tus credenciales para continuar");
    setText(elements.submitBtn, "Iniciar sesión");
    setText(elements.toggleText, "¿No tienes cuenta? Regístrate aquí");
    const labels = document.querySelectorAll("label.form-label");
    setText(labels[0], "Nombre y apellido");
    setText(labels[1], "Correo electrónico");
    setText(labels[2], "Contraseña");
    setText(labels[3], "Confirmar contraseña");
    elements.nameInput?.setAttribute("placeholder", "Juan Pérez");
    elements.emailInput?.setAttribute("placeholder", "docente@institucion.edu.co");
    elements.passwordInput?.setAttribute("placeholder", "********");
    elements.confirmPasswordInput?.setAttribute("placeholder", "********");
    setText(elements.toggleBtn1, "Mostrar");
    setText(elements.toggleBtn2, "Mostrar");
    setText(document.querySelector(".header-logo"), "IA");
    setText(document.getElementById("logoutBtn1"), "Cerrar sesión");
    const welcomeTitle = document.querySelector(".welcome-title");
    if (welcomeTitle) {
      welcomeTitle.innerHTML = 'Bienvenido(a), <span id="userName"></span>';
      elements.userName = document.getElementById("userName");
    }
    const welcomeCopy = document.querySelector(".welcome-section p");
    if (welcomeCopy) {
      welcomeCopy.textContent = "Explora contenidos introductorios, estrategias pedagógicas y herramientas de IA con una presentación más académica y clara.";
      welcomeCopy.classList.add("welcome-copy");
      welcomeCopy.removeAttribute("style");
    }
  }

  function bindAuthEvents() {
    elements.toggleFormBtn?.addEventListener("click", toggleAuthMode);
    elements.toggleBtn1?.addEventListener("click", () => togglePasswordVisibility(elements.passwordInput, elements.toggleBtn1));
    elements.toggleBtn2?.addEventListener("click", () => togglePasswordVisibility(elements.confirmPasswordInput, elements.toggleBtn2));
    elements.submitBtn?.addEventListener("click", () => state.isLoginMode ? handleLogin() : handleRegister());
  }

  function bindNavigationEvents() {
    elements.unitCards.forEach((card) => card.addEventListener("click", () => card.dataset.view === "evaluacionView" ? captureUserDataForEvaluation() : showView(card.dataset.view)));
    elements.backButtons.forEach((button) => button.addEventListener("click", () => showView(button.dataset.back)));
    elements.logoutButtons.forEach((button) => button.addEventListener("click", handleLogout));
    elements.dashboardNavLinks.forEach((button) => button.addEventListener("click", () => handleAppNavigation(button)));
    elements.profileDropdownLinks.forEach((button) => button.addEventListener("click", () => handleAppNavigation(button)));
    elements.profileMenuBtn?.addEventListener("click", toggleProfileMenu);
    document.addEventListener("click", (event) => {
      if (!elements.profileMenuBtn || !elements.profileDropdown) return;
      if (elements.profileMenuBtn.contains(event.target) || elements.profileDropdown.contains(event.target)) return;
      closeProfileMenu();
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeProfileMenu();
    });
    elements.profileImageInput?.addEventListener("change", handleProfileImageChange);
  }

  function bindCatalogEvents() {
    // Cada filtro muestra herramientas según su especialidad principal.
    elements.filterButtons.forEach((button) => button.addEventListener("click", () => {
      const filter = button.dataset.filter;
      elements.filterButtons.forEach((item) => item.classList.remove("active"));
      button.classList.add("active");
      elements.apps.forEach((app) => { app.style.display = filter === "all" || app.dataset.cat.includes(filter) ? "flex" : "none"; });
      updateCount();
    }));
    // Al abrir una herramienta se muestra su descripción, enlace y video si existe.
    elements.apps.forEach((app) => app.addEventListener("click", () => {
      setText(elements.modalTitle, app.dataset.name);
      setText(elements.modalDescription, app.dataset.desc);
      if (elements.visitSiteBtn) elements.visitSiteBtn.href = app.dataset.url;
      if (app.dataset.video && elements.videoContainer && elements.modalVideo) {
        elements.videoContainer.style.display = "block";
        elements.modalVideo.src = `https://www.youtube.com/embed/${app.dataset.video}`;
      } else if (elements.videoContainer && elements.modalVideo) {
        elements.videoContainer.style.display = "none";
        elements.modalVideo.src = "";
      }
      elements.videoModal?.classList.add("active");
    }));
    elements.closeModal?.addEventListener("click", closeVideoModal);
    elements.videoModal?.addEventListener("click", (event) => { if (event.target === elements.videoModal) closeVideoModal(); });
  }

  function bindQuizEvents() {
    elements.submitQuizBtn?.addEventListener("click", submitQuiz);
    elements.resetQuizBtn?.addEventListener("click", () => {
      if (!window.confirm("¿Estás seguro de que quieres reiniciar la evaluación?")) return;
      initializeQuiz();
      showView("evaluacionView");
    });
  }

  function bindCertificateEvents() {
    // Si la acción se dispara desde el perfil, se recuperan los datos del certificado ya guardado.
    const ensureCertificateData = () => {
      if (state.evaluationUserData.name && state.evaluationUserData.email && state.evaluationUserData.documentId) return true;
      const record = getCurrentCertificateRecord();
      if (!record) {
        showAlert("Aún no tienes un certificado aprobado guardado en tu perfil.", "error");
        return false;
      }
      state.evaluationUserData = { name: record.name, email: record.email, documentId: record.documentId };
      return true;
    };

    const openPreview = async () => {
      if (!ensureCertificateData()) return;
      try {
        const pdfUrl = await generateCertificatePdfUrl();
        if (elements.certificatePreviewFrame) elements.certificatePreviewFrame.src = pdfUrl;
        elements.certificatePreviewModal?.classList.add("active");
      } catch (error) {
        console.error(error);
        showAlert(error.message || "No fue posible generar la vista previa del certificado.", "error");
      }
    };

    const downloadPdf = async () => {
      if (!ensureCertificateData()) return;
      try {
        const pdf = await buildCertificatePdf();
        pdf.save(`Certificado_${state.evaluationUserData.name.replace(/\s+/g, "_")}.pdf`);
      } catch (error) {
        console.error(error);
        showAlert(error.message || "No fue posible descargar el certificado en PDF.", "error");
      }
    };

    const emailPdf = async () => {
      if (!ensureCertificateData()) return;
      try {
        await shareCertificateByEmail();
      } catch (error) {
        console.error(error);
        showAlert(error.message || "No fue posible preparar el envío del certificado.", "error");
      }
    };

    elements.previewCertificateBtn?.addEventListener("click", openPreview);
    elements.profilePreviewCertificateBtn?.addEventListener("click", openPreview);
    elements.downloadCertificateBtn?.addEventListener("click", downloadPdf);
    elements.profileDownloadCertificateBtn?.addEventListener("click", downloadPdf);
    elements.emailCertificateBtn?.addEventListener("click", emailPdf);
    elements.profileEmailCertificateBtn?.addEventListener("click", emailPdf);
    elements.closeCertificatePreviewBtn?.addEventListener("click", closeCertificatePreview);
    elements.certificatePreviewModal?.addEventListener("click", (event) => {
      if (event.target === elements.certificatePreviewModal) closeCertificatePreview();
    });
  }

  function toggleAuthMode() {
    state.isLoginMode = !state.isLoginMode;
    if (state.isLoginMode) {
      setText(elements.loginTitle, "Iniciar sesión");
      setText(elements.loginSubtitle, "Ingresa tus credenciales para continuar");
      setText(elements.submitBtn, "Iniciar sesión");
      setText(elements.toggleText, "¿No tienes cuenta? Regístrate aquí");
      elements.nameGroup?.classList.add("hidden");
      elements.confirmPasswordGroup?.classList.add("hidden");
    } else {
      setText(elements.loginTitle, "Crear cuenta");
      setText(elements.loginSubtitle, "Regístrate para acceder a la plataforma");
      setText(elements.submitBtn, "Registrarse");
      setText(elements.toggleText, "¿Ya tienes cuenta? Inicia sesión aquí");
      elements.nameGroup?.classList.remove("hidden");
      elements.confirmPasswordGroup?.classList.remove("hidden");
    }
    clearInputs();
    clearAlert();
  }

  function togglePasswordVisibility(input, button) { if (!input || !button) return; input.type = input.type === "password" ? "text" : "password"; button.textContent = input.type === "password" ? "Mostrar" : "Ocultar"; }

  async function handleLogin() {
    const email = elements.emailInput.value.trim();
    const password = elements.passwordInput.value;
    if (!email || !password) return showAlert("Por favor completa todos los campos.", "error");
    setAuthPending(true);
    try {
      const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
      if (error) throw error;
      state.currentUser = mapSupabaseUser(data.user);
      persistCurrentUser();
      showAlert("Bienvenido. Redirigiendo...", "success");
      window.setTimeout(showDashboard, 400);
    } catch (error) {
      showAlert(error.message || "No fue posible iniciar sesión.", "error");
    } finally {
      setAuthPending(false);
    }
  }

  async function handleRegister() {
    const name = elements.nameInput.value.trim();
    const email = elements.emailInput.value.trim();
    const password = elements.passwordInput.value;
    const confirmPassword = elements.confirmPasswordInput.value;
    if (!name || !email || !password || !confirmPassword) return showAlert("Por favor completa todos los campos.", "error");
    if (password !== confirmPassword) return showAlert("Las contraseñas no coinciden.", "error");
    if (password.length < 6) return showAlert("La contraseña debe tener al menos 6 caracteres.", "error");
    setAuthPending(true);
    try {
      const { data, error } = await supabaseClient.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: name }
        }
      });
      if (error) throw error;
      if (!data.session) {
        showAlert("Cuenta creada. Revisa tu correo para confirmar el acceso si Supabase lo solicita.", "success");
        toggleAuthMode();
        elements.emailInput.value = email;
        return;
      }
      state.currentUser = mapSupabaseUser(data.user);
      persistCurrentUser();
      showAlert("Cuenta creada exitosamente. Iniciando sesión...", "success");
      window.setTimeout(showDashboard, 500);
    } catch (error) {
      showAlert(error.message || "No fue posible registrar la cuenta.", "error");
    } finally {
      setAuthPending(false);
    }
  }

  async function handleLogout() {
    try {
      await supabaseClient?.auth.signOut();
    } finally {
      state.currentUser = null;
      localStorage.removeItem(STORAGE_KEYS.currentUser);
        sessionStorage.removeItem(STORAGE_KEYS.currentView);
      showView("loginView");
      clearInputs();
      clearAlert();
    }
  }
  function showDashboard(options = {}) {
    elements.views.forEach((view) => view.classList.remove("active"));
    elements.dashboardView?.classList.add("active");
    setAppShellVisible(true);
    const currentName = state.currentUser?.name || "Invitado";
    const currentEmail = state.currentUser?.email || "correo@institucion.edu.co";
    const initials = getUserInitials(currentName);
    setText(elements.userName, currentName);
    setText(elements.profileInitials, initials);
    setText(elements.profileSummaryAvatar, initials);
    setText(elements.profileSummaryName, currentName);
    setText(elements.profileSummaryEmail, currentEmail);
    setText(elements.profilePanelAvatar, initials);
    setText(elements.profilePanelName, currentName);
    setText(elements.profilePanelEmail, currentEmail);
    setText(document.getElementById("profilePanelInstitution"), "Universidad Pedagógica y Tecnológica de Colombia");
    renderProfileAvatar(loadStoredProfileImage(), initials);
    updateProfileCertificateSection();
    if (!options.keepNavState) activateDashboardNav("inicio");
    if (!options.skipPersistence) persistAppLocation("dashboardView", options.showProfilePanel === true);
    closeProfileMenu();
  }
  function showView(viewId) {
    elements.views.forEach((view) => view.classList.remove("active"));
    document.getElementById(viewId)?.classList.add("active");
    setAppShellVisible(viewId !== "loginView");
    if (viewId === "profileView") updateProfileCertificateSection();
    if (viewId !== "loginView") {
      activateDashboardNav(viewId === "dashboardView" ? "inicio" : viewId);
      persistAppLocation(viewId, false);
      closeProfileMenu();
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  function showAlert(message, type) {
    if (elements.loginView?.classList.contains("active") && elements.alertContainer) {
      elements.alertContainer.innerHTML = `<div class="alert alert-${type}">${message}</div>`;
      return;
    }
    window.alert(message);
  }
  function clearAlert() { if (elements.alertContainer) elements.alertContainer.innerHTML = ""; }
  function clearInputs() { if (elements.emailInput) elements.emailInput.value = ""; if (elements.passwordInput) elements.passwordInput.value = ""; if (elements.confirmPasswordInput) elements.confirmPasswordInput.value = ""; if (elements.nameInput) elements.nameInput.value = ""; }
  function setAuthPending(isPending) { state.authPending = isPending; if (elements.submitBtn) { elements.submitBtn.disabled = isPending; elements.submitBtn.textContent = isPending ? (state.isLoginMode ? "Ingresando..." : "Creando cuenta...") : (state.isLoginMode ? "Iniciar sesión" : "Registrarse"); } }

  function captureUserDataForEvaluation() {
    const name = state.currentUser?.name || window.prompt("Ingresa tu nombre completo:");
    if (!name || !name.trim()) return window.alert("El nombre es obligatorio para tomar la evaluación.");
    const email = state.currentUser?.email || window.prompt("Ingresa tu correo electrónico:");
    if (!email || !email.includes("@")) return window.alert("Ingresa un correo electrónico válido.");
    const documentId = window.prompt("Ingresa tu documento de identidad:");
    if (!documentId || !documentId.trim()) return window.alert("El documento de identidad es obligatorio para tomar la evaluación.");
    state.evaluationUserData = { name: name.trim(), email: email.trim(), documentId: documentId.trim() };
    initializeQuiz();
    showView("evaluacionView");
  }

  function updateCount() { if (!elements.appCount) return; elements.appCount.textContent = String(Array.from(elements.apps).filter((app) => app.style.display !== "none").length); }
  function closeVideoModal() { if (elements.videoModal) elements.videoModal.classList.remove("active"); if (elements.modalVideo) elements.modalVideo.src = ""; }
  function initializeQuiz() {
    state.currentQuestions = shuffleArray(allQuestions).map(prepareQuestionForQuiz);
    state.userAnswers = new Array(state.currentQuestions.length).fill(null);
    renderQuiz();
  }
  function shuffleArray(items) { const shuffled = [...items]; for (let i = shuffled.length - 1; i > 0; i -= 1) { const j = Math.floor(Math.random() * (i + 1)); [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]; } return shuffled; }

  function prepareQuestionForQuiz(question) {
    const optionEntries = question.options.map((option, index) => ({ option, isCorrect: index === question.correct }));
    const shuffledEntries = shuffleArray(optionEntries);
    return {
      ...question,
      options: shuffledEntries.map((entry) => entry.option),
      correct: shuffledEntries.findIndex((entry) => entry.isCorrect)
    };
  }

  function renderQuiz() {
    if (!elements.quizContainer) return;
    elements.quizContainer.innerHTML = "";
    let currentCategory = "";
    let categoryDiv = null;
    state.currentQuestions.forEach((question, index) => {
      if (question.category !== currentCategory) {
        currentCategory = question.category;
        categoryDiv = document.createElement("div");
        categoryDiv.className = "quiz-category";
        categoryDiv.innerHTML = `<h2 class="category-title">${currentCategory}</h2>`;
        elements.quizContainer.appendChild(categoryDiv);
      }
      const questionDiv = document.createElement("div");
      questionDiv.className = "quiz-question";
      questionDiv.innerHTML = `<div class="question-number">Pregunta ${index + 1}</div><p class="question-text">${question.question}</p><div class="options-grid">${question.options.map((option, optionIndex) => `<button class="option-btn" data-question="${index}" data-option="${optionIndex}"><span class="option-letter">${String.fromCharCode(97 + optionIndex)}</span>${option}</button>`).join("")}</div>`;
      categoryDiv.appendChild(questionDiv);
    });
    document.querySelectorAll(".option-btn").forEach((button) => button.addEventListener("click", () => {
      const questionIndex = Number.parseInt(button.dataset.question, 10);
      const optionIndex = Number.parseInt(button.dataset.option, 10);
      document.querySelectorAll(`[data-question="${questionIndex}"]`).forEach((item) => item.classList.remove("selected"));
      button.classList.add("selected");
      state.userAnswers[questionIndex] = optionIndex;
    }));
  }

  function submitQuiz() {
    // La evaluación solo se califica cuando todas las preguntas tienen respuesta.
    const unanswered = state.userAnswers.filter((answer) => answer === null).length;
    if (unanswered > 0) return window.alert(`Por favor responde todas las preguntas. Faltan ${unanswered}.`);
    let correctCount = 0;
    state.currentQuestions.forEach((question, index) => { if (state.userAnswers[index] === question.correct) correctCount += 1; });
    const totalQuestions = state.currentQuestions.length;
    const percentage = Math.round((correctCount / totalQuestions) * 100);
    showResults(correctCount, totalQuestions, percentage);
  }

  function showResults(correctCount, totalQuestions, percentage) {
    // Un puntaje igual o superior al 80% habilita y guarda el certificado del usuario.
    setText(elements.userNameHeaderResults, `Evaluado: ${state.evaluationUserData.name}`);
    if (elements.scoreDisplay) {
      elements.scoreDisplay.textContent = `${percentage}%`;
      elements.scoreDisplay.className = `score-display${percentage >= 80 ? "" : " fail"}`;
    }
    if (elements.resultMessage) {
      if (percentage >= 80) {
        elements.resultMessage.innerHTML = `<strong style="color: #22c55e;">Excelente trabajo</strong><br>Has respondido correctamente ${correctCount} de ${totalQuestions} preguntas.<br>Has aprobado el curso de IA educativa.`;
        elements.certificateSection?.classList.remove("hidden");
        void persistCertificateRecord({
          name: state.evaluationUserData.name,
          email: state.evaluationUserData.email,
          documentId: state.evaluationUserData.documentId,
          module: "Herramientas de Inteligencia Artificial para la Educación",
          percentage,
          issuedAt: new Date().toISOString()
        });
      } else {
        elements.resultMessage.innerHTML = `<strong style="color: #ef4444;">Necesitas mejorar</strong><br>Has respondido correctamente ${correctCount} de ${totalQuestions} preguntas.<br>Necesitas al menos 80% para aprobar.`;
        elements.certificateSection?.classList.add("hidden");
      }
    }
    createResultsChart(correctCount, totalQuestions - correctCount);
    showDetailedResults();
    showView("resultsView");
  }

  function createResultsChart(correct, incorrect) {
    if (!elements.resultsChart || typeof Chart === "undefined") return;
    const ctx = elements.resultsChart.getContext("2d");
    if (state.resultsChartInstance) state.resultsChartInstance.destroy();
    state.resultsChartInstance = new Chart(ctx, { type: "doughnut", data: { labels: ["Correctas", "Incorrectas"], datasets: [{ data: [correct, incorrect], backgroundColor: ["rgba(34, 197, 94, 0.8)", "rgba(239, 68, 68, 0.8)"], borderColor: ["rgba(34, 197, 94, 1)", "rgba(239, 68, 68, 1)"], borderWidth: 2 }] }, options: { responsive: true, maintainAspectRatio: true, plugins: { legend: { position: "bottom", labels: { color: "#1f2937", font: { size: 14, weight: "bold" }, padding: 20 } } } } });
  }

  function showDetailedResults() {
    if (!elements.detailedResults) return;
    elements.detailedResults.innerHTML = '<div class="content-section"><h2 class="section-title">Revisión detallada</h2></div>';
    let currentCategory = "";
    let categoryDiv = null;
    state.currentQuestions.forEach((question, index) => {
      if (question.category !== currentCategory) {
        currentCategory = question.category;
        categoryDiv = document.createElement("div");
        categoryDiv.className = "quiz-category";
        categoryDiv.innerHTML = `<h2 class="category-title">${currentCategory}</h2>`;
        elements.detailedResults.appendChild(categoryDiv);
      }
      const userAnswer = state.userAnswers[index];
      const isCorrect = userAnswer === question.correct;
      const questionDiv = document.createElement("div");
      questionDiv.className = "quiz-question";
      questionDiv.innerHTML = `<div class="question-number">Pregunta ${index + 1} ${isCorrect ? "Correcta" : "Incorrecta"}</div><p class="question-text">${question.question}</p><div class="options-grid">${question.options.map((option, optionIndex) => {
        let className = "option-btn";
        if (optionIndex === question.correct) className += " correct";
        else if (optionIndex === userAnswer && !isCorrect) className += " incorrect";
        return `<div class="${className}" style="pointer-events: none;"><span class="option-letter">${String.fromCharCode(97 + optionIndex)}</span>${option}</div>`;
      }).join("")}</div>`;
      categoryDiv.appendChild(questionDiv);
    });
  }

  async function drawCertificateOnCanvas() {
    // El certificado se construye sobre la plantilla oficial y solo dibuja encima los datos variables.
    if (!elements.certificateCanvas) throw new Error("No se encontró el lienzo del certificado.");
    const canvas = elements.certificateCanvas;
    const ctx = canvas.getContext("2d");
    const certificateAssets = window.CERTIFICATE_ASSETS || {};
    const template = await loadImage(certificateAssets.template || "Recursos/Certificado%20de%20Participaci%C3%B3n%20M%C3%B3dulo%20IA%20Educaci%C3%B3n%20UPTC.png");
    const [giaceLogo, aveLogo, cetinLogo] = await Promise.all([
      loadOptionalImage(certificateAssets.giace || "Recursos/logoGiace.png"),
      loadOptionalImage(certificateAssets.ave || "Recursos/grupo%20ave%20sencillo.jpeg"),
      loadOptionalImage(certificateAssets.cetin || "Recursos/cetin_logo-removebg-preview.png")
    ]);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(template, 0, 0, canvas.width, canvas.height);
    drawCertificatePartnerLogos(ctx, { giaceLogo, aveLogo, cetinLogo });

    const dateStr = new Date().toLocaleDateString("es-CO", { day: "numeric", month: "long", year: "numeric" });

    const nameX = 528;
    const nameY = 486;
    const documentX = 506;
    const documentY = 554;
    const dateX = 540;
    const dateY = 752;

    ctx.textAlign = "center";
    ctx.fillStyle = "#111111";
    ctx.font = "700 42px serif";
    fitText(ctx, state.evaluationUserData.name.toUpperCase(), nameX, nameY, 610, 42, 30, "700", "serif");

    ctx.textAlign = "left";
    ctx.fillStyle = "#2c6d73";
    ctx.font = "700 16px serif";
    fitText(ctx, state.evaluationUserData.documentId || "Sin documento", documentX, documentY, 175, 16, 12, "700", "serif");

    ctx.textAlign = "left";
    ctx.fillStyle = "#2f2f2f";
    ctx.font = "14px serif";
    fitText(ctx, dateStr, dateX, dateY, 180, 14, 11, "400", "serif");
    return canvas;
  }

  async function buildCertificatePdf() {
    const canvas = await drawCertificateOnCanvas();
    const { jsPDF } = window.jspdf || {};
    if (!jsPDF) throw new Error("La librería de PDF no está disponible.");
    const pdf = new jsPDF({ orientation: "landscape", unit: "px", format: [canvas.width, canvas.height] });
    const imageData = canvas.toDataURL("image/png");
    pdf.addImage(imageData, "PNG", 0, 0, canvas.width, canvas.height);
    return pdf;
  }

  async function generateCertificatePdfUrl() {
    const pdf = await buildCertificatePdf();
    const blob = pdf.output("blob");
    return URL.createObjectURL(blob);
  }

  async function shareCertificateByEmail() {
    const pdf = await buildCertificatePdf();
    const blob = pdf.output("blob");
    const fileName = `Certificado_${state.evaluationUserData.name.replace(/\s+/g, "_")}.pdf`;
    const pdfFile = new File([blob], fileName, { type: "application/pdf" });
    if (navigator.canShare && navigator.canShare({ files: [pdfFile] })) {
      await navigator.share({
        title: "Certificado IA en la Mochila",
        text: `Compartir certificado con ${state.evaluationUserData.email}`,
        files: [pdfFile]
      });
      return;
    }
    const subject = encodeURIComponent("Certificado IA en la Mochila");
    const body = encodeURIComponent(`Adjunta el certificado PDF descargado para ${state.evaluationUserData.name}.`);
    window.open(`mailto:${state.evaluationUserData.email}?subject=${subject}&body=${body}`, "_blank");
    const link = document.createElement("a");
    link.download = fileName;
    link.href = URL.createObjectURL(blob);
    link.click();
    showAlert("Se abrió tu cliente de correo. Adjunta el PDF descargado y envíalo al correo institucional.", "success");
  }

  function closeCertificatePreview() {
    elements.certificatePreviewModal?.classList.remove("active");
    if (elements.certificatePreviewFrame?.src) {
      URL.revokeObjectURL(elements.certificatePreviewFrame.src);
      elements.certificatePreviewFrame.src = "";
    }
  }

  function loadImage(src) {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error(`No fue posible cargar el recurso ${src}.`));
      image.src = src;
    });
  }

  async function loadOptionalImage(src) {
    try {
      return await loadImage(src);
    } catch (error) {
      console.warn(error.message);
      return null;
    }
  }

  function drawLogoImage(ctx, image, x, y, width, height) {
    ctx.save();
    ctx.globalAlpha = 0.98;
    ctx.drawImage(image, x, y, width, height);
    ctx.restore();
  }

  function drawCertificatePartnerLogos(ctx, { giaceLogo, aveLogo, cetinLogo }) {
    if (giaceLogo) {
      drawCertificateLogoCard(ctx, giaceLogo, 58, 310, 156, 72, {
        background: "#173f46",
        border: "rgba(23, 63, 70, 0.18)",
        padding: 10
      });
    }
    if (aveLogo) {
      drawCertificateLogoCard(ctx, aveLogo, 80, 400, 112, 112, {
        background: "#ffffff",
        border: "rgba(44, 109, 115, 0.24)",
        padding: 8
      });
    }
    if (cetinLogo) {
      drawCertificateLogoCard(ctx, cetinLogo, 67, 530, 138, 120, {
        background: "#ffffff",
        border: "rgba(44, 109, 115, 0.24)",
        padding: 8
      });
    }
  }

  function drawCertificateLogoCard(ctx, image, x, y, width, height, options) {
    ctx.save();
    roundRect(ctx, x, y, width, height, 8);
    ctx.fillStyle = options.background;
    ctx.fill();
    ctx.strokeStyle = options.border;
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.clip();
    drawContainedImage(ctx, image, x, y, width, height, options.padding);
    ctx.restore();
  }

  function drawContainedImage(ctx, image, x, y, width, height, padding = 0) {
    const availableWidth = width - (padding * 2);
    const availableHeight = height - (padding * 2);
    const scale = Math.min(availableWidth / image.width, availableHeight / image.height);
    const drawWidth = image.width * scale;
    const drawHeight = image.height * scale;
    const drawX = x + ((width - drawWidth) / 2);
    const drawY = y + ((height - drawHeight) / 2);
    drawLogoImage(ctx, image, drawX, drawY, drawWidth, drawHeight);
  }

  function fitText(ctx, text, x, y, maxWidth, startSize, minSize, weight, family) {
    let fontSize = startSize;
    while (fontSize >= minSize) {
      ctx.font = `${weight} ${fontSize}px ${family}`;
      if (ctx.measureText(text).width <= maxWidth) break;
      fontSize -= 1;
    }
    ctx.fillText(text, x, y);
  }

  function roundRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  }

  function getCurrentCertificateRecord() {
    return state.currentUser?.certificateRecord || null;
  }

  async function persistCertificateRecord(record) {
    // Se guarda una copia local y otra en los metadatos del usuario autenticado en Supabase.
    if (!state.currentUser) return;
    state.currentUser.certificateRecord = record;
    persistCurrentUser();
    updateProfileCertificateSection();
    try {
      const { error } = await supabaseClient?.auth.updateUser({ data: { certificate_record: record } });
      if (error) console.error(error);
    } catch (error) {
      console.error(error);
    }
  }

  function formatCertificateDate(value) {
    if (!value) return "";
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return "";
    return parsed.toLocaleDateString("es-CO", { day: "numeric", month: "long", year: "numeric" });
  }

  function updateProfileCertificateSection() {
    if (!elements.profileCertificateSection || !elements.profileCertificateStatus || !elements.profileCertificateMessage) return;
    const record = getCurrentCertificateRecord();
    elements.profileCertificateSection.classList.remove("hidden");
    const actionButtons = [
      elements.profilePreviewCertificateBtn,
      elements.profileDownloadCertificateBtn,
      elements.profileEmailCertificateBtn
    ];
    if (!record) {
      setText(elements.profileCertificateStatus, "Aún no disponible");
      setText(elements.profileCertificateMessage, "Cuando apruebes la evaluación, aquí quedará guardado tu certificado para volver a abrirlo, descargarlo o enviarlo sin repetir la prueba.");
      actionButtons.forEach((button) => button?.classList.add("hidden"));
      return;
    }
    setText(elements.profileCertificateStatus, "Disponible para descarga");
    setText(elements.profileCertificateMessage, `Aprobaste el módulo ${record.module} y tu certificado quedó guardado el ${formatCertificateDate(record.issuedAt)}. Puedes volver a abrirlo o descargarlo cuando quieras.`);
    actionButtons.forEach((button) => button?.classList.remove("hidden"));
  }

  async function syncSessionFromSupabase() {
    // Recupera la sesión activa y sincroniza el perfil local con los datos remotos del usuario.
    const { data, error } = await supabaseClient.auth.getSession();
    if (error) throw error;
    if (!data.session?.user) {
      state.currentUser = loadStoredCurrentUser();
      if (state.currentUser) restoreAppLocation();
      return;
    }
    state.currentUser = mapSupabaseUser(data.session.user);
    persistCurrentUser();
    restoreAppLocation();
  }

  function mapSupabaseUser(user) {
    return {
      id: user.id,
      email: user.email || "",
      name: user.user_metadata?.full_name || user.email?.split("@")[0] || "Usuario",
      certificateRecord: user.user_metadata?.certificate_record || null
    };
  }

  function loadStoredCurrentUser() { try { const raw = localStorage.getItem(STORAGE_KEYS.currentUser); return raw ? JSON.parse(raw) : null; } catch { return null; } }
  function persistCurrentUser() { localStorage.setItem(STORAGE_KEYS.currentUser, JSON.stringify(state.currentUser)); }

  function toggleProfileMenu() {
    const isHidden = elements.profileDropdown?.classList.contains("hidden");
    if (isHidden) {
      elements.profileDropdown?.classList.remove("hidden");
      elements.profileMenuBtn?.setAttribute("aria-expanded", "true");
      return;
    }
    closeProfileMenu();
  }

  function closeProfileMenu() {
    elements.profileDropdown?.classList.add("hidden");
    elements.profileMenuBtn?.setAttribute("aria-expanded", "false");
  }

  function handleAppNavigation(button) {
    const panelTarget = button.dataset.appPanel;
    const viewTarget = button.dataset.appView;
    closeProfileMenu();
    if (panelTarget === "profile") {
      showView("profileView");
      return;
    }
    if (!viewTarget) return;
    if (viewTarget === "dashboardView") return showDashboard();
    if (viewTarget === "evaluacionView") return captureUserDataForEvaluation();
    showView(viewTarget);
  }

  function activateDashboardNav(target) {
    elements.dashboardNavLinks.forEach((button) => {
      const isActive = (target === "perfil" && button.dataset.appPanel === "profile") || button.dataset.appView === target;
      button.classList.toggle("active", isActive);
    });
  }

  function showProfilePanel() { persistAppLocation("profileView", false); elements.profilePanel?.scrollIntoView({ behavior: "smooth", block: "start" }); }
  function hideProfilePanel() { return; }

  function getUserInitials(name) {
    return String(name || "IA")
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join("") || "IA";
  }

  function setAppShellVisible(isVisible) {
    elements.appHeader?.classList.toggle("hidden", !isVisible);
    document.body.classList.toggle("app-shell-mode", isVisible);
  }

  function handleProfileImageChange(event) {
    const [file] = event.target.files || [];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const imageData = String(reader.result || "");
      localStorage.setItem(STORAGE_KEYS.profileImage, imageData);
      renderProfileAvatar(imageData, getUserInitials(state.currentUser?.name || "IA"));
    };
    reader.readAsDataURL(file);
  }

  function renderProfileAvatar(imageData, fallbackInitials) {
    [elements.profileInitials, elements.profileSummaryAvatar, elements.profilePanelAvatar, elements.profileUploadPreview].forEach((node) => {
      if (!node) return;
      node.innerHTML = "";
      if (imageData) {
        const img = document.createElement("img");
        img.src = imageData;
        img.alt = "Foto de perfil";
        img.className = "profile-avatar-image";
        node.appendChild(img);
        return;
      }
      node.textContent = fallbackInitials;
    });
  }

  function loadStoredProfileImage() {
    return localStorage.getItem(STORAGE_KEYS.profileImage) || "";
  }

  function persistAppLocation(viewId, isProfilePanelOpen = false) {
    sessionStorage.setItem(STORAGE_KEYS.currentView, viewId);
  }

  function loadStoredCurrentView() {
    return sessionStorage.getItem(STORAGE_KEYS.currentView) || "dashboardView";
  }

  function restoreAppLocation() {
    const savedView = loadStoredCurrentView();
    if (savedView === "dashboardView") {
      showDashboard({ skipPersistence: true });
      return;
    }
    if (savedView === "profileView") {
      showView("profileView");
      return;
    }
    if (savedView === "evaluacionView") {
      showDashboard({ skipPersistence: true });
      return;
    }
    showView(savedView);
  }
})();


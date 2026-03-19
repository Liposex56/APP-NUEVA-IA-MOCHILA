(() => {
  const STORAGE_KEYS = { currentUser: "iam_current_user", profileImage: "iam_profile_image", currentView: "iam_current_view", profilePanelOpen: "iam_profile_panel_open" };
  const SUPABASE_URL = "https://bxxudrezbaxrmwekeyoe.supabase.co";
  const SUPABASE_KEY = "sb_publishable_SnBuzPXugGRag9uAP4NbpQ_HzPhP6BK";
  const supabaseClient = window.supabase?.createClient(SUPABASE_URL, SUPABASE_KEY);
  const elements = {};
  const state = { isLoginMode: true, currentUser: null, authPending: false, evaluationUserData: { name: "", email: "", institution: "" }, currentQuestions: [], userAnswers: [], resultsChartInstance: null };

  const allQuestions = [
    { category: "Asistentes", question: "Que herramienta se integra mejor con Microsoft 365?", options: ["ChatGPT", "Copilot", "Claude", "Perplexity"], correct: 1 },
    { category: "Asistentes", question: "Que herramienta responde con fuentes citadas en procesos de investigacion?", options: ["Perplexity", "Gemini", "Canva IA", "Kahoot!"], correct: 0 },
    { category: "Docencia", question: "Que plataforma destaca en calificacion asistida y analisis de examenes?", options: ["Gradescope", "SlidesAI", "Pictory", "Designer"], correct: 0 },
    { category: "Docencia", question: "Que plataforma ofrece utilidades pensadas especificamente para docentes?", options: ["Magic School AI", "ElevenLabs", "Lumen5", "DALL-E"], correct: 0 },
    { category: "Redaccion", question: "Que herramienta se usa para corregir gramatica y estilo?", options: ["Grammarly", "Tome", "Canva IA", "Socratic"], correct: 0 },
    { category: "Redaccion", question: "Que herramienta sirve para parafrasear y reformular textos?", options: ["QuillBot", "Formative", "Kahoot!", "Descript"], correct: 0 },
    { category: "Multimedia", question: "Que herramienta convierte texto en diapositivas automaticamente?", options: ["SlidesAI", "Grammarly", "Pictory", "Socratic"], correct: 0 },
    { category: "Multimedia", question: "Que herramienta es fuerte para edicion de audio y video mediante transcripcion?", options: ["Descript", "Gemini", "Perplexity", "QuillBot"], correct: 0 },
    { category: "Multimedia", question: "Que plataforma es util para presentaciones narrativas interactivas?", options: ["Tome", "Gradescope", "ElevenLabs", "Formative"], correct: 0 },
    { category: "Multimedia", question: "Que herramienta sirve para crear narraciones de voz realista?", options: ["ElevenLabs", "Kahoot!", "Socratic", "SlidesAI"], correct: 0 },
  ];

  const tools = [
    ["chat", "https://chat.openai.com", "hbwGYI0Nuoc", "ChatGPT", "Asistente para explicar conceptos, redactar borradores y construir actividades.", "GPT", "Asistente", "c-chat", "#8b6a1b,#ccb15d"],
    ["chat", "https://gemini.google.com", "nqzzI5Pwnxc", "Gemini", "Modelo de Google util para Workspace e investigacion inicial.", "GEM", "Asistente", "c-chat", "#244a7d,#6793d6"],
    ["chat tools", "https://copilot.microsoft.com", "zhFDhnTb0Gc", "Copilot", "Asistente de productividad y sintesis en Microsoft 365.", "CP", "Asistente", "c-chat", "#173b71,#3f74c5"],
    ["chat", "https://claude.ai", "", "Claude", "Especialista en documentos largos y respuestas estructuradas.", "CL", "Asistente", "c-chat", "#874a23,#d28c57"],
    ["chat", "https://www.perplexity.ai", "", "Perplexity", "Motor de respuesta util para investigacion con referencias.", "PX", "Asistente", "c-chat", "#155953,#349d95"],
    ["img", "https://www.canva.com", "", "Canva IA", "Creacion de presentaciones, piezas de aula e infografias.", "CV", "Imagen", "c-img", "#1f5d86,#45a4c8"],
    ["img", "https://stability.ai", "", "Stable Diffusion", "Generacion de imagenes para ilustraciones y apoyos visuales.", "SD", "Imagen", "c-img", "#4a3368,#7552aa"],
    ["img", "https://openai.com/dall-e", "", "DALL-E", "Generador visual para recursos creativos y ejemplos didacticos.", "DAL", "Imagen", "c-img", "#2c7869,#4bb09b"],
    ["tools", "https://designer.microsoft.com", "", "Designer", "Diseno rapido de piezas graficas.", "MD", "Productividad", "c-tools", "#275487,#7caed8"],
    ["tools", "https://www.adobe.com/express", "", "Adobe Express", "Creacion de piezas visuales y clips breves.", "AE", "Productividad", "c-tools", "#9b4f2b,#d98d56"],
    ["audio", "https://www.descript.com", "", "Descript", "Edicion de audio y video mediante transcripcion.", "DS", "Audio", "c-audio", "#874a69,#ca81a4"],
    ["audio", "https://elevenlabs.io", "", "ElevenLabs", "Sintesis de voz para narraciones y accesibilidad.", "EL", "Audio", "c-audio", "#5b4b91,#8f7cc7"],
    ["video", "https://lumen5.com", "", "Lumen5", "Convierte texto en video.", "L5", "Video", "c-video", "#2d7d45,#59bb7a"],
    ["video", "https://pictory.ai", "", "Pictory", "Transforma articulos o guiones en videos cortos.", "PT", "Video", "c-video", "#33724d,#4ea675"],
    ["edu", "https://www.grammarly.com", "", "Grammarly", "Correccion de gramatica, claridad y tono.", "GM", "Educacion", "c-edu", "#236b62,#3db3a1"],
    ["edu", "https://quillbot.com", "", "QuillBot", "Parafrasis y reformulacion de textos.", "QB", "Educacion", "c-edu", "#95601a,#d29b4f"],
    ["edu", "https://kahoot.com", "", "Kahoot!", "Gamificacion para repasos y participacion.", "KH", "Educacion", "c-edu", "#5c4994,#8e76d4"],
    ["edu", "https://socratic.org", "", "Socratic", "Apoyo al estudiante para resolver dudas.", "SC", "Educacion", "c-edu", "#2f6f87,#4da8c1"],
    ["tools", "https://www.slidesai.io", "", "SlidesAI", "Genera presentaciones desde texto.", "SA", "Productividad", "c-tools", "#2a5382,#6193d0"],
    ["tools", "https://tome.app", "", "Tome", "Presentaciones narrativas con enfoque editorial.", "TO", "Productividad", "c-tools", "#68578d,#ad90c8"],
    ["edu", "https://www.gradescope.com", "bNzIhOV6pQk", "Gradescope", "Calificacion asistida y analisis de respuestas.", "GS", "Educacion", "c-edu", "#3b7b4b,#58b26d"],
    ["edu", "https://www.formative.com", "zU3vOTrfzYA", "Formative", "Seguimiento en tiempo real y evaluacion formativa.", "FM", "Educacion", "c-edu", "#94611f,#d9a04d"],
    ["edu", "https://www.magicschool.ai", "", "Magic School AI", "Utilidades de IA para planeacion y rubricas.", "MS", "Educacion", "c-edu", "#74477b,#b46dc3"],
  ];

  document.addEventListener("DOMContentLoaded", () => { init().catch((error) => console.error(error)); });

  async function init() {
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
      showAlert("No fue posible inicializar la autenticacion de Supabase.", "error");
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
    setView("iaEducacionView", `<header class="header"><div class="header-content"><button class="btn-back" data-back="dashboardView">Volver</button><button class="btn-logout" id="logoutBtn2">Salir</button></div></header><div class="content-container"><section class="content-section academic-hero"><span class="section-kicker">Fundamentos</span><h1 class="section-title">Que es la inteligencia artificial</h1><p class="section-text">La inteligencia artificial desarrolla sistemas capaces de aprender de datos, reconocer patrones, procesar lenguaje y apoyar decisiones. En educacion, su valor depende del criterio humano y del objetivo pedagogico que orienta su uso.</p></section><section class="feature-grid"><article class="feature-card"><div class="feature-icon">01</div><h3 class="feature-title">Disciplina cientifica</h3><p class="feature-text">Integra aprendizaje automatico, vision por computador y procesamiento del lenguaje natural.</p></article><article class="feature-card"><div class="feature-icon">02</div><h3 class="feature-title">Aprende desde datos</h3><p class="feature-text">Los modelos encuentran regularidades para clasificar, predecir y generar contenido.</p></article><article class="feature-card"><div class="feature-icon">03</div><h3 class="feature-title">Exige validacion</h3><p class="feature-text">Toda salida debe revisarse con criterio humano, verificacion y pertinencia academica.</p></article></section><section class="content-section"><h2 class="section-subtitle">Capacidades principales</h2><ul class="section-list"><li>Analizar grandes volumenes de informacion en poco tiempo.</li><li>Reconocer patrones en texto, imagen, audio y video.</li><li>Generar borradores, explicaciones, tablas y materiales de apoyo.</li><li>Personalizar rutas de aprendizaje a partir de necesidades concretas.</li></ul></section><section class="content-section emphasis-panel"><h2 class="section-subtitle">Criterio academico</h2><p class="section-text">La IA no reemplaza al docente ni garantiza exactitud por si sola. Funciona mejor como apoyo para investigar, explicar y crear recursos cuando existe verificacion de fuentes, proposito pedagogico y mediacion humana.</p></section></div>`);
    setView("aplicacionesView", `<header class="header"><div class="header-content"><button class="btn-back" data-back="dashboardView">Volver</button><button class="btn-logout" id="logoutBtn3">Salir</button></div></header><div class="content-container"><section class="content-section academic-hero"><span class="section-kicker">Aplicacion pedagogica</span><h1 class="section-title">IA en educacion</h1><p class="section-text">La IA puede fortalecer la planeacion, la produccion de materiales, la atencion a la diversidad y la evaluacion formativa. Su incorporacion debe responder a objetivos de aprendizaje claros y a principios eticos explicitos.</p></section><section class="feature-grid"><article class="feature-card"><div class="feature-icon">A</div><h3 class="feature-title">Planeacion academica</h3><p class="feature-text">Apoya secuencias didacticas, rubricas, actividades y ajustes de nivel.</p></article><article class="feature-card"><div class="feature-icon">B</div><h3 class="feature-title">Produccion de recursos</h3><p class="feature-text">Facilita guias, resumenes, presentaciones y cuestionarios.</p></article><article class="feature-card"><div class="feature-icon">C</div><h3 class="feature-title">Seguimiento formativo</h3><p class="feature-text">Permite detectar errores frecuentes y orientar apoyos pedagogicos.</p></article></section><section class="content-section"><h2 class="section-subtitle">Escenarios de uso</h2><div class="academic-list"><div class="academic-item"><h3>Antes de clase</h3><p>Sirve para organizar contenidos, ajustar niveles y anticipar preguntas frecuentes.</p></div><div class="academic-item"><h3>Durante la clase</h3><p>Ayuda a explicar conceptos, generar ejemplos y proponer actividades dinamicas.</p></div><div class="academic-item"><h3>Despues de la clase</h3><p>Apoya la retroalimentacion, el repaso y la construccion de materiales de profundizacion.</p></div></div></section></div>`);
    setView("recursosView", `<header class="header"><div class="header-content"><button class="btn-back" data-back="dashboardView">Volver</button><button class="btn-logout" id="logoutBtn4">Salir</button></div></header><div class="content-container"><section class="content-section academic-hero"><span class="section-kicker">Seleccion orientada</span><h1 class="section-title">Herramientas IA para estudio y docencia</h1><p class="section-text">Este catalogo reune plataformas utiles para investigar, redactar, crear recursos visuales, producir contenido multimedia y evaluar. El criterio central no es usarlas todas, sino elegir las que respondan mejor a una necesidad pedagogica concreta.</p></section><section class="content-section compact-panel"><div class="tools-overview"><div><h2 class="section-subtitle">Como leer el catalogo</h2><p class="section-text">Filtra por tipo de tarea y compara fortalezas segun el proposito didactico.</p></div><div class="tools-metrics"><div class="metric-card"><span class="metric-number">23</span><span class="metric-label">herramientas curadas</span></div><div class="metric-card"><span class="metric-number" id="appCount">23</span><span class="metric-label">visibles en pantalla</span></div></div></div></section><nav class="filters"><button class="filter-btn active" data-filter="all">Todas</button><button class="filter-btn" data-filter="chat">Asistentes</button><button class="filter-btn" data-filter="img">Imagen</button><button class="filter-btn" data-filter="video">Video</button><button class="filter-btn" data-filter="audio">Audio</button><button class="filter-btn" data-filter="edu">Educacion</button><button class="filter-btn" data-filter="tools">Productividad</button></nav><section class="periodic" id="tabla">${tools.map(renderToolCard).join("")}</section></div>`);
    setView("notebooklmView", `<header class="header"><div class="header-content"><button class="btn-back" data-back="dashboardView">Volver</button><button class="btn-logout" id="logoutBtn6">Salir</button></div></header><div class="content-container"><section class="content-section academic-hero"><span class="section-kicker">Investigacion asistida</span><h1 class="section-title">NotebookLM</h1><p class="section-text">NotebookLM trabaja con documentos propios. Permite resumir, comparar y organizar informacion a partir de fuentes seleccionadas por el docente o el estudiante.</p></section><section class="content-section"><h2 class="section-subtitle">Usos recomendados</h2><div class="academic-list"><div class="academic-item"><h3>Resumir documentos</h3><p>Extrae ideas centrales de textos academicos y materiales de clase.</p></div><div class="academic-item"><h3>Preparar explicaciones</h3><p>Convierte fuentes complejas en versiones mas claras para estudiantes.</p></div><div class="academic-item"><h3>Comparar fuentes</h3><p>Encuentra coincidencias, diferencias y conceptos clave entre documentos.</p></div><div class="academic-item"><h3>Organizar estudio</h3><p>Ayuda a construir guias, preguntas de repaso y rutas de lectura.</p></div></div></section><section class="content-section"><h2 class="section-subtitle">Buenas practicas</h2><ul class="section-list"><li>Sube documentos confiables y recientes para evitar conclusiones debiles.</li><li>Usa sus resumentes como punto de partida, no como sustituto de la lectura.</li><li>Contrasta citas, conceptos y fechas antes de llevarlos al aula.</li><li>Combina la herramienta con preguntas del docente para profundizar.</li></ul></section></div>`);
    setView("equipoView", `<header class="header"><div class="header-content"><button class="btn-back" data-back="dashboardView">Volver</button><button class="btn-logout" id="logoutBtn7">Salir</button></div></header><div class="content-container"><section class="content-section academic-hero"><span class="section-kicker">Equipo del proyecto</span><h1 class="section-title">Desarrolladores y direccion academica</h1><p class="section-text">Esta propuesta fue construida desde la Licenciatura en Informatica de la UPTC para acercar la inteligencia artificial a procesos reales de aprendizaje.</p></section><div class="developers-section"><h2 class="developers-title">Equipo</h2><div class="developers-grid"><div class="developer-card"><div class="developer-avatar"><img src="Recursos/SHARON.JPG" alt="Sharon Valentina Rodriguez Pena"></div><h3 class="developer-name">Sharon Valentina Rodriguez Pena</h3><p class="developer-role">Desarrolladora Web</p><p class="developer-institution">Universidad Pedagogica y Tecnologica de Colombia</p><p class="developer-contact">sharon.rodriguez@uptc.edu.co</p></div><div class="developer-card"><div class="developer-avatar"><img src="Recursos/CRISTIAN.JPG" alt="Cristian Felipe Gomez Iguavita"></div><h3 class="developer-name">Cristian Felipe Gomez Iguavita</h3><p class="developer-role">Desarrollador Web</p><p class="developer-institution">Universidad Pedagogica y Tecnologica de Colombia</p><p class="developer-contact">cristian.gomez17@uptc.edu.co</p></div><div class="developer-card"><div class="developer-avatar"><img src="Recursos/Profe.jpg" alt="Yenny Carolina Riano Castellanos"></div><h3 class="developer-name">Yenny Carolina Riano Castellanos</h3><p class="developer-role">Directora del Proyecto</p><p class="developer-institution">Universidad Pedagogica y Tecnologica de Colombia</p><p class="developer-contact">yennycarolina.riano@uptc.edu.co</p></div></div></div></div>`);
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
    setText(elements.loginTitle, "Iniciar sesion");
    setText(elements.loginSubtitle, "Ingresa tus credenciales para continuar");
    setText(elements.submitBtn, "Iniciar sesion");
    setText(elements.toggleText, "No tienes cuenta? Registrate aqui");
    const labels = document.querySelectorAll("label.form-label");
    setText(labels[0], "Nombre y apellido");
    setText(labels[1], "Correo electronico");
    setText(labels[2], "Contrasena");
    setText(labels[3], "Confirmar contrasena");
    elements.nameInput?.setAttribute("placeholder", "Juan Perez");
    elements.emailInput?.setAttribute("placeholder", "docente@institucion.edu.co");
    elements.passwordInput?.setAttribute("placeholder", "********");
    elements.confirmPasswordInput?.setAttribute("placeholder", "********");
    setText(elements.toggleBtn1, "Mostrar");
    setText(elements.toggleBtn2, "Mostrar");
    setText(document.querySelector(".header-logo"), "IA");
    setText(document.getElementById("logoutBtn1"), "Cerrar sesion");
    const welcomeTitle = document.querySelector(".welcome-title");
    if (welcomeTitle) {
      welcomeTitle.innerHTML = 'Bienvenido(a), <span id="userName"></span>';
      elements.userName = document.getElementById("userName");
    }
    const welcomeCopy = document.querySelector(".welcome-section p");
    if (welcomeCopy) {
      welcomeCopy.textContent = "Explora contenidos introductorios, estrategias pedagogicas y herramientas de IA con una presentacion mas academica y clara.";
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
    elements.filterButtons.forEach((button) => button.addEventListener("click", () => {
      const filter = button.dataset.filter;
      elements.filterButtons.forEach((item) => item.classList.remove("active"));
      button.classList.add("active");
      elements.apps.forEach((app) => { app.style.display = filter === "all" || app.dataset.cat.includes(filter) ? "flex" : "none"; });
      updateCount();
    }));
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
      if (!window.confirm("Estas seguro de que quieres reiniciar la evaluacion?")) return;
      initializeQuiz();
      showView("evaluacionView");
    });
  }

  function bindCertificateEvents() {
    elements.previewCertificateBtn?.addEventListener("click", async () => {
      try {
        const pdfUrl = await generateCertificatePdfUrl();
        if (elements.certificatePreviewFrame) elements.certificatePreviewFrame.src = pdfUrl;
        elements.certificatePreviewModal?.classList.add("active");
      } catch (error) {
        showAlert(error.message || "No fue posible generar la vista previa del certificado.", "error");
      }
    });
    elements.downloadCertificateBtn?.addEventListener("click", async () => {
      try {
        const pdf = await buildCertificatePdf();
        pdf.save(`Certificado_${state.evaluationUserData.name.replace(/\s+/g, "_")}.pdf`);
      } catch (error) {
        showAlert(error.message || "No fue posible descargar el certificado en PDF.", "error");
      }
    });
    elements.emailCertificateBtn?.addEventListener("click", async () => {
      try {
        await shareCertificateByEmail();
      } catch (error) {
        showAlert(error.message || "No fue posible preparar el envio del certificado.", "error");
      }
    });
    elements.closeCertificatePreviewBtn?.addEventListener("click", closeCertificatePreview);
    elements.certificatePreviewModal?.addEventListener("click", (event) => {
      if (event.target === elements.certificatePreviewModal) closeCertificatePreview();
    });
  }

  function toggleAuthMode() {
    state.isLoginMode = !state.isLoginMode;
    if (state.isLoginMode) {
      setText(elements.loginTitle, "Iniciar sesion");
      setText(elements.loginSubtitle, "Ingresa tus credenciales para continuar");
      setText(elements.submitBtn, "Iniciar sesion");
      setText(elements.toggleText, "No tienes cuenta? Registrate aqui");
      elements.nameGroup?.classList.add("hidden");
      elements.confirmPasswordGroup?.classList.add("hidden");
    } else {
      setText(elements.loginTitle, "Crear cuenta");
      setText(elements.loginSubtitle, "Registrate para acceder a la plataforma");
      setText(elements.submitBtn, "Registrarse");
      setText(elements.toggleText, "Ya tienes cuenta? Inicia sesion aqui");
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
      showAlert(error.message || "No fue posible iniciar sesion.", "error");
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
    if (password !== confirmPassword) return showAlert("Las contrasenas no coinciden.", "error");
    if (password.length < 6) return showAlert("La contrasena debe tener al menos 6 caracteres.", "error");
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
      showAlert("Cuenta creada exitosamente. Iniciando sesion...", "success");
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
      localStorage.removeItem(STORAGE_KEYS.currentView);
      localStorage.removeItem(STORAGE_KEYS.profilePanelOpen);
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
    renderProfileAvatar(loadStoredProfileImage(), initials);
    if (!options.keepNavState) activateDashboardNav("inicio");
    if (!options.showProfilePanel) hideProfilePanel();
    if (!options.skipPersistence) persistAppLocation("dashboardView", options.showProfilePanel === true);
    closeProfileMenu();
  }
  function showView(viewId) {
    elements.views.forEach((view) => view.classList.remove("active"));
    document.getElementById(viewId)?.classList.add("active");
    setAppShellVisible(viewId !== "loginView");
    if (viewId !== "loginView") {
      activateDashboardNav(viewId === "dashboardView" ? "inicio" : viewId);
      hideProfilePanel();
      persistAppLocation(viewId, false);
      closeProfileMenu();
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  function showAlert(message, type) { if (elements.alertContainer) elements.alertContainer.innerHTML = `<div class="alert alert-${type}">${message}</div>`; }
  function clearAlert() { if (elements.alertContainer) elements.alertContainer.innerHTML = ""; }
  function clearInputs() { if (elements.emailInput) elements.emailInput.value = ""; if (elements.passwordInput) elements.passwordInput.value = ""; if (elements.confirmPasswordInput) elements.confirmPasswordInput.value = ""; if (elements.nameInput) elements.nameInput.value = ""; }
  function setAuthPending(isPending) { state.authPending = isPending; if (elements.submitBtn) { elements.submitBtn.disabled = isPending; elements.submitBtn.textContent = isPending ? (state.isLoginMode ? "Ingresando..." : "Creando cuenta...") : (state.isLoginMode ? "Iniciar sesion" : "Registrarse"); } }

  function captureUserDataForEvaluation() {
    const name = state.currentUser?.name || window.prompt("Ingresa tu nombre completo:");
    if (!name || !name.trim()) return window.alert("El nombre es obligatorio para tomar la evaluacion.");
    const email = state.currentUser?.email || window.prompt("Ingresa tu correo electronico:");
    if (!email || !email.includes("@")) return window.alert("Ingresa un correo electronico valido.");
    const institution = window.prompt("Ingresa tu institucion educativa:");
    if (!institution || !institution.trim()) return window.alert("La institucion es obligatoria para tomar la evaluacion.");
    state.evaluationUserData = { name: name.trim(), email: email.trim(), institution: institution.trim() };
    initializeQuiz();
    showView("evaluacionView");
  }

  function updateCount() { if (!elements.appCount) return; elements.appCount.textContent = String(Array.from(elements.apps).filter((app) => app.style.display !== "none").length); }
  function closeVideoModal() { if (elements.videoModal) elements.videoModal.classList.remove("active"); if (elements.modalVideo) elements.modalVideo.src = ""; }
  function initializeQuiz() { state.currentQuestions = shuffleArray(allQuestions); state.userAnswers = new Array(state.currentQuestions.length).fill(null); renderQuiz(); }
  function shuffleArray(items) { const shuffled = [...items]; for (let i = shuffled.length - 1; i > 0; i -= 1) { const j = Math.floor(Math.random() * (i + 1)); [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]; } return shuffled; }

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
    const unanswered = state.userAnswers.filter((answer) => answer === null).length;
    if (unanswered > 0) return window.alert(`Por favor responde todas las preguntas. Faltan ${unanswered}.`);
    let correctCount = 0;
    state.currentQuestions.forEach((question, index) => { if (state.userAnswers[index] === question.correct) correctCount += 1; });
    const totalQuestions = state.currentQuestions.length;
    const percentage = Math.round((correctCount / totalQuestions) * 100);
    showResults(correctCount, totalQuestions, percentage);
  }

  function showResults(correctCount, totalQuestions, percentage) {
    setText(elements.userNameHeaderResults, `Evaluado: ${state.evaluationUserData.name}`);
    if (elements.scoreDisplay) {
      elements.scoreDisplay.textContent = `${percentage}%`;
      elements.scoreDisplay.className = `score-display${percentage >= 80 ? "" : " fail"}`;
    }
    if (elements.resultMessage) {
      if (percentage >= 80) {
        elements.resultMessage.innerHTML = `<strong style="color: #22c55e;">Excelente trabajo</strong><br>Has respondido correctamente ${correctCount} de ${totalQuestions} preguntas.<br>Has aprobado el curso de IA educativa.`;
        elements.certificateSection?.classList.remove("hidden");
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
    state.resultsChartInstance = new Chart(ctx, { type: "doughnut", data: { labels: ["Correctas", "Incorrectas"], datasets: [{ data: [correct, incorrect], backgroundColor: ["rgba(34, 197, 94, 0.8)", "rgba(239, 68, 68, 0.8)"], borderColor: ["rgba(34, 197, 94, 1)", "rgba(239, 68, 68, 1)"], borderWidth: 2 }] }, options: { responsive: true, maintainAspectRatio: true, plugins: { legend: { position: "bottom", labels: { color: "#e0e7ff", font: { size: 14, weight: "bold" }, padding: 20 } } } } });
  }

  function showDetailedResults() {
    if (!elements.detailedResults) return;
    elements.detailedResults.innerHTML = '<div class="content-section"><h2 class="section-title">Revision detallada</h2></div>';
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
    if (!elements.certificateCanvas) throw new Error("No se encontro el lienzo del certificado.");
    const canvas = elements.certificateCanvas;
    const ctx = canvas.getContext("2d");
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, "#0b1f3b");
    gradient.addColorStop(0.55, "#153a6b");
    gradient.addColorStop(1, "#0c203d");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "rgba(255,255,255,0.04)";
    ctx.fillRect(70, 70, canvas.width - 140, canvas.height - 140);
    ctx.strokeStyle = "#d4af37";
    ctx.lineWidth = 18;
    ctx.strokeRect(36, 36, canvas.width - 72, canvas.height - 72);
    ctx.strokeStyle = "#efe2aa";
    ctx.lineWidth = 4;
    ctx.strokeRect(58, 58, canvas.width - 116, canvas.height - 116);

    const [logoIAMochila, logoUptc, logoLic, logoFac] = await Promise.all([
      loadImage("Recursos/Logo IA en la Mochila.png"),
      loadImage("Recursos/Logo_de_la_UPTC.svg.png"),
      loadImage("Recursos/Logo LI.png"),
      loadImage("Recursos/logo_FacultadCienciasEducacion.png")
    ]);

    drawLogoCard(ctx, logoUptc, 110, 82, 185, 88);
    drawLogoCard(ctx, logoLic, 315, 82, 180, 88);
    drawLogoCard(ctx, logoFac, 705, 82, 215, 88);
    drawLogoCard(ctx, logoIAMochila, 945, 82, 145, 88);

    ctx.textAlign = "center";
    ctx.fillStyle = "#f1ddb0";
    ctx.font = "700 24px serif";
    ctx.fillText("UNIVERSIDAD PEDAGOGICA Y TECNOLOGICA DE COLOMBIA", canvas.width / 2, 220);
    ctx.font = "700 21px serif";
    ctx.fillStyle = "#d8e5ff";
    ctx.fillText("Facultad de Ciencias de la Educacion | Licenciatura en Informatica", canvas.width / 2, 255);
    ctx.fillStyle = "#f1ddb0";
    ctx.font = "bold 60px serif";
    ctx.fillText("CERTIFICADO DE PARTICIPACION", canvas.width / 2, 330);
    ctx.fillStyle = "#ffffff";
    ctx.font = "28px sans-serif";
    ctx.fillText("Se certifica que", canvas.width / 2, 395);
    ctx.fillStyle = "#f6e7b0";
    ctx.font = "bold 50px serif";
    ctx.fillText(state.evaluationUserData.name.toUpperCase(), canvas.width / 2, 470);
    ctx.strokeStyle = "#d9b75f";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(220, 492);
    ctx.lineTo(980, 492);
    ctx.stroke();
    ctx.fillStyle = "#ffffff";
    ctx.font = "25px sans-serif";
    ctx.fillText("aprobo satisfactoriamente la evaluacion del modulo", canvas.width / 2, 560);
    ctx.fillStyle = "#c9d9f7";
    ctx.font = "bold 35px sans-serif";
    ctx.fillText("Herramientas de Inteligencia Artificial", canvas.width / 2, 612);
    ctx.fillText("para la Educacion", canvas.width / 2, 652);
    ctx.fillStyle = "#e0e7ff";
    ctx.font = "22px sans-serif";
    ctx.fillText(`Institucion: ${state.evaluationUserData.institution}`, canvas.width / 2, 715);
    ctx.fillText(`Correo institucional: ${state.evaluationUserData.email}`, canvas.width / 2, 750);
    const dateStr = new Date().toLocaleDateString("es-CO", { day: "numeric", month: "long", year: "numeric" });
    ctx.fillText(`Fecha de emision: ${dateStr}`, canvas.width / 2, 785);
    ctx.fillStyle = "#ffffff";
    ctx.font = "italic 20px serif";
    ctx.fillText("_________________________", 325, 808);
    ctx.fillText("_________________________", 875, 808);
    ctx.font = "bold 18px sans-serif";
    ctx.fillText("Direccion academica", 325, 838);
    ctx.fillText("Coordinacion del curso", 875, 838);
    ctx.strokeStyle = "#d9b75f";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(600, 815, 52, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = "#d9b75f";
    ctx.font = "bold 14px sans-serif";
    ctx.fillText("IA EN LA", 600, 808);
    ctx.fillText("MOCHILA", 600, 828);
    return canvas;
  }

  async function buildCertificatePdf() {
    const canvas = await drawCertificateOnCanvas();
    const { jsPDF } = window.jspdf || {};
    if (!jsPDF) throw new Error("La libreria de PDF no esta disponible.");
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
    showAlert("Se abrio tu cliente de correo. Adjunta el PDF descargado y envialo al correo institucional.", "success");
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
      image.crossOrigin = "anonymous";
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error(`No fue posible cargar el recurso ${src}.`));
      image.src = src;
    });
  }

  function drawLogoCard(ctx, image, x, y, width, height) {
    ctx.fillStyle = "rgba(255,255,255,0.95)";
    roundRect(ctx, x, y, width, height, 18);
    ctx.fill();
    const padding = 12;
    ctx.drawImage(image, x + padding, y + padding, width - (padding * 2), height - (padding * 2));
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

  async function syncSessionFromSupabase() {
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
      name: user.user_metadata?.full_name || user.email?.split("@")[0] || "Usuario"
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
      activateDashboardNav("perfil");
      showDashboard({ keepNavState: true, showProfilePanel: true });
      showProfilePanel();
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

  function showProfilePanel() {
    elements.profilePanel?.classList.remove("hidden");
    persistAppLocation("dashboardView", true);
    elements.profilePanel?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function hideProfilePanel() {
    elements.profilePanel?.classList.add("hidden");
    const currentView = loadStoredCurrentView();
    if (currentView === "dashboardView") persistAppLocation("dashboardView", false);
  }

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
    localStorage.setItem(STORAGE_KEYS.currentView, viewId);
    localStorage.setItem(STORAGE_KEYS.profilePanelOpen, isProfilePanelOpen ? "1" : "0");
  }

  function loadStoredCurrentView() {
    return localStorage.getItem(STORAGE_KEYS.currentView) || "dashboardView";
  }

  function restoreAppLocation() {
    const savedView = loadStoredCurrentView();
    const profilePanelOpen = localStorage.getItem(STORAGE_KEYS.profilePanelOpen) === "1";
    if (profilePanelOpen) {
      activateDashboardNav("perfil");
      showDashboard({ keepNavState: true, showProfilePanel: true, skipPersistence: true });
      showProfilePanel();
      return;
    }
    if (savedView === "dashboardView") {
      showDashboard({ skipPersistence: true });
      return;
    }
    if (savedView === "evaluacionView") {
      showDashboard({ skipPersistence: true });
      return;
    }
    showView(savedView);
  }
})();

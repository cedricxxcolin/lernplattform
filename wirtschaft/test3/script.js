/*
  Marktstadt 3D – Das Spiel der Preisbildung
  Offline-fähig, ohne Module, ohne Build-System.
*/
(function () {
  "use strict";

  const canvas = document.getElementById("gameCanvas");
  const startScreen = document.getElementById("startScreen");
  const startButton = document.getElementById("startButton");
  const hud = document.getElementById("hud");

  const levelValue = document.getElementById("levelValue");
  const moneyValue = document.getElementById("moneyValue");
  const pointsValue = document.getElementById("pointsValue");
  const questValue = document.getElementById("questValue");
  const inventoryValue = document.getElementById("inventoryValue");
  const interactionHint = document.getElementById("interactionHint");
  const priceBoard = document.getElementById("priceBoard");
  const eventTicker = document.getElementById("eventTicker");

  const interactionPanel = document.getElementById("interactionPanel");
  const interactionContent = document.getElementById("interactionContent");

  const quizPanel = document.getElementById("quizPanel");
  const quizQuestion = document.getElementById("quizQuestion");
  const quizOptions = document.getElementById("quizOptions");
  const quizFeedback = document.getElementById("quizFeedback");
  const nextQuizButton = document.getElementById("nextQuizButton");
  const closeQuizButton = document.getElementById("closeQuizButton");

  const ZONES = {
    bauernmarkt: { name: "Bauernmarkt", level: 1, color: 0x6ab04c, pos: new THREE.Vector3(-45, 0, -20), size: new THREE.Vector3(24, 8, 24) },
    einkaufszone: { name: "Einkaufszone", level: 2, color: 0x22a6b3, pos: new THREE.Vector3(-10, 0, -20), size: new THREE.Vector3(24, 8, 24) },
    elektronikmarkt: { name: "Elektronikmarkt", level: 3, color: 0x686de0, pos: new THREE.Vector3(25, 0, -20), size: new THREE.Vector3(24, 8, 24) },
    bank: { name: "Bank", level: 4, color: 0xf9ca24, pos: new THREE.Vector3(-10, 0, 20), size: new THREE.Vector3(20, 10, 20) },
    lagerhaus: { name: "Lagerhaus", level: 4, color: 0x7f8c8d, pos: new THREE.Vector3(25, 0, 20), size: new THREE.Vector3(24, 10, 24) },
    rathaus: { name: "Rathaus", level: 5, color: 0xeb4d4b, pos: new THREE.Vector3(-45, 0, 20), size: new THREE.Vector3(24, 12, 24) }
  };

  const PRODUCTS = {
    "Äpfel": { basePrice: 4, supply: 100, demand: 95, stock: 0 },
    "Brot": { basePrice: 5, supply: 100, demand: 100, stock: 0 },
    "Kaffee": { basePrice: 8, supply: 100, demand: 105, stock: 0 },
    "Smartphones": { basePrice: 55, supply: 90, demand: 100, stock: 0 },
    "Fahrräder": { basePrice: 40, supply: 95, demand: 95, stock: 0 }
  };

  const zoneProducts = {
    bauernmarkt: ["Äpfel", "Brot"],
    einkaufszone: ["Kaffee", "Brot", "Fahrräder"],
    elektronikmarkt: ["Smartphones", "Fahrräder"],
    lagerhaus: ["Äpfel", "Brot", "Kaffee", "Smartphones", "Fahrräder"]
  };

  const events = [
    {
      name: "Ernteausfall",
      message: "Ernteausfall: Angebot für Äpfel und Brot sinkt.",
      apply: () => {
        adjustSupply("Äpfel", -18);
        adjustSupply("Brot", -14);
      }
    },
    {
      name: "Überproduktion",
      message: "Überproduktion: Angebot in der Einkaufszone steigt.",
      apply: () => {
        adjustSupply("Kaffee", +18);
        adjustSupply("Brot", +10);
      }
    },
    {
      name: "Trend/Hype",
      message: "Trend/Hype: Nachfrage nach Smartphones steigt stark.",
      apply: () => {
        adjustDemand("Smartphones", +24);
      }
    },
    {
      name: "Krise",
      message: "Krise: Nachfrage nach Fahrrädern und Smartphones sinkt.",
      apply: () => {
        adjustDemand("Fahrräder", -18);
        adjustDemand("Smartphones", -12);
      }
    },
    {
      name: "Transportproblem",
      message: "Transportproblem: Angebot sinkt bei Kaffee und Fahrrädern.",
      apply: () => {
        adjustSupply("Kaffee", -15);
        adjustSupply("Fahrräder", -16);
      }
    },
    {
      name: "Neue Technologie",
      message: "Neue Technologie: Produktion wird effizienter, Angebot steigt.",
      apply: () => {
        adjustSupply("Smartphones", +16);
        adjustSupply("Fahrräder", +12);
      }
    }
  ];

  const quests = [
    { text: "Kaufe 3 Äpfel günstig ein (Preis unter 4 CHF).", check: (s) => s.stats.boughtApplesCheap >= 3 },
    { text: "Verkaufe 2 Waren bei steigenden Preisen.", check: (s) => s.stats.soldOnRising >= 2 },
    { text: "Reagiere auf ein Ereignis mit einem Kauf oder Verkauf.", check: (s) => s.stats.tradesAfterEvent >= 1 },
    { text: "Erreiche mindestens 140 CHF Kapital.", check: (s) => s.money >= 140 },
    { text: "Kaufe mindestens 1 Smartphone.", check: (s) => s.inventory["Smartphones"] >= 1 || s.stats.everBoughtSmartphone },
    { text: "Verkaufe 2 Fahrräder mit Gewinn.", check: (s) => s.stats.bikeProfitSales >= 2 },
    { text: "Nutze die Bank und nimm einmal Kredit auf.", check: (s) => s.stats.usedBankLoan },
    { text: "Nutze das Lagerhaus mindestens 2 Mal.", check: (s) => s.stats.usedWarehouse >= 2 },
    { text: "Beantworte mindestens 5 Quizfragen korrekt.", check: (s) => s.stats.correctQuiz >= 5 },
    { text: "Erreiche 200 Punkte.", check: (s) => s.points >= 200 }
  ];

  const quizQuestions = [
    { q: "Was passiert ceteris paribus mit dem Preis, wenn die Nachfrage steigt?", options: ["Preis steigt", "Preis sinkt", "Preis bleibt immer gleich"], a: 0, exp: "Mehr Nachfrage bei gleichem Angebot erhöht den Gleichgewichtspreis." },
    { q: "Wenn das Angebot sinkt und die Nachfrage gleich bleibt, dann ...", options: ["steigt der Preis", "fällt der Preis", "ändert sich nichts"], a: 0, exp: "Knappheit führt zu höherem Preis." },
    { q: "Marktgleichgewicht bedeutet ...", options: ["Angebot = Nachfrage", "Angebot > Nachfrage", "Nachfrage = 0"], a: 0, exp: "Im Gleichgewicht ist die gehandelte Menge stabil." },
    { q: "Was beschreibt Knappheit am besten?", options: ["Bedürfnisse sind größer als verfügbare Mittel", "Es gibt immer zu viel Angebot", "Geld ist wertlos"], a: 0, exp: "Knappheit ist ein Kernproblem jeder Volkswirtschaft." },
    { q: "Eine staatliche Preisobergrenze unter dem Gleichgewichtspreis führt oft zu ...", options: ["Nachfrageüberschuss", "Angebotsüberschuss", "keinen Effekten"], a: 0, exp: "Niedrige Preise fördern Nachfrage und bremsen Angebot." },
    { q: "Eine staatliche Preisuntergrenze über dem Gleichgewichtspreis führt oft zu ...", options: ["Angebotsüberschuss", "Nachfrageüberschuss", "sofortiger Marktauflösung"], a: 0, exp: "Zu hohe Mindestpreise fördern Überangebot." },
    { q: "Welche Aussage ist richtig?", options: ["Bei höherem Preis bieten Unternehmen meist mehr an", "Bei höherem Preis wird immer mehr nachgefragt", "Angebot ist nie preissensibel"], a: 0, exp: "Die Angebotskurve verläuft in der Regel steigend." },
    { q: "Ein Hype für ein Produkt verschiebt typischerweise ...", options: ["die Nachfragekurve nach rechts", "die Angebotskurve nach links", "beide Kurven nicht"], a: 0, exp: "Mehr Kaufbereitschaft erhöht die Nachfrage." },
    { q: "Technologischer Fortschritt bewirkt oft ...", options: ["mehr Angebot bei gleichen Kosten", "weniger Angebot", "kein Effekt auf Preise"], a: 0, exp: "Produktionskosten sinken häufig, Angebot steigt." },
    { q: "Wenn Konsumentinnen weniger Einkommen haben, sinkt bei normalen Gütern meist ...", options: ["die Nachfrage", "das Angebot", "die Produktionskosten"], a: 0, exp: "Geringere Kaufkraft reduziert die Nachfrage." },
    { q: "Was ist ein indirekter Eingriff in den Markt?", options: ["Steuer auf ein Gut", "Menge exakt festlegen", "Preis direkt fixieren"], a: 0, exp: "Steuern verändern Anreize, ohne Preis direkt festzusetzen." },
    { q: "Was zeigt die Nachfragekurve?", options: ["Zusammenhang zwischen Preis und nachgefragter Menge", "Gewinn einer Firma", "Staatsverschuldung"], a: 0, exp: "Sie beschreibt das Nachfrageverhalten bei verschiedenen Preisen." },
    { q: "Wenn sowohl Angebot als auch Nachfrage steigen, dann ...", options: ["ist die Preiswirkung unklar, Menge steigt meist", "fällt der Preis sicher", "steigt der Preis sicher"], a: 0, exp: "Der Endpreis hängt von der stärkeren Verschiebung ab." },
    { q: "Welche Maßnahme erhöht kurzfristig die Nachfrage nach Fahrrädern am ehesten?", options: ["Subvention für Käufer", "Höhere Mehrwertsteuer", "Importbeschränkung für Ersatzteile"], a: 0, exp: "Subventionen senken effektiv den Kaufpreis." },
    { q: "Warum ist Preis ein Knappheitssignal?", options: ["Er zeigt, wie begehrt und knapp ein Gut ist", "Er wird zufällig gewürfelt", "Er ist immer politisch festgelegt"], a: 0, exp: "Hohe Preise zeigen relative Knappheit und lenken Entscheidungen." }
  ];

  const state = {
    started: false,
    level: 1,
    money: 100,
    points: 0,
    inventory: {
      "Äpfel": 0,
      "Brot": 0,
      "Kaffee": 0,
      "Smartphones": 0,
      "Fahrräder": 0
    },
    averageBuyPrice: {
      "Äpfel": 0,
      "Brot": 0,
      "Kaffee": 0,
      "Smartphones": 0,
      "Fahrräder": 0
    },
    questIndex: 0,
    currentZoneKey: null,
    currentEventTime: 0,
    lastEventAt: 0,
    prevPrices: {},
    quizOpen: false,
    quizIndex: 0,
    quizAnswered: false,
    lastEventTimestamp: 0,
    stats: {
      boughtApplesCheap: 0,
      soldOnRising: 0,
      tradesAfterEvent: 0,
      everBoughtSmartphone: false,
      bikeProfitSales: 0,
      usedBankLoan: false,
      usedWarehouse: 0,
      correctQuiz: 0
    }
  };

  let renderer;
  let scene;
  let camera;
  let clock;
  let playerYaw = 0;
  let playerPitch = 0;
  const keys = { KeyW: false, KeyA: false, KeyS: false, KeyD: false };
  let zoneMeshes = [];

  function initThree() {
    renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x9ad0ff);

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 2, 10);

    const hemi = new THREE.HemisphereLight(0xffffff, 0x777777, 1.0);
    scene.add(hemi);

    const dir = new THREE.DirectionalLight(0xffffff, 0.85);
    dir.position.set(20, 30, 10);
    scene.add(dir);

    const groundGeom = new THREE.PlaneGeometry(220, 220);
    const groundMat = new THREE.MeshLambertMaterial({ color: 0x9ecf7a });
    const ground = new THREE.Mesh(groundGeom, groundMat);
    ground.rotation.x = -Math.PI / 2;
    scene.add(ground);

    addRoads();
    addZonesAndBuildings();
    addSimpleNpcs();

    clock = new THREE.Clock();
    window.addEventListener("resize", onResize);
  }

  function addRoads() {
    const roadMat = new THREE.MeshLambertMaterial({ color: 0x333333 });
    const road1 = new THREE.Mesh(new THREE.BoxGeometry(170, 0.1, 10), roadMat);
    road1.position.set(-10, 0.05, 0);
    scene.add(road1);

    const road2 = new THREE.Mesh(new THREE.BoxGeometry(10, 0.1, 130), roadMat);
    road2.position.set(-10, 0.05, 0);
    scene.add(road2);
  }

  function addZonesAndBuildings() {
    zoneMeshes = [];
    Object.keys(ZONES).forEach((key) => {
      const zone = ZONES[key];
      const zoneBase = new THREE.Mesh(
        new THREE.BoxGeometry(zone.size.x, 0.6, zone.size.z),
        new THREE.MeshLambertMaterial({ color: zone.color })
      );
      zoneBase.position.set(zone.pos.x, 0.3, zone.pos.z);
      scene.add(zoneBase);

      const buildingHeight = zone.size.y;
      const building = new THREE.Mesh(
        new THREE.BoxGeometry(zone.size.x * 0.7, buildingHeight, zone.size.z * 0.7),
        new THREE.MeshLambertMaterial({ color: darken(zone.color, 0.22) })
      );
      building.position.set(zone.pos.x, buildingHeight / 2 + 0.3, zone.pos.z);
      scene.add(building);

      zoneMeshes.push({ key: key, zone: zone, mesh: zoneBase });
    });
  }

  function addSimpleNpcs() {
    const npcPositions = [
      new THREE.Vector3(-45, 1, -7),
      new THREE.Vector3(-10, 1, -7),
      new THREE.Vector3(25, 1, -7),
      new THREE.Vector3(-10, 1, 35),
      new THREE.Vector3(25, 1, 35)
    ];

    npcPositions.forEach((p) => {
      const npc = new THREE.Mesh(
        new THREE.CapsuleGeometry(0.7, 1.2, 4, 8),
        new THREE.MeshLambertMaterial({ color: 0xffffff * Math.random() })
      );
      npc.position.copy(p);
      scene.add(npc);
    });
  }

  function darken(colorHex, amount) {
    const c = new THREE.Color(colorHex);
    c.r *= 1 - amount;
    c.g *= 1 - amount;
    c.b *= 1 - amount;
    return c;
  }

  function onResize() {
    if (!camera || !renderer) {
      return;
    }
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }

  function startGame() {
    if (state.started) {
      return;
    }
    state.started = true;
    startScreen.classList.add("hidden");
    hud.classList.remove("hidden");
    initThree();
    setupInput();
    updateAllPrices(true);
    renderPriceBoard();
    updateHud();
    animate();
    showEvent("Spiel gestartet! Starte im Bauernmarkt und löse Aufträge.");
  }

  function setupInput() {
    document.addEventListener("keydown", (e) => {
      if (keys.hasOwnProperty(e.code)) {
        keys[e.code] = true;
      }
      if (e.code === "KeyE") {
        handleInteract();
      }
      if (e.code === "Escape") {
        closePanels();
      }
    });

    document.addEventListener("keyup", (e) => {
      if (keys.hasOwnProperty(e.code)) {
        keys[e.code] = false;
      }
    });

    canvas.addEventListener("click", () => {
      if (document.pointerLockElement !== canvas) {
        canvas.requestPointerLock();
      }
    });

    document.addEventListener("mousemove", (e) => {
      if (document.pointerLockElement !== canvas || !state.started || isPanelOpen()) {
        return;
      }
      const sensitivity = 0.0023;
      playerYaw -= e.movementX * sensitivity;
      playerPitch -= e.movementY * sensitivity;
      playerPitch = Math.max(-Math.PI / 2 + 0.05, Math.min(Math.PI / 2 - 0.05, playerPitch));
      camera.rotation.set(playerPitch, playerYaw, 0, "YXZ");
    });

    nextQuizButton.addEventListener("click", () => {
      if (state.quizIndex < quizQuestions.length - 1) {
        state.quizIndex += 1;
        state.quizAnswered = false;
        renderQuizQuestion();
      } else {
        quizFeedback.textContent = "Du hast alle Quizfragen bearbeitet.";
      }
    });

    closeQuizButton.addEventListener("click", () => {
      quizPanel.classList.add("hidden");
      state.quizOpen = false;
    });
  }

  function animate() {
    requestAnimationFrame(animate);
    const dt = Math.min(clock.getDelta(), 0.05);
    if (!isPanelOpen()) {
      updateMovement(dt);
    }
    detectCurrentZone();
    maybeTriggerEvent();
    renderer.render(scene, camera);
  }

  function updateMovement(dt) {
    const speed = 12;
    const direction = new THREE.Vector3();
    if (keys.KeyW) direction.z -= 1;
    if (keys.KeyS) direction.z += 1;
    if (keys.KeyA) direction.x -= 1;
    if (keys.KeyD) direction.x += 1;

    if (direction.lengthSq() > 0) {
      direction.normalize();
      const move = new THREE.Vector3(direction.x, 0, direction.z);
      move.applyAxisAngle(new THREE.Vector3(0, 1, 0), playerYaw);
      camera.position.addScaledVector(move, speed * dt);
      camera.position.y = 2;
      camera.position.x = THREE.MathUtils.clamp(camera.position.x, -95, 95);
      camera.position.z = THREE.MathUtils.clamp(camera.position.z, -95, 95);
    }
  }

  function detectCurrentZone() {
    let found = null;
    const p = camera.position;
    zoneMeshes.forEach((z) => {
      const sx = z.zone.size.x / 2;
      const sz = z.zone.size.z / 2;
      if (
        p.x >= z.zone.pos.x - sx &&
        p.x <= z.zone.pos.x + sx &&
        p.z >= z.zone.pos.z - sz &&
        p.z <= z.zone.pos.z + sz
      ) {
        found = z.key;
      }
    });

    state.currentZoneKey = found;
    if (!found) {
      interactionHint.textContent = "Bewege dich zu einem Bereich und drücke E.";
      return;
    }

    const zone = ZONES[found];
    if (state.level >= zone.level) {
      interactionHint.textContent = `${zone.name}: Drücke E zur Interaktion.`;
    } else {
      interactionHint.textContent = `${zone.name} ist gesperrt. Erreiche zuerst Level ${zone.level}.`;
    }
  }

  function maybeTriggerEvent() {
    const now = performance.now();
    if (now - state.lastEventAt < 18000) {
      return;
    }
    state.lastEventAt = now;

    if (Math.random() < 0.45) {
      const ev = events[Math.floor(Math.random() * events.length)];
      ev.apply();
      updateAllPrices();
      state.lastEventTimestamp = Date.now();
      showEvent(ev.message);
    }
  }

  function adjustSupply(product, delta) {
    PRODUCTS[product].supply = clamp(PRODUCTS[product].supply + delta, 30, 180);
  }

  function adjustDemand(product, delta) {
    PRODUCTS[product].demand = clamp(PRODUCTS[product].demand + delta, 30, 180);
  }

  function updateAllPrices(initial) {
    Object.keys(PRODUCTS).forEach((name) => {
      const p = PRODUCTS[name];
      const oldPrice = p.currentPrice || p.basePrice;
      const ratio = p.demand / p.supply;
      const newPrice = Math.max(1, round2(p.basePrice * ratio));
      p.currentPrice = newPrice;
      state.prevPrices[name] = initial ? newPrice : oldPrice;
    });
    renderPriceBoard();
    updateLevelProgression();
  }

  function renderPriceBoard() {
    const lines = [];
    lines.push('<div class="price-header">Produkt</div><div class="price-header">Preis</div><div class="price-header">Nachfrage</div><div class="price-header">Angebot</div>');
    Object.keys(PRODUCTS).forEach((name) => {
      const p = PRODUCTS[name];
      lines.push(`<div>${name}</div><div>${p.currentPrice.toFixed(2)} CHF</div><div>${Math.round(p.demand)}</div><div>${Math.round(p.supply)}</div>`);
    });
    priceBoard.innerHTML = lines.join("");
  }

  function updateHud() {
    levelValue.textContent = state.level;
    moneyValue.textContent = state.money.toFixed(2);
    pointsValue.textContent = state.points;
    questValue.textContent = quests[state.questIndex] ? quests[state.questIndex].text : "Alle Aufträge erledigt";

    const invParts = Object.keys(state.inventory)
      .map((k) => `${k}: ${state.inventory[k]}`)
      .filter((x) => !x.endsWith(": 0"));
    inventoryValue.textContent = invParts.length ? invParts.join(" | ") : "leer";
  }

  function showEvent(msg) {
    eventTicker.textContent = msg;
  }

  function handleInteract() {
    if (!state.currentZoneKey) {
      return;
    }
    const zone = ZONES[state.currentZoneKey];
    if (state.level < zone.level) {
      showEvent(`${zone.name} noch gesperrt. Erreiche Level ${zone.level}.`);
      return;
    }

    openZonePanel(state.currentZoneKey);
  }

  function openZonePanel(zoneKey) {
    interactionPanel.classList.remove("hidden");
    let html = `<h3>${ZONES[zoneKey].name}</h3>`;

    if (zoneProducts[zoneKey]) {
      html += "<p>Kaufen/Verkaufen mit Marktpreisen:</p><div class='actions'>";
      zoneProducts[zoneKey].forEach((product) => {
        const price = PRODUCTS[product].currentPrice;
        html += `<button data-action='buy' data-product='${product}'>Kaufe ${product} (${price.toFixed(2)} CHF)</button>`;
        html += `<button data-action='sell' data-product='${product}'>Verkaufe ${product} (${price.toFixed(2)} CHF)</button><br/>`;
      });
      html += "</div>";
    }

    if (zoneKey === "bank") {
      html += "<p>Bankdienstleistungen:</p><div class='actions'>";
      html += "<button data-action='loan'>Kredit +30 CHF (einmalig, -15 Punkte)</button>";
      html += "<button data-action='repay'>Kredit zurückzahlen -30 CHF (+20 Punkte)</button>";
      html += "</div>";
    }

    if (zoneKey === "lagerhaus") {
      html += "<p>Lagerhaus: Marktanalyse gegen Gebühr.</p><div class='actions'>";
      html += "<button data-action='analysis'>Analyse kaufen (5 CHF): Nachfrage/Angebot verbessern</button>";
      html += "</div>";
    }

    if (zoneKey === "rathaus") {
      html += "<p>Abschlusszone: Erkläre Preisänderungen & absolviere Quiz.</p><div class='actions'>";
      html += "<button data-action='explain'>Preisänderung erklären (+25 Punkte)</button>";
      html += "<button data-action='quiz'>Quiz öffnen</button>";
      html += "</div>";
    }

    html += "<div class='actions'><button data-action='close'>Schließen</button></div>";
    interactionContent.innerHTML = html;

    interactionContent.querySelectorAll("button").forEach((btn) => {
      btn.addEventListener("click", () => {
        const action = btn.getAttribute("data-action");
        const product = btn.getAttribute("data-product");
        executeAction(action, product);
      });
    });
  }

  function executeAction(action, product) {
    if (action === "close") {
      closePanels();
      return;
    }

    if (action === "buy") {
      buyProduct(product);
    } else if (action === "sell") {
      sellProduct(product);
    } else if (action === "loan") {
      if (!state.stats.usedBankLoan) {
        state.money += 30;
        state.points = Math.max(0, state.points - 15);
        state.stats.usedBankLoan = true;
        showEvent("Kredit aufgenommen: +30 CHF, -15 Punkte.");
      } else {
        showEvent("Kredit wurde bereits aufgenommen.");
      }
    } else if (action === "repay") {
      if (state.stats.usedBankLoan && state.money >= 30) {
        state.money -= 30;
        state.stats.usedBankLoan = false;
        state.points += 20;
        showEvent("Kredit zurückgezahlt: +20 Punkte.");
      } else {
        showEvent("Rückzahlung nicht möglich.");
      }
    } else if (action === "analysis") {
      if (state.money >= 5) {
        state.money -= 5;
        state.stats.usedWarehouse += 1;
        Object.keys(PRODUCTS).forEach((name) => {
          adjustSupply(name, Math.random() > 0.5 ? 2 : -2);
          adjustDemand(name, Math.random() > 0.5 ? 2 : -2);
        });
        updateAllPrices();
        state.points += 5;
        showEvent("Analyse genutzt: Marktwerte leicht verändert.");
      } else {
        showEvent("Nicht genug Geld für Analyse.");
      }
    } else if (action === "explain") {
      state.points += 25;
      showEvent("Erklärung anerkannt: Angebot/Nachfrage beeinflussen den Preis.");
    } else if (action === "quiz") {
      state.quizOpen = true;
      quizPanel.classList.remove("hidden");
      state.quizAnswered = false;
      renderQuizQuestion();
    }

    progressQuests();
    updateHud();
  }

  function buyProduct(name) {
    const price = PRODUCTS[name].currentPrice;
    if (state.money < price) {
      showEvent("Zu wenig Geld für diesen Kauf.");
      return;
    }

    state.money -= price;
    state.inventory[name] += 1;

    const currentAmount = state.inventory[name];
    const oldAvg = state.averageBuyPrice[name];
    state.averageBuyPrice[name] = round2(((oldAvg * (currentAmount - 1)) + price) / currentAmount);

    adjustDemand(name, +4);
    adjustSupply(name, -3);
    updateAllPrices();

    state.points += 4;
    if (name === "Äpfel" && price < 4) {
      state.stats.boughtApplesCheap += 1;
    }
    if (name === "Smartphones") {
      state.stats.everBoughtSmartphone = true;
    }

    if (Date.now() - state.lastEventTimestamp < 16000) {
      state.stats.tradesAfterEvent += 1;
    }

    showEvent(`Gekauft: ${name} für ${price.toFixed(2)} CHF.`);
  }

  function sellProduct(name) {
    if (state.inventory[name] <= 0) {
      showEvent(`Kein Bestand von ${name} zum Verkaufen.`);
      return;
    }

    const price = PRODUCTS[name].currentPrice;
    const previousPrice = state.prevPrices[name] || price;
    state.inventory[name] -= 1;
    state.money += price;

    adjustDemand(name, -3);
    adjustSupply(name, +4);
    updateAllPrices();

    state.points += 5;

    if (price > previousPrice) {
      state.stats.soldOnRising += 1;
    }

    if (name === "Fahrräder" && price > state.averageBuyPrice[name]) {
      state.stats.bikeProfitSales += 1;
    }

    if (Date.now() - state.lastEventTimestamp < 16000) {
      state.stats.tradesAfterEvent += 1;
    }

    showEvent(`Verkauft: ${name} für ${price.toFixed(2)} CHF.`);
  }

  function progressQuests() {
    while (quests[state.questIndex] && quests[state.questIndex].check(state)) {
      state.points += 30;
      showEvent(`Auftrag erfüllt: ${quests[state.questIndex].text}`);
      state.questIndex += 1;
    }
    updateLevelProgression();
  }

  function updateLevelProgression() {
    const oldLevel = state.level;
    if (state.questIndex >= 2) state.level = Math.max(state.level, 2);
    if (state.questIndex >= 4) state.level = Math.max(state.level, 3);
    if (state.questIndex >= 7) state.level = Math.max(state.level, 4);
    if (state.questIndex >= 10) state.level = Math.max(state.level, 5);

    if (oldLevel !== state.level) {
      showEvent(`Levelaufstieg! Neues Level: ${state.level}`);
    }
  }

  function renderQuizQuestion() {
    const q = quizQuestions[state.quizIndex];
    quizQuestion.textContent = `Frage ${state.quizIndex + 1}/${quizQuestions.length}: ${q.q}`;
    quizOptions.innerHTML = "";
    quizFeedback.textContent = "";

    q.options.forEach((opt, idx) => {
      const btn = document.createElement("button");
      btn.className = "option";
      btn.textContent = opt;
      btn.disabled = state.quizAnswered;
      btn.addEventListener("click", () => answerQuiz(idx));
      quizOptions.appendChild(btn);
    });
  }

  function answerQuiz(idx) {
    if (state.quizAnswered) {
      return;
    }
    state.quizAnswered = true;
    const q = quizQuestions[state.quizIndex];
    if (idx === q.a) {
      quizFeedback.innerHTML = `<strong>Richtig!</strong> ${q.exp}`;
      state.points += 12;
      state.stats.correctQuiz += 1;
    } else {
      quizFeedback.innerHTML = `<strong>Nicht korrekt.</strong> ${q.exp}`;
      state.points += 2;
    }

    progressQuests();
    updateHud();
  }

  function isPanelOpen() {
    return !interactionPanel.classList.contains("hidden") || !quizPanel.classList.contains("hidden");
  }

  function closePanels() {
    interactionPanel.classList.add("hidden");
    quizPanel.classList.add("hidden");
    state.quizOpen = false;
  }

  function clamp(v, min, max) {
    return Math.max(min, Math.min(max, v));
  }

  function round2(v) {
    return Math.round(v * 100) / 100;
  }

  startButton.addEventListener("click", startGame);
})();

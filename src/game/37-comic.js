  // =================================================================== comic intro: 4 painted frames (assets/comic.js), shown once before the first story run
  const COMIC = { frames: [], ready: false };
  const COMIC_TEXT = {
    ru: ['Астана, наши дни. В тихом зале музея веками спит древний батыр…', '— Вставай, батыр! — Қыдыр ата касается посохом. — Чудища из сказок вырвались на волю!', 'У Байтерека открылся портал. Волки, албасты и сам Айдаһар — на улицах столицы.', 'Батыр берёт лук предков. Легенды вышли на улицы — пора им навстречу!'],
    kz: ['Астана, бүгінгі күн. Мұражайдың тыныш залында ежелгі батыр ғасырлар бойы ұйықтап жатыр…', '— Тұр, батыр! — дейді Қыдыр ата. — Ертегі құбыжықтары босап шықты!', 'Бәйтеректің жанында портал ашылды. Қасқырлар, албастылар және Айдаһардың өзі — елорда көшелерінде.', 'Батыр ата-баба садағын алады. Аңыздар көшеге шықты — оларға қарсы шығатын уақыт келді!'],
    en: ['Astana, today. In a quiet museum hall an ancient batyr has slept for centuries…', '“Rise, batyr!” Kydyr ata touches him with his staff. “The monsters of the tales are loose!”', 'A portal has opened at Baiterek. Wolves, albasty and Aydahar himself roam the streets of the capital.', 'The batyr takes up the bow of his ancestors. Legends are unleashed — time to meet them!'],
  };
  let comicI = 0, comicT0 = 0, comicThen = null;
  function loadComic(done) {
    const sc = document.createElement('script'); sc.src = 'assets/comic.js';
    sc.onload = () => {
      const list = window.COMIC_PACK || []; window.COMIC_PACK = null;
      let n = 0;
      list.forEach((src, i) => { const im = new Image(); im.onload = () => { COMIC.frames[i] = im; if (++n === list.length) COMIC.ready = true; }; im.src = src; });
      done();
    };
    sc.onerror = () => done();   // no comic yet: the game starts straight away
    document.head.appendChild(sc);
  }
  function playComic(then) {
    if (!COMIC.ready) { then && then(); return; }
    comicI = 0; comicT0 = pNow; comicThen = then; menuPopup = 'comic';
  }
  function comicNext() {
    Sound.click();
    if (comicI < COMIC.frames.length - 1) { comicI++; comicT0 = pNow; return; }
    comicEnd();
  }
  function comicEnd() {
    Save.data.introSeen = true; Save.write();
    menuPopup = null; const f = comicThen; comicThen = null; if (f) f();
  }
  function drawComic() {
    const im = COMIC.frames[comicI]; if (!im) { comicEnd(); return; }
    const t = since(comicT0);
    ctx.fillStyle = '#05070b'; ctx.fillRect(0, -1000, W, H + 2000);
    // slow push-in on the frame (cover fit)
    const z = REDUCED_MOTION ? 1 : 1 + Math.min(t, 8) * 0.012, s = Math.max(W / im.width, H / im.height) * z;
    const iw = im.width * s, ih = im.height * s;
    ctx.save(); ctx.globalAlpha = clamp(t / 0.5, 0, 1);
    ctx.drawImage(im, (W - iw) / 2, (H - ih) / 2 - Math.min(t, 8) * 2, iw, ih);
    ctx.restore();
    const g = ctx.createLinearGradient(0, H * 0.58, 0, H); g.addColorStop(0, 'rgba(5,7,11,0)'); g.addColorStop(0.45, 'rgba(5,7,11,0.85)'); g.addColorStop(1, 'rgba(5,7,11,0.96)');
    ctx.fillStyle = g; ctx.fillRect(0, H * 0.58, W, H * 0.42);
    // caption, typed out
    const full = COMIC_TEXT[lang][comicI] || '', shown = REDUCED_MOTION ? full : full.slice(0, Math.floor(t * 38));
    wrap(shown, W / 2, H - SAFE.b - 160, W - 50, 21, 15, '#f5ead2', { weight: 600, f: 'ui' });
    // page dots and buttons
    COMIC.frames.forEach((_, i) => { ctx.beginPath(); ctx.arc(W / 2 - (COMIC.frames.length - 1) * 8 + i * 16, H - SAFE.b - 78, i === comicI ? 4.5 : 3, 0, TAU); ctx.fillStyle = i === comicI ? T.gold : 'rgba(255,236,200,0.35)'; ctx.fill(); });
    button(W / 2 - 80, H - SAFE.b - 62, 160, 42, comicI < COMIC.frames.length - 1 ? mt('next') + ' ›' : mt('toBattle'), () => { if (shown.length < full.length) comicT0 -= 30000; else comicNext(); }, { size: 15 });
    ctx.font = `700 12px ${FONT}`; const skw = ctx.measureText(mt('skip')).width + 24;
    rr(ctx, W - 12 - skw, SAFE.t + 18, skw, 28, 14); ctx.fillStyle = 'rgba(8,11,18,0.72)'; ctx.fill(); goldFrame(W - 12 - skw, SAFE.t + 18, skw, 28, 14, 1);
    txt(mt('skip'), W - 12 - skw / 2, SAFE.t + 32.5, 12, T.text, { weight: 700 });
    ui.push({ x: W - 80, y: SAFE.t + 14, w: 76, h: 36, fn: () => { Sound.click(); comicEnd(); } });
    frameBand(SAFE.t + 8);
  }

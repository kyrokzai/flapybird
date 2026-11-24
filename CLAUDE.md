# БАТЫР01 — заметки для работы над игрой

Браузерная 3D-игра в жанре Archero на Three.js r128. Модели в `assets/*.js` (GLB в base64).

**Код правь в `src/`, а не в `index.html`.** `index.html` собирается командой `npm run build` из `src/shell.html` и `src/game/*.js` (по порядку имён файлов, всё внутри одного замыкания). После правок обязательно `npm run build` и коммит обоих. CI (`.github/workflows/pages.yml`) проверяет `npm run check` и выкладывает игру на GitHub Pages (ветка `gh-pages`).

**Сначала прочитай `docs/GDD.md`**: там цели, аудитория, решения владельца и план по этапам. Новые фичи делай по этому плану.

## Инструменты для геймдева
- Если подключён плагин **parallax-threejs**, используй его для отладки Three.js и шейдеров (сцена, консоль, состояние WebGL, пиксели) и для визуальных регресс-тестов после изменений графики.
- Плагин **Unity** нужен только при переносе игры на Unity (например, для мобильного приложения). Для текущей браузерной версии не используй.
- Без плагинов проверяй изменения через Playwright с `--use-angle=swiftshader` и открытием `index.html#test` (режим без урона, `Mergen.goto(n)` прыгает в комнату, `Mergen.give(item)` выдаёт бонус, `Mergen.dieNow()` открывает экран воскрешения, `Mergen.tab('gear'|'talents'|'quests', popup)` открывает вкладку меню и окно `item`/`energy`/`daily`, `Mergen.end(won)` завершает забег, `Mergen.save` — сохранение, `Mergen.tut` — состояние обучения, `Mergen.music` — текущая тема музыки, `Mergen.crateList` и `Mergen.tp(x, y)` — ящики комнаты и телепорт героя, `Mergen.survival()` — запуск арены выживания, `Mergen.wave` — номер волны; заставка в тестовом режиме не показывается; энергия в тестовом режиме не тратится). **Баланс меняй только с прогоном `Mergen.sim({...})`** — ориентиры в `docs/GDD.md`, раздел 13.

## Правила
- Ветка разработки: `claude/mergen-archer`. Flappy Trump живёт в своей ветке, её не трогать.
- Тексты для игрока — на русском, казахском и английском (`STR`, поля `name`/`desc` с `ru`/`kz`/`en`).
- Анимации: модель со скелетом делается так: GLB → `3d_rigging` в Higgsfield (одна анимация за запуск, ~8 кредитов; спрашивать у владельца) → `tools/merge-anims.mjs` собирает клипы в один GLB и убирает смещение корня. Пример — `makeBatyrRig`/`animateRig` в `17-models-and-enemies.js`.
- Новые 3D-модели: сжимать через gltf-transform (weld, simplify ~1.6%, текстуры 1024 px для персонажей и зданий, 512 px для мелких предметов), класть в `assets/<name>.js`, добавлять в `MODEL_KEYS` и `LOAD_ORDER`.
- Сначала грузится то, что видно в меню (небо меню, батыр, конь), остальное — в фоне.
- Сохранения: объект `Save` (ключ `batyr01.save`, поле `v`). Меняешь формат — подними `SAVE_VERSION` и добавь шаг в `Save.upgrade()`.
- **Интерфейс (премиальный стиль):** все экраны рисуются на 2D-холсте шириной 360. Высота логического экрана `H` переменная (640–860, по пропорциям устройства), отступы выреза/«домой» — `SAFE.t` / `SAFE.b`. Верх привязывай к `SAFE.t`, низ — к `H - SAFE.b`; окна, свёрстанные под 640, центрируй через `shiftUI(oy, fn)` (сдвигает и зоны нажатия). Камера боя сохраняет ширину обзора (`G3.baseFov`).
- Компоненты: `panel()` (тёмная панель с золотой каймой), `button()` (без `col` — золотая; с `col` — тёмная с оттенком; `shape: 'hex'`, `icon`, `sub`), `txt(..., { f: 'head' | 'logo' })`, `goldFrame`, `diamond`, `frameBand`, `drawLogo`. Цвета текста — из `T` (`T.text`, `T.muted`, `T.gold`), не тёмные.
- Шрифты: Montserrat (интерфейс), Cormorant SC (заголовки), Cinzel (только логотип BATIR01, в нём нет кириллицы). Все, кроме Cinzel, проверены на казахских буквах; Manrope и Cinzel их не поддерживают.
- Учитывай `REDUCED_MOTION` (prefers-reduced-motion) для новых анимаций.
- **Арена выживания** (`31-survival.js`): стадион — 16-я запись в `ROOM_DEFS` (`arena: true`), режим забега `run.mode === 'survival'` (`isSurv()`), сложность врагов — `diffLevel()` (в сюжете = номер комнаты, на арене растёт с волной). Сюжетный баланс и `Mergen.sim` арену не трогают.
- **PWA:** `manifest.webmanifest`, `sw.js` (страница — сначала сеть, ассеты — кэш с фоновым обновлением, CDN — кэш), значки `icons/`. CI копирует их в `gh-pages`. Если меняешь стратегию кэша, подними `CACHE` в `sw.js`.
- **Звук:** записанные эффекты — `assets/sfx.js` (`window.SFX_PACK`, mp3 в base64), музыка — `assets/music_menu|battle|boss.js`. `Sound.play(name, vol, gap)` играет запись или возвращает false (тогда звучит синтез), `Sound.musicTrack()` включает тему по `Sound.mode`. Новые эффекты: подрезать тишину, нормализовать пик до −1 dB, mono 64 kbps.
- **Профиль и рейтинг** (`32-profile.js`): `Save.data.profile`, `stats`, `glory`, `tickets` (Save v5). Слава — `gloryFor(won)`, записывается один раз за забег в `recordRun(won)` (из `endRun` и выхода из паузы). Лиги `LEAGUES`, лестница героев эпоса `LEGENDS` (это не игроки). Арена: 3 минуты (`ARENA_TIME`), вход по билету (`spendTicket`), открыта при `arenaUnlocked()`. Тест: `Mergen.arenaTime(s)`.
- **Атмосфера** (`33-atmosphere.js`): настроение комнаты `MOODS[n]` (свет солнца/неба, тон панорамы, цветокоррекция `grade` с `tint` в шейдере, фонари, дымка, свет батыра), тени `blobShadow`, трава комнат `buildRoomGrass`, полёт монет/опыта в HUD `flyToHud`/`drawFlyers`.
- **Иконки** (`34-icons.js`, `assets/icons.js` = `window.ICON_PACK` с webp): снаряжение 176 px (вырезано по контуру), навыки и таланты 128 px (круг). Ключи — id из `GEAR`, `SKILLS`, `TALENTS`. Если картинки нет, рисуется старый векторный значок.
- **Элиты** (`35-elites.js`): `maybeElite` в `spawnEnemy`, `eliteAbsorb`/`eliteTick`/`eliteDeath`; шанс `eliteChance()`. Баланс проверен симуляцией (новичок ~19%).
- **Достижения и «Жол»** (`36-goals.js`, Save v6: `ach`, `frames`, `profile.frame`, `pass`): `ACH`, `achUpdate()`, `grant(rw)`; пропуск — `PASS` (30 ступеней по `PASS_STEP` славы с `pass.start`). Тосты — `toasts`.
- **Комикс** (`37-comic.js`): `assets/comic.js` = `window.COMIC_PACK` (массив 4 data-URL, 9:16), тексты `COMIC_TEXT`, флаг `Save.data.introSeen`. Тест: `Mergen.comic()`.
- **Батыр в меню** (`assets/batyr.js`): модель владельца в стиле комикса (Tripo, `warrior_30MB.zip`) — ~97 тыс. треугольников, цвет 2048 px, карта рельефа 1024 px, геометрия сжата **meshopt** (декодер `meshopt_decoder.js` r128 подключён в `shell.html`, `loader.setMeshoptDecoder`). Конвейер: weld → simplify 0.03 (error 0.004) → `tex.mjs` (textureCompress, quantize) → `gltf-transform meshopt`. Ракурс — `MENU_CAM`. Меню рендерится с pixel ratio до 2 (кроме «Низкой»), трава меню ставится только в поле зрения камеры. `Mergen.prof` — среднее время кадра 3D и 2D.
- **Модели владельца (Tripo)** сжимаются скриптом `texn.mjs in out colorPx normalPx` (+ `gltf-transform meshopt`): `prop_birch` (берёзы в парках, у ворот и в меню), `lm_portal` (портал с драконом и бегущими людьми — ориентир в комнатах 4–5, `LM_HEIGHT.portal`), `civ_woman` (горожанки у ворот и заборов, `38-civilians.js`: машут, а после зачистки радостно подпрыгивают). Тест: `Mergen.models`, `Mergen.g3`.
- Качество графики: пресеты `QUALITY` (low/medium/high), `applyQuality()` переключает на лету. Тяжёлые эффекты масштабируй через `Q.grass` / `Q.fx` или проверку `QL`.

// SPOILERS: this script solves the whole room.
//
// End-to-end test: plays the Observatory start to finish through the real modal UI
// using the dev-only helpers on window.game, screenshots each step, and fails on
// console errors. Needs the dev server running and Playwright available:
//
//   npm run dev                                   # in another terminal
//   NODE_PATH=$(npm root -g) node tools/playthrough.cjs [outDir] [baseUrl]
//
// Software-rendered Chromium is slow, so the 3D view is rendered at low resolution.
const { chromium } = require('playwright');
const out = process.argv[2] || 'playthrough-shots';
const base = process.argv[3] || 'http://localhost:5173';
require('fs').mkdirSync(out, { recursive: true });
(async () => {
  const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--autoplay-policy=no-user-gesture-required'] });
  const page = await browser.newPage({ viewport: { width: 1100, height: 700 } });
  const problems = [];
  page.on('pageerror', (e) => problems.push('pageerror: ' + e.message));
  page.on('console', (m) => { if (['error', 'warning'].includes(m.type())) problems.push(m.type() + ': ' + m.text().slice(0, 300)); });
  await page.goto(`${base}/?peek=3,1,75,0`, { timeout: 120000 });
  await page.evaluate(() => localStorage.clear());
  await page.goto(`${base}/?peek=3,1,75,0`, { timeout: 120000 });
  await page.waitForFunction(() => window.game, null, { timeout: 90000 });
  await page.evaluate(() => window.game.state.set('started'));
  await page.evaluate(() => window.three.renderer.setPixelRatio(0.2)); // software GL is slow; modals don't need the 3D sharp
  let n = 0;
  const shot = (name) => page.screenshot({ path: `${out}/${String(++n).padStart(2, '0')}-${name}.png` });
  const close = () => page.click('.modal-close');
  const use = async (id) => { await page.evaluate((h) => window.game.use(h), id); await page.waitForTimeout(600); };
  const inv = () => page.evaluate(() => window.game.state.inventory);
  const has = (flag) => page.evaluate((f) => window.game.state.has(f), flag);
  const takeAll = async () => { while (await page.$('.item-card')) { await page.click('.item-card'); await page.waitForTimeout(100); } };
  const clickTimes = async (sel, times) => { for (let k = 0; k < times; k++) await page.click(sel); };
  const step = async (name, fn) => {
    try { await fn(); console.log('ok  ', name); } catch (e) { console.log('FAIL', name, e.message.split('\n')[0]); problems.push(name); }
  };
  const expect = async (flag) => { if (!(await has(flag))) throw new Error(`${flag} not set`); };

  await step('letter', async () => { await use('letter'); await shot('letter'); await close(); });
  await step('clock + drawer', async () => {
    await use('clock'); await shot('clock'); await close();
    await use('drawer');
    const up = await page.$$('.combo-btn[aria-label="Turn up"]');
    for (const [i, k] of [[0, 1], [1, 1], [2, 4], [3, 7]]) for (let j = 0; j < k; j++) await up[i].click();
    await page.waitForTimeout(1400);
    await shot('drawer');
    await takeAll();
    await close();
    if (!(await inv()).includes('morse-card')) throw new Error('no morse card ' + (await inv()));
  });
  await step('journal', async () => {
    await page.evaluate(() => window.game.inspect('journal')); await page.waitForTimeout(500);
    for (let k = 0; k < 8; k++) await page.click('text=Next →');
    await shot('journal-last'); await close();
  });
  await step('cloak note', async () => { await use('coat-stand'); await page.click('text=Search the pocket'); await shot('cloak-note'); await close(); });
  await step('trunk', async () => {
    await use('trunk');
    const up = await page.$$('.combo-btn[aria-label="Turn up"]');
    for (const [i, ch] of [[0, 'R'], [1, 'I'], [2, 'N'], [3, 'G']]) for (let j = 0; j < ch.charCodeAt(0) - 65; j++) await up[i].click();
    await page.waitForTimeout(1400);
    await shot('trunk-open');
    await takeAll(); await close();
    await expect('trunk.open');
  });
  await step('morse card', async () => { await page.evaluate(() => window.game.inspect('morse-card')); await page.waitForTimeout(400); await shot('morse-card'); await close(); });
  await step('telegraph', async () => {
    await use('telegram');
    await clickTimes('[aria-label="Turn inner ring clockwise"]', 21);
    const tape = await page.$$('.tg-input.tape');
    for (let i = 0; i < tape.length; i++) await tape[i].type('MTZWSNSJYJJS'[i]);
    const clear = await page.$$('.tg-input.clear');
    for (let i = 0; i < clear.length; i++) await clear[i].type('HOURNINETEEN'[i]);
    await page.waitForTimeout(300);
    await shot('telegraph-solved'); await close();
    await expect('telegram.decoded');
  });
  await step('eyepiece case', async () => {
    await use('eyepiece-case'); await page.click('.hidden-page'); await close();
    if (!(await inv()).includes('page-left')) throw new Error('no left half');
  });
  await step('quotes', async () => {
    await use('side-table'); await page.click('text=Lift the saucer'); await shot('saucer'); await close();
    await use('portrait'); await page.click('text=Turn it over'); await shot('portrait'); await close();
    await use('gramophone'); await page.click('text=Look in the record sleeve'); await shot('gramophone'); await close();
  });
  await step('bookshelf', async () => {
    await use('bookshelf');
    await page.click('.spine[title^="Faint Lights"]');
    await page.click('.take-btn');
    for (const t of ['The Story of the Heavens', 'Cosmos', 'Celestial Objects', 'Lectures on Light']) await page.click(`.spine[title^="${t}"]`);
    await page.waitForTimeout(600);
    await shot('bookshelf-open'); await close();
    await expect('shelf.open');
    if (!(await inv()).includes('page-right')) throw new Error('no right half');
  });
  await step('priest-hole', async () => {
    await page.evaluate(() => window.game.teleport(3.2, 2.6, 150, -8)); await page.waitForTimeout(2500);
    await page.evaluate(() => window.three.renderer.setPixelRatio(1)); await page.waitForTimeout(1500); await shot('niche-3d');
    await page.evaluate(() => window.three.renderer.setPixelRatio(0.2));
    await use('niche'); await shot('niche'); await close();
    await expect('sighting.1');
  });
  await step('torn page', async () => {
    await page.evaluate(() => window.game.inspect('page-left')); await page.waitForTimeout(800);
    await page.click('text=Turn it'); await page.click('text=Turn it');
    const board = await (await page.$('.assembly-board')).boundingBox();
    const k = Math.min(board.width / 1000, board.height / 620);
    const piece = await (await page.$('.draggable')).boundingBox();
    const sx = piece.x + piece.width * 0.75, sy = piece.y + piece.height / 2;
    await page.mouse.move(sx, sy); await page.mouse.down();
    await page.mouse.move(sx - 450 * k, sy - 20 * k, { steps: 8 }); await page.mouse.up();
    await page.waitForTimeout(500); await close();
    await page.evaluate(() => window.game.inspect('orrery-page')); await page.waitForTimeout(500);
    await shot('orrery-page'); await close();
    await expect('page.assembled');
  });
  await step('fern', async () => { await use('fern'); await page.click('text=Feel in the soil'); await takeAll(); await close(); if (!(await inv()).includes('saturn')) throw new Error('no saturn'); });
  await step('map chest', async () => {
    await use('map-chest');
    await page.click('text=Drawer 3'); await page.waitForTimeout(300); await shot('coast-chart');
    await page.click('text=Bottom drawer');
    for (const d of ['W', 'N', 'N', 'E', 'N', 'W']) await page.click(`[aria-label="Push ${d}"]`);
    await page.waitForTimeout(1200);
    await shot('map-chest-open'); await takeAll(); await close();
    await expect('sighting.3');
    await page.evaluate(() => window.game.inspect('almanac')); await page.waitForTimeout(300); await shot('almanac'); await close();
  });
  await step('orrery', async () => {
    await use('orrery');
    await page.click('text=Fit Saturn to its arm');
    for (const [name, k] of [['Mercury', 6], ['Venus', 7], ['Earth', 6], ['Mars', 6], ['Jupiter', 9], ['Saturn', 8]]) await clickTimes(`[aria-label="Turn ${name} on"]`, k);
    await page.waitForTimeout(1300);
    await shot('orrery-solved');
    await page.click('.orrery-reward .item-card'); await close();
    if (!(await inv()).includes('lens')) throw new Error('no lens');
  });
  await step('ladder + cabinet', async () => {
    await use('ladder'); await page.click('text=Climb up to the rail'); await shot('rail'); await takeAll(); await close();
    await use('cabinet'); await page.click('text=Unlock it with the small brass key'); await takeAll(); await close();
    await expect('cabinet.open');
  });
  await step('red sheet', async () => {
    await use('red-sheet');
    await shot('red-sheet-before');
    const glass = await (await page.$('.ruby-glass')).boundingBox();
    const sheet = await (await page.$('.red-sheet')).boundingBox();
    await page.mouse.move(glass.x + glass.width / 2, glass.y + glass.height / 2); await page.mouse.down();
    await page.mouse.move(sheet.x + sheet.width * 0.3, sheet.y + sheet.height * 0.35, { steps: 10 }); await page.mouse.up();
    await page.waitForTimeout(300);
    await shot('red-sheet-glass'); await close();
    await expect('sighting.2');
  });
  await step('star chart', async () => {
    await use('star-chart');
    // Measured per click: the modal's rise-in animation can still be moving the canvas.
    const at = async ([f, dec]) => {
      const c = await (await page.$('.chart-canvas')).boundingBox();
      return [c.x + ((150 + f * 1400) / 1600) * c.width, c.y + ((1020 - (dec / 80) * 920) / 1100) * c.height];
    };
    const stars = { crook: [0.15, 19], crown: [0.284, 26.504], eagle: [0.8, 9], clubTop: [0.455, 47.891], serpent: [0.625, 52], club: [0.45, 31] };
    for (const [a, b] of [['crook', 'crown'], ['eagle', 'clubTop'], ['serpent', 'club']]) {
      for (const star of [a, b]) { await page.mouse.click(...(await at(stars[star]))); await page.waitForTimeout(250); }
    }
    await page.waitForTimeout(300);
    await shot('star-chart-solved'); await close();
    await expect('chart.solved');
  });
  await step('telescope', async () => {
    await use('telescope');
    await page.click('text=Seat the lens');
    await clickTimes('[aria-label="HOUR up"]', 13);
    await clickTimes('[aria-label="HEIGHT up"]', 4);
    await shot('telescope');
    await page.click('text=Look through the eyepiece');
    await page.waitForTimeout(3200);
    await shot('eyepiece');
    await page.click('text=Step back from the eyepiece');
    await expect('door.open');
  });
  await step('room views', async () => {
    await page.evaluate(() => window.three.renderer.setPixelRatio(1));
    for (const [name, view] of [['view-desk', [2.2, 2.4, 30, -5]], ['view-shelf', [2.6, 2.6, 125, -2]], ['view-chart', [-1.5, 2.5, 160, 5]], ['view-cabinet', [-2.5, -0.5, 170, 0]], ['view-gramophone', [-1.5, -2.8, 230, -10]], ['view-trunk', [2.4, -2.0, 300, -15]]]) {
      await page.evaluate((v) => window.game.teleport(...v), view);
      await page.waitForTimeout(2500);
      await shot(name);
    }
  });
  await step('door + ending', async () => {
    await page.evaluate(() => window.game.teleport(3.6, 0.3, -90, 0));
    await page.waitForTimeout(4000);
    await shot('door-open');
    await use('door'); await shot('final-letter');
    await page.click('text=Go down the stairs');
    await page.waitForTimeout(6000);
    await shot('walking-out');
    await page.waitForFunction(() => document.getElementById('overlay').dataset.mode === 'end' && !document.getElementById('overlay').hidden, null, { timeout: 180000 });
    await shot('end');
  });
  console.log(problems.length ? 'PROBLEMS:\n' + [...new Set(problems)].join('\n') : 'no console problems');
  await browser.close();
})();

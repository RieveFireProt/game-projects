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
  const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const page = await browser.newPage({ viewport: { width: 1100, height: 700 } });
  const problems = [];
  page.on('pageerror', (e) => problems.push('pageerror: ' + e.message));
  page.on('console', (m) => { if (['error', 'warning'].includes(m.type())) problems.push(m.type() + ': ' + m.text().slice(0, 300)); });
  await page.goto(`${base}/?peek=3,1,75,0`);
  await page.evaluate(() => localStorage.clear());
  await page.goto(`${base}/?peek=3,1,75,0`);
  await page.waitForFunction(() => window.game, null, { timeout: 90000 });
  await page.evaluate(() => window.game.state.set('started'));
  await page.evaluate(() => window.three.renderer.setPixelRatio(0.2)); // software GL is slow; modals don't need the 3D sharp
  const shot = (name) => page.screenshot({ path: `${out}/${name}.png` });
  const close = () => page.click('.modal-close');
  const inv = () => page.evaluate(() => window.game.state.inventory);
  const step = async (name, fn) => {
    try { await fn(); console.log('ok  ', name); } catch (e) { console.log('FAIL', name, e.message.split('\n')[0]); problems.push(name); }
  };

  await step('clock', async () => { await page.evaluate(() => window.game.use('clock')); await page.waitForTimeout(800); await shot('01-clock'); await close(); });
  await step('drawer', async () => {
    await page.evaluate(() => window.game.use('drawer')); await page.waitForTimeout(800);
    const up = await page.$$('.combo-btn[aria-label="Turn up"]');
    for (const [i, n] of [[0, 1], [1, 1], [2, 4], [3, 7]]) for (let k = 0; k < n; k++) await up[i].click();
    await page.waitForTimeout(1400);
    await shot('02-drawer');
    for (const card of await page.$$('.item-card')) await card.click().catch(() => {});
    while (await page.$('.item-card')) await page.click('.item-card');
    await close();
    if (!(await inv()).includes('cipher-wheel')) throw new Error('no wheel ' + (await inv()));
  });
  await step('eyepiece case', async () => {
    await page.evaluate(() => window.game.use('eyepiece-case')); await page.waitForTimeout(800);
    await shot('03-case');
    await page.click('.hidden-page');
    await close();
    if (!(await inv()).includes('page-left')) throw new Error('no left half');
  });
  await step('bookshelf', async () => {
    await page.evaluate(() => window.game.use('bookshelf')); await page.waitForTimeout(800);
    await page.click('.spine >> nth=2');
    await page.click('.spine[title^="Faint Lights"]');
    await shot('04-bookshelf');
    await page.click('.take-btn');
    await close();
    if (!(await inv()).includes('page-right')) throw new Error('no right half');
  });
  await step('torn page', async () => {
    await page.evaluate(() => window.game.inspect('page-left')); await page.waitForTimeout(800);
    await shot('05-page-before');
    await page.click('text=Turn it');
    await page.click('text=Turn it');
    const board = await page.$('.assembly-board');
    const box = await board.boundingBox();
    const k = Math.min(box.width / 1000, box.height / 620);
    const piece = await (await page.$('.draggable')).boundingBox();
    const sx = piece.x + piece.width * 0.75, sy = piece.y + piece.height / 2;
    await page.mouse.move(sx, sy);
    await page.mouse.down();
    await page.mouse.move(sx - 450 * k, sy - 20 * k, { steps: 8 });
    await page.mouse.up();
    await page.waitForTimeout(500);
    await shot('06-page-joined');
    await close();
    if (!(await inv()).includes('orrery-page')) throw new Error('not joined ' + (await inv()));
    await page.evaluate(() => window.game.inspect('orrery-page')); await page.waitForTimeout(800);
    await shot('07-orrery-page');
    await close();
  });
  await step('orrery', async () => {
    await page.evaluate(() => window.game.use('orrery')); await page.waitForTimeout(800);
    await shot('08-orrery-start');
    for (const name of ['Mercury', 'Venus', 'Earth', 'Mars']) for (let k = 0; k < 4; k++) await page.click(`[aria-label="Turn ${name} on"]`);
    await page.waitForTimeout(1300);
    await shot('09-orrery-solved');
    await page.click('.orrery-reward .item-card');
    await close();
    if (!(await inv()).includes('lens')) throw new Error('no lens');
  });
  await step('telegram', async () => {
    await page.evaluate(() => window.game.use('telegram')); await page.waitForTimeout(800);
    for (let k = 0; k < 21; k++) await page.click('[aria-label="Turn inner ring clockwise"]');
    await shot('10-telegram-wheel');
    const inputs = await page.$$('.tg-input');
    const plain = 'THEHOURISNINETEEN';
    for (let i = 0; i < inputs.length; i++) await inputs[i].type(plain[i]);
    await page.waitForTimeout(300);
    await shot('11-telegram-solved');
    await close();
    if (!(await page.evaluate(() => window.game.state.has('telegram.decoded')))) throw new Error('not decoded');
  });
  await step('star chart', async () => {
    await page.evaluate(() => window.game.use('star-chart')); await page.waitForTimeout(800);
    const c = await (await page.$('.chart-canvas')).boundingBox();
    await page.mouse.move(c.x + c.width * 0.52, c.y + c.height * 0.5);
    await shot('12-chart');
    await close();
  });
  await step('lens + hints', async () => {
    await page.evaluate(() => window.game.inspect('lens')); await page.waitForTimeout(800);
    await shot('13-lens');
    await close();
    await page.evaluate(() => window.game.use('hints') ?? null);
  });
  await step('telescope', async () => {
    await page.evaluate(() => window.game.use('telescope')); await page.waitForTimeout(800);
    await page.click('text=Seat the lens');
    for (let k = 0; k < 13; k++) await page.click('[aria-label="HOUR up"]');
    for (let k = 0; k < 4; k++) await page.click('[aria-label="HEIGHT up"]');
    await shot('14-telescope');
    await page.click('text=Look through the eyepiece');
    await page.waitForTimeout(3200);
    await shot('15-eyepiece');
    await page.click('text=Step back from the eyepiece');
    if (!(await page.evaluate(() => window.game.state.has('door.open')))) throw new Error('door not open');
  });
  await step('door + ending', async () => {
    await page.evaluate(() => window.three.renderer.setPixelRatio(1));
    await page.evaluate(() => window.game.teleport(3.6, 0.3, -90, 0));
    await page.waitForTimeout(4000);
    await shot('16-door-open');
    await page.evaluate(() => window.game.use('door')); await page.waitForTimeout(800);
    await shot('17-final-letter');
    await page.click('text=Go down the stairs');
    await page.waitForTimeout(6000);
    await shot('18-walking-out');
    await page.waitForFunction(() => document.getElementById('overlay').dataset.mode === 'end' && !document.getElementById('overlay').hidden, null, { timeout: 180000 });
    await shot('19-end');
    const mode = await page.evaluate(() => document.getElementById('overlay').dataset.mode);
    if (mode !== 'end') throw new Error('overlay ' + mode);
  });
  console.log(problems.length ? 'PROBLEMS:\n' + [...new Set(problems)].join('\n') : 'no console problems');
  await browser.close();
})();

import { chromium } from 'playwright';
import { createApp } from '../../backend/src/app.js';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';
import ExcelJS from 'exceljs';

const {app,db}=createApp({databasePath:':memory:'});
const server=app.listen(0,'127.0.0.1');await new Promise(resolve=>server.once('listening',resolve));
const base=`http://127.0.0.1:${server.address().port}`;
const reviewDirectory=fileURLToPath(new URL('../../../.impeccable/review/',import.meta.url));
const resultsDirectory=fileURLToPath(new URL('../test-results/',import.meta.url));
mkdirSync(reviewDirectory,{recursive:true});
mkdirSync(resultsDirectory,{recursive:true});
let browser;
const errors=[],checks=[];
try {
  browser=await chromium.launch({executablePath:process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,args:['--disable-gpu']});
  const context=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'reduce'});
  const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
  async function capture(name){if(process.env.SKIP_CAPTURES)return;const dismiss=page.getByRole('button',{name:'Dismiss notification'});if(await dismiss.count()){if(await page.getByRole('dialog').count())await page.locator('.toast').waitFor({state:'hidden',timeout:7000});else await dismiss.click();}await page.evaluate(()=>document.fonts.ready);await page.evaluate(()=>window.scrollTo(0,0));await page.screenshot({path:join(reviewDirectory,`${name}.png`),fullPage:(await page.getByRole('dialog').count())===0});}
  async function navigate(route){await page.goto(`${base}/#${route}`);await page.getByRole('heading',{level:1}).waitFor();await page.evaluate(()=>document.fonts.ready);}
  await page.goto(base);await page.getByRole('button',{name:'Sign in to workspace'}).waitFor();await capture('login-desktop');
  await page.getByRole('button',{name:'Sign in to workspace'}).click();await page.getByRole('heading',{name:'Stockroom overview'}).waitFor();
  for(const route of ['overview','inventory','movements','suppliers','reports','settings']) {
    await navigate(route);await capture(route==='overview'?'desktop':`${route}-desktop`);
    assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`${route} desktop page overflows`);
  }
  checks.push('Desktop: all six routes render without page overflow.');
  await navigate('inventory');
  await page.getByRole('textbox',{name:'Search materials'}).fill('no-such-material-zzzz');await page.getByRole('heading',{name:'No materials found'}).waitFor();await capture('inventory-empty');
  await page.getByRole('button',{name:'Clear search'}).click();await page.getByRole('combobox',{name:'Filter category'}).selectOption('Fabrics');
  assert.equal(await page.locator('.inventory-table tbody tr').count(),8);checks.push('Search empty state, category filter, stock status tabs, table sorting and pagination.');
  await page.getByRole('combobox',{name:'Filter category'}).selectOption('');
  await page.getByRole('button',{name:'Needs attention',exact:false}).click();assert.equal(await page.locator('.inventory-table tbody tr').count(),7);
  await page.getByRole('button',{name:'Out of stock',exact:false}).click();assert.equal(await page.locator('.inventory-table tbody tr').count(),2);
  await page.getByRole('button',{name:'All materials',exact:false}).click();
  await page.getByRole('button',{name:'Next page'}).click();assert.match(await page.locator('.pagination').innerText(),/Page 2/);await page.getByRole('button',{name:'Previous page'}).click();
  await page.getByRole('button',{name:'On hand'}).click();await page.getByRole('button',{name:'On hand'}).click();
  await page.getByRole('button',{name:'Add material',exact:true}).click();
  const dialog=page.getByRole('dialog');await dialog.getByLabel('Material name',{exact:true}).fill('Browser test linen');await dialog.getByLabel('SKU / material code').fill('QA-FAB-001');await dialog.getByLabel('Color / variant').fill('Natural');await dialog.getByLabel('Opening quantity').fill('10.5');await dialog.getByLabel('Unit cost').fill('150.25');await dialog.getByRole('button',{name:'Add material',exact:true}).click();await page.getByRole('status').filter({hasText:'Material added'}).waitFor();
  await page.getByRole('textbox',{name:'Search materials'}).fill('QA-FAB-001');await page.getByRole('button',{name:'Browser test linen',exact:true}).click();
  await page.getByRole('button',{name:'Issue materials',exact:true}).click();await dialog.getByLabel('Quantity to issue').fill('1.25');await dialog.getByLabel('Job / order reference').fill('QA-JOB-001');await dialog.getByLabel('Reason / notes').fill('Browser workflow verification');
  assert.match(await page.locator('.balance-preview').innerText(),/9.25/);await capture('movement-desktop');
  await dialog.getByRole('button',{name:'Issue materials',exact:true}).click();await page.getByRole('status').filter({hasText:'Materials issued'}).waitFor();assert.match(await page.locator('.quantity-cell').innerText(),/9.25/);
  await page.reload();await page.getByRole('textbox',{name:'Search materials'}).fill('QA-FAB-001');assert.match(await page.locator('.quantity-cell').innerText(),/9.25/);checks.push('Material creation, decimal issue with live balance preview, and persistence after reload.');
  await page.getByRole('button',{name:'Browser test linen',exact:true}).click();await page.getByRole('button',{name:'Edit material',exact:true}).click();await dialog.getByLabel('Material name',{exact:true}).fill('Browser test linen edited');await dialog.getByRole('button',{name:'Save material',exact:true}).click();await page.getByRole('status').filter({hasText:'Material details updated'}).waitFor();
  await navigate('suppliers');await page.getByRole('button',{name:'Add supplier',exact:true}).click();await dialog.getByLabel('Supplier name').fill('Browser test supplier');await dialog.getByLabel('Contact person').fill('QA contact');await dialog.getByRole('button',{name:'Add supplier',exact:true}).click();await page.getByRole('status').filter({hasText:'Supplier added'}).waitFor();
  await navigate('settings');await page.getByRole('button',{name:'Add account'}).click();await dialog.getByLabel('Full name').fill('Browser test viewer');await dialog.getByLabel('Email address').fill('browserviewer@example.com');await dialog.getByLabel('Initial password').fill('Password123!');await dialog.getByLabel('Access level').selectOption('viewer');await dialog.getByRole('button',{name:'Create account'}).click();await page.getByRole('status').filter({hasText:'Team account created'}).waitFor();checks.push('Material editing, supplier creation and team account creation.');
  await navigate('inventory');await page.getByRole('button',{name:'Import',exact:true}).click();const [templateDownload]=await Promise.all([page.waitForEvent('download'),dialog.getByRole('button',{name:'Download Excel template'}).click()]);await templateDownload.saveAs(join(resultsDirectory,'import-template.xlsx'));
  const book=new ExcelJS.Workbook();await book.xlsx.readFile(join(resultsDirectory,'import-template.xlsx'));book.getWorksheet('Inventory').getCell('A2').value='QA-IMPORT-001';book.getWorksheet('Inventory').getCell('B2').value='Browser imported cotton';
  await dialog.getByLabel('Choose Excel workbook').setInputFiles({name:'import.xlsx',mimeType:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',buffer:Buffer.from(await book.xlsx.writeBuffer())});await dialog.getByRole('button',{name:'Preview workbook'}).click();await dialog.getByRole('heading',{name:'1 valid material',exact:true}).waitFor();await dialog.getByRole('button',{name:'Import 1 materials'}).click();await page.getByRole('status').filter({hasText:'1 materials imported'}).waitFor();
  const [inventoryDownload]=await Promise.all([page.waitForEvent('download'),page.getByRole('button',{name:'Export',exact:true}).click()]);assert.match(inventoryDownload.suggestedFilename(),/inventory.xlsx/);checks.push('Template download, XLSX upload, preview, confirmation, inventory download.');
  // Only this in-memory QA database is cleaned; the user's local database is never opened here.
  db.prepare("DELETE FROM movements WHERE item_id IN (SELECT id FROM items WHERE sku LIKE 'QA-%')").run();
  db.prepare("DELETE FROM items WHERE sku LIKE 'QA-%'").run();
  db.prepare("DELETE FROM users WHERE email='browserviewer@example.com'").run();
  db.prepare("DELETE FROM suppliers WHERE name='Browser test supplier'").run();
  await page.reload();await page.getByRole('heading',{level:1}).waitFor();
  await page.setViewportSize({width:390,height:844});
  for(const route of ['overview','inventory','movements','suppliers','reports','settings']) {
    await navigate(route);await capture(route==='overview'?'mobile':`${route}-mobile`);
    assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`${route} mobile page overflows`);
  }
  await page.getByRole('button',{name:'Open navigation'}).click();await page.getByRole('navigation').getByRole('link',{name:'Inventory'}).click();assert.equal(await page.getByRole('button',{name:'Close navigation'}).count(),1);assert(!(await page.locator('.sidebar').getAttribute('class')).includes('is-open'));
  await page.getByRole('button',{name:'Add material',exact:true}).click();await capture('material-mobile');await page.keyboard.press('Escape');assert.equal(await page.getByRole('dialog').count(),0);checks.push('Mobile: all routes, navigation drawer, horizontal table scrolling and Escape dismissal.');
  await page.getByRole('button',{name:'Open navigation'}).click();await page.getByRole('button',{name:'Sign out'}).click();await page.getByRole('button',{name:'Sign in to workspace'}).waitFor();await capture('login-mobile');
  await page.getByRole('button',{name:'Viewer',exact:true}).click();await page.getByRole('button',{name:'Sign in to workspace'}).click();await page.getByRole('heading',{level:1}).waitFor();await navigate('inventory');assert.equal(await page.getByRole('button',{name:'Add material',exact:true}).count(),0);assert.equal(await page.getByRole('button',{name:'Import',exact:true}).count(),0);checks.push('Viewer account can browse; write controls stay unavailable.');
  assert.deepEqual(errors,[]);checks.push('No browser JavaScript errors.');
  writeFileSync(join(reviewDirectory,'browser-results.json'),JSON.stringify({checks,errors},null,2));
  console.log(checks.map(s=>`PASS ${s}`).join('\n'));
} finally { if(browser)await browser.close();await new Promise(resolve=>server.close(resolve));db.close(); }

import { chromium } from 'playwright';
import fs from 'node:fs';

const BASE = 'http://localhost:4173';
const shots = 'shots';
fs.mkdirSync(shots, { recursive: true });
const results = [];
const ok = (label) => { results.push(`PASS ${label}`); console.log(`PASS ${label}`); };
const fail = (label, e) => { results.push(`FAIL ${label}: ${e}`); console.log(`FAIL ${label}: ${e}`); };
async function step(label, fn) { try { await fn(); ok(label); } catch (e) { fail(label, e.message.split('\n')[0]); } }

function lastLink(email) {
  const lines = fs.readFileSync('links.log', 'utf8').trim().split('\n').filter((l) => l.startsWith(email + ' '));
  return lines.at(-1).split(' ')[1];
}

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });

await step('home renders with reserve box', async () => {
  await page.goto(BASE + '/');
  await page.getByRole('heading', { level: 1 }).waitFor();
  await page.getByText('Be the first to publish').waitFor();
  await page.screenshot({ path: `${shots}/01-home-empty.png`, fullPage: true });
});

await step('reserved word is rejected', async () => {
  await page.getByLabel('Choose a username').first().fill('settings');
  await page.getByText('is reserved').first().waitFor();
});

await step('username available → email → link sent', async () => {
  await page.getByLabel('Choose a username').first().fill('Aisha');
  await page.getByText('is available').first().waitFor();
  await page.getByRole('button', { name: 'Claim it' }).first().click();
  await page.getByLabel('Your email').fill('aisha@example.com');
  await page.getByRole('button', { name: 'Claim @aisha' }).click();
  await page.getByText('Check your inbox').waitFor();
});

await step('magic link signs in and claims @aisha', async () => {
  await page.goto(lastLink('aisha@example.com'));
  await page.getByText('is yours').waitFor({ timeout: 10000 });
  await page.getByRole('heading', { name: 'My work' }).waitFor();
  await page.screenshot({ path: `${shots}/02-dashboard-welcome.png`, fullPage: true });
});

await step('settings: profile details + avatar', async () => {
  await page.goto(BASE + '/settings');
  await page.getByLabel('Name', { exact: true }).fill('Aisha Rahman');
  await page.getByLabel(/Headline/).fill('Performance marketer for fintech and B2B SaaS');
  await page.getByLabel('Location').fill('Riyadh, KSA');
  await page.getByLabel(/Strongest in/).fill('Google Ads, Meta Ads, CRO');
  await page.getByLabel('Bio').fill('Eight years running paid search and social for regulated categories.');
  await page.getByLabel('LinkedIn').fill('linkedin.com/in/aisha-example');
  await page.locator('input[type=file]').setInputFiles('avatar.png');
  await page.getByRole('button', { name: 'Change photo' }).waitFor({ timeout: 10000 });
  await page.getByLabel(/Available for work/).check();
  await page.getByRole('button', { name: 'Save changes' }).click();
  await page.getByText('Profile saved').waitFor();
  await page.screenshot({ path: `${shots}/03-settings.png`, fullPage: true });
});

await step('add work: publish blocked without cover', async () => {
  await page.goto(BASE + '/new');
  await page.getByLabel('Title').fill('The Zero-Click Funnel');
  await page.getByRole('button', { name: 'Publish' }).click();
  await page.getByText('Add a cover image before publishing.').waitFor();
});

await step('add work: full form and publish', async () => {
  await page.getByLabel('Brand / client').fill('Ledgerly');
  await page.getByLabel('Agency or team').fill('In-house');
  await page.getByLabel('Your role').fill('Performance lead');
  await page.getByLabel('Category').selectOption({ label: 'Search & Performance' });
  await page.getByLabel(/Markets/).fill('KSA, UAE');
  await page.getByLabel('Year').fill('2026');
  await page.getByLabel(/Summary/).fill('Answered VAT questions in the search result itself, then retargeted the people who read them.');
  const inputs = page.locator('input[type=file]');
  await inputs.nth(0).setInputFiles('cover.png');
  await page.getByAltText('Cover preview').waitFor({ timeout: 10000 });
  await page.locator('input[type=file][multiple]').setInputFiles(['g1.png', 'g2.png']);
  await page.getByLabel('Caption for image 2').waitFor({ timeout: 10000 });
  await page.getByLabel('Caption for image 1').fill('Search ad with the answer inline');
  await page.getByLabel(/^Challenge/).fill('Cost per lead had doubled in a year.');
  await page.getByLabel(/^Approach/).fill('We wrote ads that answered the question.\nThen retargeted readers with a free VAT check.');
  await page.getByLabel(/^Outcome/).fill('Leads got cheaper and better.');
  await page.getByRole('button', { name: '+ Add a result' }).click();
  await page.getByLabel('Figure').fill('−52%');
  await page.getByLabel('Metric').fill('Cost per lead');
  await page.getByLabel('Compared with').fill('Previous quarter');
  await page.getByRole('button', { name: '+ Add a credit' }).click();
  await page.getByLabel('Role', { exact: true }).fill('Copywriter');
  await page.getByLabel('Name', { exact: true }).fill('Rana Saleh');
  await page.screenshot({ path: `${shots}/04-editor.png`, fullPage: true });
  await page.getByRole('button', { name: 'Publish' }).click();
  await page.waitForURL(/\/@aisha\/the-zero-click-funnel$/, { timeout: 10000 });
  await page.getByRole('heading', { name: 'The Zero-Click Funnel' }).waitFor();
  await page.getByText('−52%').first().waitFor();
  await page.getByText('Rana Saleh').waitFor();
  await page.getByText('Search ad with the answer inline').waitFor();
  await page.screenshot({ path: `${shots}/05-work-page.png`, fullPage: true });
});

await step('second piece saved as draft', async () => {
  await page.goto(BASE + '/new');
  await page.getByLabel('Title').fill('Salary Day, Every Day');
  await page.getByRole('button', { name: 'Save draft' }).click();
  await page.waitForURL(/\/edit\//);
  await page.getByText('Draft saved').waitFor();
});

await step('profile shows published work, draft notice, stats', async () => {
  await page.goto(BASE + '/@aisha');
  await page.getByRole('heading', { name: 'Aisha Rahman' }).waitFor();
  await page.getByText('1 draft').waitFor();
  await page.getByText('Available for work').waitFor();
  await page.screenshot({ path: `${shots}/06-profile-owner.png`, fullPage: true });
});

await step('dashboard lists both with status', async () => {
  await page.goto(BASE + '/dashboard');
  await page.getByText('Salary Day, Every Day').waitFor();
  await page.getByText('Published', { exact: true }).waitFor();
  await page.getByText('Draft', { exact: true }).waitFor();
  await page.screenshot({ path: `${shots}/07-dashboard.png`, fullPage: true });
});

await step('edit published work keeps it live, replaces cover and deletes old file', async () => {
  await page.goto(BASE + '/dashboard');
  await page.getByRole('link', { name: 'The Zero-Click Funnel' }).click();
  await page.getByLabel('Title').waitFor();
  await page.locator('label:has-text("Replace cover") input[type=file]').setInputFiles('g2.png');
  await page.waitForTimeout(800);
  await page.getByRole('button', { name: 'Save changes' }).click();
  await page.waitForURL(/\/@aisha\/the-zero-click-funnel$/);
  const deleted = fs.existsSync('deletes.log') ? fs.readFileSync('deletes.log', 'utf8').trim() : '';
  if (!deleted) throw new Error('old cover not removed from storage');
});

await step('no @ redirects to @ form', async () => {
  await page.goto(BASE + '/aisha');
  await page.waitForURL(/\/@aisha$/);
});

await step('sign out', async () => {
  await page.getByRole('button', { name: /@aisha/ }).click();
  await page.getByRole('menuitem', { name: 'Sign out' }).click();
  await page.getByRole('link', { name: 'Claim your username' }).waitFor();
});

await step('public: profile visible, draft hidden', async () => {
  await page.goto(BASE + '/@aisha');
  await page.getByText('The Zero-Click Funnel').waitFor();
  if (await page.getByText('Salary Day, Every Day').count()) throw new Error('draft visible to public');
  if (await page.getByText(/draft/i).count()) throw new Error('draft notice visible to public');
  await page.screenshot({ path: `${shots}/08-profile-public.png`, fullPage: true });
});

await step('public: draft URL returns not found', async () => {
  await page.goto(BASE + '/@aisha/salary-day-every-day');
  await page.getByText('Nothing here.').waitFor();
});

await step('explore lists work + category filter + search', async () => {
  await page.goto(BASE + '/explore');
  await page.getByText('The Zero-Click Funnel').waitFor();
  await page.getByRole('button', { name: 'Email & CRM' }).click();
  await page.getByText('No work here yet').waitFor();
  await page.getByRole('button', { name: 'Search & Performance' }).click();
  await page.getByText('The Zero-Click Funnel').waitFor();
  await page.getByRole('button', { name: 'All', exact: true }).click();
  await page.getByPlaceholder('Search title, brand or agency').fill('ledger');
  await page.getByText('The Zero-Click Funnel').waitFor();
  await page.getByPlaceholder('Search title, brand or agency').fill('nothingmatches');
  await page.getByText('No work here yet').waitFor();
  await page.getByPlaceholder('Search title, brand or agency').fill('');
  await page.screenshot({ path: `${shots}/09-explore.png`, fullPage: true });
});

await step('home shows latest work', async () => {
  await page.goto(BASE + '/');
  await page.getByText('The Zero-Click Funnel').waitFor();
  await page.screenshot({ path: `${shots}/10-home.png`, fullPage: true });
});

await step('taken username shown as taken', async () => {
  await page.getByLabel('Choose a username').first().fill('aisha');
  await page.getByText('is already taken').first().waitFor();
});

await step('protected pages redirect to login', async () => {
  await page.goto(BASE + '/new');
  await page.waitForURL(/\/login\?next=%2Fnew/);
});

await step('unknown profile shows claim message', async () => {
  await page.goto(BASE + '/@someone_new');
  await page.getByText('It might be yours to claim').waitFor();
});

await step('mobile layout: no horizontal scroll', async () => {
  const m = await browser.newPage({ viewport: { width: 390, height: 844 } });
  for (const p of ['/', '/@aisha', '/@aisha/the-zero-click-funnel', '/explore', '/login']) {
    await m.goto(BASE + p);
    await m.waitForTimeout(700);
    const over = await m.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    if (over > 1) throw new Error(`${p} overflows by ${over}px`);
  }
  await m.goto(BASE + '/');
  await m.screenshot({ path: `${shots}/11-mobile-home.png`, fullPage: true });
  await m.goto(BASE + '/@aisha/the-zero-click-funnel');
  await m.waitForTimeout(700);
  await m.screenshot({ path: `${shots}/12-mobile-work.png`, fullPage: true });
});

const realErrors = errors.filter((e) => !/favicon|Failed to load resource: the server responded with a status of 40[46]/.test(e));
if (realErrors.length) { console.log('CONSOLE ERRORS:\n' + realErrors.join('\n')); }
await browser.close();
const failed = results.filter((r) => r.startsWith('FAIL'));
console.log(`\n${results.length - failed.length}/${results.length} passed`);
process.exit(failed.length ? 1 : 0);

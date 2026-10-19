import { chromium } from 'playwright';
import fs from 'node:fs';
const BASE='http://localhost:4173';
const last=(e)=>fs.readFileSync('links.log','utf8').trim().split('\n').filter(l=>l.startsWith(e+' ')).at(-1).split(' ')[1];
const b=await chromium.launch(); const p=await (await b.newContext({viewport:{width:1300,height:900}})).newPage();
const errs=[]; p.on('pageerror',e=>errs.push(e.message));
const log=(m)=>console.log(m);
try{
 await p.goto(BASE+'/login?mode=signup');
 await p.getByLabel('Choose a username').first().fill('nadia');
 await p.getByText('is available').first().waitFor();
 await p.getByRole('button',{name:'Claim it'}).first().click();
 await p.getByLabel('Your email').fill('nadia@example.com');
 await p.getByRole('button',{name:'Claim @nadia'}).click();
 await p.getByText('Check your inbox').waitFor();
 await p.goto(last('nadia@example.com'));
 await p.getByRole('heading',{name:'My work'}).waitFor({timeout:10000}); log('PASS signed in');
 await p.goto(BASE+'/new');
 const nCoverInputs = await p.locator('text=Drop your cover image').count(); log((nCoverInputs===0?'PASS':'FAIL')+' no cover upload box');
 await p.getByLabel('Title').fill('Ramadan always-on for a skincare brand');
 await p.getByLabel('Brand / client').fill('Halaya');
 await p.getByLabel('Category').selectOption({label:'Paid Social'});
 await p.getByRole('button',{name:'+ Add a result'}).click();
 await p.getByLabel('Figure').fill('+64%'); await p.getByLabel('Metric').fill('Online revenue');
 await p.getByRole('button',{name:'Growth line'}).click();
 await p.getByRole('button',{name:'Colour #1F7A4D'}).click();
 await p.locator('input[type=file][multiple]').setInputFiles(['g1.png']); // gallery still works
 await p.getByLabel('Caption for image 1').waitFor({timeout:10000}); log('PASS gallery upload');
 await p.locator('canvas').screenshot({path:'cover-preview.png'});
 await p.getByRole('button',{name:'Publish'}).click();
 await p.waitForURL(/\/@nadia\//,{timeout:15000}); log('PASS published without uploading a cover');
 const src=await p.locator('img').first().getAttribute('src'); log('cover src '+src);
 await p.screenshot({path:'work-page.png'});
 // edit title -> cover redraws and old file deleted
 await p.goto(BASE+'/dashboard'); await p.getByRole('link',{name:/Edit/}).first().click();
 await p.getByLabel('Title').fill('Ramadan always-on, year two');
 await p.getByRole('button',{name:/Save|Update/}).first().click();
 await p.waitForTimeout(2500);
 log('deletes.log: '+(fs.existsSync('deletes.log')?fs.readFileSync('deletes.log','utf8').trim():'none'));
 await p.goto(BASE+'/explore'); await p.waitForTimeout(1500); await p.screenshot({path:'explore.png'});
}catch(e){log('FAIL '+e.message.split('\n')[0]);}
log('page errors: '+JSON.stringify(errs)); await b.close();

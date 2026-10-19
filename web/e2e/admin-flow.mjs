import { chromium } from 'playwright';
import fs from 'node:fs'; import pg from 'pg';
const BASE='http://localhost:4173';
const db=new pg.Client({host:'/tmp/pgtest',port:5499,user:'postgres',database:'puls_e2e'}); await db.connect();
const last=(e)=>fs.readFileSync('links.log','utf8').trim().split('\n').filter(l=>l.startsWith(e+' ')).at(-1).split(' ')[1];
const b=await chromium.launch(); const p=await (await b.newContext({viewport:{width:1300,height:900}})).newPage();
const errs=[]; p.on('pageerror',e=>errs.push(e.message)); const log=console.log;
try{
 for (const [u,e] of [['nadia','nadia@example.com'],['omar','omar@example.com']]) {
  await p.goto(BASE+'/login?mode=signup');
  await p.getByLabel('Choose a username').first().fill(u); await p.getByText('is available').first().waitFor();
  await p.getByRole('button',{name:'Claim it'}).first().click(); await p.getByLabel('Your email').fill(e);
  await p.getByRole('button',{name:'Claim @'+u}).click(); await p.getByText('Check your inbox').waitFor();
  await p.goto(last(e)); await p.getByRole('heading',{name:'My work'}).waitFor({timeout:10000});
  if (u==='omar') { await p.goto(BASE+'/new'); await p.getByLabel('Title').fill('Omar test work'); await p.getByRole('button',{name:'Publish'}).click(); await p.waitForURL(/\/@omar\//,{timeout:15000}); }
  await p.getByRole('button',{name:/@/}).first().click(); await p.getByRole('menuitem',{name:'Sign out'}).click(); await p.waitForTimeout(800);
 }
 log('PASS two members signed up');
 // non-admin cannot see admin
 await p.goto(BASE+'/login'); await p.getByLabel('Email').fill('omar@example.com'); await p.getByRole('button',{name:/log-in link/}).click(); await p.getByText('Check your inbox').waitFor();
 await p.goto(last('omar@example.com')); await p.waitForTimeout(1500);
 await p.goto(BASE+'/admin'); await p.waitForTimeout(1500);
 log(((await p.getByRole('heading',{name:'Moderation'}).count())===0?'PASS':'FAIL')+' non-admin sees no admin page');
 await p.getByRole('button',{name:/@/}).first().click(); await p.getByRole('menuitem',{name:'Sign out'}).click(); await p.waitForTimeout(800);
 await db.query("update profiles set role='admin' where username='nadia'");
 await p.goto(BASE+'/login'); await p.getByLabel('Email').fill('nadia@example.com'); await p.getByRole('button',{name:/log-in link/}).click(); await p.getByText('Check your inbox').waitFor();
 await p.goto(last('nadia@example.com')); await p.waitForTimeout(1500);
 await p.getByRole('button',{name:/@nadia/}).click(); await p.getByRole('menuitem',{name:'Admin'}).click();
 await p.getByRole('heading',{name:'Moderation'}).waitFor(); log('PASS admin link in menu opens admin');
 const row=p.locator('div.row', {has: p.getByRole('link',{name:'@omar'})}).last();
 await p.getByRole('button',{name:'Verify'}).first().waitFor();
 await p.screenshot({path:'admin-profiles.png'});
 const verifyBtns=await p.getByRole('button',{name:'Verify'}).count(); log('verify buttons: '+verifyBtns);
 await p.getByRole('button',{name:'Verify'}).first().click(); await p.getByText(/is verified/).waitFor(); log('PASS verified a member');
 await p.getByRole('button',{name:'Work'}).click(); await p.getByRole('button',{name:'Hide'}).first().waitFor();
 await p.getByRole('button',{name:'Hide'}).first().click(); await p.getByText('Work hidden').waitFor(); log('PASS hid work');
 await p.getByRole('button',{name:'Restore'}).first().click(); await p.getByText('Work restored').waitFor(); log('PASS restored work');
 const v=(await db.query("select username,is_verified from profiles where is_verified")).rows; log('verified rows '+JSON.stringify(v));
 await p.goto(BASE+'/@'+v[0].username); await p.waitForTimeout(1500); log(((await p.getByLabel('Verified by Laud').count())>0?'PASS':'FAIL')+' tick on profile');
 await p.screenshot({path:'profile-tick.png'});
}catch(e){log('FAIL '+e.message.split('\n')[0]); await p.screenshot({path:'admin-fail.png'});}
log('page errors '+JSON.stringify(errs)); await b.close(); await db.end();

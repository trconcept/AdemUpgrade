import puppeteer from 'puppeteer';
import { spawn } from 'child_process';
import path from 'path';

(async () => {
  const vitePath = path.resolve('node_modules/.bin/vite');
  console.log('Starting vite from', vitePath);
  
  const viteProcess = spawn(vitePath, [], {
    cwd: path.resolve('artifacts/adem'),
    stdio: 'pipe'
  });

  viteProcess.stdout.on('data', (d) => console.log('VITE:', d.toString()));
  viteProcess.stderr.on('data', (d) => console.log('VITE ERR:', d.toString()));

  // wait 5s for vite
  await new Promise(r => setTimeout(r, 5000));

  console.log('Launching puppeteer');
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  
  page.on('pageerror', error => {
    console.log('PAGE ERROR STACK:', error.stack);
  });
  
  page.on('console', msg => {
    if (msg.type() === 'error' || msg.type() === 'warning') {
      console.log('CONSOLE:', msg.text(), msg.location());
    }
  });

  console.log('Going to URL');
  await page.goto('http://127.0.0.1:3000', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 2000));
  
  await browser.close();
  viteProcess.kill();
  console.log('Done');
})();

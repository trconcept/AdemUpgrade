import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  
  page.on('pageerror', error => {
    console.log('PAGE ERROR STACK:', error.stack);
  });
  
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log('CONSOLE ERROR:', msg.text(), msg.location());
    }
  });

  await page.goto('https://ais-dev-or57ruxbrnxt2at7qeo663-562635948170.europe-west2.run.app', { waitUntil: 'load' });
  await new Promise(r => setTimeout(r, 2000));
  await browser.close();
})();

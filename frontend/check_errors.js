import puppeteer from 'puppeteer';

(async () => {
    try {
        const browser = await puppeteer.launch({ headless: 'new' });
        const page = await browser.newPage();

        page.on('console', msg => {
            console.log(`[CONSOLE ${msg.type().toUpperCase()}] ${msg.text()}`);
        });

        page.on('pageerror', error => {
            console.log(`[PAGE ERROR] ${error.message}`);
        });

        page.on('requestfailed', request => {
            console.log(`[REQUEST FAILED] ${request.url()} - ${request.failure().errorText}`);
        });

        console.log('Navigating to http://localhost:5173...');
        await page.goto('http://localhost:5173', { waitUntil: 'networkidle0', timeout: 10000 });

        console.log('Navigation complete. Waiting for 2 seconds to capture async errors...');
        await new Promise(resolve => setTimeout(resolve, 2000));

        await browser.close();
    } catch (e) {
        console.error('Script error:', e);
    }
})();

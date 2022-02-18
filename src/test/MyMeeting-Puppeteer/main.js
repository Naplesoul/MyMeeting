const puppeteer = require('puppeteer');

const pages = [];

const addPeer = async (email, password, roomId, roomPassword) => {
    const browser = await puppeteer.launch({
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--ignore-certificate-errors',
            '--use-fake-ui-for-media-stream',
            '--use-fake-device-for-media-stream',
        ]
    });
    const page = await browser.newPage();
    page.on('console', (msg) => {
        for (let i = 0; i < msg.args().length; ++i)
            console.log(`${i}: ${msg.args()[i]}`);
    });
    await page.goto('http://localhost:3000');
    const emailInput = await page.$('#email');
    const passwordInput = await page.$('#password');
    const roomIdInput = await page.$('#roomId');
    const roomPasswordInput = await page.$('#roomPassword');

    await emailInput.type(email);
    await passwordInput.type(password);
    await roomIdInput.type(roomId);
    await roomPasswordInput.type(roomPassword);
    const start = await page.$('#start');
    await start.click();

    pages.push(page);
}

for (let i = 1; i < 15; i ++) {
    addPeer(`test${i}@test.com`, '123456', '126', '12345678')
}

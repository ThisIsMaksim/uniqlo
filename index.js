const playwright = require("playwright");
const fs = require("fs");

const AUTH = 'brd-customer-hl_e5b45c17-zone-scraping_browser1-country-gb-city-london:xo0sw5f5pby7';
const SBR_CDP = `wss://${AUTH}@brd.superproxy.io:9222`;

(async () => {
    const userId = 'user_id'

    // console.log('read cookies')
    const data = fs.readFileSync(`auth_cookies_${userId}.json`)

    // console.log('parse cookies')
    let cookies = JSON.parse(data.toString())

    const browser = await playwright.chromium.connectOverCDP(SBR_CDP)

    const context = await browser.newContext({
        javaScriptEnabled: true,
        isMobile: false,
        storageState: {
            cookies,
            origins: [
                {
                    origin: 'https://www.linkedin.com',
                    localStorage: [
                        { name: 'voyager-web:enterSend', value: 'false' },
                        {
                            name: 'voyager-web:badges',
                            value: '[{"_id":"ACoAAEnslb4BtIRsnxp3xJbQsu9s1CvKu0Yu22E","tab":"mynetwork","count":2}]'
                        },
                        { name: 'voyager-web:new-tab-beacon', value: '[]' },
                        {
                            name: 'voyager-web:msg-overlay-state',
                            value: '[{"_id":"urn:li:fs_miniProfile:ACoAAEnslb4BtIRsnxp3xJbQsu9s1CvKu0Yu22E","_listBubble":{"isMinimized":false},"_timeLastUpdatedState":1733161802527}]'
                        }
                    ]
                },
            ]
        }
    })
    const page = await context.newPage()

    await page.goto('https://www.linkedin.com/in/williamhgates', {timeout: 360 * 10 * 10})
    await page.waitForTimeout(10000)

    await browser.close()
})();
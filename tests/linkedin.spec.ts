import {Locator, Page, test} from '@playwright/test'

const AUTH = 'brd-customer-hl_e5b45c17-zone-scraping_browser1-country-gb-city-london:xo0sw5f5pby7'
const SBR_CDP = `wss://${AUTH}@brd.superproxy.io:9222`

const getPage = async (playwright, browser) => {
  const withProxy = process.env.WITH_PROXY === 'true'
  const b = withProxy ? await playwright.chromium.connectOverCDP(SBR_CDP) : browser
  // const userId = 'user_id'
  //
  // // console.log('read cookies')
  // const data = fs.readFileSync(`auth_cookies_${userId}.json`)
  //
  // // console.log('parse cookies')
  // let cookies = JSON.parse(data.toString()) as Cookie[]

  const context = await b.newContext({
    javaScriptEnabled: false,
    isMobile: true,
    storageState: {
      cookies: [
        {
          "name": "__cf_bm",
          "value": "kEhCNecnouGGyHejiR6VfmyLgRx3ZhZ0zIBMU9yNh3I-1733164734-1.0.1.1-NNR5pmmlqeudS3pVGJ01S35eKUoLWiOh6HCrrl.o2WQ0MIUaGMUIQDg_14pmnUe2kNRYP5.fhpFJ0pDqJM69lw",
          "domain": ".linkedin.com",
          "path": "/",
          "expires": 1731796102,
          "httpOnly": true,
          "secure": true,
          "sameSite": "None"
        },
        {
          "name": "li_at",
          "value": "AQEDAUnslb4ArqmRAAABk2filrgAAAGTi-8auE0AVB02ZcG_raOkCCLliHNb-qLyrT3DCv6jCM6bGgm0FEu6m3Vcd__4X8QG5OxP9k-a9FDOY4p3uSMJg1EMEBVP_snRiqxyqO-w_DyU_Xl25k_cC8QX",
          "domain": ".www.linkedin.com",
          "path": "/",
          "expires": 1763330304,
          "httpOnly": true,
          "secure": true,
          "sameSite": "None"
        },
        {
          "name": "bscookie",
          "value": "\"v=1&20241108192407df4f7622-e150-4864-8119-eb80f6da85e6AQFUd7oQLEEeTQ9J2zyPnnIOq1Vj0R2a\"",
          "domain": ".www.linkedin.com",
          "path": "/",
          "expires": 1763330304,
          "httpOnly": true,
          "secure": true,
          "sameSite": "None"
        }
      ],
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
      ],
    }
  })

  const page = await context.newPage()

  return {
    page,
    browser: b,
  }
}

const getElement = (parent: Page | Locator, selector: string) => {
  return parent.locator(selector).first()
}
const getElementByRole = (parent: Page | Locator, role: "alert"|"alertdialog"|"application"|"article"|"banner"|"blockquote"|"button"|"caption"|"cell"|"checkbox"|"code"|"columnheader"|"combobox"|"complementary"|"contentinfo"|"definition"|"deletion"|"dialog"|"directory"|"document"|"emphasis"|"feed"|"figure"|"form"|"generic"|"grid"|"gridcell"|"group"|"heading"|"img"|"insertion"|"link"|"list"|"listbox"|"listitem"|"log"|"main"|"marquee"|"math"|"meter"|"menu"|"menubar"|"menuitem"|"menuitemcheckbox"|"menuitemradio"|"navigation"|"none"|"note"|"option"|"paragraph"|"presentation"|"progressbar"|"radio"|"radiogroup"|"region"|"row"|"rowgroup"|"rowheader"|"scrollbar"|"search"|"searchbox"|"separator"|"slider"|"spinbutton"|"status"|"strong"|"subscript"|"superscript"|"switch"|"tab"|"table"|"tablist"|"tabpanel"|"term"|"textbox"|"time"|"timer"|"toolbar"|"tooltip"|"tree"|"treegrid"|"treeitem") => {
  return parent.getByRole(role).first()
}
const getText = async (element: Locator, errorMessage: string): Promise<string> => {
  try {
    return await element.innerText({ timeout: 10 * 1000 })
  } catch (error) {
    console.error(errorMessage, error)
  }

  return ''
}
const getHTML = async (element: Locator, errorMessage: string): Promise<string> => {
  try {
    return await element.innerHTML({ timeout: 10 * 1000 })
  } catch (error) {
    console.error(errorMessage, error)
  }

  return ''
}
const getAttribute = async (element: Locator, attribute: string, errorMessage: string): Promise<string> => {
  try {
    return await element.getAttribute(attribute, { timeout: 10 * 1000 })
  } catch (error) {
    console.error(errorMessage, error)
  }

  return ''
}

test('get_user_info_with_auth', async ({ playwright, browser }) => {
  const linkedinProfileUrl = process.env.LINK_URL
  const { page, browser: b } = await getPage(playwright, browser)

  await parseUserInfo(page, linkedinProfileUrl)

  await b.close()
})

const parseUserInfo = async (page: Page, url: string) => {
  try {
    await page.goto(url)

    try {
      const avatarWrapper = getElement(page, '#profile-picture-container')
      const avatar = getElement(avatarWrapper, '[data-delayed-url]')
      const profile = getElement(page, '.basic-profile-section')
      const userNameWrapper = getElementByRole(profile, 'heading')

      let userName = ''
      let avatarUrl = ''
      let currentCompany = ''
      let currentPosition = ''

      userName = await getText(userNameWrapper, 'can not find user name')
      avatarUrl = await getAttribute(avatar, 'data-delayed-url', 'can not find avatar url')
      currentCompany = await getText(getElement(page, '.member-current-company'), 'can not find current company')
      currentPosition = await getText(
        getElement(
          getElement(
            getElement(profile, '.bg-color-background-container.mx-2.mt-2.mb-1'),
            '.body-small.text-color-text'
          ),
          'span'
        ),
        'can not find current position'
      )

      const user = {
        userName,
        avatarUrl,
        currentCompany,
        currentPosition,
      }

      console.log(`STEALTH${JSON.stringify(user)}STEALTH`)
    } catch (error) {
      console.log(error)
    }

  } catch (error) {
    console.log(error)
  }
}

test('get_user_info_without_auth', async ({ playwright, browser }) => {
  const externalLinkedInUrl = process.env.LINK_URL
  const withProxy = process.env.WITH_PROXY === 'true'
  const b = withProxy ? await playwright.chromium.connectOverCDP(SBR_CDP) : browser

  const context = await browser.newContext({
    javaScriptEnabled: false,
    isMobile: true,
    storageState: {
      cookies: [],
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
      ],
    }
  })
  const page = await context.newPage()

  try {
    await page.goto(externalLinkedInUrl)

    try {
      const avatarUrl = await page.locator('.top-card__profile-image--real-image').getAttribute('data-delayed-url')
      const userName = await page.locator('.top-card-layout__title').innerText()
      const currentPosition = (await page.locator('.top-card__position-info').innerText()).trim()

      const user = {
        userName,
        avatarUrl,
        currentPosition,
      }

      console.log(`STEALTH${JSON.stringify(user)}STEALTH`)
    } catch (error) {
      console.log(error)
    }

  } catch (error) {
    console.log(error)
  } finally {
    await b.close();
  }
})

test('get_feed_with_auth', async ({ playwright, browser }) => {
  const externalLinkedInUrl = process.env.LINK_URL
  const { page, browser: b } = await getPage(playwright, browser)

  try {
    await page.goto(externalLinkedInUrl)

    try {
      const result = []
      const feedItems = await page.locator('.feed-item').all()

      for (let a = 0; a < feedItems.length; a++) {
        try {
          const item = feedItems[a]

          let postId = ''
          let content = ''
          let imageUrls: string[] = []
          let url = ''
          let type = 'posted'
          let time = ''

          const article = getElement(item, '[data-activity-urn]')
          const attribute = await getAttribute(article, 'data-activity-urn', 'can not find post id')

          postId = attribute.replace('urn:li:activity:', '')
          content = await getHTML(getElement(item, '.attributed-text-segment-list__content'), 'can not find content')

          try {
            const count = await item.locator("[data-tracking-control-name='feed_main-feed-card_feed-reaction-header']").count()

            if (count > 0) {
              type = 'reacted'
            }
          } catch (e) {
            console.error('it is posted')
          }
          try {
            const images = await item.locator("[data-feed-action-type='viewImage']").all()

            for (let a = 0; a < images.length; a++) {
              const imageUrl = await getAttribute(
                getElementByRole(images[a], 'img'),
                'data-delayed-url',
                'can not find image url'
              )

              imageUrl && imageUrls.push(imageUrl)
            }
          } catch (e) {
            console.error('can not find image url')
          }

          const privatelyUrl = await getAttribute(
            getElement(
              item,
              '[data-send-privately-url]'
            ),
            'data-send-privately-url',
            'can not find url'
          )

          url = privatelyUrl.replace('/messaging/compose/?body=', '')
          time = await getText(getElementByRole(item, 'time'), 'can not find time')

          result.push({
            postId,
            type,
            content,
            imageUrls,
            url,
            time,
          })
        } catch (error) {
          console.error(error)
        }
      }

      console.log(`STEALTH${JSON.stringify(result)}STEALTH`)
    } catch (error) {
      console.log(error)
    }

  } catch (error) {
    console.log(error)
  } finally {
    await b.close();
  }
})
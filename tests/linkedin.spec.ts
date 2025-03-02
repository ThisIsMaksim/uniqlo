import {Browser, Locator, Page, test,} from '@playwright/test'
import axios from "axios"

const postEvent = (value: string) => {
  console.log(`STEALTH${value}STEALTH`)
}

const getPage = async (playwright, browser, withCookie = true, javaScriptEnabled = false, isMobile = true): Promise<{
  page: Page,
  browser: Browser
}> => {
  // Log the current Node.js path
  console.log('Node.js Path:', process.execPath);
// Log the current Node.js version
  console.log('Node.js Version:', process.version);

  const withProxy = process.env.WITH_PROXY === 'true'
  const username = process.env.LINK_LOGIN

  const b = withProxy ? await playwright.chromium.launch({
    proxy: {
      server: 'https://gb.smartproxy.com:30001',
      username: 'spyo4nco0d',
      password: 'eUvSUa+yo6hcWht908'
    },
  }) : browser

  const state = {
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
          {name: 'voyager-web:enterSend', value: 'false'},
          {
            name: 'voyager-web:badges',
            value: '[{"_id":"ACoAAEnslb4BtIRsnxp3xJbQsu9s1CvKu0Yu22E","tab":"mynetwork","count":2}]'
          },
          {name: 'voyager-web:new-tab-beacon', value: '[]'},
          {
            name: 'voyager-web:msg-overlay-state',
            value: '[{"_id":"urn:li:fs_miniProfile:ACoAAEnslb4BtIRsnxp3xJbQsu9s1CvKu0Yu22E","_listBubble":{"isMinimized":false},"_timeLastUpdatedState":1733161802527}]'
          }
        ]
      },
    ],
  }

  let retry = process.env.RETRY ? +process.env.RETRY : 1
  let context

  while (retry > 0) {
    if (context) break

    try {
      context = await b.newContext({
        javaScriptEnabled,
        isMobile,
        storageState: withCookie ? !username ? state : `auth_state_${username}.json` : undefined
      })
    } catch (e) {
      console.log('try to retry')

      await new Promise(resolve => setTimeout(resolve, 1000))

      retry--
    }
  }

  if (!context) throw Error('could not create context')

  const page: Page = await context.newPage()

  return {
    page,
    browser: b,
  }
}

const getElement = (parent: Page | Locator, selector: string) => {
  return parent.locator(selector).first()
}
const getElementByRole = (parent: Page | Locator, role: "alert" | "alertdialog" | "application" | "article" | "banner" | "blockquote" | "button" | "caption" | "cell" | "checkbox" | "code" | "columnheader" | "combobox" | "complementary" | "contentinfo" | "definition" | "deletion" | "dialog" | "directory" | "document" | "emphasis" | "feed" | "figure" | "form" | "generic" | "grid" | "gridcell" | "group" | "heading" | "img" | "insertion" | "link" | "list" | "listbox" | "listitem" | "log" | "main" | "marquee" | "math" | "meter" | "menu" | "menubar" | "menuitem" | "menuitemcheckbox" | "menuitemradio" | "navigation" | "none" | "note" | "option" | "paragraph" | "presentation" | "progressbar" | "radio" | "radiogroup" | "region" | "row" | "rowgroup" | "rowheader" | "scrollbar" | "search" | "searchbox" | "separator" | "slider" | "spinbutton" | "status" | "strong" | "subscript" | "superscript" | "switch" | "tab" | "table" | "tablist" | "tabpanel" | "term" | "textbox" | "time" | "timer" | "toolbar" | "tooltip" | "tree" | "treegrid" | "treeitem") => {
  return parent.getByRole(role).first()
}
const getText = async (element: Locator, errorMessage: string): Promise<string> => {
  try {
    return await element.innerText({timeout: 10 * 1000})
  } catch (error) {
    console.error(errorMessage, error)
  }

  return ''
}
const getHTML = async (element: Locator, errorMessage: string): Promise<string> => {
  try {
    return await element.innerHTML({timeout: 10 * 1000})
  } catch (error) {
    console.error(errorMessage, error)
  }

  return ''
}
const getAttribute = async (element: Locator, attribute: string, errorMessage: string): Promise<string> => {
  try {
    return await element.getAttribute(attribute, {timeout: 10 * 1000})
  } catch (error) {
    console.error(errorMessage, error)
  }

  return ''
}

const saveSession = async (page: Page) => {
  console.log('save session')
  await page.context().storageState({path: `auth_state_${process.env.LINK_LOGIN}.json`})
}

test('get_user_info_with_auth', async ({playwright, browser}) => {
  const linkedinProfileUrl = process.env.LINK_URL

  try {
    const {page, browser: b} = await getPage(playwright, browser)

    await parseUserInfo(page, linkedinProfileUrl)

    await saveSession(page)

    await b.close()
  } catch (e) {
    console.error(e)
  }
})

const parseUserInfo = async (page: Page, url: string) => {
  try {
    await openPage(page, url, process.env.RETRY ? +process.env.RETRY : 1)

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

      if (!userName) {
        console.error('user name not found')

        return
      }


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

      console.info(`STEALTH${JSON.stringify(user)}STEALTH`)
    } catch (error) {
      console.log(error)
    }

  } catch (error) {
    console.log(error)
  }
}

interface IPost {
  link_id: string,
  content: string,
  image_urls: string[],
  link_url: string,
  type: 'posted' | 'shared' | 'reacted',
  time: string,
  shared_content?: IPost,
}

const getPost = async (post: Locator) => {
  const result: IPost = {
    link_id: '',
    content: '',
    image_urls: [],
    link_url: '',
    type: 'posted',
    time: '',
    shared_content: null,
  }

  try {
    const attribute = await getAttribute(post, 'data-activity-urn', 'can not find post id')

    result.link_id = attribute.replace('urn:li:activity:', '')

    try {
      const text = getElement(post, '.attributed-text-segment-list__content')

      if (await text.isVisible({timeout: 10 * 1000})) {
        result.content = await getHTML(text, 'can not find content')
      }
    } catch (e) {
      console.error(e)
    }

    if (await post.locator("[data-tracking-control-name='feed_main-feed-card_feed-reaction-header']").isVisible({timeout: 2 * 1000})) {
      if (await post.locator('.share-native-video').isVisible({timeout: 2 * 1000})) {
        return null
      }
      try {
        result.type = 'reacted'
        result.content = await getHTML(getElement(post, '.attributed-text-segment-list__container'), 'can not find reacted content')
      } catch (e) {
        console.error('it is posted')
      }
    } else if (await getElement(post, '.feed-reshare-content').isVisible({timeout: 2 * 1000})) {
      try {
        result.type = 'shared'
        result.shared_content = await getPost(getElement(post, '.feed-reshare-content'))
      } catch (e) {
        console.error('it is posted')
      }
    }

    try {
      const images = await post.locator("[data-feed-action-type='viewImage']").all()

      for (let a = 0; a < images.length; a++) {
        const imageUrl = await getAttribute(
          getElementByRole(images[a], 'img'),
          'data-delayed-url',
          'can not find image url'
        )

        imageUrl && result.image_urls.push(imageUrl)
      }
    } catch (e) {
      console.error('can not find image url')
    }

    try {
      result.time = await getText(getElementByRole(post, 'time'), 'can not find time')
    } catch (e) {
      console.error(e)
    }

    return result
  } catch (error) {
    console.error(error)
  }

  return null
}

const getFeedItemsWithPagination = async (page: Page) => {
  const pagination = +process.env.LINK_PAGINATION || 1

  for (let a = 0; a < pagination; a++) {
    const lastItem = page.locator('.feed-item').last()
    const count = await page.locator('.feed-item').count()

    await lastItem.scrollIntoViewIfNeeded()
    await page.waitForTimeout(2 * 1000)

    const newCount = await page.locator('.feed-item').count()

    if (newCount === count) {
      await page.waitForTimeout(2 * 1000)

      const newCount2 = await page.locator('.feed-item').count()

      if (newCount2 === count) {
        break
      }
    }
  }

  return page.locator('.feed-item').all()
}

test('get_feed_with_auth', async ({playwright, browser}) => {
  const externalLinkedInUrl = process.env.LINK_URL
  const {page, browser: b} = await getPage(playwright, browser)

  try {
    await page.goto(externalLinkedInUrl)

    try {
      const result = []
      const feedItems = await getFeedItemsWithPagination(page)

      for (let a = 0; a < feedItems.length; a++) {
        try {
          const article = getElement(feedItems[a], '.main-feed-activity-card')

          if (!(await article.isVisible())) {
            continue
          }

          const post = await getPost(article)

          if (!!post) {
            result.push(post)
          }
        } catch (error) {
          console.error(error)
        }
      }

      console.log(`STEALTH${JSON.stringify(result)}STEALTH`)
    } catch (error) {
      console.log(error)
    }

    await saveSession(page)
  } catch (error) {
    console.log(error)
  } finally {
    await b.close();
  }
})

async function GetOTP(page: Page) {
  let OTP

  try {
    const response = await axios.get(`http://localhost:8080/api/v1/internal/otp/?email=${process.env.LINK_LOGIN}`);

    OTP = response.data.otp
  } catch (error) {
    console.log(error)

    await page.waitForTimeout(1000)

    return GetOTP(page)
  }

  while (!OTP) {
    await page.waitForTimeout(1000)

    return GetOTP(page)
  }

  return OTP
}

const openPage = async (page: Page, url: string, retry: number) => {
  try {
    console.log('try to open url')

    await page.goto(url)
  } catch (error) {
    if (retry > 0) {
      console.log('wait for retry after error: ', error)
      await new Promise(resolve => setTimeout(resolve, 1000))

      await openPage(page, url, retry - 1)
    }

    throw error
  }
}

test('login', async ({playwright, browser}) => {
  const {page, browser: b} = await getPage(playwright, browser, false, true)

  try {
    await openPage(page, 'https://www.linkedin.com/login', process.env.RETRY ? +process.env.RETRY : 1)

    if (await page.locator('.not-found-404').isVisible()) {
      console.error('404')

      return
    }

    const username = page.locator('#username')
    const password = page.locator('#password')
    const submitButton = page.locator('.btn__primary--large.from__button--floating')

    console.log('try to fill LINK_LOGIN')
    await username.fill(process.env.LINK_LOGIN)

    console.log('try to fill LINK_PASSWORD')
    await password.fill(process.env.LINK_PASSWORD)

    console.log('try to submit')
    await submitButton.click()

    console.log('check valid credentials')
    const hasLoginError: boolean = await page.locator('#error-for-username').isVisible()
    const hasPasswordError: boolean = await page.locator('#error-for-password').isVisible()

    if (hasLoginError || hasPasswordError) {
      postEvent(JSON.stringify({
        status: 'INVALID_CREDENTIALS'
      }))

      return
    }

    const needWriteOTPCode = await page.locator('.input_verification_pin').isVisible();

    if (needWriteOTPCode) {
      await axios.post('http://167.99.250.71:8080/api/v1/internal/otp/request', {
        email: process.env.LINK_LOGIN,
        type: 'email',
      })

      const otpInput = page.locator('.input_verification_pin')
      const otpEmailSubmitButton = page.locator('#email-pin-submit-button').first()
      const otpTwoStepSubmitButton = page.locator('#two-step-submit-button').first()

      console.log('get OTP code')
      const OTP = await GetOTP(page)

      console.log(OTP)

      console.log('fill OTP code')
      await otpInput.fill(OTP)
      console.log('OTP code submit')
      if (await otpEmailSubmitButton.isVisible()) {
        await otpEmailSubmitButton.click()

        if (await page.locator('#email-pin-error').isVisible()) {
          postEvent(JSON.stringify({
            status: 'INVALID_OTP'
          }))

          return
        }
      } else if (await otpTwoStepSubmitButton.isVisible()) {
        await otpTwoStepSubmitButton.click()

        const avatarUrl = await getAttribute(
          getElement(page, '.artdeco-entity-image'),
          'data-ghost-url',
          'can not find avatar url'
        )

        if (!avatarUrl) {
          postEvent(JSON.stringify({
            status: 'INVALID_OTP'
          }))

          return
        }
      } else {
        console.error('otp button not found')

        return
      }
    }

    const account = {
      avatarUrl: ''
    }

    account.avatarUrl = await getAttribute(
      getElement(page, '.artdeco-entity-image'),
      'data-ghost-url',
      'can not find avatar url'
    )

    await saveSession(page)

    postEvent(JSON.stringify({
      account,
      status: 'CONNECTED'
    }))
  } catch (error) {
    console.error(error)
  } finally {
    await b.close()
  }
})

const longTouch = async (page: Page) => {
  await page.evaluate(() => {
    const element = document.getElementsByClassName('reactions-menu__trigger')

    const touchStartEvent = new TouchEvent('touchstart', {
      touches: [
        new Touch({
          clientX: 0,
          clientY: 0,
          identifier: 0,
          target: element[1],
        })
      ]
    })

    const touchEndEvent = new TouchEvent('touchend', {
      touches: [
        new Touch({
          clientX: 0,
          clientY: 0,
          identifier: 0,
          target: element[1],
        })
      ]
    })

    element[1].dispatchEvent(touchStartEvent);

    return (new Promise(resolve => (
      setTimeout(() => {
        element[1].dispatchEvent(touchEndEvent)

        resolve(undefined)
      }, 2000)
    )))
  });

}

test('send_comment', async ({playwright, browser}) => {
  const {page, browser: b} = await getPage(playwright, browser, true, true)
  const externalLinkedInUrl = process.env.LINK_URL
  const comment = process.env.COMMENT

  try {
    console.log('try to open url')
    await page.goto(externalLinkedInUrl)

    console.log('check sign in modal')
    if (await page.locator('.sign-in-modal').isVisible()) {
      console.log('try to login')
      await page.locator('.sign-in-modal__outlet-btn').click()

      const login = page.locator('#public_post_contextual-sign-in_sign-in-modal_session_key')
      const password = page.locator('#public_post_contextual-sign-in_sign-in-modal_session_password')
      const loginButton = page.locator('.sign-in-form__submit-btn--full-width')

      console.log('try to fill LINK_LOGIN')
      await login.fill(process.env.LINK_LOGIN)
      console.log('try to fill LINK_LOGIN')
      await password.fill(process.env.LINK_PASSWORD)

      console.log('try to click loginButton')
      await loginButton.click()

      console.log('wait 1 second')
      await page.waitForTimeout(1000)

      console.log('save session')
      await page.context().storageState({path: `auth_state_${process.env.LINK_LOGIN}.json`})
    } else {
      console.log('without login')
    }

    const input = page.locator('#comment-editable-container')
    const submitButton = page.locator('#post-comment-button')

    console.log('wait 2 second')
    await page.waitForTimeout(2000)

    console.log('try to fill comment')
    await input.fill(comment)

    console.log('check submitButton isEnabled')
    await submitButton.isEnabled()

    console.log('try to click submitButton')
    await submitButton.click()

    console.log('wait 2 second')
    await page.waitForTimeout(2000)

    console.info('STEALTHsuccessSTEALTH')

    // await saveSession(page)

  } catch (error) {
    console.log(error)
  } finally {
    await b.close()
  }
})

test('send_reaction', async ({playwright, browser}) => {
  const {page, browser: b} = await getPage(playwright, browser, true, true)
  const externalLinkedInUrl = process.env.LINK_URL
  const reaction = process.env.LINK_REACTION

  try {
    console.log('try to open url')
    await page.goto(externalLinkedInUrl)

    console.log('check sign in modal')
    if (await page.locator('.sign-in-modal').isVisible()) {
      console.log('try to login')
      await page.locator('.sign-in-modal__outlet-btn').click()

      const login = page.locator('#public_post_contextual-sign-in_sign-in-modal_session_key')
      const password = page.locator('#public_post_contextual-sign-in_sign-in-modal_session_password')
      const loginButton = page.locator('.sign-in-form__submit-btn--full-width')

      console.log('try to fill LINK_LOGIN')
      await login.fill(process.env.LINK_LOGIN)
      console.log('try to fill LINK_LOGIN')
      await password.fill(process.env.LINK_PASSWORD)

      console.log('try to click loginButton')
      await loginButton.click()

      console.log('wait 1 second')
      await page.waitForTimeout(1000)

      console.log('save session')
      await saveSession(page)
    } else {
      console.log('without login')
    }

    if (await getElement(page, '.promo__dismiss').isVisible()) {
      await getElement(page, '.promo__dismiss').click()
    }

    const reactions = {
      like: getElement(page, '#selected-reaction-icon--LIKE'),
      praise: getElement(page, '#selected-reaction-icon--PRAISE'),
      appreciation: getElement(page, '#selected-reaction-icon--APPRECIATION'),
      empathy: getElement(page, '#selected-reaction-icon--EMPATHY'),
      interest: getElement(page, '#selected-reaction-icon--INTEREST'),
      entertainment: getElement(page, '#selected-reaction-icon--ENTERTAINMENT'),
    }

    if (!(await page.locator('.reactions-menu__trigger').last().isVisible())) {
      console.log('did not find reactions-menu')

      return
    }

    console.log('try to show reactions')
    await longTouch(page)

    const userReaction: Locator = reactions[reaction]

    console.log(`try to click ${reaction} reaction`)
    await userReaction.locator('img').click()

    console.log('wait 2 second')
    await page.waitForTimeout(2000)

    console.info('STEALTHsuccessSTEALTH')

    // await saveSession(page)

  } catch (error) {
    console.log(error)
  } finally {
    await b.close()
  }
})
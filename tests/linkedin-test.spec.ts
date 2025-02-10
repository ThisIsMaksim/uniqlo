// import {Browser, Cookie, Page, test} from '@playwright/test'
// import * as fs from "fs"
//
// async function openLinkedin(browser: Browser, action: () => Promise<any>) {
//   const userId = 'user_id'
//   const data = fs.readFileSync(`auth_cookies_${userId}.json`)
//   const cookies = JSON.parse(data.toString()) as Cookie[]
//   const context = await browser.newContext({
//     javaScriptEnabled: false,
//     storageState: {
//       cookies,
//       origins: [],
//     }
//   })
//   const page = await context.newPage()
//
//   try {
//     console.log('open linkedin')
//     await page.goto('https://www.linkedin.com')
//
//     try {
//       console.log('waiting share-box')
//       await page.waitForSelector('.scaffold-layout__main')
//     } catch (error) {
//       console.log('error login with cookies')
//       await login(page, userId)
//
//       await page.waitForSelector('.scaffold-layout__main')
//     }
//
//   } catch (error) {
//     await login(page, userId)
//   }
//
//   await action()
// }
//
// async function login(page: Page, userId: string) {
//   const userName = 'maksimfedyanindevelop@gmail.com'
//   const password = '48Ab0015749'
//
//   console.log('open login')
//   await page.goto('https://www.linkedin.com/checkpoint/lg/sign-in-another-account')
//
//   const userNameInput = page.locator('#username')
//   const passwordInput = page.locator('#password')
//   const actionContainer = page.locator('login__form_action_container ')
//   const submitButton = page.getByLabel('Sign in', { exact: true })
//
//   console.log('fill credentials')
//   await userNameInput.fill(userName)
//   await passwordInput.fill(password)
//
//   console.log('waiting submit button enabled')
//   await submitButton.isEnabled()
//
//   console.log('click to submit button')
//   await submitButton.click()
//
//   while (true) {
//     console.log('waiting')
//     const canNext = await page.locator('.scaffold-layout__main').isVisible()
//       || await page.locator('.input_verification_pin').isVisible()
//
//     if (canNext) {
//       break;
//     }
//
//     await page.waitForTimeout(500)
//   }
//
//   const needWriteOTPCode = await page.locator('.input_verification_pin').isVisible();
//
//   if (needWriteOTPCode) {
//     const otpInput = page.locator('.input_verification_pin')
//     const formAction = page.locator('.form__action')
//     const otpSubmitButton = formAction.getByRole('button')
//
//     console.log('get OTP code')
//     const OTP = await GetOTP(page)
//
//     console.log(OTP)
//
//     console.log('fill OTP code')
//     await otpInput.fill(OTP)
//     console.log('OTP code submit')
//     await otpSubmitButton.click()
//   }
//
//   console.log('get cookies')
//   const cookies = await page.context().cookies()
//
//   console.log('save cookies to file')
//   fs.writeFileSync(`auth_cookies_${userId}.json`, JSON.stringify(cookies))
// }
//
// async function GetOTP(page: Page) {
//   let OTP
//
//   try {
//     OTP = await fetch('http://localhost:4000/').then((res) => res.text());
//   } catch (error) {
//     console.log(error)
//
//     await page.waitForTimeout(5000)
//
//     return GetOTP(page)
//   }
//
//   while (!OTP) {
//     await page.waitForTimeout(5000)
//
//     return GetOTP(page)
//   }
//
//   return OTP;
// }
//
// test('login', async ({ page }) => {
//   const action = async () => {
//     console.log('open linkedin')
//     await page.goto('https://www.linkedin.com')
//   }
//
//   await openLinkedin(page, action)
// })
//
// test('send comment', async ({ page }) => {
//   const action = async () => {
//     const url = 'https://www.linkedin.com/posts/maksim-fedyanin-4a64302a7_test-new-feed-activity-7263507619259068418-7m3_/'
//     const comment = 'test comment'
//
//     console.log('open feed page')
//     await page.goto(url)
//
//     console.log('get input')
//     const editorContainer = page.locator('.editor-container')
//     const editor = editorContainer.locator('.ql-editor')
//     const input = editor.getByRole("paragraph")
//
//     console.log('fill comment')
//     await input.fill(comment)
//
//     console.log('waiting send button')
//     await page.waitForSelector('.comments-comment-box__submit-button--cr')
//
//     const sendCommentButton = page.locator('.comments-comment-box__submit-button--cr')
//
//     console.log('sending comment')
//     await sendCommentButton.click()
//
//     console.log('waiting timeout')
//     await page.waitForTimeout(2000)
//   }
//
//   await openLinkedin(page, action)
// })
//
// test('get user info', async ({ page }) => {
//   const action = async () => {
//     const url = `https://www.linkedin.com/in/lena-platonova/`
//
//     console.log('open user page')
//     await page.goto(url)
//
//     const avatarContainer = page.locator('.pv-top-card-profile-picture__container')
//     const avatar = avatarContainer.getByRole('img')
//
//     const userName = await avatar.getAttribute('title')
//     const avatarUrl = await avatar.getAttribute('src')
//
//     console.log(userName, avatarUrl)
//   }
//
//   await openLinkedin(page, action)
// })
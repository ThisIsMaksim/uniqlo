const { firefox } = require('playwright');
const json2csv = require("json2csv")
const express = require('express')
const fs = require('fs')
const app = express()
const port = 3000

app.get('/', async (req, res) => {
  let jsonData

  try {
    try {
      const data = fs.readFileSync('data.json', 'utf8');

      jsonData = JSON.parse(data);
    } catch (err) {
      console.error('Ошибка при чтении или разборе файла:', err);
    }

    const json2csvParser = new json2csv.Parser()
    const csv = json2csvParser.parse(jsonData.items)

    res.header('Content-Type', 'text/csv')
    res.attachment('data.csv')
    res.send(csv)
  } catch (err) {
    console.error(err)
  }
})

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);

  cronGetProducts()
})

const cronGetProducts = async () => {
  console.log('cronGetProducts');

  getProducts()

  setTimeout(() => {
    getProducts()
  }, 10 * 60 * 1000)
}

async function getProducts() {
  const browser = await firefox.launch();
  const context = await browser.newContext({
    javaScriptEnabled: true,
    isMobile: false,
  });
  const page = await context.newPage()
  const records = [];
  const items = [];

  try {
    await page.goto('https://www.uniqlo.com/th/en/spl/ranking/men', {timeout: 10 * 1000});

    await page.waitForSelector('.product-tile', {timeout: 10 * 1000});

    const products = await page.locator('.product-tile').all({timeout: 2 * 1000});

    for (let product of products) {
      const parent = product.locator('xpath=..');
      const title = await product.locator('.product-tile-product-description').innerText({timeout: 2 * 1000});
      const priceWrapper = await product.locator('.fr-price-currency', {timeout: 2 * 1000});
      const currency = await priceWrapper.locator('.fr-price-currency-margin').innerText({timeout: 2 * 1000});
      const price = await priceWrapper.locator('span').last().innerText({timeout: 2 * 1000});
      const imageWrapper = product.locator('.ec-renewal-image-wrapper');
      const image = imageWrapper.locator('img');
      const imageSrc = await image.getAttribute('src', {timeout: 2 * 1000});
      const link = await parent.getAttribute('href', {timeout: 2 * 1000});
      const colorsWrapper = product.locator('.chip-wrapper');
      const colors = colorsWrapper.getByRole('listitem');
      const color = colors.first();
      const colorStyle = await color.getAttribute('style', {timeout: 2 * 1000}) || '';
      const colorOption = colorStyle.split('goods_')[1].split('_')[0];

      records.push({
        title,
        price,
        currency,
        imageSrc,
        link,
        colorOption,
      });
    }

    for (let a = 0; a < records.length; a++) {
      try {
        console.log('record: ' + a)

        const record = records[a]

        await page.goto(`https://www.uniqlo.com${record.link}`, {timeout: 10 * 1000})

        await page.waitForSelector("[name='product-color-picker']", {timeout: 10 * 1000})

        const colors = await page.locator("[name='product-color-picker']").all({timeout: 2 * 1000})
        const sizes = await page.locator("[name='product-size-picker']").all({timeout: 2 * 1000})
        const colorOptions = []
        const sizeOptions = []
        const inStock = await page.locator('.fr-text-annotation.weak').isVisible({timeout: 2 * 1000})

        for (let color of colors) {
          const value = await color.getAttribute('value', {timeout: 2 * 1000})

          colorOptions.push(`COL${value}`)
        }
        for (let size of sizes) {
          const value = await size.getAttribute('value', {timeout: 2 * 1000})

          sizeOptions.push(`SMA${value}`)
        }

        for (let color of colorOptions) {
          for (let size of sizeOptions) {
            const item = {
              Title: record.title,
              Price: record.price,
              'URL handle': `${record.link}_${color}_${size}`.replaceAll('/', '_'),
              Description: '',
              Vendor: 'Uniqlo',
              'Product category': '',
              Type: '',
              Tags: '',
              'Product image URL': record.imageSrc,
              'Image position': 1,
              'Published on online store': inStock ? 'TRUE' : 'FALSE',
            }

            items.push(item)

            try {
              fs.writeFileSync('data.json', JSON.stringify({items: items}));
              console.log('JSON успешно сохранен в data.json');
            } catch (err) {
              console.error('Ошибка при записи в файл:', err);
            }
          }
        }
      } catch (e) {
        console.error(e)
      }
    }

  } catch (e) {
    console.error(e)
  }

  console.log('SUCCESS')

  await browser.close()
}

module.exports = app
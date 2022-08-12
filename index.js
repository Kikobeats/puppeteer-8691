'use strict'

const puppeteer = require('puppeteer')
const psList = require('ps-list')

const pidtree = async pid => (await psList()).find(ps => ps.pid === pid)

const isBrowserConnected = async browserPid =>
  Boolean(await pidtree(browserPid))

const delay = d => new Promise(r => setTimeout(r, d))

/////////////////////////////////////////////////////////////////////////

console.log()
console.log(`Reproducing puppeteer #8691 bug`)
console.log()
console.log(`https://github.com/puppeteer/puppeteer/issues/8691`)
console.log()
;(async () => {
  const browser = await puppeteer.launch({ headless: false })

  const browserPid = browser.process().pid

  const contextOne = await browser.createIncognitoBrowserContext()
  const pageOne = await contextOne.newPage()

  const contextTwo = await browser.createIncognitoBrowserContext()
  const pageTwo = await contextOne.newPage()

  await contextTwo.close()

  await delay(1500) // wait a random quantity of time to update process table

  const native = browser.isConnected()
  const fallback = await isBrowserConnected(browserPid)

  if (native === false || fallback === false) {
    console.log(`The bug is still there!

Two contexts has been created in the same browser process.

Close the second context causes the browser be closed too.

The method 'browser.isConnected()' is returning '${native}'`)

    process.exit(1)
  } else {
    console.log('The issue has been fixed ✨')
  }
})()

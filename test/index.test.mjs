import { listen } from 'listhen'
import { getQuery, joinURL } from 'ufo'
import { createApp, useBody } from 'h3'
import { expect } from 'chai'
import { Headers } from 'node-fetch'
import { $fetch } from 'ohmyfetch'

describe('ohmyfetch', () => {
  let listener
  const getURL = url => joinURL(listener.url, url)

  before(async () => {
    const app = createApp()
      .use('/ok', () => 'ok')
      .use('/params', req => (getQuery(req.url || '')))
      .use('/url', req => req.url)
      .use('/post', async req => ({ body: await useBody(req), headers: req.headers }))
    listener = await listen(app)
  })

  after(async () => {
    await listener.close()
  })

  it('ok', async () => {
    expect(await $fetch(getURL('ok'))).to.equal('ok')
  })

  it('custom parseResponse', async () => {
    let called = 0
    const parser = (r) => { called++; return 'C' + r }
    expect(await $fetch(getURL('ok'), { parseResponse: parser })).to.equal('Cok')
    expect(called).to.equal(1)
  })

  it('baseURL', async () => {
    expect(await $fetch('/x?foo=123', { baseURL: getURL('url') })).to.equal('/x?foo=123')
  })

  it('stringifies posts body automatically', async () => {
    const { body } = await $fetch(getURL('post'), { method: 'POST', body: { num: 42 } })
    expect(body).to.deep.eq({ num: 42 })

    const body2 = (await $fetch(getURL('post'), { method: 'POST', body: [{ num: 42 }, { num: 43 }] })).body
    expect(body2).to.deep.eq([{ num: 42 }, { num: 43 }])

    const headerFetches = [
      [['Content-Type', 'text/html']],
      [],
      { 'Content-Type': 'text/html' },
      new Headers()
    ]

    for (const sentHeaders of headerFetches) {
      const { headers } = await $fetch(getURL('post'), { method: 'POST', body: { num: 42 }, headers: sentHeaders })
      expect(headers).to.include({ 'content-type': 'application/json' })
    }
  })

  it('404', async () => {
    const err = await $fetch(getURL('404')).catch(err => err)
    expect(err.toString()).to.contain('404 Not Found')
    expect(err.data).to.deep.eq({ stack: [], statusCode: 404, statusMessage: 'Not Found' })
    expect(err.response?.data).to.deep.eq(err.data)
    expect(err.request).to.equal(getURL('404'))
  })

  it('baseURL with retry', async () => {
    const err = await $fetch('', { baseURL: getURL('404'), retry: 3 }).catch(err => err)
    expect(err.request).to.equal(getURL('404'))
  })
})

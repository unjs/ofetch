import { listen, Listener } from 'listhen'
import { getQuery } from 'ufo'
import { createApp, useBody } from 'h3'
import { Headers, HeadersInit } from 'node-fetch'
import { $fetch, FetchError } from '../src/node'

describe('ohmyfetch', () => {
  let listener: Listener

  it('setup', async () => {
    const app = createApp()
      .use('/ok', () => 'ok')
      .use('/params', req => (getQuery(req.url || '')))
      .use('/url', req => req.url)
      .use('/post', async req => ({ body: await useBody(req), headers: req.headers }))
    listener = await listen(app)
  })

  afterAll(async () => {
    await listener.close()
  })

  it('ok', async () => {
    expect(await $fetch(listener.getURL('ok'))).toBe('ok')
  })

  it('baseURL', async () => {
    expect(await $fetch('/x?foo=123', { baseURL: listener.getURL('url') })).toBe('/x?foo=123')
  })

  it('stringifies posts body automatically', async () => {
    const { body } = await $fetch(listener.getURL('post'), { method: 'POST', body: { num: 42 } })
    expect(body).toEqual({ num: 42 })

    const headerFetches = [
      [['content-type', 'text/html']],
      [],
      { 'content-type': 'text/html' },
      new Headers()
    ]

    for (const sentHeaders of headerFetches) {
      const { headers } = await $fetch(listener.getURL('post'), { method: 'POST', body: { num: 42 }, headers: sentHeaders as any })
      expect(headers).toEqual(expect.objectContaining({ 'content-type': 'application/json' }))
    }
  })

  it('404', async () => {
    const err: FetchError = await $fetch(listener.getURL('404')).catch(err => err)
    expect(err.stack).toMatch('404 Not Found')
    expect(err.data).toMatchObject({ stack: [], statusCode: 404, statusMessage: 'Not Found' })
    expect(err.response?.data).toBe(err.data)
    expect(err.request).toBe(listener.getURL('404'))
  })
})

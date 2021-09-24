import { listen, Listener } from 'listhen'
import { getQuery, joinURL } from 'ufo'
import { createApp, useBody } from 'h3'
import { Headers } from 'node-fetch'
import { $fetch, FetchError } from '../src/node'

describe('ohmyfetch', () => {
  let listener: Listener
  const getURL = (url: string) => joinURL(listener.url, url)

  beforeEach(async () => {
    const app = createApp()
      .use('/ok', () => 'ok')
      .use('/params', req => (getQuery(req.url || '')))
      .use('/url', req => req.url)
      .use('/post', async req => ({ body: await useBody(req), headers: req.headers }))
    listener = await listen(app)
  })

  afterEach(async () => {
    await listener.close()
    jest.resetAllMocks()
  })

  it('ok', async () => {
    expect(await $fetch(getURL('ok'))).toBe('ok')
  })

  it('custom parse', async () => {
    const parser = jest.fn().mockReturnValue('asdf')
    await $fetch(getURL('ok'), { parse: parser })
    expect(parser).toHaveBeenCalledTimes(1)
  })

  it('custom parse false', async () => {
    expect(await $fetch(getURL('ok'), { parse: false })).toBe('ok')
  })

  it('baseURL', async () => {
    expect(await $fetch('/x?foo=123', { baseURL: getURL('url') })).toBe('/x?foo=123')
  })

  it('stringifies posts body automatically', async () => {
    const { body } = await $fetch(getURL('post'), { method: 'POST', body: { num: 42 } })
    expect(body).toEqual({ num: 42 })

    const headerFetches = [
      [['Content-Type', 'text/html']],
      [],
      { 'Content-Type': 'text/html' },
      new Headers()
    ]

    for (const sentHeaders of headerFetches) {
      const { headers } = await $fetch(getURL('post'), { method: 'POST', body: { num: 42 }, headers: sentHeaders as any })
      expect(headers).toEqual(expect.objectContaining({ 'content-type': 'application/json' }))
    }
  })

  it('404', async () => {
    const err: FetchError = await $fetch(getURL('404')).catch(err => err)
    expect(err.stack).toMatch('404 Not Found')
    expect(err.data).toMatchObject({ stack: [], statusCode: 404, statusMessage: 'Not Found' })
    expect(err.response?.data).toBe(err.data)
    expect(err.request).toBe(getURL('404'))
  })
})

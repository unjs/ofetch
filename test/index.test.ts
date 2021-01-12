import { listen, Listener } from 'listhen'
import { getQuery } from 'ufo'
import { createApp } from 'h3'
import { $fetch, FetchError } from '../src/node'

describe('ohmyfetch', () => {
  let listener: Listener

  it('setup', async () => {
    const app = createApp()
      .use('/ok', () => 'ok')
      .use('/params', req => (getQuery(req.url || '')))
      .use('/url', req => req.url)
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

  it('404', async () => {
    const err: FetchError = await $fetch(listener.getURL('404')).catch(err => err)
    expect(err.stack).toMatch('404 Not Found')
    expect(err.data).toMatchObject({ stack: [], statusCode: 404, statusMessage: 'Not Found' })
    expect(err.response?.data).toBe(err.data)
    expect(err.request).toBe(listener.getURL('404'))
  })
})

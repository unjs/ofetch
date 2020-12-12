import { listen, Listener } from 'listhen'
import { getParams } from '@nuxt/ufo'
import { createApp } from '@nuxt/h2'
import { $fetch, FetchError } from '../src/node'

describe('ohmyfetch', () => {
  let listener: Listener

  it('setup', async () => {
    const app = createApp().use('/api', req => (getParams(req.url || '')))
    listener = await listen(app)
  })

  afterAll(async () => {
    await listener.close()
  })

  it('api', async () => {
    expect(await $fetch('api', {
      baseURL: listener.url,
      params: { api: 1 }
    })).toMatchObject({ api: '1' })
  })

  it('404', async () => {
    const err: FetchError = await $fetch('404', { baseURL: listener.url }).catch(err => err)
    expect(err.stack).toMatch('404 Not Found')
    expect(err.data).toMatch('Not Found (404)')
    expect(err.response?.data).toBe(err.data)
    expect(err.request).toBe('http://localhost:3000/404')
  })
})

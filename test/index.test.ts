import { listen, Listener } from 'listhen'
import { createApp } from '@nuxt/h2'
import { $fetch } from '../src/node'

describe('ohmyfetch', () => {
  let listener: Listener

  it('setup', async () => {
    const app = createApp().use('/api', () => ({ api: 1 }))
    listener = await listen(app)
  })

  afterAll(async () => {
    await listener.close()
  })

  it('api', async () => {
    expect(await $fetch('api', { baseURL: listener.url })).toMatchObject({ api: 1 })
  })

  it('404', async () => {
    const err = await $fetch('404', { baseURL: listener.url }).catch(err => err)
    expect(err.stack).toMatch('404 Not Found')
    expect(err.data).toMatch('Not Found (404)')
  })
})

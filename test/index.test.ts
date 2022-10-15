import { listen } from 'listhen'
import { getQuery, joinURL } from 'ufo'
import { createApp, eventHandler, readBody, readRawBody, toNodeListener } from 'h3'
import { Blob } from 'fetch-blob'
import { FormData } from 'formdata-polyfill/esm.min.js'
import { describe, beforeEach, afterEach, it, expect } from 'vitest'
import { Headers, $fetch } from '../src/node'

describe('ohmyfetch', () => {
  let listener
  const getURL = url => joinURL(listener.url, url)

  beforeEach(async () => {
    const app = createApp()
      .use('/ok', eventHandler(() => 'ok'))
      .use('/params', eventHandler(event => (getQuery(event.req.url || ''))))
      .use('/url', eventHandler(event => event.req.url))
      .use('/post', eventHandler(async event => ({ body: await readBody(event), headers: event.req.headers })))
      .use('/binary', eventHandler((event) => {
        event.res.setHeader('Content-Type', 'application/octet-stream')
        return new Blob(['binary'])
      }))
      .use('/echo', async event => ({ body: await readRawBody(event) }))
    listener = await listen(toNodeListener(app))
  })

  afterEach(async () => {
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

  it('allows specifying FetchResponse method', async () => {
    expect(await $fetch(getURL('params?test=true'), { responseType: 'json' })).to.deep.equal({ test: 'true' })
    expect(await $fetch(getURL('params?test=true'), { responseType: 'blob' })).to.be.instanceOf(Blob)
    expect(await $fetch(getURL('params?test=true'), { responseType: 'text' })).to.equal('{"test":"true"}')
    expect(await $fetch(getURL('params?test=true'), { responseType: 'arrayBuffer' })).to.be.instanceOf(ArrayBuffer)
  })

  it('returns a blob for binary content-type', async () => {
    expect(await $fetch(getURL('binary'))).to.be.instanceOf(Blob)
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
      [['X-header', '1']],
      { 'x-header': '1' },
      new Headers({ 'x-header': '1' })
    ]

    for (const sentHeaders of headerFetches) {
      const { headers } = await $fetch(getURL('post'), { method: 'POST', body: { num: 42 }, headers: sentHeaders })
      expect(headers).to.include({ 'x-header': '1' })
      expect(headers).to.include({ accept: 'application/json' })
    }
  })

  it('does not stringify body when content type != application/json', async () => {
    const msg = '"Hallo von Pascal"'
    const { body } = await $fetch(getURL('echo'), { method: 'POST', body: msg, headers: { 'Content-Type': 'text/plain' } })
    expect(body).to.deep.eq(msg)
  })

  it('Bypass FormData body', async () => {
    const data = new FormData()
    data.append('foo', 'bar')
    const { body } = await $fetch(getURL('post'), { method: 'POST', body: data })
    expect(body).to.include('form-data; name="foo"')
  })

  it('Bypass URLSearchParams body', async () => {
    const data = new URLSearchParams({ foo: 'bar' })
    const { body } = await $fetch(getURL('post'), { method: 'POST', body: data })
    expect(body).to.eq('foo=bar')
  })

  it('404', async () => {
    const err = await $fetch(getURL('404')).catch(err => err)
    expect(err.toString()).to.contain('Cannot find any route matching /404.')
    expect(err.data).to.deep.eq({ stack: [], statusCode: 404, statusMessage: 'Cannot find any route matching /404.' })
    expect(err.response?._data).to.deep.eq(err.data)
    expect(err.request).to.equal(getURL('404'))
  })

  it('baseURL with retry', async () => {
    const err = await $fetch('', { baseURL: getURL('404'), retry: 3 }).catch(err => err)
    expect(err.request).to.equal(getURL('404'))
  })

  it('abort with retry', () => {
    const controller = new AbortController()
    async function abortHandle () {
      controller.abort()
      const res = await $fetch('', { baseURL: getURL('ok'), retry: 3, signal: controller.signal })
      console.log('res', res)
    }
    expect(abortHandle()).rejects.toThrow(/aborted/)
  })
})

import { type Listener, listen } from 'listhen'
import { getQuery } from 'ufo'
import { createApp, useBody } from 'h3'
import { describe, beforeEach, afterEach, it, expect } from 'vitest'
import { type ClientBuilder, createClient } from '../src/builder'

// Test TypeScript support
interface TypedResponse {
  foo: string
}

describe('rest client', () => {
  let listener: Listener
  let client: ClientBuilder

  beforeEach(async () => {
    const app = createApp()
      .use('/foo/1', () => ({ foo: '1' }))
      .use('/foo', () => ({ foo: 'bar' }))
      .use('/bar', async req => ({
        url: req.url,
        body: await useBody(req),
        headers: req.headers,
        method: req.method
      }))
      .use('/params', req => getQuery(req.url || ''))
    listener = await listen(app, { port: 3001 })
    client = createClient(listener.url)
  })

  afterEach(async () => {
    await listener.close()
  })

  it('GET request', async () => {
    const response = await client.foo.get<TypedResponse>()
    expect(response).to.deep.equal({ foo: 'bar' })
  })

  it('POST request', async () => {
    const response = await client.bar.post({ foo: 'bar' })
    expect(response.body).to.deep.equal({ foo: 'bar' })
    expect(response.method).to.equal('POST')
  })

  it('PUT request', async () => {
    const response = await client.bar.put({ foo: 'bar' })
    expect(response.body).to.deep.equal({ foo: 'bar' })
    expect(response.method).to.equal('PUT')
  })

  it('DELETE request', async () => {
    const response = await client.bar.delete()
    expect(response.method).to.equal('DELETE')
  })

  it('PATCH request', async () => {
    const response = await client.bar.patch({ foo: 'bar' })
    expect(response.body).to.deep.equal({ foo: 'bar' })
    expect(response.method).to.equal('PATCH')
  })

  it('Query parameter', async () => {
    const response = await client.params.get({ test: 'true' })
    expect(response).to.deep.equal({ test: 'true' })
  })

  it('Bracket syntax for path segment', async () => {
    const response = await client.foo['1'].get<TypedResponse>()
    expect(response).to.deep.equal({ foo: '1' })
  })

  it('Chain syntax for path segment', async () => {
    const response = await client.foo(1).get<TypedResponse>()
    expect(response).to.deep.equal({ foo: '1' })
  })

  it('Multiple path segments', async () => {
    const response = await client('foo', '1').get<TypedResponse>()
    expect(response).to.deep.equal({ foo: '1' })
  })

  it('Invalid api endpoint', async () => {
    await client.baz.get<TypedResponse>().catch((e) => {
      expect(e.message).toMatch(/404 Not Found/)
    })
  })
})

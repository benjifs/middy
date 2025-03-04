const { invoke } = require('../../test-helpers')
const middy = require('../../core')
const httpMultipartBodyParser = require('../')

describe('📦  Middleware Multipart Form Data Body Parser', () => {
  test('It should parse a non-file field from a multipart/form-data request', async () => {
    const handler = middy((event, context, cb) => {
      cb(null, event.body) // propagates the body as a response
    })

    handler.use(httpMultipartBodyParser())

    // invokes the handler
    // Base64 encoded form data with field 'foo' of value 'bar'
    const event = {
      headers: {
        'content-type': 'multipart/form-data; boundary=----WebKitFormBoundaryppsQEwf2BVJeCe0M'
      },
      body: 'LS0tLS0tV2ViS2l0Rm9ybUJvdW5kYXJ5cHBzUUV3ZjJCVkplQ2UwTQ0KQ29udGVudC1EaXNwb3NpdGlvbjogZm9ybS1kYXRhOyBuYW1lPSJmb28iDQoNCmJhcg0KLS0tLS0tV2ViS2l0Rm9ybUJvdW5kYXJ5cHBzUUV3ZjJCVkplQ2UwTS0t',
      isBase64Encoded: true
    }
    const response = await invoke(handler, event)

    expect(response).toEqual({ foo: 'bar' })
  })

  test('parseMultipartData should resolve with valid data', async () => {
    const handler = middy((event, context, cb) => {
      cb(null, event.body) // propagates the body as a response
    })

    handler.use(httpMultipartBodyParser())

    const event = {
      headers: {
        'content-type': 'multipart/form-data; boundary=----WebKitFormBoundaryppsQEwf2BVJeCe0M'
      },
      body: 'LS0tLS0tV2ViS2l0Rm9ybUJvdW5kYXJ5cHBzUUV3ZjJCVkplQ2UwTQ0KQ29udGVudC1EaXNwb3NpdGlvbjogZm9ybS1kYXRhOyBuYW1lPSJmb28iDQoNCmJhcg0KLS0tLS0tV2ViS2l0Rm9ybUJvdW5kYXJ5cHBzUUV3ZjJCVkplQ2UwTS0t',
      isBase64Encoded: true
    }

    const response = await invoke(handler, event)
    expect(response).toEqual({ foo: 'bar' })
  })

  test('It should parse a file field from a multipart/form-data request', async () => {
    const handler = middy((event, context, cb) => {
      cb(null, event.body) // propagates the body as a response
    })

    handler.use(httpMultipartBodyParser())

    // Base64 encoded form data with a file with fieldname 'attachment', filename 'test.txt', and contents 'hello world!'
    const event = {
      headers: {
        'content-type': 'multipart/form-data; boundary=------------------------4f0e69e6c2513684'
      },
      body: 'LS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS00ZjBlNjllNmMyNTEzNjg0DQpDb250ZW50LURpc3Bvc2l0aW9uOiBmb3JtLWRhdGE7IG5hbWU9ImF0dGFjaG1lbnQiOyBmaWxlbmFtZT0idGVzdC50eHQiDQpDb250ZW50LVR5cGU6IHRleHQvcGxhaW4NCg0KaGVsbG8gd29ybGQhCg0KLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS00ZjBlNjllNmMyNTEzNjg0LS0NCg==',
      isBase64Encoded: true
    }

    const response = await invoke(handler, event)

    expect(Object.keys(response)).toContain('attachment')
    expect(Object.keys(response.attachment)).toContain('content')
  })
  //
  test('It should handle invalid form data as an UnprocessableEntity', async () => {
    const handler = middy((event, context, cb) => {
      cb(null, event.body) // propagates the body as a response
    })

    handler.use(httpMultipartBodyParser())

    // invokes the handler
    const event = {
      headers: {
        'content-type': 'multipart/form-data; boundary=------WebKitFormBoundaryfdmza9FgfefwkQzA'
      },
      body: null,
      isBase64Encoded: true
    }

    try {
      await invoke(handler, event)
    } catch (e) {
      expect(e.message).toEqual('Invalid or malformed multipart/form-data was provided')
    }
  })

  test('It should handle more invalid form data as an UnprocessableEntity', async () => {
    // Body contains LF instead of CRLF line endings, which cant be processed
    const handler = middy((event, context, cb) => {
      cb(null, event.body) // propagates the body as a response
    })

    handler.use(httpMultipartBodyParser())

    const event = {
      headers: {
        'content-type': 'multipart/form-data; boundary=----WebKitFormBoundaryppsQEwf2BVJeCe0M'
      },
      body: 'LS0tLS0tV2ViS2l0Rm9ybUJvdW5kYXJ5cHBzUUV3ZjJCVkplQ2UwTQpDb250ZW50LURpc3Bvc2l0aW9uOiBmb3JtLWRhdGE7IG5hbWU9ImZvbyIKCmJhcgotLS0tLS1XZWJLaXRGb3JtQm91bmRhcnlwcHNRRXdmMkJWSmVDZTBNLS0=',
      isBase64Encoded: true
    }

    try {
      await invoke(handler, event)
    } catch (e) {
      expect(e.message).toEqual('Invalid or malformed multipart/form-data was provided')
    }
  })

  test('It shouldn\'t process the body if no headers are passed', async () => {
    const handler = middy((event, context, cb) => {
      cb(null, event.body) // propagates the body as a response
    })

    handler.use(httpMultipartBodyParser())

    // invokes the handler
    const event = {
      body: 'LS0tLS0tV2ViS2l0Rm9ybUJvdW5kYXJ5cHBzUUV3ZjJCVkplQ2UwTQpDb250ZW50LURpc3Bvc2l0aW9uOiBmb3JtLWRhdGE7IG5hbWU9ImZvbyIKCmJhcgotLS0tLS1XZWJLaXRGb3JtQm91bmRhcnlwcHNRRXdmMkJWSmVDZTBNLS0='
    }

    const response = await invoke(handler, event)

    expect(response).toEqual('LS0tLS0tV2ViS2l0Rm9ybUJvdW5kYXJ5cHBzUUV3ZjJCVkplQ2UwTQpDb250ZW50LURpc3Bvc2l0aW9uOiBmb3JtLWRhdGE7IG5hbWU9ImZvbyIKCmJhcgotLS0tLS1XZWJLaXRGb3JtQm91bmRhcnlwcHNRRXdmMkJWSmVDZTBNLS0=')
  })

  test('It shouldn\'t process the body if the content type is not multipart/form-data', async () => {
    const handler = middy((event, context, cb) => {
      cb(null, event.body) // propagates the body as a response
    })

    handler.use(httpMultipartBodyParser())

    // invokes the handler
    const event = {
      headers: {
        'content-type': 'application/json'
      },
      body: 'LS0tLS0tV2ViS2l0Rm9ybUJvdW5kYXJ5cHBzUUV3ZjJCVkplQ2UwTQpDb250ZW50LURpc3Bvc2l0aW9uOiBmb3JtLWRhdGE7IG5hbWU9ImZvbyIKCmJhcgotLS0tLS1XZWJLaXRGb3JtQm91bmRhcnlwcHNRRXdmMkJWSmVDZTBNLS0='
    }
    const response = await invoke(handler, event)
    expect(response).toEqual('LS0tLS0tV2ViS2l0Rm9ybUJvdW5kYXJ5cHBzUUV3ZjJCVkplQ2UwTQpDb250ZW50LURpc3Bvc2l0aW9uOiBmb3JtLWRhdGE7IG5hbWU9ImZvbyIKCmJhcgotLS0tLS1XZWJLaXRGb3JtQm91bmRhcnlwcHNRRXdmMkJWSmVDZTBNLS0=')
  })

  test('It shouldn\'t process the body if headers are passed without content type', async () => {
    const handler = middy((event, context, cb) => {
      cb(null, event.body) // propagates the body as a response
    })

    handler.use(httpMultipartBodyParser())

    // invokes the handler
    const event = {
      headers: {
        accept: 'application/json'
      },
      body: 'LS0tLS0tV2ViS2l0Rm9ybUJvdW5kYXJ5cHBzUUV3ZjJCVkplQ2UwTQpDb250ZW50LURpc3Bvc2l0aW9uOiBmb3JtLWRhdGE7IG5hbWU9ImZvbyIKCmJhcgotLS0tLS1XZWJLaXRGb3JtQm91bmRhcnlwcHNRRXdmMkJWSmVDZTBNLS0='
    }

    const response = await invoke(handler, event)
    expect(response).toEqual('LS0tLS0tV2ViS2l0Rm9ybUJvdW5kYXJ5cHBzUUV3ZjJCVkplQ2UwTQpDb250ZW50LURpc3Bvc2l0aW9uOiBmb3JtLWRhdGE7IG5hbWU9ImZvbyIKCmJhcgotLS0tLS1XZWJLaXRGb3JtQm91bmRhcnlwcHNRRXdmMkJWSmVDZTBNLS0=')
  })
})

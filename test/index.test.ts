import { expect, test } from 'vitest'
import { parseHTML } from '../src/index'

test('<p>123</p>', () => {
  expect(parseHTML('<p>123</p>')).toEqual({
    type: 'doc',
    content: [{
      type: 'p',
      content: [{
        type: 'text',
        text: '123'
      }]
    }]
  })
})

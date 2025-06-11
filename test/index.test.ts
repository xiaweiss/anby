import { expect, test } from 'vitest'
import { parseHTML } from '../src/index'

test('简单标签 <p>123</p>', () => {
  expect(parseHTML('<p>123</p>').doc).toEqual({
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

test('空标签 <p></p>', () => {
  expect(parseHTML('<p></p>').doc).toEqual({
    type: 'doc',
    content: [{
      type: 'p'
    }]
  })
})

test('多个标签 <p>123</p><div>456</div>', () => {
  expect(parseHTML('<p>123</p><div>456</div>').doc).toEqual({
    type: 'doc',
    content: [{
      type: 'p',
      content: [{
        type: 'text',
        text: '123'
      }]
    }, {
      type: 'div',
      content: [{
        type: 'text',
        text: '456'
      }]
    }]
  })
})

test('缺少结束标签 <p1>111<p2>222', () => {
  expect(parseHTML('<p1>111<p2>222').doc).toEqual({
    type: 'doc',
    content: [
      {
        type: 'p1',
        content: [{
          type: 'text',
          text: '111'
        },
        {
          type: 'p2',
          content: [{
            type: 'text',
            text: '222'
          }]
        }]
      }
    ]
  })
})

test('缺少开始标签 111</p1>222</p2>', () => {
  expect(parseHTML('111</p1>222</p2>').doc).toEqual({
    type: 'doc',
    content: [{
      type: 'text',
      text: '111222'
    }]
  })
})

test('嵌套标签 <p><span>123</span></p>', () => {
  expect(parseHTML('<p><span>123</span></p>').doc).toEqual({
    type: 'doc',
    content: [{
      type: 'p',
      content: [{
        type: 'span',
        content: [{
          type: 'text',
          text: '123'
        }]
      }]
    }]
  })
})


test('开始标签后面有换行 <p\n></p><div>123</div>', () => {
  expect(parseHTML('<p\n></p><div>123</div>').doc).toEqual({
    type: 'doc',
    content: [
      {
        type: 'p'
      },
      {
        type: 'div',
        content: [{
          type: 'text',
          text: '123'
        }]
      }
    ]
  })
})

test('开始标签前面有空格 < p></p><div>123</div>', () => {
  expect(parseHTML('< p></p><div>123</div>').doc).toEqual({
    type: 'doc',
    content: [
      {
        type: 'p'
      },
      {
        type: 'div',
        content: [{
          type: 'text',
          text: '123'
        }]
      }
    ]
  })
})

test('自闭合标签 <p>11<br>22</p>', () => {
  expect(parseHTML('<p>11<br>22</p>').doc).toEqual({
    type: 'doc',
    content: [
      {
        type: 'p',
        content: [
          {
            type: 'text',
            text: '11'
          },
          {
            type: 'br'
          },
          {
            type: 'text',
            text: '22'
          }
        ]
      }
    ]
  })
})

test('自闭合标签 <p>11<foo />22</p>', () => {
  expect(parseHTML('<p>11<foo />22</p>').doc).toEqual({
    type: 'doc',
    content: [
      {
        type: 'p',
        content: [
          {
            type: 'text',
            text: '11'
          },
          {
            type: 'foo'
          },
          {
            type: 'text',
            text: '22'
          }
        ]
      }
    ]
  })
})

test('自闭合标签 <p>11<foo/>22</p>', () => {
  expect(parseHTML('<p>11<foo/>22</p>').doc).toEqual({
    type: 'doc',
    content: [
      {
        type: 'p',
        content: [
          {
            type: 'text',
            text: '11'
          },
          {
            type: 'foo'
          },
          {
            type: 'text',
            text: '22'
          }
        ]
      }
    ]
  })
})

test('自闭合标签 <p>11<foo />22</p>', () => {
  expect(parseHTML('<p>11<foo />22</p>').doc).toEqual({
    type: 'doc',
    content: [
      {
        type: 'p',
        content: [
          {
            type: 'text',
            text: '11'
          },
          {
            type: 'foo'
          },
          {
            type: 'text',
            text: '22'
          }
        ]
      }
    ]
  })
})

// test('注释 <!-- comment -->', () => {
//   expect(parseHTML('<!-- comment -->').doc).toEqual({
//     type: 'doc',
//     content: []
//   })
// })

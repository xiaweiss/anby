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

test('多个标签 <p>11</p>  <p>22</p>', () => {
  expect(parseHTML('<p>11</p>  <p>22</p>').doc).toEqual({
    type: 'doc',
    content: [{
      type: 'p',
      content: [{
        type: 'text',
        text: '11'
      }]
    }, {
      type: 'text',
      text: '  '
    }, {
      type: 'p',
      content: [{
        type: 'text',
        text: '22'
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
    content: [{
      type: 'p'
    }, {
      type: 'div',
      content: [{
        type: 'text',
        text: '123'
      }]
    }]
  })
})

test('开始标签前面有空格 < p></p><div>123</div>', () => {
  expect(parseHTML('< p></p><div>123</div>').doc).toEqual({
    type: 'doc',
    content: [{
      type: 'p'
    },{
      type: 'div',
      content: [{
        type: 'text',
        text: '123'
      }]
    }]
  })
})

test('自闭合标签 <p>11<br>22</p>', () => {
  expect(parseHTML('<p>11<br>22</p>').doc).toEqual({
    type: 'doc',
    content: [{
      type: 'p',
      content: [{
        type: 'text',
        text: '11'
      }, {
        type: 'br'
      }, {
        type: 'text',
        text: '22'
      }]
    }]
  })
})

test('自闭合标签 <p>11<foo/>22</p>', () => {
  expect(parseHTML('<p>11<foo/>22</p>').doc).toEqual({
    type: 'doc',
    content: [{
      type: 'p',
      content: [{
        type: 'text',
        text: '11'
      }, {
        type: 'foo'
      }, {
        type: 'text',
        text: '22'
      }]
    }]
  })
})

test('自闭合标签 <p>11<foo />22</p>', () => {
  expect(parseHTML('<p>11<foo />22</p>').doc).toEqual({
    type: 'doc',
    content: [{
      type: 'p',
      content: [{
        type: 'text',
        text: '11'
      }, {
        type: 'foo'
      }, {
        type: 'text',
        text: '22'
      }]
    }]
  })
})

test('注释 <p><!-- comment -->123</p>', () => {
  expect(parseHTML('<p><!-- comment -->123</p>').doc).toEqual({
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

test('内容有 > 号 <p> 2 > 1 </p>', () => {
  expect(parseHTML('<p> 2 > 1 </p>').doc).toEqual({
    type: 'doc',
    content: [{
      type: 'p',
      content: [{
        type: 'text',
        text: ' 2 > 1 '
      }]
    }]
  })
})

test('内容有 < 号 <p> 1 < 2 </p>', () => {
  expect(parseHTML('<p> 1 < 2 </p>').doc).toEqual({
    type: 'doc',
    content: [{
      type: 'p',
      content: [{
        type: 'text',
        text: ' 1 < 2 '
      }]
    }]
  })
})

test('内容有 < 号 <p>1 < 2</p>', () => {
  expect(parseHTML('<p> 1 < 2 </p>').doc).toEqual({
    type: 'doc',
    content: [{
      type: 'p',
      content: [{
        type: 'text',
        text: ' 1 < 2 '
      }]
    }]
  })
})

test('标签带空格 <p >123</p>', () => {
  expect(parseHTML('<p >123</p>').doc).toEqual({
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

test('标签属性 <p aa bb>123</p>', () => {
  expect(parseHTML('<p aa bb>123</p>').doc).toEqual({
    type: 'doc',
    content: [{
      type: 'p',
      attrs: {
        aa: true,
        bb: true
      },
      content: [{
        type: 'text',
        text: '123'
      }]
    }]
  })
})

test('标签属性名 <p aa bb >123</p>', () => {
  expect(parseHTML('<p aa bb >123</p>').doc).toEqual({
    type: 'doc',
    content: [{
      type: 'p',
      attrs: {
        aa: true,
        bb: true
      },
      content: [{
        type: 'text',
        text: '123'
      }]
    }]
  })
})

test(`标签属性 <p aa="aa" bb='bb' cc=cc>123</p>`, () => {
  expect(parseHTML(`<p aa="aa" bb='bb' cc=cc>123</p>`).doc).toEqual({
    type: 'doc',
    content: [{
      type: 'p',
      attrs: {
        aa: 'aa',
        bb: 'bb',
        cc: 'cc'
      },
      content: [{
        type: 'text',
        text: '123'
      }]
    }]
  })
})

test(`标签属性 <p aa="aa" bb='bb' cc=cc >123</p>`, () => {
  expect(parseHTML(`<p aa="aa" bb='bb' cc=cc>123</p>`).doc).toEqual({
    type: 'doc',
    content: [{
      type: 'p',
      attrs: {
        aa: 'aa',
        bb: 'bb',
        cc: 'cc'
      },
      content: [{
        type: 'text',
        text: '123'
      }]
    }]
  })
})

test(`标签松散属性 <p aa = "aa"  bb = 'bb'  cc = cc >123</p>`, () => {
  expect(parseHTML(`<p aa="aa" bb='bb' cc=cc>123</p>`).doc).toEqual({
    type: 'doc',
    content: [{
      type: 'p',
      attrs: {
        aa: 'aa',
        bb: 'bb',
        cc: 'cc'
      },
      content: [{
        type: 'text',
        text: '123'
      }]
    }]
  })
})

test(`标签属性带尖括号 <p aa="1 < 2"  bb='1 > 2'>123</p>`, () => {
  expect(parseHTML(`<p aa="1 < 2" bb='1 > 2'>123</p>`).doc).toEqual({
    type: 'doc',
    content: [{
      type: 'p',
      attrs: {
        aa: '1 < 2',
        bb: '1 > 2'
      },
      content: [{
        type: 'text',
        text: '123'
      }]
    }]
  })
})

test(`标签属性带数字 <p a="123" b="-123' c='123.45' d='123.' e=".45">123</p>`, () => {
  expect(parseHTML(`<p a="123" b="-123" c='123.45' d='123.' e=".45" f="123 ">123</p>`).doc).toEqual({
    type: 'doc',
    content: [{
      type: 'p',
      attrs: {
        a: 123,
        b: -123,
        c: 123.45,
        d: '123.',
        e: '.45',
        f: 123
      },
      content: [{
        type: 'text',
        text: '123'
      }]
    }]
  })
})

test(`标签别名 <p>123</p>`, () => {
  expect(parseHTML('<p>123</p>', {alias: {p: 'paragraph'}}).doc).toEqual({
    type: 'doc',
    content: [{
      type: 'paragraph',
      content: [{
        type: 'text',
        text: '123'
      }]
    }]
  })
})

test(`父子关系指定标签别名 <audio><p>123</p></audio>`, () => {
  expect(parseHTML('<audio><p>123</p></audio>', {
    alias: {
      'audio > p': 'audioText'
    }
  }).doc).toEqual({
    type: 'doc',
    content: [{
      type: 'audio',
      content: [{
        type: 'audioText',
        content: [{
          type: 'text',
          text: '123'
        }]
      }]
    }]
  })
})

test(`自闭合标签 <p><note>123</p>`, () => {
  expect(parseHTML('<p><note>123</p>', {selfClose: ['note']}).doc).toEqual({
    type: 'doc',
    content: [{
      type: 'p',
      content: [{
        type: 'note',
      }, {
        type: 'text',
        text: '123'
      }]
    }]
  })
})

test(`自闭合标签别名 <p>11<br>22</p>`, () => {
  expect(parseHTML('<p>11<br>22</p>', {
    alias: {
      p: 'paragraph',
      br: 'headBreak'
    },
    selfClose: ['headBreak']
  }).doc).toEqual({
    type: 'doc',
    content: [{
      type: 'paragraph',
      content: [{
        type: 'text',
        text: '11'
      }, {
        type: 'headBreak'
      }, {
        type: 'text',
        text: '22'
      }]
    }]
  })
})

test(`简单 mark <p><strong>加粗</strong></p>`, () => {
  expect(parseHTML('<p><strong>加粗</strong></p>', {
    markRule: [{
      type: 'strong',
      mark: {type: 'bold'}
    }]
  }).doc).toEqual({
    type: 'doc',
    content: [{
      type: 'p',
      content: [{
        type: 'text',
        marks: [
          {type: 'bold'}
        ],
        text: '加粗'
      }]
    }]
  })
})

test(`不同种类的 mark <i>aa</i> <b>bb</b>cc`, () => {
  expect(parseHTML(`<i>aa</i> <b>bb</b>cc`, {
    markRule: [{
      type: 'i',
      mark: {type: 'italic'},
    },{
      type: 'b',
      mark: {type: 'bold'},
    }]
  }).doc).toEqual({
    type: 'doc',
    content: [{
      type: 'text',
      text: 'aa',
      marks: [{type: 'italic'}]
    },{
      type: 'text',
      text: ' ',
    },{
      type: 'text',
      text: 'bb',
      marks: [{type: 'bold'}]
    },{
      type: 'text',
      text: 'cc'
    }]
  })
})

test(`嵌套的 mark <i><b>斜体加粗</b></i>`, () => {
  expect(parseHTML('<i><b>斜体加粗</b></i>', {
    markRule: [{
      type: 'i',
      mark: {type: 'italic'},
    },{
      type: 'b',
      mark: {type: 'bold'},
    }]
  }).doc).toEqual({
    type: 'doc',
    content: [{
      type: 'text',
      text: '斜体加粗',
      marks: [
        {type: 'italic'},
        {type: 'bold'}
      ]
    }]
  })
})

test(`带属性的 mark <span type="highlight">高亮</span>`, () => {
  expect(parseHTML('<span type="highlight">高亮</span>', {
    markRule: [{
      type: 'span',
      attrs: {type: 'highlight'},
      mark: {type: 'highlight'}
    }]
  }).doc).toEqual({
    type: 'doc',
    content: [{
      type: 'text',
      text: '高亮',
      marks: [{
        type: 'highlight'
      }]
    }]
  })
})

test(`带属性的 mark <span type="highlight" color="pink" foo="11">高亮</span>`, () => {
  expect(parseHTML('<span type="highlight" color="pink" foo="11">高亮</span>', {
    markRule: [{
      type: 'span',
      attrs: {type: 'highlight'},
      mark: {type: 'highlight'}
    }]
  }).doc).toEqual({
    type: 'doc',
    content: [{
      type: 'text',
      text: '高亮',
      marks: [{
        type: 'highlight',
        attrs: {
          color: 'pink',
          foo: 11
        }
      }]
    }]
  })
})


test(`标签包裹的 mark <p>文字<span type="highlight">高亮</span></p>`, () => {
  expect(parseHTML('<p>文字<span type="highlight">高亮</span></p>', {
    markRule: [{
      type: 'span',
      attrs: {type: 'highlight'},
      mark: {type: 'highlight'}
    }]
  }).doc).toEqual({
    type: 'doc',
    content: [{
      type: 'p',
      content: [{
        type: 'text',
        text: '文字',
      }, {
        type: 'text',
        text: '高亮',
        marks: [{
          type: 'highlight'
        }]
      }]
    }]
  })
})

test(`多种规则对应用一个 mark <strong>aa</strong><b>bb</b>`, () => {
  expect(parseHTML('<strong>aa</strong><b>bb</b>', {
    markRule: [{
      type: 'strong',
      mark: {type: 'bold'}
    }, {
      type: 'b',
      mark: {type: 'bold'}
    }]
  }).doc).toEqual({
    type: 'doc',
    content: [{
      type: 'text',
      text: 'aabb',
      marks: [{type: 'bold'}]
    }]
  })
})


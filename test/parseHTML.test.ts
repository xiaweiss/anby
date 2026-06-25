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

test(`简单 mark JSON.stringify <p><strong>加粗</strong></p>`, () => {
  expect(JSON.stringify(parseHTML('<p><strong>加粗</strong></p>', {
    markRule: [{
      type: 'strong',
      mark: {type: 'bold'}
    }]
  }).doc)).toEqual(JSON.stringify({
    type: 'doc',
    content: [{
      type: 'p',
      content: [{
        type: 'text',
        marks: [
          {type: 'bold'}
        ],
        text: '加粗',
      }]
    }]
  }))
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
      marks: [{type: 'italic'}],
      text: 'aa'
    },{
      type: 'text',
      text: ' ',
    },{
      type: 'text',
      marks: [{type: 'bold'}],
      text: 'bb'
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
      marks: [
        {type: 'italic'},
        {type: 'bold'}
      ],
      text: '斜体加粗'
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
      marks: [{
        type: 'highlight'
      }],
      text: '高亮'
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
      marks: [{
        type: 'highlight',
        attrs: {
          color: 'pink',
          foo: 11
        }
      }],
      text: '高亮'
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
        marks: [{
          type: 'highlight'
        }],
        text: '高亮'
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
      marks: [{type: 'bold'}],
      text: 'aabb'
    }]
  })
})

test(`属性转数字 <img foo="123" alt="123" />`, () => {
  expect(parseHTML('<img foo="123" alt="123" />').doc).toEqual({
    type: 'doc',
    content: [{
      type: 'img',
      attrs: {
        foo: 123,
        alt: '123'
      }
    }]
  })
})

test(`节点覆盖规则 <p type="title">标题</p>`, () => {
  expect(parseHTML('<p type="title">标题</p>', {
    nodeRule: [{
      type: 'p',
      attrs: {type: 'title'},
      node: {type: 'title'}
    }]
  }).doc).toEqual({
    type: 'doc',
    content: [{
      type: 'title',
      content: [{
        type: 'text',
        text: '标题'
      }]
    }]
  })
})

test(`节点覆盖规则 <h1>标题1</h1>`, () => {
  expect(parseHTML('<h1>标题1</h1>', {
    nodeRule: [{
      type: 'h1',
      node: {
        type: 'heading',
        attrs: {
          level: 1
        }
      }
    }]
  }).doc).toEqual({
    type: 'doc',
    content: [{
      type: 'heading',
      attrs: {
        level: 1
      },
      content: [{
        type: 'text',
        text: '标题1'
      }]
    }]
  })
})

test(`别名+节点覆盖 <p type="title">标题</p><p>文字</p>`, () => {
  expect(parseHTML('<p type="title">标题</p><p>文字</p>', {
    alias: {
      'p': 'paragraph'
    },
    nodeRule: [{
      type: 'paragraph',
      attrs: {type: 'title'},
      node: {type: 'title'}
    }]
  }).doc).toEqual({
    type: 'doc',
    content: [{
      type: 'title',
      content: [{
        type: 'text',
        text: '标题'
      }]
    },{
      type: 'paragraph',
      content: [{
        type: 'text',
        text: '文字'
      }]
    }]
  })
})


/**
 * AI 补充的测试用例，用于提高测试覆盖率
 */


test(`标签属性无引号带空格 <p aa=123 bb=456>789</p>`, () => {
  expect(parseHTML(`<p aa=123 bb=456>789</p>`).doc).toEqual({
    type: 'doc',
    content: [{
      type: 'p',
      attrs: { aa: 123, bb: 456 },
      content: [{ type: 'text', text: '789' }]
    }]
  })
})

test(`标签名中间有 < 号 <p<2>`, () => {
  expect(parseHTML('<p<2>').doc).toEqual({
    type: 'doc',
    content: [{
      type: 'p<2'  // 会被当作标签名
    }]
  })
})

test(`带属性的 mark 结束，另一个无属性 mark 开始 <span type="highlight">高亮</span><i>斜体</i>`, () => {
  expect(parseHTML(`<span type="highlight">高亮</span><i>斜体</i>`, {
    markRule: [
      { type: 'span', attrs: { type: 'highlight' }, mark: { type: 'highlight' } },
      { type: 'i', mark: { type: 'italic' } }
    ]
  }).doc).toEqual({
    type: 'doc',
    content: [
      {
        type: 'text',
        marks: [{ type: 'highlight' }],
        text: '高亮'
      },
      {
        type: 'text',
        marks: [{ type: 'italic' }],
        text: '斜体'
      }
    ]
  })
})

// === 未覆盖分支补充 ===

test(`空输入 ''`, () => {
  expect(parseHTML('').doc).toEqual({ type: 'doc' })
})

test(`纯文本 'hello world'`, () => {
  expect(parseHTML('hello world').doc).toEqual({
    type: 'doc',
    content: [{ type: 'text', text: 'hello world' }]
  })
})

test(`InTagName 遇到 < 且 backwardTo 返回非零 x<p<y>`, () => {
  expect(parseHTML('x<p<y>').doc).toEqual({
    type: 'doc',
    content: [
      { type: 'text', text: 'x<p' },
      { type: 'y' }
    ]
  })
})

test(`BeforeAttrName 遇到 < 且 backwardTo 返回非零 <p aa <2>`, () => {
  expect(parseHTML('<p aa <2>').doc).toEqual({
    type: 'doc',
    content: [{
      type: 'p',
      attrs: { '2': true, aa: true }
    }]
  })
})

test(`BeforeAttrValue 遇到空格 <p aa= bb>text</p>`, () => {
  expect(parseHTML('<p aa= bb>text</p>').doc).toEqual({
    type: 'doc',
    content: [{
      type: 'p',
      attrs: { aa: 'bb' },
      content: [{ type: 'text', text: 'text' }]
    }]
  })
})

test(`InAttrValue 无引号值遇空格 <p aa=bb cc=dd>text</p>`, () => {
  expect(parseHTML('<p aa=bb cc=dd>text</p>').doc).toEqual({
    type: 'doc',
    content: [{
      type: 'p',
      attrs: { aa: 'bb', cc: 'dd' },
      content: [{ type: 'text', text: 'text' }]
    }]
  })
})

test(`finalize 时处于 InTagName 状态 <p`, () => {
  expect(parseHTML('<p').doc).toEqual({ type: 'doc' })
})

test(`finalize 时处于 InExclamation 状态 <!--`, () => {
  expect(parseHTML('<!--').doc).toEqual({ type: 'doc' })
})

test(`finalize 时处于 InClosingTagName 状态 </p`, () => {
  expect(parseHTML('</p').doc).toEqual({ type: 'doc' })
})

test(`HTML 实体 &amp; 在文本中 <p>foo &amp; bar</p>`, () => {
  expect(parseHTML('<p>foo &amp; bar</p>').doc).toEqual({
    type: 'doc',
    content: [{
      type: 'p',
      content: [{ type: 'text', text: 'foo & bar' }]
    }]
  })
})

test(`HTML 实体 &amp; 在属性值中 <p title="a &amp; b">text</p>`, () => {
  expect(parseHTML('<p title="a &amp; b">text</p>').doc).toEqual({
    type: 'doc',
    content: [{
      type: 'p',
      attrs: { title: 'a & b' },
      content: [{ type: 'text', text: 'text' }]
    }]
  })
})

test(`isAttrsInclude 规则属性多于标签属性时不匹配 <p a=1>text</p>`, () => {
  expect(parseHTML('<p a=1>text</p>', {
    nodeRule: [{ type: 'p', attrs: { a: 1, b: 2 }, node: { type: 'x' } }]
  }).doc).toEqual({
    type: 'doc',
    content: [{
      type: 'p',
      attrs: { a: 1 },
      content: [{ type: 'text', text: 'text' }]
    }]
  })
})

test(`isAttrsEqual 一方有 attrs 一方无 <span type=highlight color=pink>aa</span><span type=highlight>bb</span>`, () => {
  expect(parseHTML('<span type="highlight" color="pink">aa</span><span type="highlight">bb</span>', {
    markRule: [{ type: 'span', attrs: { type: 'highlight' }, mark: { type: 'highlight' } }]
  }).doc).toEqual({
    type: 'doc',
    content: [
      { type: 'text', marks: [{ type: 'highlight', attrs: { color: 'pink' } }], text: 'aa' },
      { type: 'text', marks: [{ type: 'highlight' }], text: 'bb' }
    ]
  })
})

test(`isAttrsEqual 属性数量不同 <span type=highlight color=pink size=big>aa</span><span type=highlight color=pink>bb</span>`, () => {
  expect(parseHTML('<span type="highlight" color="pink" size="big">aa</span><span type="highlight" color="pink">bb</span>', {
    markRule: [{ type: 'span', attrs: { type: 'highlight' }, mark: { type: 'highlight' } }]
  }).doc).toEqual({
    type: 'doc',
    content: [
      { type: 'text', marks: [{ type: 'highlight', attrs: { color: 'pink', size: 'big' } }], text: 'aa' },
      { type: 'text', marks: [{ type: 'highlight', attrs: { color: 'pink' } }], text: 'bb' }
    ]
  })
})

test(`相邻无 marks 文本节点合并 <p>aa<!-- -->bb</p>`, () => {
  expect(parseHTML('<p>aa<!-- -->bb</p>').doc).toEqual({
    type: 'doc',
    content: [{
      type: 'p',
      content: [{ type: 'text', text: 'aabb' }]
    }]
  })
})

test(`自闭合标签带属性 <br class="foo"/>`, () => {
  expect(parseHTML('<br class="foo"/>').doc).toEqual({
    type: 'doc',
    content: [{ type: 'br', attrs: { class: 'foo' } }]
  })
})

test(`自定义 selfClose 带属性 <note type="info">text`, () => {
  expect(parseHTML('<note type="info">text', {
    selfClose: ['note']
  }).doc).toEqual({
    type: 'doc',
    content: [
      { type: 'note', attrs: { type: 'info' } },
      { type: 'text', text: 'text' }
    ]
  })
})

test(`isAttrsEqual 属性相同且值相同，文本合并 <span color=pink>aa</span><span color=pink>bb</span>`, () => {
  expect(parseHTML('<span type="highlight" color="pink">aa</span><span type="highlight" color="pink">bb</span>', {
    markRule: [{ type: 'span', attrs: { type: 'highlight' }, mark: { type: 'highlight' } }]
  }).doc).toEqual({
    type: 'doc',
    content: [{
      type: 'text',
      marks: [{ type: 'highlight', attrs: { color: 'pink' } }],
      text: 'aabb'
    }]
  })
})

test(`isAttrsEqual 属性相同但值不同，文本不合并 <span color=pink>aa</span><span color=blue>bb</span>`, () => {
  expect(parseHTML('<span type="highlight" color="pink">aa</span><span type="highlight" color="blue">bb</span>', {
    markRule: [{ type: 'span', attrs: { type: 'highlight' }, mark: { type: 'highlight' } }]
  }).doc).toEqual({
    type: 'doc',
    content: [
      { type: 'text', marks: [{ type: 'highlight', attrs: { color: 'pink' } }], text: 'aa' },
      { type: 'text', marks: [{ type: 'highlight', attrs: { color: 'blue' } }], text: 'bb' }
    ]
  })
})

test(`多余的结束标签导致栈空，后续文本被丢弃 <p></p></p>text`, () => {
  expect(parseHTML('<p></p></p>text').doc).toEqual({
    type: 'doc',
    content: [{ type: 'p' }]
  })
})

test(`isMarksEqual marks 数量不同且非零 <b>aa</b><i><b>bb</b></i>`, () => {
  expect(parseHTML('<b>aa</b><i><b>bb</b></i>', {
    markRule: [{ type: 'b', mark: { type: 'bold' } }, { type: 'i', mark: { type: 'italic' } }]
  }).doc).toEqual({
    type: 'doc',
    content: [
      { type: 'text', marks: [{ type: 'bold' }], text: 'aa' },
      { type: 'text', marks: [{ type: 'italic' }, { type: 'bold' }], text: 'bb' }
    ]
  })
})

# Anby
![license](https://img.shields.io/npm/l/anby)
![downloads](https://img.shields.io/npm/dt/anby)
![npm](https://img.shields.io/npm/v/anby)

安装 `pnpm install anby`

## parseHTML

基于状态机实现的 html 宽松解析器，转换为 js 对象，方便做富文本渲染。

```javascript
import { parseHTML } from 'anby'

parseHTML('<p>123</p>').doc

// result
{
  type: 'doc',
  content: [{
    type: 'p',
    content: [{
      type: 'text',
      text: '123'
    }]
  }]
}
```

### 配置项

#### alias
标签别名，用于更改 tag 名称

```js
parseHTML('<p>123</p>', {
  alias: {
    p: 'paragraph'
  }
}).doc

// result
{
  type: 'doc',
  content: [{
    type: 'paragraph',
    content: [{
      type: 'text',
      text: '123'
    }]
  }]
}
```

也可以根据父子关系修改，如 `'audio > p'`

```js
parseHTML('<audio><p>123</p></audio>', {
  alias: {
    'audio > p': 'audioText'
  }
}).doc

// result
{
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
}
```

#### markRule
节点解析为编辑器 marks。类似 tiptap 的 mark 规则，将包裹修饰的标签，转换为 marks 属性

```js
parseHTML('<p><strong>加粗</strong></p>', {
    markRule: [{
      type: 'strong',
      mark: {type: 'bold'}
    }]
  }).doc

// result
{
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
}
```

#### selfClose
自定义自闭合标签

常见的自闭合标签库已处理，可以额外指定自闭合标签

注意：如果标签自带反斜杠，则无需配置，例如 `<note />`

```js
parseHTML('<p><note>123</p>', {
  selfClose: ['note']
}).doc

{
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
}
```

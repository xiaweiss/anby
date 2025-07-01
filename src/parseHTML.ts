interface Node {
  type: string
  content?: Node[]
  text?: string
  attrs?: Record<string, string | number | boolean>
  marks?: Mark[]
}

interface Mark {
  type: string
}

interface MarkRule extends Node {
  mark: Mark
}

interface Data {
  input: string
  config: ParseHTMLConfig

  // state
  state: typeof State[keyof typeof State]
  code: number
  char: string
  tag: Node | null
  attrName: string
  attrQuote: number
  marks: Mark[] | null

  // pos
  index: number
  start: number
  end: number

  // json
  stack: Node[]
  doc: Node
}

export interface ParseHTMLConfig {
  /** 标签别名 */
  alias?: Record<string, string>
  /** 自闭合标签 */
  selfClose?: string[]
  /** 节点解析为编辑器 marks */
  markRule?: MarkRule[]
}


const State = {
  Text: 'Text',

  // tag
  BeforeTagName: 'BeforeTagName',
  InTagName: 'InTagName',
  BeforeClosingTagName: 'BeforeClosingTagName',
  InClosingTagName: 'InClosingTagName',
  InExclamation: 'InExclamation',

  // attr
  BeforeAttrName: 'BeforeAttrName',
  InAttrName: 'InAttrName',
  BeforeAttrValue: 'BeforeAttrValue',
  InAttrValue: 'InAttrValue'
}

const CharCodes = {
  // tag wrapper
  Lt:  0x3c, // "<"
  Slash: 0x2f, // "/"
  Gt: 0x3e, // ">"
  Exclamation: 0x21, // "!"

  // attr
  Eq: 0x3d, // "="
  DoubleQuote: 0x22, // '"'
  SingleQuote: 0x27, // "'"

  // whitespace
  Space: 0x20, // " "
  Tab: 0x9, // "\t"
  NewLine: 0xa, // "\n"
  CarriageReturn: 0xd, // "\r"
  FormFeed: 0xc, // "\f"
  VerticalTab: 0xb, // "\v"
}

export const SelfClosingTags: Record<string, boolean> = {
  'area': true,
  'base': true,
  'br': true,
  'col': true,
  'embed': true,
  'hr': true,
  'img': true,
  'input': true,
  'link': true,
  'meta': true,
  'param': true,
  'source': true,
  'track': true,
  'wbr': true
}

/**
 * @see https://wx7vyvopbx.feishu.cn/docx/ST7add9rtohkcVxz11gcUFvxnUh
 */
export const parseHTML = (input: string, config: ParseHTMLConfig = {}) => {
  const d: Data = reset()
  d.input = input
  d.config = config

  while (d.index < d.input.length) {
    d.code = d.input.charCodeAt(d.index)
    d.char = d.input[d.index]

    switch (d.state) {
      case State.Text: {
        stateText(d)
        break
      }
      case State.BeforeTagName: {
        stateBeforeTagName(d)
        break
      }
      case State.InTagName: {
        stateInTagName(d)
        break
      }
      case State.BeforeClosingTagName: {
        stateBeforeClosingTagName(d)
        break
      }
      case State.InClosingTagName: {
        stateInClosingTagName(d)
        break
      }
      case State.BeforeAttrName: {
        stateBeforeAttrName(d)
        break
      }
      case State.InAttrName: {
        stateInAttrName(d)
        break
      }
      case State.BeforeAttrValue: {
        stateBeforeAttrValue(d)
        break
      }
      case State.InAttrValue: {
        stateInAttrValue(d)
        break
      }
      case State.InExclamation: {
        stateInExclamation(d)
        break
      }
    }

    d.index += 1
  }

  finalize(d)

  return d
}

const reset = () : Data => {
  const doc = {type: 'doc'}
  return {
    input: '',
    config: {},

    // state
    state: State.Text,
    code: 0,
    char: '',
    tag: null,
    attrName: '',
    attrQuote: 0,
    marks: null,

    // pos
    index: 0,
    start: 0,
    end: 0,

    // json
    stack: [doc],
    doc
  }
}

const stateText = (d: Data) => {
  if (d.code === CharCodes.Lt) {
    elementText(d)

    d.state = State.BeforeTagName
    d.start = d.index
  }
}

const stateBeforeTagName = (d: Data) => {
  if (d.code === CharCodes.Slash) {
    d.state = State.BeforeClosingTagName

  // 注释 or 条件注释 or doctype
  } else if (d.code === CharCodes.Exclamation) {
    d.state = State.InExclamation
    d.start = d.index - 1

  } else if (!isWhitespace(d.code)) {
    d.state = State.InTagName
    d.start = d.index
  }
}

const stateInTagName = (d: Data) => {
  // 不带属性的标签
  if (d.code === CharCodes.Gt) {
    tagName(d)
    elementStart(d, true)

    d.state = State.Text
    d.start = d.index + 1

  // 自闭合标签
  } else if (d.code === CharCodes.Slash) {
    tagName(d)
    elementStart(d)

    d.state = State.InClosingTagName

  // 前面 content 内有 < 号（如 <p> 1 < 2 </p>）
  } else if (d.code === CharCodes.Lt) {
    const index = backwardTo(d, CharCodes.Lt)

    if (index) {
      d.start = index
      stateText(d)
    }

  // 可能带属性的标签
  } else if (isWhitespace(d.code)) {
    tagName(d)
    d.state = State.BeforeAttrName
    d.start = d.index + 1
  }
}

const stateBeforeClosingTagName = (d: Data) => {
  d.state = State.InClosingTagName
  d.start = d.index
}

const stateInClosingTagName = (d: Data) => {
  if (d.code === CharCodes.Gt) {
    elementEnd(d)

    d.state = State.Text
    d.start = d.index + 1
  }
}

const stateBeforeAttrName = (d: Data) => {
  // 标签结束
  if (d.code === CharCodes.Gt) {
    elementStart(d, true)
    d.state = State.Text
    d.start = d.index + 1

  // 自闭合标签
  } else if (d.code === CharCodes.Slash) {
    elementStart(d)
    d.state = State.InClosingTagName

  // 前面 content 内有 < 号（如 <p> 1 < 2 </p>）
  } else if (d.code === CharCodes.Lt) {
    const index = backwardTo(d, CharCodes.Lt)

    if (index) {
      d.start = index
      stateText(d)
    }

  } else if (!isWhitespace(d.code)) {
    d.state = State.InAttrName
    d.start = d.index
  }
}

const stateInAttrName = (d: Data) => {
  if (d.code === CharCodes.Gt) {
    attrName(d)
    elementStart(d, true)

    d.state = State.Text
    d.start = d.index + 1

  } else if (d.code === CharCodes.Eq) {
    attrName(d)
    d.state = State.BeforeAttrValue
    d.start = d.index + 1

  } else if (isWhitespace(d.code)) {
    attrName(d)
    d.state = State.BeforeAttrName
    d.start = d.index + 1
  }
}

const stateBeforeAttrValue = (d: Data) => {
  // 引号
  if (d.code === CharCodes.DoubleQuote || d.code === CharCodes.SingleQuote) {
    d.attrQuote = d.code
    d.state = State.InAttrValue
    d.start = d.index + 1

  // 无引号
  } else if (!isWhitespace(d.code)) {
    d.attrQuote = 0
    d.state = State.InAttrValue
    d.start = d.index
  }
}

const stateInAttrValue = (d: Data) => {
  // 有引号时，直接去找对应的结尾引号
  if (d.attrQuote) {
    if (d.code === d.attrQuote) {
      attrValue(d)

      d.state = State.BeforeAttrName
      d.start = d.index + 1
    }

  } else if (d.code === CharCodes.Gt) {
    attrValue(d)
    elementStart(d, true)

    d.state = State.Text
    d.start = d.index + 1

  } else if (isWhitespace(d.code)) {
    attrValue(d)

    d.state = State.BeforeAttrName
    d.start = d.index + 1
  }
}

const stateInExclamation = (d: Data) => {
  if (d.code === CharCodes.Gt) {
    // 这里的内容不会被解析，跳过
    d.state = State.Text
    d.start = d.index + 1
  }
}

const finalize = (d: Data) => {
  if (d.state === State.Text) {
    elementText(d)
  }
}

const isWhitespace = (c: number): boolean => {
    return (
      c === CharCodes.Space ||
      c === CharCodes.Tab ||
      c === CharCodes.NewLine ||
      c === CharCodes.CarriageReturn ||
      c === CharCodes.FormFeed ||
      c === CharCodes.VerticalTab
    )
}

const backwardTo = (d: Data, c: number) => {
  let index = d.index

  while (index > 0) {
    index -= 1
    if (d.input.charCodeAt(index) === c) break
  }

  return index
}

const tagName = (d: Data) => {
  let tagName = d.input.slice(d.start, d.index).toLowerCase().trim().replace(/\/$/, '')

  // 别名
  if (d.config.alias && d.config.alias[tagName]) {
    tagName = d.config.alias[tagName]
  }

  d.tag = {type: tagName}
}

const attrName = (d: Data) => {
  // 属性名转为小写
  const attrName = d.input.slice(d.start, d.index).toLowerCase().trim()
  if (!d.tag!.attrs) d.tag!.attrs = {}
  d.tag!.attrs[attrName] = true // 默认值为 true
  d.attrName = attrName
}

const attrValue = (d: Data) => {
  const attrValue = d.input.slice(d.start, d.index)
  d.tag!.attrs![d.attrName] = attrValue
}

const elementStart = (d: Data, gt?: boolean) => {
  // parent node
  const node = d.stack[d.stack.length - 1]

  if (d.tag) {
    // 匹配出 type 和 attrs 都符合的 mark
    if (d.config.markRule) {
      const marks = d.config.markRule.filter(rule => rule.type === d.tag!.type && Object.keys(rule.attrs || {}).every(key => rule.attrs![key] === d.tag!.attrs?.[key]))
      if (marks && marks.length) d.marks = marks.map(rule => rule.mark)
      else d.marks = null
    }

    if (d.marks) {
      console.log('====elementStart with marks', d.tag, d.marks)

    } else {
      if (!node.content) node.content = []
      node.content.push(d.tag)
      d.stack.push(d.tag)
    }
  }


  // console.log('====elementStart', d.tag)

  if (gt && d.tag && (SelfClosingTags[d.tag.type] || d.config.selfClose?.includes(d.tag.type))) {
    elementEnd(d)
  }
}

const elementEnd = (d: Data) => {
  console.log('====elementEnd', d.tag)
  if (d.tag) {
    if (d.marks) {
      d.marks = null
    } else {
      d.stack.pop()
    }
  }
}

const elementText = (d: Data) => {
  if (d.index > d.start) {
    const text = d.input.slice(d.start, d.index)

    console.log('====elementText', text)

    const parentNode = d.stack[d.stack.length - 1]
    if (parentNode) {
      if (!parentNode.content) parentNode.content = []
      const lastChild = parentNode.content[parentNode.content.length - 1]

      if (d.marks) {
        parentNode.content.push({type: 'text', text, marks: d.marks})
      } else if (lastChild?.type === 'text') {
        lastChild.text += text
      } else {
        parentNode.content.push({type: 'text', text})
      }
    }
  }
}

setTimeout(() => {
  // const d = parseHTML(`<p>11<br>22</p>`, {alias: {p: 'paragraph', br: 'hardBreak'}, selfClose: ['hardBreak']})
  // const d = parseHTML(`<p><note uuid="123">1111</p>`, {selfClose: ['note']})
  // const d = parseHTML(`<p>文字<span type="highlight">高亮</span><strong>加粗</strong></p><p>文字同时<span type="highlight"><strong>高亮加粗</strong></span></p><p></p>`, {
  //   alias: {
  //     p: 'paragraph',
  //     br: 'hardBreak',
  //   },
  //   selfClose: ['hardBreak'],
  //   marks: {
  //     bold: [{
  //       type: 'strong'
  //     }],
  //     highlight: [{
  //       type: 'span',
  //       attrs: {type: 'highlight'}
  //     }]
  //   }
  // })

  // todo: 看下 mark 的 attrs 如何处理？
  // todo: 看下 mark 的嵌套情况 如何处理？

  const d = parseHTML(`<p>文字<strong>加粗</strong></p>`, {
  // const d = parseHTML(`<p>文字<strong>加粗</strong>`, {
    markRule: [{
      type: 'strong',
      mark: {type: 'bold'},
    }]
  })

  console.log(d.state)
  console.log(d.start, d.index)
  console.log(d.input.slice(d.start, d.index))
  console.log(d.tag)
  console.log(d.stack[d.stack.length - 1])
  console.log(d.doc)

  // console.log(JSON.stringify(d.doc))
})

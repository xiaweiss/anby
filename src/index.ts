interface Node {
  type: string
  content?: Node[]
  text?: string
  attrs?: Record<string, string | number | boolean>
  marks?: {type: string}[]
}

type Data = {
  input: string

  // state
  state: typeof State[keyof typeof State]
  code: number
  char: string
  tag: Node | null
  attrQuote: number

  // pos
  index: number
  start: number
  end: number

  // json
  stack: Node[]
  doc: Node
}

const State = {
  Text: 'Text',

  // tag
  BeforeTagName: 'BeforeTagName',
  InTagName: 'InTagName',
  BeforeClosingTagName: 'BeforeClosingTagName',
  InClosingTagName: 'InClosingTagName',

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
export const parseHTML = (input: string) => {
  const d: Data = reset()
  d.input = input

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

    // state
    state: State.Text,
    code: 0,
    char: '',
    tag: null,
    attrQuote: 0,

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
  if (d.code === CharCodes.Eq) {
    attrName(d)
    d.state = State.BeforeAttrValue
    d.start = d.index + 1

  } else if (d.code === CharCodes.Gt) {
    attrName(d)
    elementStart(d, true)
    if (d.tag && SelfClosingTags[d.tag.type]) elementEnd(d)

    d.state = State.Text
    d.start = d.index + 1


  } else if (isWhitespace(d.code)) {
    attrName(d)
    d.state = State.BeforeAttrName
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
  const tagName = d.input.slice(d.start, d.index).toLowerCase().trim().replace(/\/$/, '')
  const isComment = tagName.startsWith('!--') && tagName.endsWith('--')

  if (isComment) {
    d.tag = null
    return
  }

  d.tag = {type: tagName}
}

const attrName = (d: Data) => {
  if (d.tag) {
    // 属性名转为小写
    const attrName = d.input.slice(d.start, d.index).toLowerCase().trim()
    if (!d.tag.attrs) d.tag.attrs = {}
    d.tag.attrs[attrName] = true // 默认值为 true
  }
}

const elementStart = (d: Data, gt?: boolean) => {
  // parent node
  const node = d.stack[d.stack.length - 1]

  if (d.tag) {
    if (!node.content) node.content = []
    node.content.push(d.tag)
    d.stack.push(d.tag)
  }


  // console.log('====elementStart', d.tag)

  if (gt && d.tag && SelfClosingTags[d.tag.type]) {
    elementEnd(d)
  }
}

const elementEnd = (d: Data) => {
  // console.log('====elementEnd', d.tag)
  if (d.tag) d.stack.pop()
}

const elementText = (d: Data) => {
  if (d.index > d.start) {
    const text = d.input.slice(d.start, d.index)

    // console.log('====elementText', text)

    const parentNode = d.stack[d.stack.length - 1]
    if (parentNode) {
      if (!parentNode.content) parentNode.content = []
      const lastChild = parentNode.content[parentNode.content.length - 1]

      if (lastChild?.type === 'text') {
        lastChild.text += text
      } else {
        parentNode.content.push({type: 'text', text})
      }
    }
  }
}

setTimeout(() => {
  const d = parseHTML(`<p aa bb >123</p>`)
  // const d = parseHTML(`<p aa="aa" bb='bb' cc=cc>123</p>`)

  console.log(d.state)
  console.log(d.start, d.index)
  console.log(d.input.slice(d.start, d.index))
  console.log(d.tag)
  console.log(d.stack[d.stack.length - 1])
  console.log(d.doc)
})


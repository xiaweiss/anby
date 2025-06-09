type Data = {
  input: string
  code: number
  char: string

  // state
  state: typeof State[keyof typeof State]

  // pos
  index: number
  start: number
  end: number

  // json
  stack: any[]
  doc: any
}

const State = {
  Text: 'Text',
  BeforeTagName: 'BeforeTagName',
  InTagName: 'InTagName',
  BeforeAttributeName: 'BeforeAttributeName',
  InAttributeName: 'InAttributeName',
  BeforeClosingTagName: 'BeforeClosingTagName',
  InClosingTagName: 'InClosingTagName',
  AfterClosingTagName: 'AfterClosingTagName',
}

const CharCodes = {
  Lt:  0x3c, // "<"
  LowerA: 0x61, // "a"
  LowerZ: 0x7a, // "z"
  UpperA: 0x41, // "A"
  UpperZ: 0x5a, // "Z"
  Slash: 0x2f, // "/"
  Gt: 0x3e, // ">"
  Space: 0x20, // " "
  NewLine: 0xa, // "\n"
  Tab: 0x9, // "\t"
  FormFeed: 0xc, // "\f"
  CarriageReturn: 0xd, // "\r"
}

export const parseHTML = (input: string) => {
  const d: Data = reset()
  d.input = input

  while (d.index < d.input.length) {
    d.code = d.input.charCodeAt(d.index)
    d.char = d.input[d.index]

    console.log(d)

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
    }

    d.index += 1
  }

  finalize(d)

  console.log(d.state)
  console.log(d.start, d.index)
  console.log(d.input.slice(d.start, d.index))
  console.log(d.doc)

  return d.doc
}

// setTimeout(() => {
//   parseHTML('<p>123</p>')
// })

const reset = () : Data => {
  const doc = {type: 'doc', content: []}
  return {
    input: '',
    state: State.Text,
    index: 0,
    start: 0,
    end: 0,
    code: 0,
    char: '',
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
  } else {
    d.state = State.InTagName
    d.start = d.index
  }
}

const stateInTagName = (d: Data) => {
  if (isEndOfTagSection(d.code)) {
    elementStart(d)

    d.state = State.Text
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
  }
}

const finalize = (d: Data) => {
  if (d.state === State.Text) {
    elementText(d)
  }
}


const elementStart = (d: Data) => {
  const tagName = d.input.slice(d.start, d.index).toLowerCase()
  const item = {type: tagName, content: []}
  const parentNode = d.stack[d.stack.length - 1]
  parentNode.content.push(item)
  d.stack.push(item)
  console.log('====elementStart', item)
}

const elementEnd = (d: Data) => {
  console.log('====elementEnd')
  d.stack.pop()
}

const elementText = (d: Data) => {
  if (d.index > d.start) {
    const text = d.input.slice(d.start, d.index)

    console.log('====onText', text)

    const parentNode = d.stack[d.stack.length - 1]
    if (parentNode) {
      const lastChild = parentNode.content[parentNode.content.length - 1]

      if (lastChild?.type === 'text') {
        lastChild.text += text
      } else {
        parentNode.content.push({type: 'text', text})
      }
    }
  }
}


const isTagStartChar = (c: number): boolean => {
  return (c >= CharCodes.LowerA && c <= CharCodes.LowerZ) || (c >= CharCodes.UpperA && c <= CharCodes.UpperZ)
}

const isEndOfTagSection = (c: number): boolean => {
    return c === CharCodes.Slash || c === CharCodes.Gt || isWhitespace(c);
}

const isWhitespace = (c: number): boolean => {
    return (
        c === CharCodes.Space ||
        c === CharCodes.NewLine ||
        c === CharCodes.Tab ||
        c === CharCodes.FormFeed ||
        c === CharCodes.CarriageReturn
    )
}


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

export const parse = (input: string): string => {
  let stack: string[] = []
  let index = 0
  let state = State.Text
  let sectionStart = 0
  let openTagStart = 0
  let tagname = ''
  let startIndex = 0;
  let endIndex = 0;

  const stateText = (c: number): void => {
    if (c === CharCodes.Lt) {

      if (index > startIndex) {
        console.log('on_text', sectionStart, index)
      }

      state = State.BeforeTagName
      sectionStart = index
    }
  }

  const stateBeforeTagName = (c: number): void => {
    if (isTagStartChar(c)) {
      const lower = c | 0x20
      sectionStart = index
      state = State.InTagName

    } else if (c === CharCodes.Slash) {
      state = State.BeforeClosingTagName
    }
  }

  const stateBeforeClosingTagName = (c: number): void => {
    state = State.InClosingTagName
    sectionStart = index
  }

  const stateBeforeAttributeName = (c: number): void => {
    if (c === CharCodes.Gt) {
      console.log('on_open_tag_end', index)

      // todo: 忽略特殊标签

      state = State.Text
      sectionStart = index + 1

    } else if (c === CharCodes.Slash) {

    } else if (!isWhitespace(c)) {

    }
  }

  const stateAfterClosingTagName = (c: number): void => {
    if (c === CharCodes.Gt) {
      console.log('on_close_tag_end', index)

      state = State.Text
      sectionStart = index + 1
    }
  }

  const stateInTagName = (c: number): void => {
    if (isEndOfTagSection(c)) {
      // on open tag name
      console.log('on_open_tag_name', sectionStart, index)

      tagname = input.slice(sectionStart, index).toLowerCase()
      openTagStart = 0

      // todo: 隐式关闭
      // todo: 自闭合标签

      stack.unshift(tagname)

      sectionStart = -1
      state = State.BeforeAttributeName
      stateBeforeAttributeName(c)
    }
  }

  const stateInClosingTagName = (c: number): void => {
    if (c === CharCodes.Gt || isWhitespace(c)) {
      console.log('on_close_tag', sectionStart, index)
      sectionStart = -1
      state = State.AfterClosingTagName
      stateAfterClosingTagName(c)
    }
  }

  console.log('parse', input)

  while (index < input.length) {
    const char = input[index]
    const c = input.charCodeAt(index)

    console.log('char', index, char, c)

    switch (state) {
      case State.Text: {
        stateText(c)
        break
      }
      case State.BeforeTagName: {
        stateBeforeTagName(c)
        break
      }
      case State.InTagName: {
        stateInTagName(c)
        break
      }
      case State.BeforeClosingTagName: {
        stateBeforeClosingTagName(c)
        break
      }
      case State.InClosingTagName: {
        stateInClosingTagName(c)
        break
      }
    }

    index += 1
  }

  return input.toLocaleUpperCase();
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
    );
}


// const data1 = `<p>123</p>`

// const result = parse(data1) // {type: 'paragraph', content: [{type: 'text', text: '123'}]}

// console.log(result)



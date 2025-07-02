import { getDecoder } from './getDecoder'
import { htmlDecodeTree } from './htmlDecodeTree'

export const htmlDecoder = /* #__PURE__ */ getDecoder(htmlDecodeTree);

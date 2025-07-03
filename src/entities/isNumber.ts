import { CharCodes } from './CharCodes'

export function isNumber(code: number): boolean {
  return code >= CharCodes.ZERO && code <= CharCodes.NINE;
}

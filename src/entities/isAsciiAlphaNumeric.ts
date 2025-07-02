import { CharCodes } from './CharCodes'
import { isNumber } from './isNumber'

export function isAsciiAlphaNumeric(code: number): boolean {
  return (
      (code >= CharCodes.UPPER_A && code <= CharCodes.UPPER_Z) ||
      (code >= CharCodes.LOWER_A && code <= CharCodes.LOWER_Z) ||
      isNumber(code)
  );
}

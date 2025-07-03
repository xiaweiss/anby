import { CharCodes } from './CharCodes'

export function isHexadecimalCharacter(code: number): boolean {
  return (
    (code >= CharCodes.UPPER_A && code <= CharCodes.UPPER_F) ||
    (code >= CharCodes.LOWER_A && code <= CharCodes.LOWER_F)
  );
}

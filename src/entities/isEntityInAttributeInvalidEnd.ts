import { CharCodes } from './CharCodes'
import { isAsciiAlphaNumeric } from './isAsciiAlphaNumeric'

/**
 * Checks if the given character is a valid end character for an entity in an attribute.
 *
 * Attribute values that aren't terminated properly aren't parsed, and shouldn't lead to a parser error.
 * See the example in https://html.spec.whatwg.org/multipage/parsing.html#named-character-reference-state
 */
export function isEntityInAttributeInvalidEnd(code: number): boolean {
  return code === CharCodes.EQUALS || isAsciiAlphaNumeric(code);
}

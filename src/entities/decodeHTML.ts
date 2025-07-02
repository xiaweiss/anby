import { DecodingMode } from './DecodingMode'
import { htmlDecoder } from './htmlDecoder'

/**
 * Decodes an HTML string.
 *
 * @param htmlString The string to decode.
 * @param mode The decoding mode.
 * @returns The decoded string.
 */
export function decodeHTML(
    htmlString: string,
    mode: DecodingMode = DecodingMode.Legacy,
): string {
    return htmlDecoder(htmlString, mode);
}

import { BinTrieFlags } from './BinTrieFlags'
import { CharCodes } from './CharCodes'
import { DecodingMode } from './DecodingMode'
import { determineBranch } from './determineBranch'
import { isEntityInAttributeInvalidEnd } from './isEntityInAttributeInvalidEnd'
import { isHexadecimalCharacter } from './isHexadecimalCharacter'
import { isNumber } from './isNumber'
import { replaceCodePoint } from './replaceCodePoint'

interface EntityErrorProducer {
  missingSemicolonAfterCharacterReference(): void;
  absenceOfDigitsInNumericCharacterReference(
    consumedCharacters: number,
  ): void;
  validateNumericCharacterReference(code: number): void;
}

type EntityDecoderState = typeof EntityDecoderState[keyof typeof EntityDecoderState]

const EntityDecoderState = {
  EntityStart: 0,
  NumericStart: 1,
  NumericDecimal: 2,
  NumericHex: 3,
  NamedEntity: 4,
} as const

/** Bit that needs to be set to convert an upper case ASCII character to lower case */
const TO_LOWER_BIT = 0b10_0000;

/**
 * Token decoder with support of writing partial entities.
 */
export class EntityDecoder {
  private decodeTree: Uint16Array;
  private emitCodePoint: (cp: number, consumed: number) => void;
  private errors?: EntityErrorProducer | undefined;

  constructor(
    decodeTree: Uint16Array,
    emitCodePoint: (cp: number, consumed: number) => void,
    errors?: EntityErrorProducer | undefined,
  ) {
    this.decodeTree = decodeTree;
    this.emitCodePoint = emitCodePoint;
    this.errors = errors;
  }

  private state: EntityDecoderState = EntityDecoderState.EntityStart;
  private consumed = 1;
  private result = 0;
  private treeIndex = 0;
  private excess = 1;
  private decodeMode: DecodingMode = DecodingMode.Strict;

  startEntity(decodeMode: DecodingMode): void {
    this.decodeMode = decodeMode;
    this.state = EntityDecoderState.EntityStart;
    this.result = 0;
    this.treeIndex = 0;
    this.excess = 1;
    this.consumed = 1;
  }

  write(input: string, offset: number): number {
    switch (this.state) {
      case EntityDecoderState.EntityStart: {
        if (input.charCodeAt(offset) === CharCodes.NUM) {
          this.state = EntityDecoderState.NumericStart;
          this.consumed += 1;
          return this.stateNumericStart(input, offset + 1);
        }
        this.state = EntityDecoderState.NamedEntity;
        return this.stateNamedEntity(input, offset);
      }

      case EntityDecoderState.NumericStart: {
        return this.stateNumericStart(input, offset);
      }

      case EntityDecoderState.NumericDecimal: {
        return this.stateNumericDecimal(input, offset);
      }

      case EntityDecoderState.NumericHex: {
        return this.stateNumericHex(input, offset);
      }

      case EntityDecoderState.NamedEntity: {
        return this.stateNamedEntity(input, offset);
      }
    }
  }

  private stateNumericStart(input: string, offset: number): number {
    if (offset >= input.length) {
      return -1;
    }

    if ((input.charCodeAt(offset) | TO_LOWER_BIT) === CharCodes.LOWER_X) {
      this.state = EntityDecoderState.NumericHex;
      this.consumed += 1;
      return this.stateNumericHex(input, offset + 1);
    }

    this.state = EntityDecoderState.NumericDecimal;
    return this.stateNumericDecimal(input, offset);
  }

  private addToNumericResult(
    input: string,
    start: number,
    end: number,
    base: number,
  ): void {
    if (start !== end) {
      const digitCount = end - start;
      this.result =
        this.result * Math.pow(base, digitCount) +
        Number.parseInt(input.substr(start, digitCount), base);
      this.consumed += digitCount;
    }
  }

  private stateNumericHex(input: string, offset: number): number {
    const startIndex = offset;

    while (offset < input.length) {
      const char = input.charCodeAt(offset);
      if (isNumber(char) || isHexadecimalCharacter(char)) {
        offset += 1;
      } else {
        this.addToNumericResult(input, startIndex, offset, 16);
        return this.emitNumericEntity(char, 3);
      }
    }

    this.addToNumericResult(input, startIndex, offset, 16);

    return -1;
  }

  private stateNumericDecimal(input: string, offset: number): number {
    const startIndex = offset;

    while (offset < input.length) {
      const char = input.charCodeAt(offset);
      if (isNumber(char)) {
        offset += 1;
      } else {
        this.addToNumericResult(input, startIndex, offset, 10);
        return this.emitNumericEntity(char, 2);
      }
    }

    this.addToNumericResult(input, startIndex, offset, 10);

    return -1;
  }

  private emitNumericEntity(lastCp: number, expectedLength: number): number {
    if (this.consumed <= expectedLength) {
      this.errors?.absenceOfDigitsInNumericCharacterReference(
        this.consumed,
      );
      return 0;
    }

    if (lastCp === CharCodes.SEMI) {
      this.consumed += 1;
    } else if (this.decodeMode === DecodingMode.Strict) {
      return 0;
    }

    this.emitCodePoint(replaceCodePoint(this.result), this.consumed);

    if (this.errors) {
      if (lastCp !== CharCodes.SEMI) {
        this.errors.missingSemicolonAfterCharacterReference();
      }

      this.errors.validateNumericCharacterReference(this.result);
    }

    return this.consumed;
  }

  private stateNamedEntity(input: string, offset: number): number {
    const { decodeTree } = this;
    let current = decodeTree[this.treeIndex];
    // The mask is the number of bytes of the value, including the current byte.
    let valueLength = (current & BinTrieFlags.VALUE_LENGTH) >> 14;

    for (; offset < input.length; offset++, this.excess++) {
      const char = input.charCodeAt(offset);

      this.treeIndex = determineBranch(
        decodeTree,
        current,
        this.treeIndex + Math.max(1, valueLength),
        char,
      );

      if (this.treeIndex < 0) {
        return this.result === 0 ||
          (this.decodeMode === DecodingMode.Attribute &&
            (valueLength === 0 ||
              isEntityInAttributeInvalidEnd(char)))
          ? 0
          : this.emitNotTerminatedNamedEntity();
      }

      current = decodeTree[this.treeIndex];
      valueLength = (current & BinTrieFlags.VALUE_LENGTH) >> 14;

      if (valueLength !== 0) {
        if (char === CharCodes.SEMI) {
          return this.emitNamedEntityData(
            this.treeIndex,
            valueLength,
            this.consumed + this.excess,
          );
        }

        if (this.decodeMode !== DecodingMode.Strict) {
          this.result = this.treeIndex;
          this.consumed += this.excess;
          this.excess = 0;
        }
      }
    }

    return -1;
  }

  private emitNotTerminatedNamedEntity(): number {
    const { result, decodeTree } = this;

    const valueLength =
      (decodeTree[result] & BinTrieFlags.VALUE_LENGTH) >> 14;

    this.emitNamedEntityData(result, valueLength, this.consumed);
    this.errors?.missingSemicolonAfterCharacterReference();

    return this.consumed;
  }

  private emitNamedEntityData(
    result: number,
    valueLength: number,
    consumed: number,
  ): number {
    const { decodeTree } = this;

    this.emitCodePoint(
      valueLength === 1
        ? decodeTree[result] & ~BinTrieFlags.VALUE_LENGTH
        : decodeTree[result + 1],
      consumed,
    );
    if (valueLength === 3) {
      this.emitCodePoint(decodeTree[result + 2], consumed);
    }

    return consumed;
  }

  end(): number {
    switch (this.state) {
      case EntityDecoderState.NamedEntity: {
        return this.result !== 0 &&
          (this.decodeMode !== DecodingMode.Attribute ||
            this.result === this.treeIndex)
          ? this.emitNotTerminatedNamedEntity()
          : 0;
      }

      case EntityDecoderState.NumericDecimal: {
        return this.emitNumericEntity(0, 2);
      }
      case EntityDecoderState.NumericHex: {
        return this.emitNumericEntity(0, 3);
      }
      case EntityDecoderState.NumericStart: {
        this.errors?.absenceOfDigitsInNumericCharacterReference(
          this.consumed,
        );
        return 0;
      }
      case EntityDecoderState.EntityStart: {
        return 0;
      }
    }
  }
}

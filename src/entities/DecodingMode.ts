export const DecodingMode = {
  Legacy: 0,
  Strict: 1,
  Attribute: 2,
}

export type DecodingMode = typeof DecodingMode[keyof typeof DecodingMode]

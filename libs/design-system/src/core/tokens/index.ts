import { IODimensions } from "./dimensions";

export * from "./dimensions";

/**
 * Every Design System token in one object, keyed by the token types of the W3C
 * Design Tokens Community Group format (`dimension`, `color`, …). Tokens are
 * plain data: platform-specific code (StyleSheets, Reanimated curves…) must not
 * live under `core/tokens`.
 */
export const IOTokens = {
  dimension: IODimensions
} as const;

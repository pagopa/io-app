import { createContext } from "react";

/**
 * Holds the measured width (px) of the card element as reported by onLayout in CardSideBase.
 * Defaults to 0 before the first layout pass.
 *
 * WHY A SEPARATE FILE
 * -------------------
 * The context must be consumed by ClaimLabel, which sits at the bottom of this import chain:
 *
 *   index.tsx → CardData → CardClaim → ClaimLabel
 *
 * If the context were defined in index.tsx and ClaimLabel imported it from there, it would
 * create a circular dependency (index.tsx → CardData → … → ClaimLabel → index.tsx).
 * A dedicated module with no local imports breaks the cycle.
 *
 * WHY A CONTEXT (not a prop)
 * --------------------------
 * ClaimLabel is rendered several levels deep inside CardData/CardClaim. Threading a
 * cardWidth prop through every intermediate component would require touching unrelated
 * files and coupling them to a layout detail they don't own. A context lets CardSideBase
 * publish the value once and ClaimLabel consume it directly, with no intermediate boilerplate.
 */
export const CardWidthContext = createContext<number>(0);

/**
 * Build a string based on the currency that
 * is to be displayed. The only currently supposed
 * currency is EUR => "AMOUNT €". Other currencies,
 * e.g. USD, can be handled here differently ("$ AMOUNT")
 * @param amount amount (can be a float, will be truncated to its 2nd digit )
 */
const DISPLAYED_DIGITS = 2;
export const amountBuilder = (amount: number): string =>
  `${amount.toFixed(DISPLAYED_DIGITS)} €`;

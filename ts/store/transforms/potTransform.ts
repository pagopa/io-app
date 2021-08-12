import { createTransform } from "redux-persist";

import * as pot from "italia-ts-commons/lib/pot";

/**
 * If the value is a Pot object removes the loading and error states.
 */
const potReviver = (_: any, value: any) => {
  if (value !== undefined && pot.isPot(value)) {
    return pot.fold<any, any, pot.Pot<any, any>>(
      value,
      () => pot.none,
      () => pot.none,
      () => pot.none,
      () => pot.none,
      __ => pot.some(__),
      __ => pot.some(__),
      __ => pot.some(__),
      __ => pot.some(__)
    );
  }

  return value;
};

/**
 * A redux-persist transformer that removes the loading and error states from Pot values.
 * `noneLoading` and `noneError` become `none`
 * `someLoading` and `someError` become `some`
 */
export const PotTransform = createTransform(
  // We only care about rehydrated so we do not apply any transformation
  // for inboundState.
  _ => _,
  (outboundState, _) => JSON.parse(JSON.stringify(outboundState), potReviver)
);

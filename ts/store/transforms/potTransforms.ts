import { createTransform } from "redux-persist";

import { valueAsPotSomeOrNone } from "../../utils/pot";

const potReviver = (_: any, value: any) => {
  return valueAsPotSomeOrNone(value).getOrElse(value);
};

/**
 * A redux-persist transformer that resets the status of the pots
 */
export const PotTransform = createTransform(
  // We only care about rehydrated so we do not apply any transformation
  // for inboundState.
  _ => _,
  (outboundState, _) => {
    return JSON.parse(JSON.stringify(outboundState), potReviver);
  }
);

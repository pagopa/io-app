import { cdcEnabled } from "../../../../config";

export const ID_CGN_TYPE = 3;
export const ID_CDC_TYPE = 4;

/**
 * Return a Map with the bonus ID as a key and
 * a bool representing the relative feature flag
 * status as a value.
 */
export const mapBonusIdFeatureFlag = () =>
  new Map<number, boolean>([
    [ID_CGN_TYPE, true],
    [ID_CDC_TYPE, cdcEnabled]
  ]);

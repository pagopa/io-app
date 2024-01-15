import {
  bonusVacanzeEnabled,
  bpdEnabled,
  cdcEnabled
} from "../../../../config";

export const ID_BONUS_VACANZE_TYPE = 1;
export const ID_BPD_TYPE = 2;
export const ID_CGN_TYPE = 3;
export const ID_CDC_TYPE = 4;

/**
 * Return a Map with the bonus ID as a key and
 * a bool representing the relative feature flag
 * status as a value.
 */
export const mapBonusIdFeatureFlag = () =>
  new Map<number, boolean>([
    [ID_BONUS_VACANZE_TYPE, bonusVacanzeEnabled],
    [ID_BPD_TYPE, bpdEnabled],
    [ID_CGN_TYPE, true],
    [ID_CDC_TYPE, cdcEnabled]
  ]);

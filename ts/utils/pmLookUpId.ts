import uuid from "uuid/v4";

export type LookUpId = string | undefined;
// eslint-disable-next-line functional/no-let
let pmLookUpId: LookUpId;

export const getLookUpId = (): LookUpId => pmLookUpId;
export const newLookUpId = (): LookUpId => {
  pmLookUpId = uuid();
  return pmLookUpId;
};
export const resetLookUpId = (): void => {
  pmLookUpId = undefined;
};

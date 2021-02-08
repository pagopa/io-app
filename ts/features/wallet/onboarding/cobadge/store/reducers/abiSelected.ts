import { getType } from "typesafe-actions";
import { Action } from "../../../../../../store/actions/types";
import { GlobalState } from "../../../../../../store/reducers/types";
import { searchUserCoBadge, walletAddCoBadgeStart } from "../actions";

export type AbiSelected = string | null;

const abiSelectedReducer = (
  state: AbiSelected = null,
  action: Action
): AbiSelected => {
  switch (action.type) {
    case getType(searchUserCoBadge.request):
    case getType(walletAddCoBadgeStart):
      return action.payload ?? null;
  }
  return state;
};

/**
 * Return the abi chosen from the user to search for their CoBadge
 * @param state
 */
export const onboardingCoBadgeAbiSelectedSelector = (
  state: GlobalState
): string | undefined =>
  state.wallet.onboarding.coBadge.abiSelected ?? undefined;

export default abiSelectedReducer;

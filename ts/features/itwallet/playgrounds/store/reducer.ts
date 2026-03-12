import { getType } from "typesafe-actions";
import { Action } from "../../../../store/actions/types";
import {
  StoredCredential,
  ItwCredentialStatus
} from "../../common/utils/itwTypesUtils";
import {
  itwDebugClearGlobalStatusOverride,
  itwDebugSaveOriginalCredentials,
  itwDebugSetGlobalStatusOverride
} from "./actions";

export type ItwDebugState = {
  /** The active status override shown in the playground UI. */
  globalCredentialStatusOverride: ItwCredentialStatus | undefined;
  /**
   * Original credentials saved before the override was applied.
   * Used to restore the real data when the override is cleared.
   * Keyed by credentialId.
   */
  savedCredentials: Record<string, StoredCredential> | undefined;
};

const initialState: ItwDebugState = {
  globalCredentialStatusOverride: undefined,
  savedCredentials: undefined
};

const reducer = (
  state: ItwDebugState = initialState,
  action: Action
): ItwDebugState => {
  switch (action.type) {
    case getType(itwDebugSetGlobalStatusOverride):
      return { ...state, globalCredentialStatusOverride: action.payload };

    case getType(itwDebugClearGlobalStatusOverride):
      return initialState;

    case getType(itwDebugSaveOriginalCredentials): {
      // Only save originals once (don't overwrite if already saved)
      if (state.savedCredentials !== undefined) {return state;}
      const record = action.payload.reduce<Record<string, StoredCredential>>(
        (acc, c) => ({ ...acc, [c.credentialId]: c }),
        {}
      );
      return { ...state, savedCredentials: record };
    }

    default:
      return state;
  }
};

export default reducer;

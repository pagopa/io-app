import { getType } from "typesafe-actions";
import { Action } from "../../../../store/actions/types";
import {
  StoredCredential,
  ItwCredentialStatus
} from "../../common/utils/itwTypesUtils";
import {
  itwDebugClearCredentialStatusOverride,
  itwDebugSaveOriginalCredentials,
  itwDebugSetCredentialStatusOverride
} from "./actions";

export type ItwDebugState = {
  /**
   * Per-credential status overrides, keyed by credentialType.
   */
  credentialStatusOverrides: Record<string, ItwCredentialStatus>;
  /**
   * Original credentials saved before any override was applied.
   * Used to restore the real data when overrides are cleared.
   * Keyed by credentialId.
   */
  savedCredentials: Record<string, StoredCredential> | undefined;
};

const initialState: ItwDebugState = {
  credentialStatusOverrides: {},
  savedCredentials: undefined
};

const reducer = (
  state: ItwDebugState = initialState,
  action: Action
): ItwDebugState => {
  switch (action.type) {
    case getType(itwDebugSetCredentialStatusOverride): {
      const { credentialType, status } = action.payload;
      return {
        ...state,
        credentialStatusOverrides: {
          ...state.credentialStatusOverrides,
          [credentialType]: status
        }
      };
    }

    case getType(itwDebugClearCredentialStatusOverride): {
      const { credentialType } = action.payload;
      const { [credentialType]: _, ...rest } = state.credentialStatusOverrides;
      // Reset savedCredentials too if no overrides remain
      const hasOverrides = Object.keys(rest).length > 0;
      return {
        ...state,
        credentialStatusOverrides: rest,
        savedCredentials: hasOverrides ? state.savedCredentials : undefined
      };
    }

    case getType(itwDebugSaveOriginalCredentials): {
      // Only save originals once (don't overwrite if already saved)
      if (state.savedCredentials !== undefined) {
        return state;
      }
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

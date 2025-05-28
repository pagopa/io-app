import { useIOStore } from "../../../../../store/hooks.ts";
import { isItwEnabledSelector } from "../../../common/store/selectors/remoteConfig.ts";
import { itwLifecycleIsValidSelector } from "../../../lifecycle/store/selectors";
import { itwCredentialsEidStatusSelector } from "../../../credentials/store/selectors";
import { itwIsL3EnabledSelector } from "../../../common/store/selectors/preferences.ts";

export const createRemoteGuardsImplementation = (
  store: ReturnType<typeof useIOStore>
) => ({
  isWalletActive: () =>
    itwLifecycleIsValidSelector(store.getState()) &&
    isItwEnabledSelector(store.getState()),

  isL3Enabled: () => itwIsL3EnabledSelector(store.getState()),

  isEidExpired: () => {
    const eidStatus = itwCredentialsEidStatusSelector(store.getState());

    return eidStatus === "jwtExpired";
  }
});

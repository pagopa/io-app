import { useIOStore } from "../../../../../store/hooks.ts";
import { isItwEnabledSelector } from "../../../common/store/selectors/remoteConfig.ts";
import { itwLifecycleIsValidSelector } from "../../../lifecycle/store/selectors";
import { itwCredentialsEidStatusSelector } from "../../../credentials/store/selectors";

export const createRemoteGuardsImplementation = (
  store: ReturnType<typeof useIOStore>
) => ({
  isWalletActive: () =>
    itwLifecycleIsValidSelector(store.getState()) &&
    isItwEnabledSelector(store.getState()),

  areRequiredCredentialsAvailable: () =>
    // TODO: implementation depends on the remote presentation request
    true,

  isEidExpired: () => {
    const eidStatus = itwCredentialsEidStatusSelector(store.getState());

    return eidStatus === "jwtExpired";
  },
  isRPTrusted: () =>
    // TODO: implementation depends on RP certificates check
    false
});

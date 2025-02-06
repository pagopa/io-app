import { useIOStore } from "../../../../../store/hooks.ts";
import { isItwEnabledSelector } from "../../../common/store/selectors/remoteConfig.ts";
import { itwLifecycleIsValidSelector } from "../../../lifecycle/store/selectors";

export const createRemoteGuardsImplementation = (
  store: ReturnType<typeof useIOStore>
) => ({
  isItwWalletInactive: () =>
    !itwLifecycleIsValidSelector(store.getState()) &&
    isItwEnabledSelector(store.getState())
});

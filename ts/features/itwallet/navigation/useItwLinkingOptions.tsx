import { PathConfigMap } from "@react-navigation/native";
import { useIOSelector } from "../../../store/hooks";
import { isItwTrialActiveSelector } from "../../trialSystem/store/reducers";
import { itwLifecycleIsValidSelector } from "../lifecycle/store/selectors";
import { isItwEnabledSelector } from "../../../store/reducers/backendStatus/remoteConfig";
import { AppParamsList } from "../../../navigation/params/AppParamsList";
import { ITW_ROUTES } from "./routes";

/**
 * Hook which returns the linking options for internal navigation routes for the IT Wallet.
 * They are disabled if the IT Wallet is not enabled, the trial is not active, or the lifecycle is valid.
 */
export const useItwLinkingOptions = (): PathConfigMap<AppParamsList> => {
  const isItwTrialActive = useIOSelector(isItwTrialActiveSelector);
  const isItwValid = useIOSelector(itwLifecycleIsValidSelector);
  const isItwEnabled = useIOSelector(isItwEnabledSelector);

  const isUserAllowedToItw = isItwEnabled && isItwTrialActive;

  return {
    [ITW_ROUTES.MAIN]: {
      path: "itw",
      screens: {
        ...(isUserAllowedToItw && {
          [ITW_ROUTES.ISSUANCE.CREDENTIAL_ASYNC_FLOW_CONTINUATION]:
            "credential/issuance",
          [isItwValid
            ? ITW_ROUTES.DISCOVERY.ALREADY_ACTIVE_SCREEN
            : ITW_ROUTES.DISCOVERY.INFO]: "discovery/info"
        })
      }
    }
  };
};

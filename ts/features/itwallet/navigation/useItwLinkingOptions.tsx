import { PathConfigMap } from "@react-navigation/native";
import { useIOSelector } from "../../../store/hooks";
import { isItwTrialActiveSelector } from "../../trialSystem/store/reducers";
import { itwLifecycleIsValidSelector } from "../lifecycle/store/selectors";
import { isItwEnabledSelector } from "../../../store/reducers/backendStatus";
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
  const canItwBeActivated = isItwTrialActive && !isItwValid && isItwEnabled;

  return {
    [ITW_ROUTES.MAIN]: {
      path: "itw",
      screens: {
        [ITW_ROUTES.ISSUANCE.CREDENTIAL_ASYNC_FLOW_CONTINUATION]:
          "credential/issuance",
        ...(canItwBeActivated && {
          [ITW_ROUTES.DISCOVERY.INFO]: "discovery/info"
        })
      }
    }
  };
};
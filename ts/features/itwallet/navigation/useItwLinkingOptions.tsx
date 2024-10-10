import { PathConfigMap } from "@react-navigation/native";
import { useIOSelector } from "../../../store/hooks";
import { isItwTrialActiveSelector } from "../../trialSystem/store/reducers";
import { itwLifecycleIsValidSelector } from "../lifecycle/store/selectors";
import { isItwEnabledSelector } from "../../../store/reducers/backendStatus";
import { AppParamsList } from "../../../navigation/params/AppParamsList";
import { ITW_ROUTES } from "./routes";

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

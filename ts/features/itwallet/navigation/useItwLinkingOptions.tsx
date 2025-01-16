import { PathConfigMap } from "@react-navigation/native";
import { AppParamsList } from "../../../navigation/params/AppParamsList";
import { useIOSelector } from "../../../store/hooks";
import { isItwEnabledSelector } from "../common/store/selectors/remoteConfig";
import { itwLifecycleIsValidSelector } from "../lifecycle/store/selectors";
import { ITW_ROUTES } from "./routes";

/**
 * Hook which returns the linking options for internal navigation routes for the IT Wallet.
 * They are disabled if the IT Wallet is not enabled or the lifecycle is valid.
 */
export const useItwLinkingOptions = (): PathConfigMap<AppParamsList> => {
  const isItwValid = useIOSelector(itwLifecycleIsValidSelector);
  const isItwEnabled = useIOSelector(isItwEnabledSelector);

  return {
    [ITW_ROUTES.MAIN]: {
      path: "itw",
      screens: {
        ...(isItwEnabled && {
          [ITW_ROUTES.ISSUANCE.CREDENTIAL_ASYNC_FLOW_CONTINUATION]:
            "credential/issuance",
          [isItwValid
            ? ITW_ROUTES.DISCOVERY.ALREADY_ACTIVE_SCREEN
            : ITW_ROUTES.DISCOVERY.INFO]: "discovery/info",
          [isItwValid
            ? ITW_ROUTES.PRESENTATION.CREDENTIAL_DETAIL
            : ITW_ROUTES.ISSUANCE.CREDENTIAL_ASYNC_FLOW_CONTINUATION]: {
            path: "presentation/credential-detail/:credentialType"
          }
        })
      }
    }
  };
};

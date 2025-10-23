import { PathConfigMap } from "@react-navigation/native";
import { AppParamsList } from "../../../navigation/params/AppParamsList";
import { useIOSelector } from "../../../store/hooks";
import { itwLifecycleIsValidSelector } from "../lifecycle/store/selectors";
import { ITW_REMOTE_ROUTES } from "../presentation/remote/navigation/routes.ts";
import { ITW_ROUTES } from "./routes";

/**
 * Hook which returns the linking options for internal navigation routes for the IT Wallet.
 * They are disabled if the IT Wallet is not enabled or the lifecycle is valid.
 */
export const useItwLinkingOptions = (): PathConfigMap<AppParamsList> => {
  const isItwValid = useIOSelector(itwLifecycleIsValidSelector);

  return {
    [ITW_ROUTES.MAIN]: {
      path: "itw",
      screens: {
        [ITW_ROUTES.LANDING_SCREEN.EID_REISSUANCE]: "credential/reissuance/eid",
        [ITW_ROUTES.LANDING_SCREEN.CREDENTIAL_ASYNC_FLOW_CONTINUATION]:
          "credential/issuance",
        [isItwValid
          ? ITW_ROUTES.DISCOVERY.ALREADY_ACTIVE_SCREEN
          : ITW_ROUTES.DISCOVERY.INFO]: "discovery/info",
        [ITW_ROUTES.PRESENTATION.CREDENTIAL_DETAIL]: {
          path: "presentation/credential-detail/:credentialType"
        }
      }
    },
    [ITW_REMOTE_ROUTES.MAIN]: {
      path: "itw/auth",
      screens: {
        [ITW_REMOTE_ROUTES.REQUEST_VALIDATION]: {
          path: ""
        }
      }
    }
  };
};

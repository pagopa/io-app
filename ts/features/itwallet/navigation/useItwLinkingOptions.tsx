import { PathConfigMap } from "@react-navigation/native";
import { useIOSelector } from "../../../store/hooks";
import { itwLifecycleIsValidSelector } from "../lifecycle/store/selectors";
import { isItwEnabledSelector } from "../../../store/reducers/backendStatus/remoteConfig";
import { AppParamsList } from "../../../navigation/params/AppParamsList";
import { itwHasMdlCredentialSelector } from "../credentials/store/selectors";
import { ITW_ROUTES } from "./routes";

/**
 * Hook which returns the linking options for internal navigation routes for the IT Wallet.
 * They are disabled if the IT Wallet is not enabled or the lifecycle is valid.
 */
export const useItwLinkingOptions = (): PathConfigMap<AppParamsList> => {
  const isItwValid = useIOSelector(itwLifecycleIsValidSelector);
  const isItwEnabled = useIOSelector(isItwEnabledSelector);
  const isMdlPresent = useIOSelector(itwHasMdlCredentialSelector);

  const presentationRoute = isItwValid
    ? isMdlPresent
      ? ITW_ROUTES.PRESENTATION.CREDENTIAL_DETAIL
      : ITW_ROUTES.ISSUANCE.CREDENTIAL_NOT_FOUND
    : ITW_ROUTES.ISSUANCE.CREDENTIAL_ASYNC_FLOW_CONTINUATION;

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
          [presentationRoute]: {
            path: "presentation/credential-detail/:credentialType?",
            parse: {
              credentialType: (credentialType: string) => credentialType
            }
          }
        })
      }
    }
  };
};

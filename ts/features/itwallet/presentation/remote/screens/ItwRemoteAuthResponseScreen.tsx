import { Linking } from "react-native";
import { IOToast } from "@pagopa/io-app-design-system";
import I18n from "i18next";
import { OperationResultScreenContent } from "../../../../../components/screens/OperationResultScreenContent";
import { useItwDisableGestureNavigation } from "../../../common/hooks/useItwDisableGestureNavigation";
import { ItwRemoteLoadingScreen } from "../components/ItwRemoteLoadingScreen";
import { ItwRemoteMachineContext } from "../machine/provider";
import {
  selectFlowType,
  selectIsLoading,
  selectIsSuccess,
  selectRedirectUri,
  selectRelyingPartyData,
  selectRemoteCredentialCombination
} from "../machine/selectors";
import { trackItwRemotePresentationCompleted } from "../analytics";
import { useOnFirstRender } from "../../../../../utils/hooks/useOnFirstRender";

export const ItwRemoteAuthResponseScreen = () => {
  useItwDisableGestureNavigation();

  const machineRef = ItwRemoteMachineContext.useActorRef();
  const isLoading = ItwRemoteMachineContext.useSelector(selectIsLoading);
  const isSuccess = ItwRemoteMachineContext.useSelector(selectIsSuccess);
  const rpData = ItwRemoteMachineContext.useSelector(selectRelyingPartyData);
  const redirectUri = ItwRemoteMachineContext.useSelector(selectRedirectUri);
  const credential_type = ItwRemoteMachineContext.useSelector(
    selectRemoteCredentialCombination
  );
  const flowType = ItwRemoteMachineContext.useSelector(selectFlowType);

  useOnFirstRender(() => {
    if (credential_type) {
      trackItwRemotePresentationCompleted(!!redirectUri, credential_type);
    }
  });

  /**
   * In addition to checking for the loading state,
   * we need to ensure that the current state is not `Success`
   * to prevent a visual glitch caused by a slight delay in navigation
   */
  if (isLoading || !isSuccess) {
    return (
      <ItwRemoteLoadingScreen
        title={I18n.t(
          "features.itWallet.presentation.remote.loadingScreen.response",
          { relyingParty: rpData?.organization_name }
        )}
      />
    );
  }

  const closeMachine = () => machineRef.send({ type: "close" });

  const isSameDeviceFlowWithRedirectUri =
    flowType === "same-device" && !!redirectUri;

  const action = isSameDeviceFlowWithRedirectUri
    ? {
        icon: "externalLinkSmall" as const,
        label: I18n.t("features.itWallet.presentation.remote.success.cta"),
        onPress: () => {
          Linking.openURL(redirectUri)
            .catch(() => IOToast.error("global.genericError"))
            .finally(closeMachine);
        }
      }
    : {
        label: I18n.t("global.buttons.close"),
        onPress: closeMachine
      };

  const secondaryAction = isSameDeviceFlowWithRedirectUri
    ? {
        label: I18n.t("global.buttons.close"),
        accessibilityLabel: I18n.t("global.buttons.close"),
        onPress: closeMachine
      }
    : undefined;

  return (
    <OperationResultScreenContent
      pictogram="success"
      title={I18n.t("features.itWallet.presentation.remote.success.title")}
      subtitle={I18n.t(
        "features.itWallet.presentation.remote.success.subtitle"
      )}
      action={action}
      secondaryAction={secondaryAction}
    />
  );
};

import { Linking } from "react-native";
import { IOToast } from "@pagopa/io-app-design-system";
import I18n from "i18next";
import { OperationResultScreenContent } from "../../../../../components/screens/OperationResultScreenContent";
import { useItwDisableGestureNavigation } from "../../../common/hooks/useItwDisableGestureNavigation";
import { ItwRemoteLoadingScreen } from "../components/ItwRemoteLoadingScreen";
import { ItwRemoteMachineContext } from "../machine/provider";
import {
  selectIsLoading,
  selectIsSuccess,
  selectRedirectUri,
  selectRelyingPartyData
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

  useOnFirstRender(() => {
    trackItwRemotePresentationCompleted(!!redirectUri);
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

  return (
    <OperationResultScreenContent
      enableAnimatedPictogram
      pictogram="success"
      title={I18n.t("features.itWallet.presentation.remote.success.title")}
      subtitle={I18n.t(
        "features.itWallet.presentation.remote.success.subtitle"
      )}
      action={
        redirectUri
          ? {
              icon: "externalLinkSmall",
              label: I18n.t(
                "features.itWallet.presentation.remote.success.cta"
              ),
              onPress: () => {
                Linking.openURL(redirectUri)
                  .catch(() => IOToast.error("global.genericError"))
                  .finally(closeMachine);
              }
            }
          : {
              label: I18n.t("global.buttons.close"),
              onPress: closeMachine
            }
      }
    />
  );
};

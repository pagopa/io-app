import { OperationResultScreenContent } from "../../../../../components/screens/OperationResultScreenContent";
import I18n from "../../../../../i18n";
import { ItwRemoteLoadingScreen } from "../components/ItwRemoteLoadingScreen";
import { ItwRemoteMachineContext } from "../machine/provider";
import {
  selectIsLoading,
  selectIsSuccess,
  selectRelyingPartyData
} from "../machine/selectors";

export const ItwRemoteAuthResponseScreen = () => {
  const machineRef = ItwRemoteMachineContext.useActorRef();
  const isLoading = ItwRemoteMachineContext.useSelector(selectIsLoading);
  const isSuccess = ItwRemoteMachineContext.useSelector(selectIsSuccess);
  const rpData = ItwRemoteMachineContext.useSelector(selectRelyingPartyData);

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

  return (
    <OperationResultScreenContent
      pictogram="success"
      title={I18n.t("features.itWallet.presentation.remote.success.title")}
      subtitle={I18n.t(
        "features.itWallet.presentation.remote.success.subtitle"
      )}
      action={{
        label: I18n.t("global.buttons.close"),
        onPress: () => machineRef.send({ type: "close" })
      }}
    />
  );
};

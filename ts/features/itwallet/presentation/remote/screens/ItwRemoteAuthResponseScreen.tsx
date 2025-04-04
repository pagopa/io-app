import { OperationResultScreenContent } from "../../../../../components/screens/OperationResultScreenContent";
import I18n from "../../../../../i18n";
import { ItwRemoteLoadingScreen } from "../components/ItwRemoteLoadingScreen";
import { ItwRemoteMachineContext } from "../machine/provider";
import { selectIsLoading, selectRelyingPartyData } from "../machine/selectors";

export const ItwRemoteAuthResponseScreen = () => {
  const machineRef = ItwRemoteMachineContext.useActorRef();
  const isLoading = ItwRemoteMachineContext.useSelector(selectIsLoading);
  const rpData = ItwRemoteMachineContext.useSelector(selectRelyingPartyData);

  if (isLoading) {
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

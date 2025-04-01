import { OperationResultScreenContent } from "../../../../../components/screens/OperationResultScreenContent";
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
        title={`Stiamo comunicando i tuoi dati a ${rpData?.organization_name}`}
      />
    );
  }

  return (
    <OperationResultScreenContent
      pictogram="success"
      title="Fatto!"
      subtitle="Continua sul sito dell'ente"
      action={{
        label: "Chiudi",
        onPress: () => machineRef.send({ type: "close" })
      }}
    />
  );
};

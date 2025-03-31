import { OperationResultScreenContent } from "../../../../../components/screens/OperationResultScreenContent";
import { ItwRemoteLoadingScreen } from "../components/ItwRemoteLoadingScreen";
import { ItwRemoteMachineContext } from "../machine/provider";
import { selectIsLoading, selectRelyingPartyName } from "../machine/selectors";

export const ItwRemoteAuthResponseScreen = () => {
  const isLoading = ItwRemoteMachineContext.useSelector(selectIsLoading);
  const rpName = ItwRemoteMachineContext.useSelector(selectRelyingPartyName);

  if (isLoading) {
    return (
      <ItwRemoteLoadingScreen
        title={`Stiamo comunicando i tuoi dati a ${rpName}`}
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
        onPress: () => null
      }}
    />
  );
};

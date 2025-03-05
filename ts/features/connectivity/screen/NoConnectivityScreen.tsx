import { OperationResultScreenContent } from "../../../components/screens/OperationResultScreenContent";
import { useHeaderSecondLevel } from "../../../hooks/useHeaderSecondLevel";

type NoConnectivityScreenContentProps = {
  onRetry?: () => void;
};

export const NoConnectivityScreenContent = ({
  onRetry
}: NoConnectivityScreenContentProps) => (
  <OperationResultScreenContent
    pictogram="lostConnection"
    title="Nessuna connessione"
    subtitle="Collegati a internet per continuare ad usare tutti i servizi di app IO."
    secondaryAction={
      onRetry
        ? {
            label: "Riprova",
            onPress: onRetry
          }
        : undefined
    }
  />
);

export const NoConnectivityScreen = () => {
  useHeaderSecondLevel({ title: "" });
  return <NoConnectivityScreenContent />;
};

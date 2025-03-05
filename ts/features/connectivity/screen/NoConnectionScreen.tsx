import { OperationResultScreenContent } from "../../../components/screens/OperationResultScreenContent";
import { useHeaderSecondLevel } from "../../../hooks/useHeaderSecondLevel";

type NoConnectionScreenContentProps = {
  onRetry?: () => void;
};

export const NoConnectionScreenContent = ({
  onRetry
}: NoConnectionScreenContentProps) => (
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

export const NoConnectionScreen = () => {
  useHeaderSecondLevel({ title: "" });
  return <NoConnectionScreenContent />;
};

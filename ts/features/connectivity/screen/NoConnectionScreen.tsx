import { OperationResultScreenContent } from "../../../components/screens/OperationResultScreenContent";
import { useHeaderSecondLevel } from "../../../hooks/useHeaderSecondLevel";
import I18n from "../../../i18n";
type NoConnectionScreenContentProps = {
  onRetry?: () => void;
};

export const NoConnectionScreenContent = ({
  onRetry
}: NoConnectionScreenContentProps) => (
  <OperationResultScreenContent
    pictogram="lostConnection"
    title={I18n.t("global.noConnection.screen.title")}
    subtitle={I18n.t("global.noConnection.screen.subtitle")}
    secondaryAction={
      onRetry
        ? {
            label: I18n.t("global.noConnection.screen.action"),
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

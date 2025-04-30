import { OperationResultScreenContent } from "../screens/OperationResultScreenContent";
import { useHeaderSecondLevel } from "../../hooks/useHeaderSecondLevel";
import I18n from "../../i18n";

type OfflineFailureComponentProps = {
  onRetry?: () => void;
  isHeaderVisible?: boolean;
};

export const OfflineFailureComponent = ({
  onRetry,
  isHeaderVisible
}: OfflineFailureComponentProps) => (
  <OperationResultScreenContent
    pictogram="lostConnection"
    title={I18n.t("global.offline.screen.title")}
    subtitle={I18n.t("global.offline.screen.subtitle")}
    secondaryAction={
      onRetry
        ? {
            label: I18n.t("global.offline.screen.action"),
            onPress: onRetry
          }
        : undefined
    }
    isHeaderVisible={isHeaderVisible}
  />
);

export const OfflineFailureScreen = () => {
  useHeaderSecondLevel({ title: "" });
  return <OfflineFailureComponent />;
};

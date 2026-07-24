import I18n from "i18next";

import { useHeaderSecondLevel } from "../../hooks/useHeaderSecondLevel";
import { OperationResultScreenContent } from "../screens/OperationResultScreenContent";

type OfflineFailureComponentProps = {
  isHeaderVisible?: boolean;
  onRetry?: () => void;
};

export const OfflineFailureComponent = ({
  onRetry,
  isHeaderVisible
}: OfflineFailureComponentProps) => {
  useHeaderSecondLevel({ title: "" });
  return (
    <OperationResultScreenContent
      isHeaderVisible={isHeaderVisible}
      pictogram="lostConnection"
      secondaryAction={
        onRetry
          ? {
              label: I18n.t("global.offline.screen.action"),
              onPress: onRetry
            }
          : undefined
      }
      subtitle={I18n.t("global.offline.screen.subtitle")}
      title={I18n.t("global.offline.screen.title")}
    />
  );
};

export const OfflineFailureScreen = () => <OfflineFailureComponent />;

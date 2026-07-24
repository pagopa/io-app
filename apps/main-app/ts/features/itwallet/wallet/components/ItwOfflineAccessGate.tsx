import { useFocusEffect } from "@react-navigation/native";
import I18n from "i18next";
import { PropsWithChildren, useState } from "react";

import { OperationResultScreenContent } from "../../../../components/screens/OperationResultScreenContent";
import { useIOSelector } from "../../../../store/hooks";
import {
  itwIsOfflineAccessLimitReached,
  itwShouldDisplayOfflineAccessLimitWarning
} from "../../common/store/selectors/securePreferences";
import {
  trackItwOfflineAccessExpired,
  trackItwOfflineAccessExpiring
} from "../analytics";
import { useAppRestartAction } from "../hooks/useAppRestartAction";

export const ItwOfflineAccessGate = ({ children }: PropsWithChildren) => {
  const [warningViewed, setWarningViewed] = useState(false);
  const isLimitReached = useIOSelector(itwIsOfflineAccessLimitReached);
  const shouldDisplayLimitWarning = useIOSelector(
    itwShouldDisplayOfflineAccessLimitWarning
  );

  if (shouldDisplayLimitWarning && !warningViewed) {
    return <LimitWarningScreenContent setWarningViewed={setWarningViewed} />;
  }

  if (isLimitReached) {
    return <LimitReachedScreenContent />;
  }

  return children;
};

const LimitWarningScreenContent = ({
  setWarningViewed
}: {
  setWarningViewed: (viewed: boolean) => void;
}) => {
  useFocusEffect(trackItwOfflineAccessExpiring);

  return (
    <OperationResultScreenContent
      action={{
        testID: "itwOfflineAccessGateWarningActionTestID",
        label: I18n.t(
          "features.itWallet.offline.gate.limitWarning.primaryAction"
        ),
        accessibilityLabel: I18n.t(
          "features.itWallet.offline.gate.limitWarning.primaryAction"
        ),
        onPress: () => setWarningViewed(true)
      }}
      pictogram="attention"
      subtitle={I18n.t("features.itWallet.offline.gate.limitWarning.subtitle")}
      testID="itwOfflineAccessGateWarningTestID"
      title={I18n.t("features.itWallet.offline.gate.limitWarning.title")}
    />
  );
};

const LimitReachedScreenContent = () => {
  const handleAppRestart = useAppRestartAction("access_expired_screen");
  useFocusEffect(trackItwOfflineAccessExpired);

  return (
    <OperationResultScreenContent
      action={{
        label: I18n.t(
          "features.itWallet.offline.gate.limitReached.primaryAction"
        ),
        accessibilityLabel: I18n.t(
          "features.itWallet.offline.gate.limitReached.primaryAction"
        ),
        onPress: handleAppRestart
      }}
      pictogram="accessDenied"
      subtitle={I18n.t("features.itWallet.offline.gate.limitReached.subtitle")}
      testID="itwOfflineAccessGateLimitReachedTestID"
      title={I18n.t("features.itWallet.offline.gate.limitReached.title")}
    />
  );
};

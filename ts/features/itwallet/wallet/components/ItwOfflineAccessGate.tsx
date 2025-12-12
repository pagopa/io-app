import { useFocusEffect } from "@react-navigation/native";
import I18n from "i18next";
import { PropsWithChildren, useState } from "react";
import { OperationResultScreenContent } from "../../../../components/screens/OperationResultScreenContent";
import { useIOSelector } from "../../../../store/hooks";
import {
  trackItwOfflineAccessExpired,
  trackItwOfflineAccessExpiring
} from "../../analytics";
import {
  itwIsOfflineAccessLimitReached,
  itwShouldDisplayOfflineAccessLimitWarning
} from "../../common/store/selectors/securePreferences";
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
      testID="itwOfflineAccessGateWarningTestID"
      pictogram="attention"
      title={I18n.t("features.itWallet.offline.gate.limitWarning.title")}
      subtitle={I18n.t("features.itWallet.offline.gate.limitWarning.subtitle")}
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
    />
  );
};

const LimitReachedScreenContent = () => {
  const handleAppRestart = useAppRestartAction("access_expired_screen");
  useFocusEffect(trackItwOfflineAccessExpired);

  return (
    <OperationResultScreenContent
      testID="itwOfflineAccessGateLimitReachedTestID"
      pictogram="accessDenied"
      title={I18n.t("features.itWallet.offline.gate.limitReached.title")}
      subtitle={I18n.t("features.itWallet.offline.gate.limitReached.subtitle")}
      action={{
        label: I18n.t(
          "features.itWallet.offline.gate.limitReached.primaryAction"
        ),
        accessibilityLabel: I18n.t(
          "features.itWallet.offline.gate.limitReached.primaryAction"
        ),
        onPress: handleAppRestart
      }}
    />
  );
};

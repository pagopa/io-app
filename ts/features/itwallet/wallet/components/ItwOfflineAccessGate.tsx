import { PropsWithChildren, useEffect, useState } from "react";
import { OperationResultScreenContent } from "../../../../components/screens/OperationResultScreenContent";
import { useIOSelector } from "../../../../store/hooks";
import {
  itwIsOfflineAccessLimitReached,
  itwShouldDisplayOfflineAccessLimitWarning
} from "../../common/store/selectors/securePreferences";
import { useAppRestartAction } from "../hooks/useAppRestartAction";
import I18n from "../../../../i18n";
import {
  trackItwOfflineAccessExpired,
  trackItwOfflineAccessExpiring
} from "../../analytics";

export const ItwOfflineAccessGate = ({ children }: PropsWithChildren) => {
  const [warningViewed, setWarningViewed] = useState(false);
  const isLimitReached = useIOSelector(itwIsOfflineAccessLimitReached);
  const shouldDisplayLimitWarning = useIOSelector(
    itwShouldDisplayOfflineAccessLimitWarning
  );

  const handleAppRestart = useAppRestartAction("banner");

  if (shouldDisplayLimitWarning && !warningViewed) {
    return <LimitWarningScreenContent setWarningViewed={setWarningViewed} />;
  }

  if (isLimitReached) {
    return <LimitReachedScreenContent handleAppRestart={handleAppRestart} />;
  }

  return children;
};

const LimitWarningScreenContent = ({
  setWarningViewed
}: {
  setWarningViewed: (viewed: boolean) => void;
}) => {
  useEffect(trackItwOfflineAccessExpiring, []);

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

const LimitReachedScreenContent = ({
  handleAppRestart
}: {
  handleAppRestart: () => void;
}) => {
  useEffect(trackItwOfflineAccessExpired, []);

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

import { HeaderSecondLevel } from "@io-app/design-system";
import { useNavigation } from "@react-navigation/native";
import I18n from "i18next";

import { useIOAlertVisible } from "../../../../components/StatusMessages/IOAlertVisibleContext";
import { useOfflineToastGuard } from "../../../../hooks/useOfflineToastGuard";
import { useStartSupportRequest } from "../../../../hooks/useStartSupportRequest";

export const MessageRouterHeader = () => {
  const { goBack } = useNavigation();
  const { isAlertVisible } = useIOAlertVisible();
  const startSupportRequest = useOfflineToastGuard(useStartSupportRequest());

  return (
    <HeaderSecondLevel
      backAccessibilityLabel={I18n.t("global.buttons.back")}
      firstAction={{
        icon: "help",
        onPress: startSupportRequest,
        accessibilityLabel: I18n.t(
          "global.accessibility.contextualHelp.open.label"
        )
      }}
      goBack={goBack}
      ignoreAccessibilityCheck
      ignoreSafeAreaMargin={isAlertVisible}
      title=""
      transparent={false}
      type="singleAction"
    />
  );
};

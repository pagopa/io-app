import { Body, FooterActions } from "@pagopa/io-app-design-system";
import { View } from "react-native";
import I18n from "i18next";
import { useIOBottomSheetModal } from "../../../../../utils/hooks/bottomSheet";
import {
  trackMixpanelConsentBottomsheet,
  trackMixpanelConsentCancel
} from "../../../common/analytics/mixpanel/mixpanelAnalytics";
import { getFlowType } from "../../../../../utils/analytics";
import { useOnFirstRender } from "../../../../../utils/hooks/useOnFirstRender";

const ConfirmOptOut = () => {
  useOnFirstRender(() => {
    trackMixpanelConsentBottomsheet(getFlowType(false, false));
  });
  return (
    <View>
      <View style={{ flex: 1 }}>
        <Body>{I18n.t("profile.main.privacy.shareData.alert.body")}</Body>
      </View>
    </View>
  );
};

export const useConfirmOptOutBottomSheet = (onConfirm: () => void) => {
  const { present, bottomSheet, dismiss } = useIOBottomSheetModal({
    component: <ConfirmOptOut />,
    title: I18n.t("profile.main.privacy.shareData.alert.title"),
    snapPoint: [350],
    footer: (
      <FooterActions
        actions={{
          type: "TwoButtons",
          primary: {
            label: I18n.t("global.buttons.confirm"),
            onPress: () => {
              dismiss();
              onConfirm();
            }
          },
          secondary: {
            label: I18n.t("global.buttons.cancel"),
            onPress: () => {
              trackMixpanelConsentCancel(getFlowType(false, false));
              dismiss();
            }
          }
        }}
      />
    )
  });

  return { present, bottomSheet, dismiss };
};

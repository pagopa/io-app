import { Body, FooterActions } from "@pagopa/io-app-design-system";
import I18n from "i18next";
import { View } from "react-native";

import { getFlowType } from "../../../../../utils/analytics";
import { useIOBottomSheetModal } from "../../../../../utils/hooks/bottomSheet";
import { useOnFirstRender } from "../../../../../utils/hooks/useOnFirstRender";
import {
  trackMixpanelConsentBottomsheet,
  trackMixpanelConsentCancel
} from "../../../common/analytics/mixpanel/mixpanelAnalytics";

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

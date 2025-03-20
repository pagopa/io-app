import { Body, FooterActions } from "@pagopa/io-app-design-system";
import { View } from "react-native";
import { IOStyles } from "../../../components/core/variables/IOStyles";
import I18n from "../../../i18n";
import { useIOBottomSheetModal } from "../../../utils/hooks/bottomSheet";

const ConfirmOptOut = () => (
  <View>
    <View style={IOStyles.flex}>
      <Body>{I18n.t("profile.main.privacy.shareData.alert.body")}</Body>
    </View>
  </View>
);

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
              dismiss();
            }
          }
        }}
      />
    )
  });

  return { present, bottomSheet, dismiss };
};

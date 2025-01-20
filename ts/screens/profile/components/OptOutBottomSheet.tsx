import { View } from "react-native";
import { Body, ButtonSolid, VSpacer } from "@pagopa/io-app-design-system";
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
      <View style={IOStyles.horizontalContentPadding}>
        <ButtonSolid
          fullWidth
          label={I18n.t("global.buttons.confirm")}
          onPress={() => {
            dismiss();
            onConfirm();
          }}
        />
        <VSpacer size={8} />
        <ButtonSolid
          fullWidth
          color="contrast"
          label={I18n.t("global.buttons.cancel")}
          onPress={() => {
            dismiss();
          }}
        />
      </View>
    )
  });

  return { present, bottomSheet, dismiss };
};

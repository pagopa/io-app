import { View } from "react-native";
import * as React from "react";
import { FooterWithButtons, VSpacer } from "@pagopa/io-app-design-system";
import { Body } from "../../../components/core/typography/Body";
import { IOStyles } from "../../../components/core/variables/IOStyles";
import I18n from "../../../i18n";
import { useLegacyIOBottomSheetModal } from "../../../utils/hooks/bottomSheet";

const ConfirmOptOut = (): React.ReactElement => (
  <View>
    <VSpacer size={16} />
    <View style={IOStyles.flex}>
      <Body>{I18n.t("profile.main.privacy.shareData.alert.body")}</Body>
    </View>
  </View>
);

export const useConfirmOptOutBottomSheet = (onConfirm: () => void) => {
  const { present, bottomSheet, dismiss } = useLegacyIOBottomSheetModal(
    <ConfirmOptOut />,
    I18n.t("profile.main.privacy.shareData.alert.title"),
    350,
    <FooterWithButtons
      type={"TwoButtonsInlineThird"}
      primary={{
        type: "Outline",
        buttonProps: {
          onPress: () => dismiss(),
          label: I18n.t("global.buttons.cancel")
        }
      }}
      secondary={{
        type: "Solid",
        buttonProps: {
          onPress: () => {
            dismiss();
            onConfirm();
          },
          label: I18n.t("global.buttons.confirm")
        }
      }}
    />
  );

  return { present, bottomSheet, dismiss };
};

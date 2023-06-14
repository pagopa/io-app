import { View } from "react-native";
import * as React from "react";
import { VSpacer } from "../../../components/core/spacer/Spacer";
import { Body } from "../../../components/core/typography/Body";
import { IOStyles } from "../../../components/core/variables/IOStyles";
import FooterWithButtons from "../../../components/ui/FooterWithButtons";
import {
  cancelButtonProps,
  errorButtonProps
} from "../../../features/bonus/bonusVacanze/components/buttons/ButtonConfigurations";
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
      leftButton={{
        ...cancelButtonProps(() => dismiss()),
        onPressWithGestureHandler: true
      }}
      rightButton={{
        ...errorButtonProps(() => {
          dismiss();
          onConfirm();
        }, I18n.t("global.buttons.confirm")),
        onPressWithGestureHandler: true
      }}
    />
  );

  return { present, bottomSheet, dismiss };
};

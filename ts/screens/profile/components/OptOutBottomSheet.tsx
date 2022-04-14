import { View } from "native-base";
import * as React from "react";
import { BottomSheetContent } from "../../../components/bottomSheet/BottomSheetContent";
import { Body } from "../../../components/core/typography/Body";
import { IOStyles } from "../../../components/core/variables/IOStyles";
import FooterWithButtons from "../../../components/ui/FooterWithButtons";
import {
  cancelButtonProps,
  errorButtonProps
} from "../../../features/bonus/bonusVacanze/components/buttons/ButtonConfigurations";
import I18n from "../../../i18n";
import { useIOBottomSheet } from "../../../utils/hooks/bottomSheet";

type ConfirmOptOutProps = {
  onCancel: () => void;
  onConfirm: () => void;
};

const ConfirmOptOut = (props: ConfirmOptOutProps): React.ReactElement => (
  <BottomSheetContent
    footer={
      <FooterWithButtons
        type={"TwoButtonsInlineThird"}
        leftButton={{
          ...cancelButtonProps(props.onCancel),
          onPressWithGestureHandler: true
        }}
        rightButton={{
          ...errorButtonProps(
            props.onConfirm,
            I18n.t("global.buttons.confirm")
          ),
          onPressWithGestureHandler: true
        }}
      />
    }
  >
    <View>
      <View spacer={true} />
      <View style={IOStyles.flex}>
        <Body>{I18n.t("profile.main.privacy.shareData.alert.body")}</Body>
      </View>
    </View>
  </BottomSheetContent>
);

export const useConfirmOptOutBottomSheet = (onConfirm: () => void) => {
  const { present, bottomSheet, dismiss } = useIOBottomSheet(
    <ConfirmOptOut
      onCancel={() => dismiss()}
      onConfirm={() => {
        dismiss();
        onConfirm();
      }}
    />,
    I18n.t("profile.main.privacy.shareData.alert.title"),
    350
  );

  return { present, bottomSheet, dismiss };
};

import { View } from "react-native";
import React, { useState } from "react";
import { RawCheckBox } from "../../../components/core/selection/checkbox/RawCheckBox";
import { VSpacer } from "../../../components/core/spacer/Spacer";
import { Body } from "../../../components/core/typography/Body";
import { IOStyles } from "../../../components/core/variables/IOStyles";
import FooterWithButtons from "../../../components/ui/FooterWithButtons";
import i18n from "../../../i18n";
import { useIOBottomSheetModal } from "../../../utils/hooks/bottomSheet";
import {
  cancelButtonProps,
  confirmButtonProps
} from "../../bonus/bonusVacanze/components/buttons/ButtonConfigurations";

const BOTTOM_SHEET_HEIGHT = 375;

type BottomSheetProps = Readonly<{
  onConfirm: (dontAskAgain: boolean) => void;
  onCancel: () => void;
}>;

export const useDownloadAttachmentBottomSheet = ({
  onConfirm,
  onCancel
}: BottomSheetProps) => {
  const [dontAskAgain, setDontAskAgain] = useState<boolean>(false);

  return useIOBottomSheetModal(
    <View>
      <VSpacer size={16} />
      <Body>
        {i18n.t("features.mvl.details.attachments.bottomSheet.warning.body")}
      </Body>
      <VSpacer size={16} />
      <View style={IOStyles.row}>
        <RawCheckBox
          checked={dontAskAgain}
          onPress={() => setDontAskAgain(!dontAskAgain)}
        />
        <Body
          style={{ paddingLeft: 8 }}
          onPress={() => setDontAskAgain(!dontAskAgain)}
        >
          {i18n.t("features.mvl.details.attachments.bottomSheet.checkBox")}
        </Body>
      </View>
    </View>,
    i18n.t("features.mvl.details.attachments.bottomSheet.warning.title"),
    BOTTOM_SHEET_HEIGHT,
    <FooterWithButtons
      type={"TwoButtonsInlineHalf"}
      leftButton={{
        ...cancelButtonProps(onCancel),
        onPressWithGestureHandler: true
      }}
      rightButton={{
        ...confirmButtonProps(() => {
          onConfirm(dontAskAgain);
        }, i18n.t("global.buttons.continue")),
        onPressWithGestureHandler: true
      }}
    />
  );
};

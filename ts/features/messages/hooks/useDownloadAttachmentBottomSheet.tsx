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
import { trackThirdPartyMessageAttachmentDoNotShow } from "../../../utils/analytics";

const BOTTOM_SHEET_HEIGHT = 375;

type BottomSheetProps = Readonly<{
  isGenericAttachment: boolean;
  onConfirm: (dontAskAgain: boolean) => void;
  onCancel: () => void;
}>;

function trackDoNotAskAgain(
  isGenericAttachment: boolean,
  afterTapValue: boolean
) {
  if (isGenericAttachment && afterTapValue) {
    trackThirdPartyMessageAttachmentDoNotShow();
  }
}

export const useDownloadAttachmentBottomSheet = ({
  isGenericAttachment,
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
          onPress={() => {
            trackDoNotAskAgain(isGenericAttachment, !dontAskAgain);
            setDontAskAgain(!dontAskAgain);
          }}
        />
        <Body
          style={{ paddingLeft: 8 }}
          onPress={() => {
            trackDoNotAskAgain(isGenericAttachment, !dontAskAgain);
            setDontAskAgain(!dontAskAgain);
          }}
        >
          {i18n.t("features.mvl.details.attachments.bottomSheet.checkBox")}
        </Body>
      </View>
    </View>,
    i18n.t("features.mvl.details.attachments.bottomSheet.warning.title"),
    BOTTOM_SHEET_HEIGHT,
    <FooterWithButtons
      type={
        isGenericAttachment ? "TwoButtonsInlineThird" : "TwoButtonsInlineHalf"
      }
      leftButton={{
        ...cancelButtonProps(onCancel),
        onPressWithGestureHandler: true
      }}
      rightButton={{
        ...confirmButtonProps(() => {
          onConfirm(dontAskAgain);
        }, i18n.t(isGenericAttachment ? "messageDetails.attachments.showPreview" : "global.buttons.continue")),
        onPressWithGestureHandler: true
      }}
    />
  );
};

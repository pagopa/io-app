import { View } from "native-base";
import React, { useState } from "react";
import { BottomSheetContent } from "../../../../../../components/bottomSheet/BottomSheetContent";
import { RawCheckBox } from "../../../../../../components/core/selection/checkbox/RawCheckBox";
import { Body } from "../../../../../../components/core/typography/Body";
import { IOStyles } from "../../../../../../components/core/variables/IOStyles";
import FooterWithButtons from "../../../../../../components/ui/FooterWithButtons";
import i18n from "../../../../../../i18n";
import { useIODispatch } from "../../../../../../store/hooks";
import { useIOBottomSheetRaw } from "../../../../../../utils/bottomSheet";
import {
  cancelButtonProps,
  confirmButtonProps
} from "../../../../../bonus/bonusVacanze/components/buttons/ButtonConfigurations";
import { MvlAttachment } from "../../../../types/mvlData";
import { handleDownloadResult } from "../../../../utils";
import { mvlPreferencesSetWarningForAttachments } from "../../../../store/actions";

type Props = {
  attachment: MvlAttachment;

  /**
   * Initial configuration for user preferences
   */
  initialPreferences: { dontAskAgain: boolean };

  /**
   *  Called on right-button press with the user's selected preferences (see also {@link initialPreferences})
   */
  onConfirm: (preferences: { dontAskAgain: boolean }) => void;

  onCancel: () => void;
};

const DownloadAttachmentConfirmationBottomSheet = (
  props: Props
): React.ReactElement => {
  const [dontAskAgain, setDontAskAgain] = useState<boolean>(
    props.initialPreferences.dontAskAgain
  );

  return (
    <BottomSheetContent
      footer={
        <FooterWithButtons
          type={"TwoButtonsInlineHalf"}
          leftButton={{
            ...cancelButtonProps(props.onCancel),
            onPressWithGestureHandler: true
          }}
          // TODO: start the download & save on device https://pagopa.atlassian.net/browse/IAMVL-27
          rightButton={{
            ...confirmButtonProps(
              () => props.onConfirm({ dontAskAgain }),
              i18n.t("global.buttons.continue")
            ),
            onPressWithGestureHandler: true
          }}
        />
      }
    >
      <View>
        <View spacer={true} />
        <Body>
          {i18n.t("features.mvl.details.attachments.bottomSheet.body")}
        </Body>
        <View spacer={true} />
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
      </View>
    </BottomSheetContent>
  );
};

export const useDownloadAttachmentConfirmationBottomSheet = (
  attachment: MvlAttachment,
  authHeader: { [key: string]: string },
  initialPreferences: { dontAskAgain: boolean }
) => {
  const { present, dismiss } = useIOBottomSheetRaw(375);
  const dispatch = useIODispatch();

  const openModalBox = () =>
    present(
      <DownloadAttachmentConfirmationBottomSheet
        attachment={attachment}
        onCancel={dismiss}
        onConfirm={({ dontAskAgain }) => {
          dispatch(mvlPreferencesSetWarningForAttachments(!dontAskAgain));
          void handleDownloadResult(attachment, authHeader);
          dismiss();
        }}
        initialPreferences={initialPreferences}
      />,
      i18n.t("features.mvl.details.attachments.bottomSheet.title")
    );

  return { present: openModalBox, dismiss };
};

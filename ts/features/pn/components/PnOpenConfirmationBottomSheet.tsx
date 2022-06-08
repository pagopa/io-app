import React, { useState } from "react";
import { View } from "react-native";
import { IORenderHtml } from "../../../components/core/IORenderHtml";
import { RawCheckBox } from "../../../components/core/selection/checkbox/RawCheckBox";
import { Body } from "../../../components/core/typography/Body";
import { IOStyles } from "../../../components/core/variables/IOStyles";
import FooterWithButtons from "../../../components/ui/FooterWithButtons";
import i18n from "../../../i18n";
import { UIMessage } from "../../../store/reducers/entities/messages/types";
import { useIOBottomSheetModal } from "../../../utils/hooks/bottomSheet";
import {
  cancelButtonProps,
  confirmButtonProps
} from "../../bonus/bonusVacanze/components/buttons/ButtonConfigurations";

const BOTTOM_SHEET_HEIGHT = 600;

type BottomSheetProps = Readonly<{
  /**
   * Called on right-button press with the user's selected message and preferences.
   */
  onConfirm: (message: UIMessage, dontAskAgain: boolean) => void;

  /**
   * The user canceled the action via the UI.
   */
  onCancel: () => void;
}>;

export const usePnOpenConfirmationBottomSheet = ({
  onConfirm,
  onCancel
}: BottomSheetProps) => {
  const [message, setMessage] = useState<UIMessage | null>(null);
  const [dontAskAgain, setDontAskAgain] = useState<boolean>(false);

  const useBottomSheet = useIOBottomSheetModal(
    <>
      <IORenderHtml
        source={{
          html: i18n.t("features.pn.open.warning.body", {
            sender: "Comune di Milano",
            subject: "Infrazione al codice della strada",
            date: "12 Luglio 2022 - 12.36",
            iun: "YYYYMM-1-ABCD-EFGH-X"
          })
        }}
        tagsStyles={{
          p: {
            marginTop: 10
          }
        }}
        classesStyles={{
          container: { marginVertical: 20 }
        }}
      />
      <View style={{ ...IOStyles.row, marginBottom: 20 }}>
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
    </>,
    i18n.t("features.pn.open.warning.title"),
    BOTTOM_SHEET_HEIGHT,
    <FooterWithButtons
      type={"TwoButtonsInlineHalf"}
      leftButton={{
        ...cancelButtonProps(onCancel),
        onPressWithGestureHandler: true
      }}
      rightButton={{
        ...confirmButtonProps(() => {
          if (message) {
            onConfirm(message, dontAskAgain);
          }
        }, i18n.t("global.buttons.continue")),
        onPressWithGestureHandler: true
      }}
    />
  );

  return {
    present: (message: UIMessage) => {
      setMessage(message);
      useBottomSheet.present();
    },
    dismiss: useBottomSheet.dismiss,
    bottomSheet: useBottomSheet.bottomSheet
  };
};

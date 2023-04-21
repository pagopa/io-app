import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import React, { useState } from "react";
import { View } from "react-native";
import { MessageCategoryPN } from "../../../../definitions/backend/MessageCategoryPN";
import HeaderImage from "../../../../img/features/pn/pn_alert_header.svg";
import { H4 } from "../../../components/core/typography/H4";
import { IOColors } from "../../../components/core/variables/IOColors";
import FooterWithButtons from "../../../components/ui/FooterWithButtons";
import i18n from "../../../i18n";
import { mixpanelTrack } from "../../../mixpanel";
import { UIMessage } from "../../../store/reducers/entities/messages/types";
import customVariables from "../../../theme/variables";
import { useIOBottomSheetModal } from "../../../utils/hooks/bottomSheet";
import {
  cancelButtonProps,
  confirmButtonProps
} from "../../bonus/bonusVacanze/components/buttons/ButtonConfigurations";

const BOTTOM_SHEET_HEIGHT = 500;

type BottomSheetProps = Readonly<{
  /**
   * Called on right-button press with the user's selected message and preferences.
   */
  onConfirm: (message: UIMessage, dontAskAgain: boolean) => void;
}>;

const Header = () => (
  <View
    style={{
      flex: 1,
      flexDirection: "row",
      alignItems: "center"
    }}
  >
    <HeaderImage
      width={32}
      height={32}
      fill={IOColors.blue}
      style={{ marginRight: customVariables.spacerWidth }}
    />
    <H4 weight="SemiBold" color="bluegreyDark"></H4>
  </View>
);

export const usePnOpenConfirmationBottomSheet = ({
  onConfirm
}: BottomSheetProps) => {
  const [message, setMessage] = useState<UIMessage | undefined>(undefined);
  const [dontAskAgain, setDontAskAgain] = useState<boolean>(false);

  const {
    present: bsPresent,
    dismiss: bsDismiss,
    bottomSheet
  } = useIOBottomSheetModal(
    <></>,
    <Header />,
    BOTTOM_SHEET_HEIGHT,
    <FooterWithButtons
      type={"TwoButtonsInlineHalf"}
      leftButton={{
        ...cancelButtonProps(() => {
          void mixpanelTrack("PN_DISCLAIMER_REJECTED");
          bsDismiss();
        }),
        onPressWithGestureHandler: true
      }}
      rightButton={{
        ...confirmButtonProps(() => {
          bsDismiss();
          if (message) {
            const notificationTimestamp = pipe(
              O.fromEither(MessageCategoryPN.decode(message.category)),
              O.map(category => category.original_receipt_date?.toISOString()),
              O.toUndefined
            );

            void mixpanelTrack("PN_DISCLAIMER_ACCEPTED", {
              eventTimestamp: new Date().toISOString(),
              messageTimestamp: message.createdAt.toISOString(),
              notificationTimestamp
            });
            onConfirm(message, dontAskAgain);
          }
        }, i18n.t("global.buttons.continue")),
        onPressWithGestureHandler: true
      }}
    />
  );

  return {
    present: (message: UIMessage) => {
      void mixpanelTrack("PN_DISCLAIMER_SHOW_SUCCESS");
      setDontAskAgain(false);
      setMessage(message);
      bsPresent();
    },
    dismiss: () => {
      setMessage(undefined);
      bsDismiss();
    },
    bottomSheet
  };
};

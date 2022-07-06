import { useLinkTo } from "@react-navigation/native";
import { fromEither, fromNullable } from "fp-ts/lib/Option";
import React, { useEffect, useState } from "react";
import { View } from "react-native";
import { MessageCategoryPN } from "../../../../definitions/backend/MessageCategoryPN";
import { IORenderHtml } from "../../../components/core/IORenderHtml";
import { RawCheckBox } from "../../../components/core/selection/checkbox/RawCheckBox";
import { Body } from "../../../components/core/typography/Body";
import { IOStyles } from "../../../components/core/variables/IOStyles";
import FooterWithButtons from "../../../components/ui/FooterWithButtons";
import { handleInternalLink } from "../../../components/ui/Markdown/handlers/internalLink";
import i18n from "../../../i18n";
import { UIMessage } from "../../../store/reducers/entities/messages/types";
import { formatDateAsLocal } from "../../../utils/dates";
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

type HTMLParams = Readonly<{
  sender: string;
  subject: string;
  date: string;
  iun: string;
}>;

const emptyHTMLParams: HTMLParams = {
  sender: "-",
  subject: "-",
  date: "-",
  iun: "-"
};
export const usePnOpenConfirmationBottomSheet = ({
  onConfirm,
  onCancel
}: BottomSheetProps) => {
  const [message, setMessage] = useState<UIMessage | undefined>(undefined);
  const [dontAskAgain, setDontAskAgain] = useState<boolean>(false);
  const [params, setParams] = useState<HTMLParams | undefined>(undefined);

  const linkTo = useLinkTo();
  const handleLink = (href: string) => {
    onCancel();
    handleInternalLink(linkTo, href);
  };

  useEffect(() => {
    const params = fromEither(MessageCategoryPN.decode(message?.category))
      .map(
        category =>
          ({
            sender: category.original_sender ?? emptyHTMLParams.sender,
            subject: category.summary ?? emptyHTMLParams.subject,
            date: fromNullable(category.original_receipt_date)
              .map(timestamp => new Date(timestamp))
              .map(
                date =>
                  `${formatDateAsLocal(
                    date,
                    true,
                    true
                  )} - ${date.toLocaleTimeString()}`
              )
              .getOrElse(emptyHTMLParams.date),
            iun: category.id
          } as HTMLParams)
      )
      .getOrElse(emptyHTMLParams);
    setParams(params);
  }, [message, setParams]);

  const useBottomSheet = useIOBottomSheetModal(
    <>
      <IORenderHtml
        source={{
          html: i18n.t("features.pn.open.warning.body", params)
        }}
        tagsStyles={{
          p: {
            marginTop: 10
          }
        }}
        classesStyles={{
          container: { marginVertical: 20 }
        }}
        renderersProps={{
          a: { onPress: (_, href) => handleLink(href) }
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
    dismiss: () => {
      setMessage(undefined);
      useBottomSheet.dismiss();
    },
    bottomSheet: useBottomSheet.bottomSheet
  };
};

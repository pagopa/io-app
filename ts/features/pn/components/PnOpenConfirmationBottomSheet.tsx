import { useLinkTo } from "@react-navigation/native";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import React, { useEffect, useState } from "react";
import { View } from "react-native";
import { MessageCategoryPN } from "../../../../definitions/backend/MessageCategoryPN";
import HeaderImage from "../../../../img/features/pn/pn_alert_header.svg";
import { IORenderHtml } from "../../../components/core/IORenderHtml";
import { H4 } from "../../../components/core/typography/H4";
import { IOColors } from "../../../components/core/variables/IOColors";
import FooterWithButtons from "../../../components/ui/FooterWithButtons";
import { handleInternalLink } from "../../../components/ui/Markdown/handlers/internalLink";
import i18n from "../../../i18n";
import { UIMessage } from "../../../store/reducers/entities/messages/types";
import customVariables from "../../../theme/variables";
import { useIOBottomSheetModal } from "../../../utils/hooks/bottomSheet";
import { localeDateFormat } from "../../../utils/locale";
import {
  cancelButtonProps,
  confirmButtonProps
} from "../../bonus/bonusVacanze/components/buttons/ButtonConfigurations";
import { mixpanelTrack } from "../../../mixpanel";

const BOTTOM_SHEET_HEIGHT = 500;

type BottomSheetProps = Readonly<{
  /**
   * Called on right-button press with the user's selected message and preferences.
   */
  onConfirm: (message: UIMessage, dontAskAgain: boolean) => void;
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
    <H4 weight="SemiBold" color="bluegreyDark">
      {i18n.t("features.pn.open.warning.title")}
    </H4>
  </View>
);

export const usePnOpenConfirmationBottomSheet = ({
  onConfirm
}: BottomSheetProps) => {
  const [message, setMessage] = useState<UIMessage | undefined>(undefined);
  const [dontAskAgain, setDontAskAgain] = useState<boolean>(false);
  const [params, setParams] = useState<HTMLParams | undefined>(undefined);

  const linkTo = useLinkTo();
  const handleLink = (href: string) => {
    handleInternalLink(linkTo, href);
  };

  useEffect(() => {
    const params = pipe(
      MessageCategoryPN.decode(message?.category),
      O.fromEither,
      O.map(
        category =>
          ({
            sender: category.original_sender ?? emptyHTMLParams.sender,
            subject: category.summary ?? emptyHTMLParams.subject,
            date: pipe(
              category.original_receipt_date,
              O.fromNullable,
              O.map(timestamp => new Date(timestamp)),
              O.map(
                date =>
                  `${localeDateFormat(
                    date,
                    i18n.t("global.dateFormats.shortFormatWithTime")
                  )}`
              ),
              O.getOrElse(() => emptyHTMLParams.date)
            ),
            iun: category.id
          } as HTMLParams)
      ),
      O.getOrElse(() => emptyHTMLParams)
    );
    setParams(params);
  }, [message, setParams]);

  const {
    present: bsPresent,
    dismiss: bsDismiss,
    bottomSheet
  } = useIOBottomSheetModal(
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
          a: {
            onPress: (_, href) => {
              bsDismiss();
              handleLink(href);
            }
          }
        }}
      />
    </>,
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
            const notificationTimestamp = fromEither(
              MessageCategoryPN.decode(message.category)
            )
              .map(category => category.original_receipt_date?.toISOString())
              .toUndefined();

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

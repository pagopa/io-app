import * as React from "react";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { IOColors } from "@pagopa/io-app-design-system";
import FooterWithButtons from "../../../../components/ui/FooterWithButtons";
import { UIMessage } from "../../types";
import { useIOSelector } from "../../../../store/hooks";
import { getPaginatedMessageById } from "../../store/reducers/paginatedById";
import I18n from "../../../../i18n";
import { trackNotificationRejected, trackUxConversion } from "../../analytics";

type Props = {
  messageId: string;
  onDismiss: () => void;
  navigationAction: (message: UIMessage) => void;
};

const foldMessage = (
  message: pot.Pot<UIMessage, Error>,
  callback: (message: UIMessage) => void
) => pipe(message, pot.toOption, O.map(callback));

export const PreconditionFooter = ({
  messageId,
  navigationAction,
  onDismiss
}: Props) => {
  const message = useIOSelector(state =>
    getPaginatedMessageById(state, messageId)
  );

  const handleCancelPress = () => {
    foldMessage(message, (foldedMessage: UIMessage) =>
      trackNotificationRejected(foldedMessage.category.tag)
    );
    onDismiss();
  };

  const handleContinuePress = () => {
    foldMessage(message, (foldedMessage: UIMessage) => {
      trackUxConversion(foldedMessage.category.tag);
      navigationAction(foldedMessage);
    });
    onDismiss();
  };

  return (
    <FooterWithButtons
      type={"TwoButtonsInlineHalf"}
      leftButton={{
        bordered: true,
        labelColor: IOColors.blue,
        title: I18n.t("global.buttons.cancel"),
        onPressWithGestureHandler: true,
        onPress: handleCancelPress
      }}
      rightButton={{
        primary: true,
        labelColor: IOColors.white,
        title: I18n.t("global.buttons.continue"),
        onPressWithGestureHandler: true,
        onPress: handleContinuePress
      }}
    />
  );
};

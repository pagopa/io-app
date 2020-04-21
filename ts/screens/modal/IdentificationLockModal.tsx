import { fromNullable } from "fp-ts/lib/Option";
import { Text } from "native-base";
import * as React from "react";
import { Image, Modal } from "react-native";
import I18n from "../../i18n";

type Props = {
  // milliseconds
  countdown?: number;
};

const errorIcon = require("../../../img/messages/error-message-detail-icon.png");

const wrongCodeText = I18n.t("identification.fail.wrongCode");
const waitMessageText = I18n.t("identification.fail.waitMessage");
const tooManyAttemptsText = I18n.t("identification.fail.tooManyAttempts");

const fromMillisecondsToTimeRepresentation = (milliseconds: number): string => {
  const roundedMs = 1000 * Math.round(milliseconds / 1000);
  const minutes = Math.floor(roundedMs / 60000).toString();
  const seconds = (roundedMs % 60000) / 1000;

  return minutes + ":" + (seconds < 10 ? "0" : "") + seconds.toFixed(0);
};

export const IdentificationLockModal: React.FunctionComponent<
  Props
> = props => {
  const minuteSeconds = fromNullable(props.countdown).fold(
    "0:00",
    fromMillisecondsToTimeRepresentation
  );

  return (
    <Modal>
      <Image source={errorIcon} />
      <Text bold={true} alignCenter={true}>
        {wrongCodeText}
      </Text>
      <Text>{tooManyAttemptsText}</Text>
      <Text>{waitMessageText}</Text>
      <Text>{minuteSeconds}</Text>
    </Modal>
  );
};

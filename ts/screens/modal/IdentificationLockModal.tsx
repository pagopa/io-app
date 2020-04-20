import { fromNullable } from "fp-ts/lib/Option";
import { Text } from "native-base";
import * as React from "react";
import { Image, Modal } from "react-native";

type Props = {
  // milliseconds
  countdown?: number;
};

const errorIcon = require("../../../img/messages/error-message-detail-icon.png");

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
        Codice Errato
      </Text>
      <Text>Troppi tentativi di inserimento errati</Text>
      <Text>Chiudi l'applicazione e riprova più tardi:</Text>
      <Text>{minuteSeconds}</Text>
    </Modal>
  );
};

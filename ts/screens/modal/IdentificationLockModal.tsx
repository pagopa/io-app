import { Text } from "native-base";
import * as React from "react";
import { Image, Modal } from "react-native";

type Props = {};

export const IdentificationLockModal: React.FunctionComponent<
  Props
> = props => {
  return (
    <Modal>
      <Image
        source={require("../../../img/messages/error-message-detail-icon.png")}
      />
      <Text bold={true} alignCenter={true}>
        Codice Errato
      </Text>
      <Text>Troppi tentativi di inserimento errati</Text>
      <Text>Chiudi l'applicazione e riprova più tardi:</Text>
      <Text>12:03</Text>
    </Modal>
  );
};

import { Button, Text, View } from "native-base";
import React from "react";

import { LightModalConsumer } from "./LightModal";

type ModalContentProps = {
  hideModal: () => void;
};

const ModalContent: React.SFC<ModalContentProps> = props => (
  <View style={{ backgroundColor: "yellow", flex: 1 }}>
    <Text>I am inside the modal</Text>
    <Button onPress={props.hideModal}>
      <Text>Close</Text>
    </Button>
  </View>
);

const LiteModalTestButton: React.SFC = () => (
  <LightModalConsumer>
    {({ showModal, hideModal }) => (
      <Button onPress={() => showModal(<ModalContent hideModal={hideModal} />)}>
        <Text>Open modal</Text>
      </Button>
    )}
  </LightModalConsumer>
);

export default LiteModalTestButton;

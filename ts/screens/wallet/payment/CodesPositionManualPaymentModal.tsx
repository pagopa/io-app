import { Body, Button, Container, Content, Right } from "native-base";
import * as React from "react";
import { Modal } from "react-native";

import AppHeader from "./../../../components/ui/AppHeader";
import IconFont from "./../../../components/ui/IconFont";

type Props = {
  onClose: () => void;
};

class CodesPositionManualPaymentModal extends React.PureComponent<Props> {
  public render() {
    return (
      <Modal animationType="slide" onRequestClose={this.props.onClose}>
        <Container>
          <AppHeader noLeft={true}>
            <Body />
            <Right>
              <Button onPress={this.props.onClose} transparent={true}>
                <IconFont name="io-close" />
              </Button>
            </Right>
          </AppHeader>
          <Content />
        </Container>
      </Modal>
    );
  }
}

export default CodesPositionManualPaymentModal;

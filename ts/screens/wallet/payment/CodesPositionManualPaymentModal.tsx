import { Body, Button, Container, Right } from "native-base";
import * as React from "react";

import AppHeader from "./../../../components/ui/AppHeader";
import IconFont from "./../../../components/ui/IconFont";

type Props = {
  onCancel: () => void;
};

class CodesPositionManualPaymentModal extends React.PureComponent<Props> {
  public render() {
    return (
      <Container>
        <AppHeader noLeft={true}>
          <Body />
          <Right>
            <Button onPress={this.props.onCancel} transparent={true}>
              <IconFont name="io-close" />
            </Button>
          </Right>
        </AppHeader>
      </Container>
    );
  }
}

export default CodesPositionManualPaymentModal;

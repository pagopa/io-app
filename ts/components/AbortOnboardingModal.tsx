import { Button, Container, Content, Right, Text } from "native-base";
import * as React from "react";
import { Modal, StyleSheet } from "react-native";

import I18n from "../i18n";
import AppHeader from "./ui/AppHeader";
import FooterWithButtons from "./ui/FooterWithButtons";
import IconFont from "./ui/IconFont";
import ScreenContent from './shared/ScreenContent';

const styles = StyleSheet.create({
  contentContainer: { flex: 1, justifyContent: "center" }
});

type Props = {
  onClose: () => void;
  onConfirm: () => void;
};

class AbortOnboardingModal extends React.PureComponent<Props> {
  public render() {
    return (
      <Modal visible={true} onRequestClose={this.props.onClose}>
        <Container>
          <AppHeader noLeft={true}>
            <Right>
              <Button transparent={true} onPress={this.props.onClose}>
                <IconFont name="io-close" />
              </Button>
            </Right>
          </AppHeader>

          <ScreenContent contentContainerStyle={styles.contentContainer}>
            <Text>{I18n.t("onboarding.resetConfirm")}</Text>
          </ScreenContent>

          <FooterWithButtons
            type="TwoButtonsInlineHalf"
            leftButton={{
              block: true,
              bordered: true,
              onPress: this.props.onClose,
              title: I18n.t("global.buttons.cancel")
            }}
            rightButton={{
              block: true,
              primary: true,
              onPress: this.props.onConfirm,
              title: I18n.t("global.buttons.continue")
            }}
          />
        </Container>
      </Modal>
    );
  }
}

export default AbortOnboardingModal;

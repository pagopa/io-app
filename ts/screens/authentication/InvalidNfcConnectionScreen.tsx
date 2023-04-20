/**
 * A screen where the user is warned of a problem about the NFC card reading.
 * TODO: The contextualHelp will be added in https://www.pivotaltracker.com/n/projects/2048617/stories/169392558
 */

import { Container } from "native-base";
import * as React from "react";
import { View, StyleSheet } from "react-native";

import BaseScreenComponent from "../../components/screens/BaseScreenComponent";
import FooterWithButtons from "../../components/ui/FooterWithButtons";
import { H1 } from "../../components/core/typography/H1";
import I18n from "../../i18n";
import {
  AppParamsList,
  IOStackNavigationProp
} from "../../navigation/params/AppParamsList";
import { VSpacer } from "../../components/core/spacer/Spacer";
import { Body } from "../../components/core/typography/Body";

type OwnProps = {
  navigation: IOStackNavigationProp<AppParamsList>;
};

type Props = OwnProps;

const styles = StyleSheet.create({
  container: {
    margin: 24
  }
});

class InvalidNfcConnectionScreen extends React.Component<Props, never> {
  /**
   * Footer
   */
  private renderFooterButtons() {
    const cancelButtonProps = {
      cancel: true,
      block: true,
      onPress: (): void => this.props.navigation.goBack(),
      title: I18n.t("global.buttons.cancel")
    };
    const retryButtonProps = {
      block: true,
      primary: true,
      onPress: undefined,
      title: I18n.t("global.buttons.retry")
    };

    return (
      <FooterWithButtons
        type="TwoButtonsInlineThird"
        leftButton={cancelButtonProps}
        rightButton={retryButtonProps}
      />
    );
  }

  public render() {
    return (
      <Container>
        <BaseScreenComponent goBack={true}>
          <Container>
            <View style={styles.container}>
              <H1>{I18n.t("authentication.cie.nfc.noNfcConnectionTitle")}</H1>
              <VSpacer size={24} />
              <Body>
                {I18n.t("authentication.cie.nfc.noNfcConnectionContent")}
              </Body>
            </View>
          </Container>
        </BaseScreenComponent>
        {this.renderFooterButtons()}
        <View />
      </Container>
    );
  }
}

export default InvalidNfcConnectionScreen;

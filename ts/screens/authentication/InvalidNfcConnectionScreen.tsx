/**
 * A screen where the user is warned of a problem with the NFC connection.
 * TODO: The contextualHelp will be added in https://www.pivotaltracker.com/n/projects/2048617/stories/169392558
 */

import { Container, H2, View } from "native-base";
import * as React from "react";
import { NavigationScreenProp, NavigationState } from "react-navigation";

import BaseScreenComponent from "../../components/screens/BaseScreenComponent";
import FooterWithButtons from "../../components/ui/FooterWithButtons";
import Markdown from "../../components/ui/Markdown";
import I18n from "../../i18n";

type OwnProps = {
  navigation: NavigationScreenProp<NavigationState>;
};

type Props = OwnProps;

class InvalidNfcConnectionScreen extends React.Component<Props, never> {
  /**
   * Footer
   */
  private renderFooterButtons() {
    const cancelButtonProps = {
      cancel: true,
      block: true,
      onPress: (): boolean => this.props.navigation.goBack(),
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
            <View style={{ margin: 24 }}>
              <H2>
                {I18n.t("authentication.landing.cie.noNfcConnectionTitle")}
              </H2>
              <Markdown>
                {I18n.t("authentication.landing.cie.noNfcConnectionContent")}
              </Markdown>
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

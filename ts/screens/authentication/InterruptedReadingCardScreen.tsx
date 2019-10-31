import { Container, H2, Text, View } from "native-base";
import * as React from "react";
import { StyleSheet } from "react-native";
import { NavigationScreenProp, NavigationState } from "react-navigation";
import BaseScreenComponent from "../../components/screens/BaseScreenComponent";
import FooterWithButtons from "../../components/ui/FooterWithButtons";
import I18n from "../../i18n";
import variables from "../../theme/variables";

type OwnProps = Readonly<{
  navigation: NavigationScreenProp<NavigationState>;
}>;

type Props = OwnProps;

const styles = StyleSheet.create({
  contentContainerStyle: {
    padding: variables.contentPadding
  },
  text: {
    fontSize: variables.fontSizeBase
  }
});

class InterruptedReadingCardScreen extends React.Component<Props> {
  constructor(props: Props) {
    super(props);
  }

  /**
   * Footer
   */
  private renderFooterButtons() {
    const cancelButtonProps = {
      cancel: true,
      onPress: (): boolean => this.props.navigation.goBack(),
      title: I18n.t("global.buttons.cancel"),
      block: true
    };

    const retryButtonProps = {
      onPress: undefined,
      title: I18n.t("global.buttons.retry"),
      block: true
    };

    return (
      <FooterWithButtons
        type={"TwoButtonsInlineThird"}
        leftButton={cancelButtonProps}
        rightButton={retryButtonProps}
      />
    );
  }
  // TODO: ContextualHelp will be introduced within (https://www.pivotaltracker.com/n/projects/2048617/stories/169392558)
  public render(): React.ReactNode {
    return (
      <Container>
        <BaseScreenComponent goBack={true}>
          <View style={styles.contentContainerStyle}>
            <H2>
              {I18n.t("authentication.landing.cie.cardRemovedEarlyTitle")}
            </H2>
            <View spacer={true} />
            <Text style={styles.text}>
              {I18n.t("authentication.landing.cie.cardRemovedEarlyContent")}
            </Text>
          </View>
        </BaseScreenComponent>
        {this.renderFooterButtons()}
      </Container>
    );
  }
}

export default InterruptedReadingCardScreen;

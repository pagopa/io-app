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

type Props = OwnProps &
  Readonly<{
    onRetry: () => void;
  }>;

const styles = StyleSheet.create({
  contentContainerStyle: {
    padding: variables.contentPadding
  },
  text: {
    fontSize: variables.fontSizeBase
  }
});

class InterruptedReadingCardScreen extends React.Component<Props> {
  /**
   * Footer
   */
  get cancelButtonProps() {
    return {
      cancel: true,
      onPress: this.props.navigation.goBack,
      title: I18n.t("global.buttons.cancel"),
      block: true
    };
  }
  get retryButtonProps() {
    return {
      onPress: this.props.onRetry,
      title: I18n.t("global.buttons.retry"),
      block: true
    };
  }
  private renderFooterButtons() {
    return (
      <FooterWithButtons
        type={"TwoButtonsInlineThird"}
        leftButton={this.cancelButtonProps}
        rightButton={this.retryButtonProps}
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
              {I18n.t("authentication.cie.card.error.cardRemovedEarlyTitle")}
            </H2>
            <View spacer={true} />
            <Text style={styles.text}>
              {I18n.t("authentication.cie.card.error.cardRemovedEarlyContent")}
            </Text>
          </View>
        </BaseScreenComponent>
        {this.renderFooterButtons()}
      </Container>
    );
  }
}

export default InterruptedReadingCardScreen;

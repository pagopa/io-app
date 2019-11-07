import { Container, H1, Text, View } from "native-base";
import * as React from "react";
import { Alert, StyleSheet } from "react-native";
import { NavigationScreenProp, NavigationState } from "react-navigation";
import BaseScreenComponent from "../../components/screens/BaseScreenComponent";
import FooterWithButtons from "../../components/ui/FooterWithButtons";
import I18n from "../../i18n";
import customVariables from "../../theme/variables";

type Props = Readonly<{
  navigation: NavigationScreenProp<NavigationState>;
  remainingCount: number;
}>;
const styles = StyleSheet.create({
  contentContainerStyle: {
    padding: customVariables.contentPadding
  },
  text: {
    fontSize: customVariables.fontSizeBase
  }
});

class IncorrectCiePinScreen extends React.Component<Props> {
  public render(): React.ReactNode {
    const cancelButtonProps = {
      block: true,
      cancel: true,
      onPress: this.props.navigation.goBack,
      title: I18n.t("global.buttons.cancel")
    };
    const retryButtonProps = {
      block: true,
      primary: true,
      onPress: (): void => Alert.alert(I18n.t("global.notImplemented")),
      title: I18n.t("global.buttons.retry")
    };
    const remainingCount = this.props.remainingCount || 2; // TODO
    return (
      <Container>
        <BaseScreenComponent goBack={true}>
          <View style={styles.contentContainerStyle}>
            <H1>
              {I18n.t("authentication.landing.cie.incorrectCiePinTitle", {
                remainingCount
              })}
            </H1>
            <Text>
              {I18n.t("authentication.landing.cie.incorrectCiePinContent1")}
            </Text>
            <View spacer={true} />
            <Text>
              {I18n.t("authentication.landing.cie.incorrectCiePinContent2")}
            </Text>
            <View spacer={true} />
          </View>
        </BaseScreenComponent>
        <FooterWithButtons
          type={"TwoButtonsInlineThird"}
          rightButton={retryButtonProps}
          leftButton={cancelButtonProps}
        />
      </Container>
    );
  }
}
export default IncorrectCiePinScreen;

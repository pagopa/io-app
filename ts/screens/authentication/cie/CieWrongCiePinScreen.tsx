import { Container, H1, Text, View } from "native-base";
import * as React from "react";
import { StyleSheet } from "react-native";
import {
  NavigationScreenProp,
  NavigationScreenProps,
  NavigationState
} from "react-navigation";
import BaseScreenComponent from "../../../components/screens/BaseScreenComponent";
import FooterWithButtons from "../../../components/ui/FooterWithButtons";
import I18n from "../../../i18n";
import ROUTES from "../../../navigation/routes";
import customVariables from "../../../theme/variables";
import { isNfcEnabled } from "../../../utils/cie";

interface OwnProps {
  navigation: NavigationScreenProp<NavigationState>;
}
type NavigationParams = {
  remainingCount: number;
};

type Props = OwnProps &
  Readonly<{
    navigation: NavigationScreenProp<NavigationState>;
  }> &
  NavigationScreenProps<NavigationParams>;

const styles = StyleSheet.create({
  contentContainerStyle: {
    padding: customVariables.contentPadding
  },
  text: {
    fontSize: customVariables.fontSizeBase
  }
});

class CieWrongCiePinScreen extends React.Component<Props> {
  private navigateToCiePinScreen = async () => {
    const isNfcOn = await isNfcEnabled();
    this.props.navigation.navigate(
      isNfcOn ? ROUTES.CIE_PIN_SCREEN : ROUTES.CIE_NFC_SCREEN
    );
  };

  get ciePinRemainingCount(): string {
    return this.props.navigation.getParam("remainingCount");
  }

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
      onPress: this.navigateToCiePinScreen,
      title: I18n.t("global.buttons.retry")
    };
    const remainingCount = this.ciePinRemainingCount;
    return (
      <Container>
        <BaseScreenComponent goBack={false}>
          <View style={styles.contentContainerStyle}>
            <H1>
              {I18n.t("authentication.cie.pin.incorrectCiePinTitle", {
                remainingCount
              })}
            </H1>
            <Text>
              {I18n.t("authentication.cie.pin.incorrectCiePinContent1")}
            </Text>
            <View spacer={true} />
            <Text>
              {I18n.t("authentication.cie.pin.incorrectCiePinContent2")}
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
export default CieWrongCiePinScreen;

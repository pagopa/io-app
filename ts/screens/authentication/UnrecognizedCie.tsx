import { Container, H1, Text, View } from "native-base";
import * as React from "react";
import { StyleSheet } from "react-native";
import { NavigationScreenProp, NavigationState } from "react-navigation";
import BaseScreenComponent from "../../components/screens/BaseScreenComponent";
import FooterWithButtons from "../../components/ui/FooterWithButtons";
import I18n from "../../i18n";
import customVariables from "../../theme/variables";

type OwnProps = Readonly<{
  navigation: NavigationScreenProp<NavigationState>;
}>;
type Props = OwnProps;
const styles = StyleSheet.create({
  contentContainerStyle: {
    padding: customVariables.contentPadding
  },
  text: {
    fontSize: customVariables.fontSizeBase
  }
});

class UnrecognizedCie extends React.Component<Props> {
  public render(): React.ReactNode {
    const cancelButtonProps = {
      block: true,
      cancel: true,
      onPress: (): void => {
        this.props.navigation.goBack();
      },
      title: I18n.t("global.buttons.cancel")
    };
    const retryButtonProps = {
      block: true,
      primary: true,
      onPress: (): void => undefined,
      title: I18n.t("global.buttons.retry")
    };

    return (
      <Container>
        <BaseScreenComponent goBack={true}>
          <View style={styles.contentContainerStyle}>
            <H1>{I18n.t("authentication.landing.unknownCardTitle")}</H1>
            <View spacer={true} />
            <Text style={styles.text}>
              {I18n.t("authentication.landing.unknownCardContent")}
            </Text>
            <View spacer={true} />
            {
              // to know more about CIE, open CIE info screen
              // TODO: https://www.pivotaltracker.com/story/show/169167508
            }
            <Text link={true} onPress={undefined}>
              {I18n.t("authentication.landing.unknownCardHelpLink")}
            </Text>
          </View>
        </BaseScreenComponent>
        <FooterWithButtons
          type="TwoButtonsInlineHalf"
          rightButton={retryButtonProps}
          leftButton={cancelButtonProps}
        />
      </Container>
    );
  }
}
export default UnrecognizedCie;

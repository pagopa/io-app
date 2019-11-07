/**
 * A screen where invite the user to update app because the current version is unsupported
 *
 */

import { Container, H2, Text, View } from "native-base";
import * as React from "react";
import { Image, StyleSheet } from "react-native";
import { NavigationScreenProp, NavigationState } from "react-navigation";
import BaseScreenComponent from "../components/screens/BaseScreenComponent";
import FooterWithButtons from "../components/ui/FooterWithButtons";
import I18n from "../i18n";

import customVariables from "../theme/variables";

type OwnProps = Readonly<{
  navigation: NavigationScreenProp<NavigationState>;
}>;

type Props = OwnProps;

const styles = StyleSheet.create({
  text: {
    marginTop: customVariables.contentPadding,
    fontSize: 20
  },
  container: {
    margin: customVariables.contentPadding,
    flex: 1,
    alignItems: "flex-start"
  },
  img: {
    marginTop: customVariables.contentPadding,
    alignSelf: "center"
  }
});

class UpdateAppScreen extends React.PureComponent<Props> {
  constructor(props: Props) {
    super(props);
  }
  /**
   * Footer
   */
  private renderFooterButtons() {
    const cancelButtonProps = {
      cancel: true,
      block: true,
      onPress: undefined,
      title: I18n.t("global.buttons.cancel")
    };
    const updateButtonProps = {
      block: true,
      primary: true,
      onPress: undefined,
      title: I18n.t("btnUpdateApp")
    };

    return (
      <FooterWithButtons
        type="TwoButtonsInlineThird"
        leftButton={cancelButtonProps}
        rightButton={updateButtonProps}
      />
    );
  }

  public render() {
    return (
      <Container>
        <BaseScreenComponent appLogo={true} goBack={false}>
          <Container>
            <View style={styles.container}>
              <H2>{I18n.t("titleUpdateApp")}</H2>
              <Text style={styles.text}>{I18n.t("messageUpdateApp")}</Text>
              <View spacer={true} large={true} />
              <Image
                style={styles.img}
                source={require("../../img/icons/update-icon.png")}
              />
            </View>
          </Container>
        </BaseScreenComponent>
        {this.renderFooterButtons()}
        <View />
      </Container>
    );
  }
}

export default UpdateAppScreen;

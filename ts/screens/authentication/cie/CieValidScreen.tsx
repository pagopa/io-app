import { Content, View } from "native-base";
import * as React from "react";
import { Alert, Image, Platform, StyleSheet } from "react-native";
import { NavigationScreenProps } from "react-navigation";
import { ScreenContentHeader } from "../../../components/screens/ScreenContentHeader";
import TopScreenComponent from "../../../components/screens/TopScreenComponent";
import IconFont from "../../../components/ui/IconFont";
import I18n from "../../../i18n";
import { navigateToCieConfirmDataUsage } from "../../../store/actions/navigation";
import variables from "../../../theme/variables";

type NavigationParams = {
  cieConsentUri: string;
};

type Props = NavigationScreenProps<NavigationParams>;

const boxDimension = 180;
const cieImage = require("../../../../img/landing/place-card-illustration.png");

const styles = StyleSheet.create({
  image: {
    width: boxDimension,
    height: boxDimension,
    resizeMode: "cover",
    borderColor: variables.brandLightGray,
    borderWidth: 1.5,
    borderRadius: Platform.OS === "ios" ? boxDimension / 2 : boxDimension
  },
  center: {
    alignSelf: "center"
  },
  absolute: {
    position: "absolute"
  }
});

class CieValidScreen extends React.Component<Props> {
  public componentDidMount() {
    setTimeout(() => {
      this.props.navigation.navigate(
        navigateToCieConfirmDataUsage({
          cieConsentUri: this.cieAuthorizationUri
        })
      );
    }, 1500);
  }

  get cieAuthorizationUri(): string {
    return this.props.navigation.getParam("cieConsentUri");
  }

  // TODO: add also footer button for cancel??
  private handleBack = () => {
    Alert.alert(I18n.t("authentication.cie.pin.alert"), undefined, [
      {
        text: I18n.t("global.buttons.cancel"),
        style: "cancel"
      },
      {
        text: I18n.t("global.buttons.confirm"),
        style: "default",
        onPress: this.props.navigation.goBack // Maybe return to pin/landing screen
      }
    ]);
  };

  public render(): React.ReactNode {
    return (
      <TopScreenComponent
        goBack={this.handleBack}
        title={"CIE readed"} // TODO: validate
      >
        <ScreenContentHeader
          title={I18n.t("global.buttons.ok2")}
          subtitle={I18n.t("authentication.cie.card.cieCardValid")}
        />
        <Content>
          <View spacer={true} />
          <View style={styles.center}>
            <Image source={cieImage} style={[styles.image]} />
            <IconFont
              name={"io-success"}
              color={variables.textLinkColor}
              size={50}
              style={styles.absolute}
            />
          </View>
        </Content>
      </TopScreenComponent>
    );
  }
}

export default CieValidScreen;

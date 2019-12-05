import { H1, Text, View } from "native-base";
import * as React from "react";
import { Dimensions, Image, Platform, StyleSheet } from "react-native";
import { NavigationScreenProp, NavigationState } from "react-navigation";
import BaseScreenComponent from "../../../components/screens/BaseScreenComponent";
import IconFont from "../../../components/ui/IconFont";
import I18n from "../../../i18n";
import variables from "../../../theme/variables";

type OwnProps = Readonly<{
  navigation: NavigationScreenProp<NavigationState>;
}>;

type Props = OwnProps;

const screenWidth = Dimensions.get("screen").width;
const boxDimension = 180;
const cieImage = require("../../../../img/landing/place-card-illustration.png");

const styles = StyleSheet.create({
  contentContainerStyle: {
    padding: variables.contentPadding
  },
  container: {
    width: boxDimension,
    flex: 1,
    alignContent: "flex-start"
  },
  containerBox: {
    width: screenWidth,
    height: boxDimension,
    alignItems: "center",
    alignContent: "flex-start",
    flex: 1
  },
  image: {
    width: boxDimension,
    height: boxDimension,
    resizeMode: "cover",
    position: "absolute",
    alignItems: "flex-end",
    borderColor: variables.brandLightGray,
    borderWidth: 1.5,
    borderRadius: Platform.OS === "ios" ? boxDimension / 2 : boxDimension
  },
  text: {
    fontSize: variables.fontSizeBase
  },
  success: {
    justifyContent: "flex-start"
  }
});

class CieValidScreen extends React.Component<Props> {
  public render(): React.ReactNode {
    return (
      <BaseScreenComponent goBack={true}>
        <View style={styles.contentContainerStyle}>
          <H1>{I18n.t("authentication.landing.ok")}</H1>
          <Text style={styles.text}>
            {I18n.t("authentication.landing.cieCardValid")}
          </Text>
        </View>
        <View spacer={true} extralarge={true} />
        <View style={styles.containerBox}>
          <View style={styles.container}>
            <Image source={cieImage} style={styles.image} />
            <IconFont
              style={styles.success}
              name="io-success"
              color={variables.textLinkColor}
              size={50}
            />
          </View>
        </View>
      </BaseScreenComponent>
    );
  }
}

export default CieValidScreen;

import { Option } from "fp-ts/lib/Option";
import { H1, Text, View } from "native-base";
import * as React from "react";
import { Dimensions, Image, Platform, StyleSheet } from "react-native";
import {
  NavigationEvents,
  NavigationScreenProp,
  NavigationState
} from "react-navigation";
import { connect } from "react-redux";
import BaseScreenComponent from "../../components/screens/BaseScreenComponent";
import IconFont from "../../components/ui/IconFont";
import I18n from "../../i18n";
import variables from "../../theme/variables";

type OwnProps = Readonly<{
  navigation: NavigationScreenProp<NavigationState>;
}>;

type Props = OwnProps;

type State = Readonly<{
  securityCode: Option<string>;
  holder: Option<string>;
}>;

const screenWidth = Dimensions.get("screen").width;
const boxDimension = 200;

const styles = StyleSheet.create({
  contentContainerStyle: {
    padding: variables.contentPadding
  },
  container: {
    width: boxDimension,
    height: boxDimension,
    alignItems: "center",
    alignContent: "flex-start",
    flex: 1,
    backgroundColor: "yellow"
  },
  containerBox: {
    width: screenWidth,
    height: 200,
    alignItems: "center",
    alignContent: "flex-start",
    flex: 1,
    backgroundColor: "red"
  },
  image: {
    width: 180,
    height: 180,
    resizeMode: "cover",
    borderColor: variables.brandLightGray,
    borderWidth: 1.5,
    borderRadius: Platform.OS === "ios" ? 180 / 2 : 180
  },
  text: {
    fontSize: variables.fontSizeBase
  }
});

class CieConfirmScreen extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
  }

  public render(): React.ReactNode {
    return (
      <BaseScreenComponent goBack={true}>
        <NavigationEvents onWillFocus={undefined} />
        <View style={styles.contentContainerStyle}>
          <H1>{I18n.t("authentication.landing.ok")}</H1>
          <Text style={styles.text}>
            {I18n.t("authentication.landing.cardOk")}
          </Text>
        </View>
        <View spacer={true} extralarge={true} />
        <View style={styles.containerBox}>
          <View style={styles.container}>
            <Image
              source={require("../../../img/landing/place-card-illustration.png")}
              style={styles.image}
            />
            <IconFont
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

export default connect()(CieConfirmScreen);

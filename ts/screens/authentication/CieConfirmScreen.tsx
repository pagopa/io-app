import { none, Option } from "fp-ts/lib/Option";
import { Col, Content, Grid, H1, Text, View } from "native-base";
import * as React from "react";
import { Dimensions, Image, StyleSheet } from "react-native";
import {
  NavigationEvents,
  NavigationScreenProp,
  NavigationState
} from "react-navigation";
import { connect } from "react-redux";
import BaseScreenComponent from "../../components/screens/BaseScreenComponent";
// import I18n from "../../i18n";
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

const styles = StyleSheet.create({
  contentContainerStyle: {
    padding: variables.contentPadding
  },
  container: {
    width: screenWidth,
    alignItems: "center",
    alignContent: "flex-start"
  },
  image: {
    width: screenWidth / 2,
    height: screenWidth / 2,
    resizeMode: "contain",
    borderColor: variables.brandLightGray,
    borderWidth: 1
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
        <Content
          contentContainerStyle={styles.contentContainerStyle}
          noPadded={true}
        >
          <H1>Ok</H1>
          <Text>
            Ok, la tua carta è valida! Attendi ancora qualche secondo..
          </Text>
        </Content>
        <View style={styles.container}>
          <Image
            source={require("../../../img/landing/cie/place-card-illustration.png")}
            style={styles.image}
          />
          <View spacer={true} />
          <Grid>
            <Col size={1} />
            <Col size={7}>
              <View spacer={true} />
            </Col>
            <Col size={1} />
          </Grid>
        </View>
      </BaseScreenComponent>
    );
  }
}

export default connect()(CieConfirmScreen);

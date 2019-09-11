import { Body, Container, Right } from "native-base";
import * as React from "react";
import { BackHandler, Dimensions, Image, StyleSheet } from "react-native";
import ImageZoom from "react-native-image-pan-zoom";
import ButtonWithoutOpacity from "../../../components/ButtonWithoutOpacity";

import AppHeader from "./../../../components/ui/AppHeader";
import IconFont from "./../../../components/ui/IconFont";

type Props = {
  onCancel: () => void;
};

const pngHeight = 2000;
const pngWidth = 2828;
const screenHeight = Dimensions.get("screen").height;
const screenWidth = Dimensions.get("screen").width;

const imageHeight = (screenWidth * pngWidth) / pngHeight;
const imageWidth = (screenHeight * pngHeight) / pngWidth;
const styles = StyleSheet.create({
  imageStyle: {
    width: imageWidth,
    height: imageHeight,
    resizeMode: "contain",
    justifyContent: "center",
    alignSelf: "center"
  },
  textStyle: {
    fontSize: 30
  }
});

class CodesPositionManualPaymentModal extends React.PureComponent<Props> {
  private handleBackPress = () => {
    this.props.onCancel();
    return true;
  };

  public componentDidMount() {
    BackHandler.addEventListener("hardwareBackPress", this.handleBackPress);
  }

  public componentWillUnmount() {
    BackHandler.removeEventListener("hardwareBackPress", this.handleBackPress);
  }

  public render() {
    return (
      <Container>
        <AppHeader noLeft={true}>
          <Body />
          <Right>
            <ButtonWithoutOpacity
              onPress={this.props.onCancel}
              transparent={true}
            >
              <IconFont name="io-close" />
            </ButtonWithoutOpacity>
          </Right>
        </AppHeader>
        <ImageZoom
          imageHeight={screenHeight}
          imageWidth={screenWidth}
          cropHeight={screenHeight}
          cropWidth={screenWidth}
        >
          <Image
            source={require("../../../../img/wallet/payment-notice-pagopa.png")}
            style={styles.imageStyle}
          />
        </ImageZoom>
      </Container>
    );
  }
}

export default CodesPositionManualPaymentModal;

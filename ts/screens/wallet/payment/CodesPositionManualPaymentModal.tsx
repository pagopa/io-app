import { Body, Container, Right } from "native-base";
import * as React from "react";
import {
  BackHandler,
  Dimensions,
  Image,
  NativeEventSubscription,
  StyleSheet
} from "react-native";
import ImageZoom from "react-native-image-pan-zoom";
import ButtonDefaultOpacity from "../../../components/ButtonDefaultOpacity";

import { Icon } from "../../../components/core/icons/Icon";
import AppHeader from "./../../../components/ui/AppHeader";

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
  }
});

class CodesPositionManualPaymentModal extends React.PureComponent<Props> {
  private subscription: NativeEventSubscription | undefined;
  private handleBackPress = () => {
    this.props.onCancel();
    return true;
  };

  public componentDidMount() {
    // eslint-disable-next-line functional/immutable-data
    this.subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      this.handleBackPress
    );
  }

  public componentWillUnmount() {
    this.subscription?.remove();
  }

  public render() {
    return (
      <Container>
        <AppHeader noLeft={true}>
          <Body />
          <Right>
            <ButtonDefaultOpacity
              onPress={this.props.onCancel}
              transparent={true}
            >
              <Icon name="legClose" color="black" />
            </ButtonDefaultOpacity>
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

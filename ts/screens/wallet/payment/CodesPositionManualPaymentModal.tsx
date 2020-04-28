import * as React from "react";
import { Dimensions, Image, StyleSheet } from "react-native";
import ImageZoom from "react-native-image-pan-zoom";
import BaseScreenComponent from "../../../components/screens/BaseScreenComponent";

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
  public render() {
    return (
      <BaseScreenComponent
        isModal={true}
        customRightIcon={{ iconName: "io-close", onPress: this.props.onCancel }}
      >
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
      </BaseScreenComponent>
    );
  }
}

export default CodesPositionManualPaymentModal;

import * as React from "react";
import {
  BackHandler,
  Dimensions,
  Image,
  NativeEventSubscription,
  StyleSheet,
  View
} from "react-native";
import ImageZoom from "react-native-image-pan-zoom";
import {
  HeaderSecondLevel,
  IOColors,
  IOStyles
} from "@pagopa/io-app-design-system";
import I18n from "../../../i18n";

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
      <View style={[IOStyles.flex, { backgroundColor: IOColors.white }]}>
        <HeaderSecondLevel
          title=""
          type="singleAction"
          firstAction={{
            icon: "closeLarge",
            onPress: this.handleBackPress,
            accessibilityLabel: I18n.t("global.buttons.close"),
            testID: "contextualInfo_closeButton"
          }}
        />
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
      </View>
    );
  }
}

export default CodesPositionManualPaymentModal;

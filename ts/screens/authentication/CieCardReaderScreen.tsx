import { Button, Content, H2, Text, View } from "native-base";
import * as React from "react";
import { Image, StyleSheet } from "react-native";
import ProgressCircle from "react-native-progress-circle";
import { NavigationScreenProp, NavigationState } from "react-navigation";
import ScreenHeader from "../../components/ScreenHeader";
import BaseScreenComponent from "../../components/screens/BaseScreenComponent";
import I18n from "../../i18n";
import customVariables from "../../theme/variables";

interface OwnProps {
  navigation: NavigationScreenProp<NavigationState>;
}

type Props = OwnProps;
// Image dimension
const imgDimension = 180;
/** Every stepTimeProgress update circular progress, max value progress is 100, example
 *  50: the animation ending in 16 seconds
 *  60: the animation ending in 19 seconds
 *  ecc ecc
 */
const stepTimeProgress = 50;

const styles = StyleSheet.create({
  messageHeader: {
    paddingRight: customVariables.contentPadding,
    paddingLeft: customVariables.contentPadding,
    paddingTop: customVariables.contentPadding,
    paddingBottom: customVariables.contentPadding / 2,
    fontSize: customVariables.fontSizeBase
  },
  messageFooter: {
    paddingRight: customVariables.contentPadding,
    paddingLeft: customVariables.contentPadding,
    paddingBottom: customVariables.contentPadding,
    paddingTop: customVariables.contentPadding / 2,
    fontSize: customVariables.fontSizeBase
  },
  titleHeader: {
    marginTop: 35
  },
  imgContainer: {
    justifyContent: "center",
    alignItems: "center"
  },
  img: {
    overflow: "hidden",
    backgroundColor: customVariables.colorWhite,
    height: imgDimension - 3,
    width: imgDimension - 3,
    borderRadius: imgDimension / 2
  }
});

type State = {
  progressBarValue: number;
};

/**
 *  This screen shown while reading the card
 */
class CieCardReaderScreen extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      progressBarValue: 0
    };
    // Start an interval to increment progress bar
    const interval = setInterval(() => {
      // After 60% decrease velocity
      if (this.state.progressBarValue < 60) {
        this.setState({
          progressBarValue: this.state.progressBarValue + 0.5
        });
      } else {
        this.setState({
          progressBarValue: this.state.progressBarValue + 0.2
        });
      }
      // Stop interval
      if (this.state.progressBarValue >= 100) {
        clearInterval(interval);
      }
    }, stepTimeProgress);
  }
  // With the AnimatedCircularProgress component we can represent a circular progress
  public render(): React.ReactNode {
    return (
      <BaseScreenComponent goBack={true}>
        <Content noPadded={true} bounces={false}>
          <ScreenHeader
            heading={
              <H2 style={styles.titleHeader}>
                {I18n.t("authentication.cie.readerCardTitle")}
              </H2>
            }
          />
          <Text style={styles.messageHeader}>
            {I18n.t("authentication.cie.readerCardHeader")}
          </Text>
          <View style={styles.imgContainer}>
            <ProgressCircle
              percent={this.state.progressBarValue}
              radius={imgDimension / 2}
              borderWidth={3}
              color={customVariables.brandPrimary}
              shadowColor={customVariables.brandLightGray}
              bgColor={customVariables.brandLightGray}
            >
              <Image
                source={require("../../../img/landing/place-card-illustration.png")}
                style={styles.img}
              />
            </ProgressCircle>
          </View>
          <Text style={styles.messageFooter}>
            {I18n.t("authentication.cie.readerCardFooter")}
          </Text>
        </Content>
        <View footer={true}>
          <Button
            onPress={this.props.navigation.goBack}
            cancel={true}
            block={true}
          >
            <Text>{I18n.t("global.buttons.cancel")}</Text>
          </Button>
        </View>
      </BaseScreenComponent>
    );
  }
}

export default CieCardReaderScreen;

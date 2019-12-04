import { Millisecond } from "italia-ts-commons/lib/units";
import { Button, Content, H2, Text, View } from "native-base";
import * as React from "react";
import { Image, StyleSheet } from "react-native";
import ProgressCircle from "react-native-progress-circle";
import { NavigationScreenProp, NavigationState } from "react-navigation";
import AnimatedRing from "../../components/animations/AnimatedRing";
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
const boxDimension = 245;
/** Every stepTimeProgress update circular progress, max value progress is 100, example
 *  50: the animation ending in 16 seconds
 *  60: the animation ending in 19 seconds
 *  ecc ecc
 */
const stepTimeProgress = 50;

const styles = StyleSheet.create({
  messageHeader: {
    minHeight: 90,
    paddingRight: customVariables.contentPadding,
    paddingLeft: customVariables.contentPadding,
    paddingTop: customVariables.contentPadding,
    fontSize: customVariables.fontSizeBase
  },
  messageFooter: {
    paddingRight: customVariables.contentPadding,
    paddingLeft: customVariables.contentPadding,
    paddingBottom: customVariables.contentPadding,
    fontSize: customVariables.fontSizeBase
  },
  titleHeader: {
    marginTop: 35
  },
  imgContainer: {
    justifyContent: "center",
    alignItems: "center",
    height: boxDimension
  },
  img: {
    overflow: "hidden",
    backgroundColor: customVariables.colorWhite,
    height: imgDimension - 3,
    width: imgDimension - 3,
    borderRadius: imgDimension / 2
  },
  rings: {
    height: boxDimension,
    width: boxDimension,
    position: "absolute",
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center"
  }
});

type State = {
  progressBarValue: number;
  // This boolean change progress color, if true the color turns red
  isReadInterrupted: boolean;
};

/**
 *  This screen shown while reading the card
 */
class CieCardReaderScreen extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      progressBarValue: 0,
      isReadInterrupted: false
    };
    // Start an interval to increment progress bar
    const interval = setInterval(() => {
      // After 60% decrease velocity
      if (this.state.progressBarValue < 60) {
        this.setState({
          progressBarValue: this.state.isReadInterrupted
            ? this.state.progressBarValue
            : this.state.progressBarValue + 0.5
        });
      } else {
        this.setState({
          progressBarValue: this.state.isReadInterrupted
            ? this.state.progressBarValue
            : this.state.progressBarValue + 0.2
        });
      }
      // Stop interval
      if (this.state.progressBarValue >= 100 || this.state.isReadInterrupted) {
        clearInterval(interval);
      }
    }, stepTimeProgress);

    // TODO: remove this!!
    // Simulates user interruption
    // tslint:disable-next-line: no-commented-code
    /*  setTimeout(() => {
      this.setState({
        isReadInterrupted: true
      });
    }, 5000); */
  }

  public render(): React.ReactNode {
    // Setting for 'radar' animation
    const ringSettings = {
      dimension: imgDimension,
      // Three different animation start delays (one is 0), one for each ring
      delayX1: 700 as Millisecond,
      delayX2: 1400 as Millisecond,
      duration: 2100 as Millisecond
    };

    return (
      <BaseScreenComponent goBack={true}>
        <Content noPadded={true} bounces={false}>
          <ScreenHeader
            heading={
              <H2 style={styles.titleHeader}>
                {this.state.isReadInterrupted
                  ? I18n.t("authentication.cie.readerCardLostTitle")
                  : I18n.t("authentication.cie.readerCardTitle")}
              </H2>
            }
          />
          <Text style={styles.messageHeader}>
            {this.state.isReadInterrupted
              ? I18n.t("authentication.cie.readerCardLostHeader")
              : I18n.t("authentication.cie.readerCardHeader")}
          </Text>
          <View style={styles.imgContainer}>
            <View style={styles.rings}>
              {this.state.isReadInterrupted && (
                <AnimatedRing
                  dimension={ringSettings.dimension}
                  startAnimationAfter={0 as Millisecond}
                  duration={ringSettings.duration}
                  boxDimension={boxDimension}
                />
              )}
              {this.state.isReadInterrupted && (
                <AnimatedRing
                  dimension={ringSettings.dimension}
                  startAnimationAfter={ringSettings.delayX1}
                  duration={ringSettings.duration}
                  boxDimension={boxDimension}
                />
              )}
              {this.state.isReadInterrupted && (
                <AnimatedRing
                  dimension={ringSettings.dimension}
                  startAnimationAfter={ringSettings.delayX2}
                  duration={ringSettings.duration}
                  boxDimension={boxDimension}
                />
              )}
            </View>
            <ProgressCircle
              percent={this.state.progressBarValue}
              radius={imgDimension / 2}
              borderWidth={3}
              color={
                this.state.isReadInterrupted
                  ? customVariables.brandDanger
                  : customVariables.brandPrimary
              }
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
            {this.state.isReadInterrupted
              ? ""
              : I18n.t("authentication.cie.readerCardFooter")}
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

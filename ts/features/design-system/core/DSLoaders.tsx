import {
  H3,
  IOColors,
  LoadingSpinner,
  Pictogram,
  ProgressLoader,
  VSpacer,
  hexToRgba,
  useIOTheme
} from "@pagopa/io-app-design-system";
import * as React from "react";
import { StyleSheet, View } from "react-native";
import ProgressCircle from "react-native-progress-circle";
import ActivityIndicator from "../../../components/ui/ActivityIndicator";
import { LoadingIndicator } from "../../../components/ui/LoadingIndicator";
import I18n from "../../../i18n";
import { DSComponentViewerBox } from "../components/DSComponentViewerBox";
import { DesignSystemScreen } from "../components/DesignSystemScreen";
import { CircularProgress } from "../../../components/ui/CircularProgress";

// Image dimension
const imgDimension = 188;
const progressThreshold = 60;
const circleBorderWidth = 3;

const styles = StyleSheet.create({
  spinnerOuter: {
    alignSelf: "flex-start",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: hexToRgba(IOColors.black, 0.15),
    padding: 16,
    overflow: "hidden"
  },
  sectionTitle: {
    marginBottom: 16
  },
  imgWrapper: {
    height: imgDimension + 30,
    width: imgDimension + 30,
    paddingStart: 15,
    paddingTop: 25
  },
  flexStart: {
    justifyContent: "flex-start"
  }
});

type SpinnerViewerBox = {
  name: string;
  children: React.ReactNode;
  variant?: "default" | "primary";
};

const viewerBackgroundMap: Record<
  NonNullable<SpinnerViewerBox["variant"]>,
  IOColors
> = {
  default: "white",
  primary: "blueIO-500"
};

const SpinnerViewerBox = ({
  name,
  children,
  variant = "default"
}: SpinnerViewerBox) => (
  <DSComponentViewerBox name={name}>
    <View
      style={[
        styles.spinnerOuter,
        { backgroundColor: IOColors[viewerBackgroundMap[variant]] }
      ]}
    >
      {children}
    </View>
  </DSComponentViewerBox>
);

const ProgressLoaderViewerBox = () => {
  const [progress, setProgress] = React.useState(0);
  React.useEffect(() => {
    const interval = setInterval(() => {
      // console.log("progress", progress, (progress + 10) % 100);
      setProgress(prev => (prev + 10) % 100);
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <View style={{ borderRadius: 8, overflow: "hidden" }}>
      <View style={{ backgroundColor: IOColors.white, padding: 16 }}>
        <ProgressLoader progress={progress} />
      </View>
      <View style={{ backgroundColor: IOColors["blueIO-500"], padding: 16 }}>
        <ProgressLoader progress={90} />
      </View>
    </View>
  );
};

const ProgressCircleViewerBox = () => (
  <>
    <View style={{ alignSelf: "center" }} accessible={false}>
      <View style={styles.flexStart}>
        <ProgressCircle
          percent={80}
          radius={imgDimension / 2}
          borderWidth={circleBorderWidth}
          // color={
          //   this.props.readingState === ReadingState.error
          //     ? IOColors.greyLight
          //     : this.props.circleColor
          // }
          shadowColor={IOColors.greyLight}
          bgColor={IOColors.white}
        >
          <View style={styles.imgWrapper}>
            <Pictogram size={"100%"} name={"nfcScaniOS"} />
          </View>
        </ProgressCircle>
      </View>
    </View>
    <VSpacer />
    <CircularProgress
      radius={imgDimension / 2}
      progress={10}
      size={imgDimension}
      strokeWidth={circleBorderWidth}
      strokeBgColor={IOColors.greyLight}
      strokeColor={IOColors.blue}
    >
      <View style={styles.imgWrapper}>
        <Pictogram size={"100%"} name={"nfcScaniOS"} />
      </View>
    </CircularProgress>
  </>
);

export const DSLoaders = () => {
  const theme = useIOTheme();

  return (
    <DesignSystemScreen title={"Loaders"}>
      {/* Present in the main Messages screen */}
      <H3
        color={theme["textHeading-default"]}
        weight={"Semibold"}
        style={styles.sectionTitle}
      >
        Activity Indicator
      </H3>
      <SpinnerViewerBox name="ActivityIndicator · Large size, primary legacy color">
        <ActivityIndicator
          animating={true}
          size={"large"}
          color={IOColors.blue}
          accessible={true}
          accessibilityHint={I18n.t(
            "global.accessibility.activityIndicator.hint"
          )}
          accessibilityLabel={I18n.t(
            "global.accessibility.activityIndicator.label"
          )}
          importantForAccessibility={"no-hide-descendants"}
          testID={"activityIndicator"}
        />
      </SpinnerViewerBox>

      <VSpacer />

      <H3
        color={theme["textHeading-default"]}
        weight={"Semibold"}
        style={styles.sectionTitle}
      >
        Loading Indicator
      </H3>
      <SpinnerViewerBox name="LoadingIndicator, with predefined visual attributes">
        <LoadingIndicator />
      </SpinnerViewerBox>

      <H3
        color={theme["textHeading-default"]}
        weight={"Semibold"}
        style={styles.sectionTitle}
      >
        Loading Spinner
      </H3>
      <SpinnerViewerBox name="LoadingSpinner · Size 24, primary color">
        <LoadingSpinner color="blueIO-500" />
      </SpinnerViewerBox>
      <SpinnerViewerBox
        name="LoadingSpinner · Size 24, white color"
        variant="primary"
      >
        <LoadingSpinner color="white" />
      </SpinnerViewerBox>
      <SpinnerViewerBox name="LoadingSpinner · Size 48, default color">
        <LoadingSpinner size={48} />
      </SpinnerViewerBox>

      <H3>ProgressLoader</H3>
      <ProgressLoaderViewerBox />

      <VSpacer />

      <H3>ProgressCircle</H3>
      <ProgressCircleViewerBox />
    </DesignSystemScreen>
  );
};

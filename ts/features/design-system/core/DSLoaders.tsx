import {
  H4,
  IOColors,
  LoadingSpinner,
  Pictogram,
  ProgressLoader,
  VStack,
  hexToRgba,
  useIOTheme
} from "@pagopa/io-app-design-system";

import { ReactNode, useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import ActivityIndicator from "../../../components/ui/ActivityIndicator";
import { CircularProgress } from "../../../components/ui/CircularProgress";
import { LoadingIndicator } from "../../../components/ui/LoadingIndicator";
import I18n from "../../../i18n";
import { DSComponentViewerBox } from "../components/DSComponentViewerBox";
import { DesignSystemScreen } from "../components/DesignSystemScreen";

// Image dimension
const imgDimension = 188;
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
  imgWrapper: {
    height: imgDimension + 30,
    width: imgDimension + 30,
    paddingStart: 15,
    paddingTop: 25
  }
});

type SpinnerViewerBox = {
  name: string;
  children: ReactNode;
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
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      // console.log("progress", progress, (progress + 10) % 100);
      setProgress(prev => (prev + 10) % 100);
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <View
      style={{
        borderRadius: 16,
        borderCurve: "continuous",
        overflow: "hidden",
        borderColor: hexToRgba(IOColors.black, 0.15),
        borderWidth: 1
      }}
    >
      <View style={{ backgroundColor: IOColors.white, padding: 16 }}>
        <ProgressLoader progress={progress} />
      </View>
      <View style={{ backgroundColor: IOColors["blueIO-500"], padding: 16 }}>
        <ProgressLoader progress={90} />
      </View>
    </View>
  );
};

const CircularProgressViewerBox = () => (
  <CircularProgress
    radius={imgDimension / 2}
    progress={10}
    size={imgDimension}
    strokeWidth={circleBorderWidth}
    strokeBgColor={IOColors["grey-100"]}
    strokeColor={IOColors.blue}
  >
    <View style={styles.imgWrapper}>
      <Pictogram size={"100%"} name={"nfcScaniOS"} />
    </View>
  </CircularProgress>
);

const sectionMargin = 40;
const sectionTitleMargin = 16;

export const DSLoaders = () => {
  const theme = useIOTheme();

  return (
    <DesignSystemScreen title={"Loaders"}>
      <VStack space={sectionMargin}>
        <VStack space={sectionTitleMargin}>
          <H4 color={theme["textHeading-default"]}>Activity Indicator</H4>
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
        </VStack>

        <VStack space={sectionTitleMargin}>
          <H4 color={theme["textHeading-default"]}>Loading Indicator</H4>
          <SpinnerViewerBox name="LoadingIndicator, with predefined visual attributes">
            <LoadingIndicator />
          </SpinnerViewerBox>
        </VStack>

        <VStack space={sectionTitleMargin}>
          <H4 color={theme["textHeading-default"]}>Loading Spinner</H4>
          <VStack space={16}>
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
          </VStack>
        </VStack>

        <VStack space={sectionTitleMargin}>
          <H4 color={theme["textHeading-default"]}>ProgressLoader</H4>
          <ProgressLoaderViewerBox />
        </VStack>

        <VStack space={sectionTitleMargin}>
          {/* CIE Card Reading */}
          <H4 color={theme["textHeading-default"]}>CircularProgress</H4>
          <CircularProgressViewerBox />
        </VStack>
      </VStack>
    </DesignSystemScreen>
  );
};

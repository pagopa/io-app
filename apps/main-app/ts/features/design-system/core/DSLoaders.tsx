import {
  H4,
  hexToRgba,
  IOColors,
  LoadingSpinner,
  Pictogram,
  ProgressLoader,
  useIOTheme,
  VStack
} from "@pagopa/io-app-design-system";
import I18n from "i18next";
import { ReactNode, useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";

import { CircularProgress } from "../../../components/ui/CircularProgress";
import { LoadingIndicator } from "../../../components/ui/LoadingIndicator";
import { DesignSystemScreen } from "../components/DesignSystemScreen";
import { DSComponentViewerBox } from "../components/DSComponentViewerBox";

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
  children: ReactNode;
  name: string;
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

  return <ProgressLoader progress={progress} />;
};

const CircularProgressViewerBox = () => {
  const theme = useIOTheme();

  return (
    <CircularProgress
      progress={10}
      radius={imgDimension / 2}
      size={imgDimension}
      strokeBgColor={IOColors[theme["appBackground-tertiary"]]}
      strokeColor={IOColors[theme["interactiveElem-default"]]}
      strokeWidth={circleBorderWidth}
    >
      <View style={styles.imgWrapper}>
        <Pictogram name={"nfcScaniOS"} size={"100%"} />
      </View>
    </CircularProgress>
  );
};

const sectionMargin = 40;
const sectionTitleMargin = 16;

export const DSLoaders = () => {
  const theme = useIOTheme();

  return (
    <DesignSystemScreen title={"Loaders"}>
      <VStack space={sectionMargin}>
        <VStack space={sectionTitleMargin}>
          <H4 color={theme["textHeading-default"]}>Activity Indicator</H4>
          <DSComponentViewerBox name="ActivityIndicator · Large size, primary color">
            <View style={{ alignItems: "flex-start" }}>
              <ActivityIndicator
                accessibilityHint={I18n.t(
                  "global.accessibility.activityIndicator.hint"
                )}
                accessibilityLabel={I18n.t(
                  "global.accessibility.activityIndicator.label"
                )}
                accessible={true}
                animating={true}
                color={IOColors[theme["interactiveElem-default"]]}
                importantForAccessibility={"no-hide-descendants"}
                size={"large"}
                testID={"activityIndicator"}
              />
            </View>
          </DSComponentViewerBox>
        </VStack>

        <VStack space={sectionTitleMargin}>
          <H4 color={theme["textHeading-default"]}>Loading Indicator</H4>
          <DSComponentViewerBox name="LoadingIndicator, with predefined visual attributes">
            <LoadingIndicator />
          </DSComponentViewerBox>
        </VStack>

        <VStack space={sectionTitleMargin}>
          <H4 color={theme["textHeading-default"]}>Loading Spinner</H4>
          <VStack space={16}>
            <SpinnerViewerBox name="LoadingSpinner · Size 24, primary color">
              <LoadingSpinner
                color={IOColors[theme["interactiveElem-default"]]}
              />
            </SpinnerViewerBox>
            <SpinnerViewerBox
              name="LoadingSpinner · Size 24, white color"
              variant="primary"
            >
              <LoadingSpinner color="white" />
            </SpinnerViewerBox>
            <DSComponentViewerBox name="LoadingSpinner · Size 48, default color">
              <LoadingSpinner size={48} />
            </DSComponentViewerBox>
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

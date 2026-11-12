import {
  H4,
  LoadingSpinner,
  Pictogram,
  ProgressLoader,
  useIOColors,
  VStack
} from "@io-app/design-system";
import I18n from "i18next";
import { ReactNode, useEffect, useState } from "react";
import { ActivityIndicator, ColorValue, StyleSheet, View } from "react-native";

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

const SpinnerViewerBox = ({
  name,
  children,
  variant = "default"
}: SpinnerViewerBox) => {
  const colors = useIOColors();

  const viewerBackgroundMap: Record<
    NonNullable<SpinnerViewerBox["variant"]>,
    ColorValue
  > = {
    default: colors.background.default,
    primary: colors.background.accent
  };

  return (
    <DSComponentViewerBox name={name}>
      <View
        style={[
          styles.spinnerOuter,
          {
            backgroundColor: viewerBackgroundMap[variant],
            borderColor: colors.stroke.default
          }
        ]}
      >
        {children}
      </View>
    </DSComponentViewerBox>
  );
};

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
  const colors = useIOColors();

  return (
    <CircularProgress
      progress={10}
      radius={imgDimension / 2}
      size={imgDimension}
      strokeBgColor={colors.surface.tertiary}
      strokeColor={colors.foreground.accent}
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
  const colors = useIOColors();

  return (
    <DesignSystemScreen title={"Loaders"}>
      <VStack space={sectionMargin}>
        <VStack space={sectionTitleMargin}>
          <H4>Activity Indicator</H4>
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
                color={colors.foreground.accent}
                importantForAccessibility={"no-hide-descendants"}
                size={"large"}
                testID={"activityIndicator"}
              />
            </View>
          </DSComponentViewerBox>
        </VStack>

        <VStack space={sectionTitleMargin}>
          <H4>Loading Indicator</H4>
          <DSComponentViewerBox name="LoadingIndicator, with predefined visual attributes">
            <LoadingIndicator />
          </DSComponentViewerBox>
        </VStack>

        <VStack space={sectionTitleMargin}>
          <H4>Loading Spinner</H4>
          <VStack space={16}>
            <SpinnerViewerBox name="LoadingSpinner · Size 24, primary color">
              <LoadingSpinner color={colors.foreground.accent} />
            </SpinnerViewerBox>
            <SpinnerViewerBox
              name="LoadingSpinner · Size 24, white color"
              variant="primary"
            >
              <LoadingSpinner color={colors.foreground.onAccent.default} />
            </SpinnerViewerBox>
            <DSComponentViewerBox name="LoadingSpinner · Size 48, default color">
              <LoadingSpinner size={48} />
            </DSComponentViewerBox>
          </VStack>
        </VStack>

        <VStack space={sectionTitleMargin}>
          <H4>ProgressLoader</H4>
          <ProgressLoaderViewerBox />
        </VStack>

        <VStack space={sectionTitleMargin}>
          {/* CIE Card Reading */}
          <H4>CircularProgress</H4>
          <CircularProgressViewerBox />
        </VStack>
      </VStack>
    </DesignSystemScreen>
  );
};

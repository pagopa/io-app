import * as React from "react";
import {
  H3,
  IOColors,
  LoadingSpinner,
  ProgressLoader,
  VSpacer,
  hexToRgba,
  useIOTheme
} from "@pagopa/io-app-design-system";
import { View, StyleSheet } from "react-native";
import ActivityIndicator from "../../../components/ui/ActivityIndicator";
import { DesignSystemScreen } from "../components/DesignSystemScreen";
import I18n from "../../../i18n";
import { DSComponentViewerBox } from "../components/DSComponentViewerBox";
import { LoadingIndicator } from "../../../components/ui/LoadingIndicator";

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
    </DesignSystemScreen>
  );
};

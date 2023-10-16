import * as React from "react";
import {
  IOColors,
  LoadingSpinner,
  VSpacer,
  hexToRgba,
  useIOTheme
} from "@pagopa/io-app-design-system";
import { View, StyleSheet } from "react-native";
import ActivityIndicator from "../../../components/ui/ActivityIndicator";
import { DesignSystemScreen } from "../components/DesignSystemScreen";
import I18n from "../../../i18n";
import { H2 } from "../../../components/core/typography/H2";
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

export const DSLoaders = () => {
  const theme = useIOTheme();

  return (
    <DesignSystemScreen title={"Loaders"}>
      {/* Present in the main Messages screen */}
      <H2
        color={theme["textHeading-default"]}
        weight={"SemiBold"}
        style={styles.sectionTitle}
      >
        Activity Indicator
      </H2>
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

      <H2
        color={theme["textHeading-default"]}
        weight={"SemiBold"}
        style={styles.sectionTitle}
      >
        Loading Spinner
      </H2>
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

      <VSpacer />

      <H2
        color={theme["textHeading-default"]}
        weight={"SemiBold"}
        style={styles.sectionTitle}
      >
        Loading Indicator
      </H2>
      <SpinnerViewerBox name="LoadingIndicator, with predefined visual attributes">
        <LoadingIndicator />
      </SpinnerViewerBox>
    </DesignSystemScreen>
  );
};

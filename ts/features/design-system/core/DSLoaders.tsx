import * as React from "react";
import {
  IOColors,
  LoadingSpinner,
  VSpacer,
  hexToRgba,
  useIOTheme
} from "@pagopa/io-app-design-system";
import { View } from "react-native";
import ActivityIndicator from "../../../components/ui/ActivityIndicator";
import { DesignSystemScreen } from "../components/DesignSystemScreen";
import I18n from "../../../i18n";
import { H2 } from "../../../components/core/typography/H2";
import { H3 } from "../../../components/core/typography/H3";
import { DSComponentViewerBox } from "../components/DSComponentViewerBox";

export const DSLoaders = () => {
  const theme = useIOTheme();

  return (
    <DesignSystemScreen title={"Loaders"}>
      {/* Present in the main Messages screen */}
      <H2 color={theme["textHeading-default"]} weight={"SemiBold"}>
        Activity Indicator
      </H2>
      <VSpacer size={24} />
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
      <VSpacer size={40} />
      <H2 color={theme["textHeading-default"]} weight={"SemiBold"}>
        Loading Spinner
      </H2>
      <VSpacer size={16} />
      <DSComponentViewerBox name="LoadingSpinner, different colors">
        <View
          style={{
            borderRadius: 16,
            borderWidth: 1,
            borderColor: hexToRgba(IOColors.black, 0.15),
            overflow: "hidden"
          }}
        >
          <View style={{ backgroundColor: IOColors.white, padding: 16 }}>
            <LoadingSpinner color="blueIO-500" />
          </View>
          <View
            style={{ backgroundColor: IOColors["blueIO-500"], padding: 16 }}
          >
            <LoadingSpinner color="white" />
          </View>
        </View>
      </DSComponentViewerBox>
      <DSComponentViewerBox name="LoadingSpinner · Size 48, stroke 5, default color">
        <View
          style={{
            alignSelf: "flex-start",
            borderRadius: 16,
            borderWidth: 1,
            borderColor: hexToRgba(IOColors.black, 0.15),
            overflow: "hidden"
          }}
        >
          <View
            style={{
              backgroundColor: IOColors.white,
              padding: 16
            }}
          >
            <LoadingSpinner size={48} stroke={5} color="blueIO-500" />
          </View>
        </View>
      </DSComponentViewerBox>
    </DesignSystemScreen>
  );
};

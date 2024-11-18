/**
 * An ingress screen to choose the real first screen the user must navigate to.
 */
import {
  ContentWrapper,
  H3,
  IOColors,
  useIOTheme,
  VStack
} from "@pagopa/io-app-design-system";
import * as React from "react";
import { AccessibilityInfo, Platform, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LoadingIndicator } from "../../components/ui/LoadingIndicator";
import { WithTestID } from "../../types/WithTestID";
import {
  AnimatedPictogram,
  AnimatedPictogramSource
} from "../ui/AnimatedPictogramComponent";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center"
  }
});

const SPACE_BETWEEN_SPINNER_AND_TEXT = 24;

type LoadingScreenContentProps = WithTestID<{
  contentTitle: string;
  children?: React.ReactNode;
  headerVisible?: boolean;
  animatedPictogramSource?: AnimatedPictogramSource;
}>;

export const LoadingScreenContent = (props: LoadingScreenContentProps) => {
  const theme = useIOTheme();
  const {
    contentTitle,
    children,
    headerVisible,
    testID,
    animatedPictogramSource
  } = props;

  React.useEffect(() => {
    // Since the screen is shown for a very short time,
    // we prefer to announce the content to the screen reader,
    // instead of focusing the first element.
    if (Platform.OS === "android") {
      // We use it only on Android, because on iOS the screen reader
      // stops reading the content when the ingress screen is unmounted
      // and the focus is moved to another element.
      AccessibilityInfo.announceForAccessibility(contentTitle);
    }
  }, [contentTitle]);

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: IOColors[theme["appBackground-primary"]] }
      ]}
      edges={headerVisible ? ["bottom"] : undefined}
      testID={testID}
    >
      <ContentWrapper>
        <VStack
          space={SPACE_BETWEEN_SPINNER_AND_TEXT}
          style={{ alignItems: "center" }}
        >
          <View
            accessible={false}
            accessibilityElementsHidden={true}
            importantForAccessibility={"no-hide-descendants"}
          >
            {animatedPictogramSource ? (
              <AnimatedPictogram source={animatedPictogramSource} />
            ) : (
              <LoadingIndicator />
            )}
          </View>
          <H3
            style={{ textAlign: "center" }}
            color={theme["textHeading-secondary"]}
            accessibilityLabel={contentTitle}
          >
            {contentTitle}
          </H3>
        </VStack>
      </ContentWrapper>
      {children}
    </SafeAreaView>
  );
};

export default LoadingScreenContent;

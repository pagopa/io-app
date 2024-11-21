/**
 * An ingress screen to choose the real first screen the user must navigate to.
 */
import * as React from "react";
import { View, StyleSheet, Platform, AccessibilityInfo } from "react-native";
import {
  ContentWrapper,
  H3,
  IOStyles,
  useIOTheme,
  VSpacer
} from "@pagopa/io-app-design-system";
import { SafeAreaView } from "react-native-safe-area-context";
import { LoadingIndicator } from "../../components/ui/LoadingIndicator";
import { WithTestID } from "../../types/WithTestID";
import {
  AnimatedPictogram,
  AnimatedPictogramSource
} from "../ui/AnimatedPictogramComponent";

const styles = StyleSheet.create({
  container: {
    ...IOStyles.bgWhite,
    ...IOStyles.centerJustified,
    ...IOStyles.flex
  },
  contentTitle: {
    textAlign: "center"
  },
  content: {
    alignItems: "center"
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
      style={styles.container}
      edges={headerVisible ? ["bottom"] : undefined}
      testID={testID}
    >
      <ContentWrapper>
        <View style={styles.content}>
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
          <VSpacer size={SPACE_BETWEEN_SPINNER_AND_TEXT} />
          <H3
            color={theme["textHeading-secondary"]}
            style={styles.contentTitle}
            accessibilityLabel={contentTitle}
          >
            {contentTitle}
          </H3>
        </View>
      </ContentWrapper>
      {children}
    </SafeAreaView>
  );
};

export default LoadingScreenContent;

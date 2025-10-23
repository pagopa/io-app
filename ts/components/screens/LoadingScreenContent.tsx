/**
 * An ingress screen to choose the real first screen the user must navigate to.
 */
import {
  Banner,
  ContentWrapper,
  H3,
  IOColors,
  useIOTheme,
  VStack
} from "@pagopa/io-app-design-system";

import { ComponentProps, ReactNode, useEffect } from "react";
import { AccessibilityInfo, Platform, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LoadingIndicator } from "../../components/ui/LoadingIndicator";
import { WithTestID } from "../../types/WithTestID";
import {
  AnimatedPictogram,
  IOAnimatedPictograms
} from "../ui/AnimatedPictogram";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center"
  }
});

const SPACE_BETWEEN_SPINNER_AND_TEXT = 24;

type LoadingScreenContentProps = WithTestID<{
  contentTitle: string;
  children?: ReactNode;
  headerVisible?: boolean;
  animatedPictogramSource?: IOAnimatedPictograms;
  banner?:
    | { showBanner: true; props: ComponentProps<typeof Banner> }
    | { showBanner?: false };
}>;

export const LoadingScreenContent = (props: LoadingScreenContentProps) => {
  const theme = useIOTheme();
  const {
    contentTitle,
    children,
    headerVisible,
    testID,
    animatedPictogramSource,
    banner = { showBanner: false }
  } = props;

  useEffect(() => {
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
      <ContentWrapper style={{ flex: 1 }}>
        <VStack
          space={SPACE_BETWEEN_SPINNER_AND_TEXT}
          style={{ alignItems: "center", flex: 1, justifyContent: "center" }}
        >
          <View
            accessible={false}
            accessibilityElementsHidden={true}
            importantForAccessibility={"no-hide-descendants"}
          >
            {animatedPictogramSource ? (
              <AnimatedPictogram
                name={animatedPictogramSource}
                size={120}
                loop={true}
              />
            ) : (
              <LoadingIndicator />
            )}
          </View>
          <VStack space={8}>
            <H3
              style={{ textAlign: "center" }}
              color={theme["textHeading-secondary"]}
              accessibilityLabel={contentTitle}
            >
              {contentTitle}
            </H3>
            {children}
          </VStack>
        </VStack>
      </ContentWrapper>
      <ContentWrapper style={{ marginBottom: 16 }}>
        {banner.showBanner && <Banner {...banner.props} />}
      </ContentWrapper>
    </SafeAreaView>
  );
};

export default LoadingScreenContent;

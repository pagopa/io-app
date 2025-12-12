/**
 * An ingress screen to choose the real first screen the user must navigate to.
 */
import {
  Banner,
  Body,
  BodyProps,
  ComposedBodyFromArray,
  ContentWrapper,
  H3,
  IOButton,
  IOButtonProps,
  IOColors,
  useIOTheme,
  VSpacer,
  VStack
} from "@pagopa/io-app-design-system";

import { ComponentProps, useEffect } from "react";
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

type ButtonProps = Pick<
  IOButtonProps,
  "label" | "accessibilityLabel" | "onPress" | "testID" | "icon"
>;

const SPACE_BETWEEN_SPINNER_AND_TEXT = 24;

type LoadingScreenContentProps = WithTestID<{
  title: string;
  subtitle?: string | Array<BodyProps>;
  action?: ButtonProps;
  headerVisible?: boolean;
  animatedPictogramSource?: IOAnimatedPictograms;
  banner?: ComponentProps<typeof Banner>;
}>;

export const LoadingScreenContent = ({
  title,
  subtitle,
  action,
  headerVisible,
  testID,
  animatedPictogramSource,
  banner
}: LoadingScreenContentProps) => {
  const theme = useIOTheme();

  useEffect(() => {
    // Since the screen is shown for a very short time,
    // we prefer to announce the content to the screen reader,
    // instead of focusing the first element.
    if (Platform.OS === "android") {
      // We use it only on Android, because on iOS the screen reader
      // stops reading the content when the ingress screen is unmounted
      // and the focus is moved to another element.
      AccessibilityInfo.announceForAccessibility(title);
    }
  }, [title]);

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
          <VStack space={8} style={{ alignItems: "center" }}>
            <H3
              style={{ textAlign: "center" }}
              color={theme["textHeading-secondary"]}
              accessibilityLabel={title}
            >
              {title}
            </H3>
            {subtitle &&
              (typeof subtitle === "string" ? (
                <Body style={{ textAlign: "center" }}>{subtitle}</Body>
              ) : (
                <ComposedBodyFromArray textAlign="center" body={subtitle} />
              ))}
            {action && (
              <View>
                <VSpacer size={16} />
                <IOButton variant="link" {...action} />
              </View>
            )}
          </VStack>
        </VStack>
      </ContentWrapper>
      {banner && (
        <ContentWrapper style={{ marginBottom: 16 }}>
          <Banner {...banner} />
        </ContentWrapper>
      )}
    </SafeAreaView>
  );
};

export default LoadingScreenContent;

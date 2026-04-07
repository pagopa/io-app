import {
  H3,
  IOButton,
  IOButtonProps,
  IOMarkdownLite,
  IOPictograms,
  IOVisualCostants,
  Pictogram,
  VSpacer,
  WithTestID
} from "@pagopa/io-app-design-system";
import {
  cloneElement,
  forwardRef,
  isValidElement,
  PropsWithChildren,
  ReactNode
} from "react";
import { Platform, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  AnimatedPictogram,
  IOAnimatedPictograms,
  IOAnimatedPictogramsAssets
} from "../ui/AnimatedPictogram";

type ButtonProps = Pick<
  IOButtonProps,
  "accessibilityLabel" | "icon" | "label" | "onPress" | "testID"
>;

type OperationResultScreenContentProps = WithTestID<{
  action?: ButtonProps;
  disableAnimatedPictogram?: boolean;
  isHeaderVisible?: boolean;
  onSubtitleLinkPress?: (url: string) => void;
  pictogram: IOAnimatedPictograms | IOPictograms;
  secondaryAction?: ButtonProps;
  subtitle?: string;
  title: string;
  topElement?: ReactNode;
}>;

/**
 * Check if a pictogram has an animated version or not
 */
const hasAnimatedVersion = (
  pictogram: IOAnimatedPictograms | IOPictograms
): pictogram is IOAnimatedPictograms => pictogram in IOAnimatedPictogramsAssets;

const OperationResultScreenContent = forwardRef<
  View,
  PropsWithChildren<OperationResultScreenContentProps>
>(
  (
    {
      disableAnimatedPictogram = false,
      pictogram,
      title,
      subtitle,
      onSubtitleLinkPress,
      action,
      secondaryAction,
      children,
      testID,
      isHeaderVisible,
      topElement = undefined
    },
    ref
  ) => {
    const isAnimatedPictogram =
      !disableAnimatedPictogram && hasAnimatedVersion(pictogram);

    return (
      <SafeAreaView
        edges={isHeaderVisible ? ["bottom"] : undefined}
        ref={ref}
        style={{ flexGrow: 1 }}
        testID={testID}
      >
        <ScrollView
          alwaysBounceVertical={false}
          centerContent={true}
          contentContainerStyle={[
            styles.wrapper,
            /* Android fallback because `centerContent` is only an iOS property */
            Platform.OS === "android" && styles.wrapperAndroid
          ]}
        >
          {pictogram && (
            <View style={{ alignItems: "center" }}>
              {isAnimatedPictogram ? (
                <AnimatedPictogram name={pictogram} size={120} />
              ) : (
                <Pictogram name={pictogram as IOPictograms} size={120} />
              )}
              <VSpacer size={24} />
            </View>
          )}
          {topElement}
          <H3 accessibilityRole="header" style={{ textAlign: "center" }}>
            {title}
          </H3>
          {subtitle && (
            <>
              <VSpacer size={8} />
              <IOMarkdownLite
                content={subtitle}
                onLinkPress={onSubtitleLinkPress}
                textAlign="center"
              />
            </>
          )}
          {action && (
            <View style={{ alignItems: "center" }}>
              <VSpacer size={24} />
              <View>
                <IOButton variant="solid" {...action} />
              </View>
            </View>
          )}
          {secondaryAction && (
            <View style={{ alignItems: "center" }}>
              <VSpacer size={24} />
              <View>
                <IOButton variant="link" {...secondaryAction} />
              </View>
            </View>
          )}

          {isValidElement(children) && cloneElement(children)}
        </ScrollView>
      </SafeAreaView>
    );
  }
);

const styles = StyleSheet.create({
  wrapper: {
    flexGrow: 1,
    alignItems: "stretch",
    justifyContent: "center",
    alignContent: "center",
    padding: IOVisualCostants.appMarginDefault
  },
  wrapperAndroid: {
    flexGrow: 1,
    justifyContent: "center"
  }
});

export { OperationResultScreenContent };
export type { OperationResultScreenContentProps };

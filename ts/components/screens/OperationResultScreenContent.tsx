import {
  Body,
  BodyProps,
  ComposedBodyFromArray,
  H3,
  IOButton,
  IOButtonProps,
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
  "label" | "accessibilityLabel" | "onPress" | "testID" | "icon"
>;

type OperationResultScreenContentProps = WithTestID<{
  pictogram: IOPictograms | IOAnimatedPictograms;
  title: string;
  subtitle?: string | Array<BodyProps>;
  subtitleProps?: Pick<BodyProps, "textBreakStrategy" | "lineBreakStrategyIOS">;
  topElement?: ReactNode;
  action?: ButtonProps;
  secondaryAction?: ButtonProps;
  isHeaderVisible?: boolean;
  disableAnimatedPictogram?: boolean;
}>;

/**
 * Check if a pictogram has an animated version or not
 */
const hasAnimatedVersion = (
  pictogram: IOPictograms | IOAnimatedPictograms
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
      action,
      secondaryAction,
      children,
      testID,
      isHeaderVisible,
      subtitleProps,
      topElement = undefined
    },
    ref
  ) => {
    const isAnimatedPictogram =
      !disableAnimatedPictogram && hasAnimatedVersion(pictogram);

    return (
      <SafeAreaView
        edges={isHeaderVisible ? ["bottom"] : undefined}
        style={{ flexGrow: 1 }}
        testID={testID}
        ref={ref}
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
                <AnimatedPictogram
                  name={pictogram as IOAnimatedPictograms}
                  size={120}
                />
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
              {typeof subtitle === "string" ? (
                <Body style={{ textAlign: "center" }} {...subtitleProps}>
                  {subtitle}
                </Body>
              ) : (
                <ComposedBodyFromArray body={subtitle} textAlign="center" />
              )}
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

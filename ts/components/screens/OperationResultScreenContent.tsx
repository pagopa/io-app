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
  VStack,
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
  IOAnimatedPictograms
} from "../ui/AnimatedPictogram";

type ButtonProps = Pick<
  IOButtonProps,
  "label" | "accessibilityLabel" | "onPress" | "testID" | "icon"
>;

type OperationResultScreenContentProps = WithTestID<
  {
    title: string;
    subtitle?: string | Array<BodyProps>;
    subtitleProps?: Pick<
      BodyProps,
      "textBreakStrategy" | "lineBreakStrategyIOS"
    >;
    action?: ButtonProps & Pick<IOButtonProps, "fullWidth">;
    secondaryAction?: ButtonProps;
    isHeaderVisible?: boolean;
    topElement?: ReactNode;
  } & GraphicAssetProps
>;

type GraphicAssetProps =
  | {
      enableAnimatedPictogram: true;
      pictogram: IOAnimatedPictograms;
      loop?: AnimatedPictogram["loop"];
    }
  | {
      enableAnimatedPictogram?: false;
      pictogram?: IOPictograms;
      loop?: never;
    };

const OperationResultScreenContent = forwardRef<
  View,
  PropsWithChildren<OperationResultScreenContentProps>
>(
  (
    {
      enableAnimatedPictogram,
      pictogram,
      loop,
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
  ) => (
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
        <VStack space={24}>
          {!enableAnimatedPictogram && pictogram && (
            <View style={{ alignItems: "center" }}>
              <Pictogram name={pictogram} size={120} />
            </View>
          )}
          {enableAnimatedPictogram && pictogram && (
            <View style={{ alignItems: "center" }}>
              <AnimatedPictogram name={pictogram} size={120} loop={loop} />
            </View>
          )}
          <VStack space={8}>
            {topElement}
            <H3 accessibilityRole="header" style={{ textAlign: "center" }}>
              {title}
            </H3>
            {subtitle &&
              (typeof subtitle === "string" ? (
                <Body style={{ textAlign: "center" }} {...subtitleProps}>
                  {subtitle}
                </Body>
              ) : (
                <ComposedBodyFromArray body={subtitle} textAlign="center" />
              ))}
          </VStack>
          {action && (
            <View style={{ alignItems: "center" }}>
              <IOButton variant="solid" {...action} />
            </View>
          )}
          {secondaryAction && (
            <View style={{ alignItems: "center" }}>
              <View>
                <IOButton variant="link" {...secondaryAction} />
              </View>
            </View>
          )}
        </VStack>
        {isValidElement(children) && cloneElement(children)}
      </ScrollView>
    </SafeAreaView>
  )
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

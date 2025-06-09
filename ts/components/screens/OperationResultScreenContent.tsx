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
  PropsWithChildren
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
    action?: ButtonProps;
    secondaryAction?: ButtonProps;
    isHeaderVisible?: boolean;
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
      subtitleProps
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
        {!enableAnimatedPictogram && pictogram && (
          <View style={{ alignItems: "center" }}>
            <Pictogram name={pictogram} size={120} />
            <VSpacer size={24} />
          </View>
        )}

        {enableAnimatedPictogram && pictogram && (
          <View style={{ alignItems: "center" }}>
            <AnimatedPictogram name={pictogram} size={120} loop={loop} />
            <VSpacer size={24} />
          </View>
        )}
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

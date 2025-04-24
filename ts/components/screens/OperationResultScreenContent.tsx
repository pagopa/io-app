import {
  Body,
  BodyProps,
  ComposedBodyFromArray,
  H3,
  IOButton,
  IOButtonProps,
  IOPictograms,
  IOStyles,
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
import { Platform, StyleSheet, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";

type ButtonProps = Pick<
  IOButtonProps,
  "label" | "accessibilityLabel" | "onPress" | "testID" | "icon"
>;

type OperationResultScreenContentProps = WithTestID<{
  pictogram?: IOPictograms;
  title: string;
  subtitle?: string | Array<BodyProps>;
  subtitleProps?: Pick<BodyProps, "textBreakStrategy" | "lineBreakStrategyIOS">;
  action?: ButtonProps;
  secondaryAction?: ButtonProps;
  isHeaderVisible?: boolean;
}>;

const OperationResultScreenContent = forwardRef<
  View,
  PropsWithChildren<OperationResultScreenContentProps>
>(
  (
    {
      pictogram,
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
      style={styles.container}
      testID={testID}
      ref={ref}
    >
      <ScrollView
        centerContent={true}
        contentContainerStyle={[
          styles.wrapper,
          /* Android fallback because `centerContent` is only an iOS property */
          Platform.OS === "android" && styles.wrapper_android
        ]}
      >
        {pictogram && (
          <View style={IOStyles.alignCenter}>
            <Pictogram name={pictogram} size={120} />
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
          <View style={IOStyles.alignCenter}>
            <VSpacer size={24} />
            <View>
              <IOButton variant="solid" {...action} />
            </View>
          </View>
        )}
        {secondaryAction && (
          <View style={IOStyles.alignCenter}>
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
  container: {
    flexGrow: 1,
    marginHorizontal: IOVisualCostants.appMarginDefault
  },
  wrapper: {
    flex: 1,
    alignItems: "stretch",
    justifyContent: "center",
    alignContent: "center"
  },
  wrapper_android: {
    flexGrow: 1,
    justifyContent: "center"
  }
});

export { OperationResultScreenContent };
export type { OperationResultScreenContentProps };

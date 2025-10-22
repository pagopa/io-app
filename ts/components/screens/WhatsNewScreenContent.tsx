import {
  Badge,
  H3,
  IOButton,
  IOButtonProps,
  IOPictograms,
  IOVisualCostants,
  Pictogram,
  VStack,
  WithTestID
} from "@pagopa/io-app-design-system";
import { View, ScrollView, StyleSheet } from "react-native";
import { forwardRef, PropsWithChildren } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  AnimatedPictogram,
  IOAnimatedPictograms
} from "../ui/AnimatedPictogram";

type ButtonProps<ExtraProps extends keyof IOButtonProps | never = never> = Pick<
  IOButtonProps,
  "label" | "accessibilityLabel" | "onPress" | "testID" | "icon" | ExtraProps
>;

export type WhatsNewScreenContentProps = WithTestID<
  {
    title: string;
    badge?: Badge;
    action?: ButtonProps<"fullWidth">;
    secondaryAction?: ButtonProps;
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

export const WhatsNewScreenContent = forwardRef<
  View,
  PropsWithChildren<WhatsNewScreenContentProps>
>(
  (
    {
      enableAnimatedPictogram,
      badge,
      pictogram,
      loop,
      title,
      action,
      secondaryAction,
      children,
      testID
    },
    ref
  ) => (
    <SafeAreaView style={{ flexGrow: 1 }} testID={testID} ref={ref}>
      <ScrollView
        alwaysBounceVertical={false}
        centerContent={true}
        contentContainerStyle={styles.container}
      >
        <VStack space={24} style={styles.mainStack}>
          {pictogram && (
            <View style={styles.centeredItems}>
              {enableAnimatedPictogram ? (
                <AnimatedPictogram name={pictogram} size={120} loop={loop} />
              ) : (
                <Pictogram name={pictogram} size={120} />
              )}
            </View>
          )}
          {(title || badge || children) && (
            <VStack space={8}>
              {badge && (
                <View style={styles.centeredItems}>
                  <Badge {...badge} />
                </View>
              )}
              <H3 accessibilityRole="header" style={{ textAlign: "center" }}>
                {title}
              </H3>
              {children}
            </VStack>
          )}
          {(action || secondaryAction) && (
            <VStack space={16}>
              {action && (
                <View style={styles.centeredItems}>
                  <IOButton variant="solid" {...action} />
                </View>
              )}
              {secondaryAction && (
                <View style={{ alignSelf: "center" }}>
                  <IOButton variant="link" {...secondaryAction} />
                </View>
              )}
            </VStack>
          )}
        </VStack>
      </ScrollView>
    </SafeAreaView>
  )
);

const styles = StyleSheet.create({
  mainStack: {
    padding: IOVisualCostants.appMarginDefault
  },
  container: {
    flexGrow: 1,
    alignItems: "stretch",
    justifyContent: "center",
    alignContent: "center"
  },
  centeredItems: {
    alignItems: "center"
  }
});

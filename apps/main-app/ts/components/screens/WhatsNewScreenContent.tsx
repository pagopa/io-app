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
import { PropsWithChildren, Ref } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  AnimatedPictogram,
  IOAnimatedPictograms
} from "../ui/AnimatedPictogram";

export type WhatsNewScreenContentProps = WithTestID<
  GraphicAssetProps & {
    action?: ButtonProps<"fullWidth">;
    badge?: Badge;
    ref?: Ref<View>;
    secondaryAction?: ButtonProps;
    title: string;
  }
>;

type ButtonProps<ExtraProps extends keyof IOButtonProps | never = never> = Pick<
  IOButtonProps,
  "accessibilityLabel" | "icon" | "label" | "onPress" | "testID" | ExtraProps
>;

type GraphicAssetProps =
  | {
      enableAnimatedPictogram: true;
      loop?: AnimatedPictogram["loop"];
      pictogram: IOAnimatedPictograms;
    }
  | {
      enableAnimatedPictogram?: false;
      loop?: never;
      pictogram?: IOPictograms;
    };

export const WhatsNewScreenContent = ({
  ref,
  enableAnimatedPictogram,
  badge,
  pictogram,
  loop,
  title,
  action,
  secondaryAction,
  children,
  testID
}: PropsWithChildren<WhatsNewScreenContentProps>) => (
  <SafeAreaView ref={ref} style={{ flexGrow: 1 }} testID={testID}>
    <ScrollView
      alwaysBounceVertical={false}
      centerContent={true}
      contentContainerStyle={styles.container}
    >
      <VStack space={24} style={styles.mainStack}>
        {pictogram && (
          <View style={styles.centeredItems}>
            {enableAnimatedPictogram ? (
              <AnimatedPictogram loop={loop} name={pictogram} size={120} />
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

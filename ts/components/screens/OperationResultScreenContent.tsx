import {
  Body,
  ButtonLink,
  ButtonLinkProps,
  ButtonSolid,
  ButtonSolidProps,
  H3,
  IOPictograms,
  IOStyles,
  IOVisualCostants,
  Pictogram,
  useIOTheme,
  VSpacer,
  WithTestID
} from "@pagopa/io-app-design-system";
import * as React from "react";
import { PropsWithChildren } from "react";
import { Platform, StyleSheet, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  BodyProps,
  ComposedBodyFromArray
} from "../core/typography/ComposedBodyFromArray";

type OperationResultScreenContentProps = WithTestID<{
  pictogram?: IOPictograms;
  title: string;
  subtitle?: string | Array<BodyProps>;
  action?: Pick<
    ButtonSolidProps,
    "label" | "accessibilityLabel" | "onPress" | "testID"
  >;
  secondaryAction?: Pick<
    ButtonLinkProps,
    "label" | "accessibilityLabel" | "onPress" | "testID"
  >;
  isHeaderVisible?: boolean;
}>;

const OperationResultScreenContent = ({
  pictogram,
  title,
  subtitle,
  action,
  secondaryAction,
  children,
  testID,
  isHeaderVisible
}: PropsWithChildren<OperationResultScreenContentProps>) => {
  const theme = useIOTheme();

  return (
    <SafeAreaView
      edges={isHeaderVisible ? ["bottom"] : undefined}
      style={styles.container}
      testID={testID}
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
        <H3
          color={theme["textHeading-secondary"]}
          style={{ textAlign: "center" }}
        >
          {title}
        </H3>
        {subtitle && (
          <>
            <VSpacer size={8} />
            {typeof subtitle === "string" ? (
              <Body style={{ textAlign: "center" }}>{subtitle}</Body>
            ) : (
              <ComposedBodyFromArray body={subtitle} textAlign="center" />
            )}
          </>
        )}
        {action && (
          <View style={IOStyles.alignCenter}>
            <VSpacer size={24} />
            <View>
              <ButtonSolid {...action} />
            </View>
          </View>
        )}
        {secondaryAction && (
          <View style={IOStyles.alignCenter}>
            <VSpacer size={24} />
            <View>
              <ButtonLink {...secondaryAction} />
            </View>
          </View>
        )}

        {React.isValidElement(children) && React.cloneElement(children)}
      </ScrollView>
    </SafeAreaView>
  );
};

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

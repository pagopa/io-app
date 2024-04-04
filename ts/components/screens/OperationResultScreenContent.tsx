import {
  ButtonLink,
  ButtonLinkProps,
  ButtonSolid,
  ButtonSolidProps,
  H3,
  IOPictograms,
  IOStyles,
  IOVisualCostants,
  Pictogram,
  VSpacer,
  WithTestID
} from "@pagopa/io-app-design-system";
import * as React from "react";
import { Platform, SafeAreaView, StyleSheet, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { LabelSmall } from "../core/typography/LabelSmall";

// if we are inserting the action and buttonType is not there or is
// equals ButtonSolid then we use the ButtonSolidProps type
// otherwise we use the ButtonLinkProps type

// if we are inserting the secondaryAction and buttonType is either not there or is
// equals ButtonLink then we use the ButtonLinkProps type
// otherwise we use the ButtonSolidProps type

type ButtonTypeSolid = ButtonSolidProps & {
  buttonType?: "ButtonSolid";
};
type ButtonTypeLink = ButtonLinkProps & {
  buttonType?: "ButtonLink";
};

type ButtonProps = ButtonTypeSolid | ButtonTypeLink;

type OperationResultScreenContentProps = WithTestID<{
  pictogram?: IOPictograms;
  title: string;
  subtitle?: string;
  action?: Pick<
    ButtonProps,
    "label" | "accessibilityLabel" | "onPress" | "testID" | "buttonType"
  >;
  secondaryAction?: Pick<
    ButtonProps,
    "label" | "accessibilityLabel" | "onPress" | "testID" | "buttonType"
  >;
}>;

const OperationResultScreenContent = ({
  pictogram,
  title,
  subtitle,
  action,
  secondaryAction,
  children,
  testID
}: React.PropsWithChildren<OperationResultScreenContentProps>) => (
  <SafeAreaView style={styles.container} testID={testID}>
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
      <H3 style={styles.text}>{title}</H3>
      {subtitle && (
        <>
          <VSpacer size={8} />
          <LabelSmall style={styles.text} color="grey-650" weight="Regular">
            {subtitle}
          </LabelSmall>
        </>
      )}
      {action &&
        (!action.buttonType || action.buttonType === "ButtonSolid") && (
          <View style={IOStyles.alignCenter}>
            <VSpacer size={24} />
            <View>
              <ButtonSolid {...(action as ButtonSolidProps)} />
            </View>
          </View>
        )}
      {action && action.buttonType === "ButtonLink" && (
        <View style={IOStyles.alignCenter}>
          <VSpacer size={24} />
          <View>
            <ButtonLink {...action} />
          </View>
        </View>
      )}
      {secondaryAction &&
        (!secondaryAction.buttonType ||
          secondaryAction.buttonType === "ButtonLink") && (
          <View style={IOStyles.alignCenter}>
            <VSpacer size={24} />
            <View>
              <ButtonLink {...secondaryAction} />
            </View>
          </View>
        )}
      {secondaryAction && secondaryAction.buttonType === "ButtonSolid" && (
        <View style={IOStyles.alignCenter}>
          <VSpacer size={24} />
          <View>
            <ButtonSolid {...(secondaryAction as ButtonSolidProps)} />
          </View>
        </View>
      )}
      {React.isValidElement(children) && React.cloneElement(children)}
    </ScrollView>
  </SafeAreaView>
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
  },
  text: {
    textAlign: "center"
  }
});

export type { OperationResultScreenContentProps };
export { OperationResultScreenContent };

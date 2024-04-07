import {
  Body,
  ButtonLink,
  ButtonLinkProps,
  ButtonSolid,
  ButtonSolidProps,
  ExternalTypographyProps,
  H3,
  IOColors,
  IOFontWeight,
  IOPictograms,
  IOStyles,
  IOTheme,
  IOVisualCostants,
  Pictogram,
  TypographyProps,
  VSpacer,
  WithTestID
} from "@pagopa/io-app-design-system";
import * as React from "react";
import { Platform, SafeAreaView, StyleSheet, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";

type PartialAllowedColors = Extract<
  IOColors,
  "bluegreyDark" | "white" | "blue" | "bluegrey" | "bluegreyLight"
>;
type AllowedColors = PartialAllowedColors | IOTheme["textBody-default"];
type AllowedWeight = IOFontWeight | "Regular" | "SemiBold";

export type BodyProps = ExternalTypographyProps<
  TypographyProps<AllowedWeight, AllowedColors> & {
    text: string | React.ReactElement;
  }
>;

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
}>;

type PropsComposedBody = {
  subtitle: Array<BodyProps>;
  textAlign?: "auto" | "left" | "right" | "center" | "justify" | undefined;
};

export const ComposedBodyFromArray = ({
  subtitle,
  textAlign = "center"
}: PropsComposedBody) => (
  <Body style={{ textAlign }}>
    {subtitle.map(({ text, key, ...props }) => (
      <Body key={key} {...props}>
        {text}
      </Body>
    ))}
  </Body>
);

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
          {typeof subtitle === "string" ? (
            <Body style={styles.text}>{subtitle}</Body>
          ) : (
            <ComposedBodyFromArray subtitle={subtitle} textAlign="center" />
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

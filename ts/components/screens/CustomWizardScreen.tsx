import {
  Body,
  BodyProps,
  ButtonLink,
  ButtonLinkProps,
  ButtonSolid,
  ButtonSolidProps,
  ComposedBodyFromArray,
  ContentWrapper,
  H3,
  IOPictograms,
  IOVisualCostants,
  Pictogram,
  VSpacer
} from "@pagopa/io-app-design-system";
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export type CustomWizardScreenProps = {
  title: string;
  description?: string | Array<BodyProps>;
  pictogram: IOPictograms;
  primaryButton: Pick<
    ButtonSolidProps,
    "label" | "accessibilityLabel" | "onPress" | "testID"
  >;
  actionButton?: Pick<
    ButtonLinkProps,
    "label" | "accessibilityLabel" | "onPress" | "testID"
  >;
  buttonLink?: Pick<
    ButtonLinkProps,
    "label" | "accessibilityLabel" | "onPress" | "testID"
  >;
};

/**
 * A common screen used in a wizard flow to show a pictogram, a title, a description and one or two buttons.
 * @deprecated This component is deprecated. Use `IOScrollViewCentredContent` instead.
 */
const CustomWizardScreen = ({
  title,
  description,
  pictogram,
  primaryButton,
  actionButton,
  buttonLink
}: CustomWizardScreenProps) => (
  <SafeAreaView style={{ flex: 1 }}>
    <WizardBody
      pictogram={pictogram}
      title={title}
      description={description}
      buttonLink={buttonLink}
    />
    <ContentWrapper>
      <ButtonSolid {...primaryButton} fullWidth={true} />
      {actionButton && (
        <>
          <VSpacer size={24} />
          <View style={{ alignItems: "center", alignSelf: "center" }}>
            <ButtonLink {...actionButton} />
          </View>
          <VSpacer size={16} />
        </>
      )}
    </ContentWrapper>
  </SafeAreaView>
);

type CustomWizardBodyProps = {
  title: string;
  description?: string | Array<BodyProps>;
  pictogram: IOPictograms;
  buttonLink?: Pick<
    ButtonLinkProps,
    "label" | "accessibilityLabel" | "onPress" | "testID"
  >;
};

const WizardBody = ({
  title,
  description,
  pictogram,
  buttonLink
}: CustomWizardBodyProps) => (
  <View style={styles.wizardContent}>
    <View style={{ alignItems: "center" }}>
      <Pictogram name={pictogram} size={120} />
    </View>
    <VSpacer size={24} />
    <View style={{ paddingHorizontal: 28 }}>
      <H3 style={styles.textCenter}>{title}</H3>
      {description && (
        <>
          <VSpacer size={8} />
          {typeof description === "string" ? (
            <Body style={styles.textCenter}>{description}</Body>
          ) : (
            <ComposedBodyFromArray body={description} textAlign="center" />
          )}
        </>
      )}
      {buttonLink && (
        <View style={{ alignSelf: "center" }}>
          <VSpacer size={16} />
          <ButtonLink {...buttonLink} />
        </View>
      )}
    </View>
  </View>
);

const styles = StyleSheet.create({
  textCenter: {
    textAlign: "center"
  },
  wizardContent: {
    flex: 1,
    paddingHorizontal: IOVisualCostants.appMarginDefault,
    alignItems: "center"
  }
});

export { CustomWizardScreen };

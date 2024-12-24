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
  IOStyles,
  Pictogram,
  VSpacer
} from "@pagopa/io-app-design-system";
import { SafeAreaView } from "react-native-safe-area-context";
import { StyleSheet, View } from "react-native";

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
  <SafeAreaView style={IOStyles.flex}>
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
          <View style={[IOStyles.alignCenter, IOStyles.selfCenter]}>
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
    <View style={IOStyles.alignCenter}>
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
        <View style={IOStyles.selfCenter}>
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
    ...IOStyles.flex,
    ...IOStyles.horizontalContentPadding,
    ...IOStyles.centerJustified
  }
});

export { CustomWizardScreen };

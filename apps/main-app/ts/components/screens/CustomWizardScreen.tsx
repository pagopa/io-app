import {
  ContentWrapper,
  H3,
  IOButton,
  IOButtonProps,
  IOMarkdownLite,
  IOPictograms,
  IOVisualCostants,
  Pictogram,
  VSpacer
} from "@io-app/design-system";
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export type CustomWizardScreenProps = {
  actionButton?: ButtonProps;
  buttonLink?: ButtonProps;
  description?: string;
  pictogram: IOPictograms;
  primaryButton: ButtonProps;
  title: string;
};

type ButtonProps = Pick<
  IOButtonProps,
  "accessibilityLabel" | "label" | "onPress" | "testID"
>;

/**
 * A common screen used in a wizard flow to show a pictogram, a title, a
 * description and one or two buttons.
 *
 * @deprecated This component is deprecated. Use `IOScrollViewCentredContent`
 *   instead.
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
      buttonLink={buttonLink}
      description={description}
      pictogram={pictogram}
      title={title}
    />
    <ContentWrapper>
      <IOButton fullWidth variant="solid" {...primaryButton} />
      {actionButton && (
        <>
          <VSpacer size={24} />
          <View style={{ alignItems: "center", alignSelf: "center" }}>
            <IOButton variant="link" {...actionButton} />
          </View>
          <VSpacer size={16} />
        </>
      )}
    </ContentWrapper>
  </SafeAreaView>
);

type CustomWizardBodyProps = {
  buttonLink?: Pick<
    IOButtonProps,
    "accessibilityLabel" | "label" | "onPress" | "testID"
  >;
  description?: string;
  pictogram: IOPictograms;
  title: string;
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
          <IOMarkdownLite content={description} textAlign="center" />
        </>
      )}
      {buttonLink && (
        <View style={{ alignSelf: "center" }}>
          <VSpacer size={16} />
          <IOButton variant="link" {...buttonLink} />
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
    justifyContent: "center"
  }
});

export { CustomWizardScreen };

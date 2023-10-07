import {
  Body,
  ButtonLink,
  ButtonSolid,
  ButtonSolidProps,
  ContentWrapper,
  H3,
  IOPictograms,
  IOStyles,
  Pictogram,
  VSpacer
} from "@pagopa/io-app-design-system";
import { SafeAreaView } from "react-native-safe-area-context";
import * as React from "react";
import { StyleSheet, View } from "react-native";
import TopScreenComponent from "./TopScreenComponent";

export type WizardScreenProps = {
  title: string;
  description?: string;
  pictogram: IOPictograms;
  primaryButton: Pick<
    ButtonSolidProps,
    "label" | "accessibilityLabel" | "onPress" | "testID"
  >;
  actionButton?: Pick<
    ButtonLink,
    "label" | "accessibilityLabel" | "onPress" | "testID"
  >;
  goBack?: () => void;
};

/**
 * A common screen used in a wizard flow to show a pictogram, a title, a description and one or two buttons.
 */
const WizardScreen = ({
  title,
  description,
  pictogram,
  primaryButton,
  actionButton,
  goBack
}: WizardScreenProps) => (
  <SafeAreaView style={IOStyles.flex}>
    <TopScreenComponent goBack={goBack || true}>
      <WizardBody
        pictogram={pictogram}
        title={title}
        description={description}
      />
    </TopScreenComponent>
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

type WizardBodyProps = {
  title: string;
  description?: string;
  pictogram: IOPictograms;
};

const WizardBody = ({ title, description, pictogram }: WizardBodyProps) => (
  <View style={styles.wizardContent}>
    <View style={IOStyles.alignCenter}>
      <Pictogram name={pictogram} size={180} />
    </View>
    <VSpacer size={24} />
    <View style={{ paddingHorizontal: 28 }}>
      <H3 style={styles.textCenter}>{title}</H3>
      {description && (
        <>
          <VSpacer size={8} />
          <Body weight="Regular" color="grey-850" style={styles.textCenter}>
            {description}
          </Body>
        </>
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

export { WizardScreen };

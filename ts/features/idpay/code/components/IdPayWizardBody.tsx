import {
  Body,
  IOPictograms,
  IOStyles,
  Pictogram,
  VSpacer
} from "@pagopa/io-app-design-system";
import * as React from "react";
import { StyleSheet, View } from "react-native";
import { NewH3 } from "../../../../components/core/typography/NewH3";

type IdPayWizardBody = {
  title: string;
  description: string;
  pictogram: IOPictograms;
};

const IdPayWizardBody = ({
  title,
  description,
  pictogram
}: IdPayWizardBody) => (
  <View style={styles.wizardContent}>
    <View style={IOStyles.alignCenter}>
      <Pictogram name={pictogram} size={240} />
    </View>
    <VSpacer size={24} />
    <View style={{ paddingHorizontal: 28 }}>
      <NewH3 style={styles.textCenter}>{title}</NewH3>
      <VSpacer size={8} />
      <Body weight="Regular" color="grey-850" style={styles.textCenter}>
        {description}
      </Body>
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

export { IdPayWizardBody };

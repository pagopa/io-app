import { View } from "native-base";
import * as React from "react";
import { StyleSheet } from "react-native";
import LegalMessage from "../../../../../../img/features/mvl/legalMessage.svg";
import { RawAccordion } from "../../../../../components/core/RawAccordion";
import { H2 } from "../../../../../components/core/typography/H2";
import { H3 } from "../../../../../components/core/typography/H3";
import { IOColors } from "../../../../../components/core/variables/IOColors";
import { IOStyles } from "../../../../../components/core/variables/IOStyles";
import I18n from "../../../../../i18n";
import themeVariables from "../../../../../theme/variables";
import { MvlMetadata } from "../../../types/mvlData";

type Props = {
  metadata: MvlMetadata;
};

const styles = StyleSheet.create({
  background: {
    backgroundColor: IOColors.greyLight,
    marginHorizontal: -themeVariables.contentPadding
  },
  header: {
    ...IOStyles.row,
    marginVertical: themeVariables.contentPadding,
    marginLeft: themeVariables.contentPadding,
    flex: 1
  }
});

const Header = (): React.ReactElement => (
  <View style={styles.header}>
    <LegalMessage width={24} height={24} fill={IOColors.blue} />
    <View hspacer={true} />
    <H3 numberOfLines={1} style={IOStyles.flex}>
      {I18n.t("features.mvl.details.metadata.title")}
    </H3>
  </View>
);

/**
 * An accordion that allows the user to navigate and see all the legal message related metadata
 * TODO: this is a placeholder, will be implemented in https://pagopa.atlassian.net/browse/IAMVL-20
 * @constructor
 * @param _
 */
export const MvlMetadataComponent = (_: Props): React.ReactElement => (
  <View style={styles.background}>
    <RawAccordion header={<Header />}>
      <H2>{"Metadata placeholder"}</H2>
    </RawAccordion>
  </View>
);

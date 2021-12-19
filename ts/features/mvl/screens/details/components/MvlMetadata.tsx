import { View } from "native-base";
import * as React from "react";
import { StyleSheet } from "react-native";
import LegalMessage from "../../../../../../img/features/mvl/legalMessage.svg";
import { RawAccordion } from "../../../../../components/core/RawAccordion";
import { Body } from "../../../../../components/core/typography/Body";
import { H3 } from "../../../../../components/core/typography/H3";
import { H4 } from "../../../../../components/core/typography/H4";
import { IOColors } from "../../../../../components/core/variables/IOColors";
import { IOStyles } from "../../../../../components/core/variables/IOStyles";
import I18n from "../../../../../i18n";
import themeVariables from "../../../../../theme/variables";
import { localeDateFormat } from "../../../../../utils/locale";
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

const Description = (props: Props): React.ReactElement => (
  <View style={IOStyles.horizontalContentPadding}>
    <Body>
      {I18n.t("features.mvl.details.metadata.description", {
        date: localeDateFormat(
          props.metadata.timestamp,
          I18n.t("global.dateFormats.shortFormat")
        ),
        time: localeDateFormat(
          props.metadata.timestamp,
          I18n.t("global.dateFormats.timeFormatWithTimezone")
        ),
        subject: props.metadata.subject,
        sender: props.metadata.sender
      })}
    </Body>
    <H4>{I18n.t("features.mvl.details.metadata.messageId")}</H4>
    <Body>{props.metadata.id}</Body>
  </View>
);

/**
 * An accordion that allows the user to navigate and see all the legal message related metadata
 * @constructor
 * @param props
 */
export const MvlMetadataComponent = (props: Props): React.ReactElement => (
  <View style={styles.background}>
    <RawAccordion header={<Header />}>
      <>
        <Description {...props} />
        <View spacer={true} />
      </>
    </RawAccordion>
  </View>
);

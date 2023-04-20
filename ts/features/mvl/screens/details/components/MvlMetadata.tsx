import { Toast } from "native-base";
import * as React from "react";
import { View, StyleSheet } from "react-native";
import LegalMessage from "../../../../../../img/features/mvl/legalMessage.svg";
import { RawAccordion } from "../../../../../components/core/accordion/RawAccordion";
import { HSpacer, VSpacer } from "../../../../../components/core/spacer/Spacer";
import { Body } from "../../../../../components/core/typography/Body";
import { H3 } from "../../../../../components/core/typography/H3";
import { H4 } from "../../../../../components/core/typography/H4";
import { Link } from "../../../../../components/core/typography/Link";
import { IOColors } from "../../../../../components/core/variables/IOColors";
import { IOStyles } from "../../../../../components/core/variables/IOStyles";
import ItemSeparatorComponent from "../../../../../components/ItemSeparatorComponent";
import I18n from "../../../../../i18n";
import themeVariables from "../../../../../theme/variables";
import { clipboardSetStringWithFeedback } from "../../../../../utils/clipboard";
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
  headerContent: {
    marginVertical: themeVariables.contentPadding,
    marginHorizontal: themeVariables.contentPadding
  },
  link: {
    paddingVertical: 16
  }
});

const Header = (): React.ReactElement => (
  <View style={[IOStyles.row, IOStyles.flex]}>
    <LegalMessage width={24} height={24} fill={IOColors.blue} />
    <HSpacer size={16} />
    <H3 numberOfLines={1} style={IOStyles.flex}>
      {I18n.t("features.mvl.details.metadata.title")}
    </H3>
  </View>
);

const Description = (props: Props): React.ReactElement => (
  <View>
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

type LinkRepresentation = {
  text: string;
  action: () => void;
};

const tmpNotImplementedFeedback = () => {
  Toast.show({
    text: I18n.t("wallet.incoming.title")
  });
};

const generateLinks = (props: Props): ReadonlyArray<LinkRepresentation> => {
  const sender =
    props.metadata.cc.length > 0
      ? [
          {
            text: I18n.t("features.mvl.details.metadata.links.recipients"),
            action: tmpNotImplementedFeedback
          }
        ]
      : [];

  return [
    {
      text: I18n.t("features.mvl.details.metadata.links.copy"),
      action: () => clipboardSetStringWithFeedback(props.metadata.id)
    },
    ...sender,
    {
      text: I18n.t("features.mvl.details.metadata.links.signature"),
      action: tmpNotImplementedFeedback
    },
    {
      text: I18n.t("features.mvl.details.metadata.links.certificates"),
      action: tmpNotImplementedFeedback
    },
    {
      text: I18n.t("features.mvl.details.metadata.links.originalMessage"),
      action: tmpNotImplementedFeedback
    },
    {
      text: I18n.t("features.mvl.details.metadata.links.datiCert"),
      action: tmpNotImplementedFeedback
    },
    {
      text: I18n.t("features.mvl.details.metadata.links.smime"),
      action: tmpNotImplementedFeedback
    }
  ];
};

const Links = (props: Props): React.ReactElement => {
  const links = generateLinks(props);
  return (
    <>
      {links.map((l, index) => (
        <View key={index}>
          <Link onPress={l.action} style={styles.link}>
            {l.text}
          </Link>
          {index < links.length - 1 && (
            <ItemSeparatorComponent noPadded={true} />
          )}
        </View>
      ))}
    </>
  );
};

/**
 * An accordion that allows the user to navigate and see all the legal message related metadata
 * @constructor
 * @param props
 */
export const MvlMetadataComponent = (props: Props): React.ReactElement => (
  <View style={styles.background}>
    <RawAccordion
      header={<Header />}
      headerStyle={styles.headerContent}
      accessibilityLabel={I18n.t("features.mvl.details.metadata.title")}
    >
      <View style={IOStyles.horizontalContentPadding}>
        <Description {...props} />
        <VSpacer size={16} />
        <Links {...props} />
      </View>
    </RawAccordion>
  </View>
);

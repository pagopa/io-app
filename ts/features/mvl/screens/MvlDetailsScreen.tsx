import { View } from "native-base";
import * as React from "react";
import { SafeAreaView, ScrollView, StyleSheet } from "react-native";
import Attachment from "../../../../img/features/mvl/attachment.svg";
import LegalMessage from "../../../../img/features/mvl/legalMessage.svg";
import { H5 } from "../../../components/core/typography/H5";
import { IOColors } from "../../../components/core/variables/IOColors";
import { IOStyles } from "../../../components/core/variables/IOStyles";
import { HeaderDueDateBar } from "../../../components/messages/paginated/MessageDetail/common/HeaderDueDateBar";
import { MessageTitle } from "../../../components/messages/paginated/MessageDetail/common/MessageTitle";
import OrganizationHeader from "../../../components/OrganizationHeader";
import BaseScreenComponent from "../../../components/screens/BaseScreenComponent";
import I18n from "../../../i18n";
import { UIMessageDetails } from "../../../store/reducers/entities/messages/types";
import { UIService } from "../../../store/reducers/entities/services/types";
import { emptyContextualHelp } from "../../../utils/emptyContextualHelp";
import { Mvl } from "../types/mvlData";

type Props = { mvl: Mvl };

const styles = StyleSheet.create({
  row: { flexDirection: "row", flexWrap: "wrap" },
  rightElement: { paddingLeft: 8 },
  spacer: {
    marginLeft: 8,
    marginRight: 8,
    backgroundColor: IOColors.greyLight,
    width: 1
  }
});

/**
 * Icon + text element
 * @param props
 * @constructor
 */
const HeaderItem = (props: { text: string; image: React.ReactElement }) => (
  <View style={styles.row}>
    {props.image}
    <H5 weight={"Regular"} color={"bluegrey"} style={[styles.rightElement]}>
      {props.text}
    </H5>
  </View>
);

/**
 * An header displaying the legal message icon + text.
 * Optionally display the attachment icon + text if at least one attachment is available
 * @param props
 * @constructor
 */
const LegalMessageHeader = (props: { hasAttachments: boolean }) => (
  <View style={styles.row}>
    <HeaderItem
      text={I18n.t("features.mvl.title")}
      image={<LegalMessage width={16} height={16} fill={IOColors.bluegrey} />}
    />
    {props.hasAttachments && (
      <>
        <View style={styles.spacer} />
        <HeaderItem
          text={I18n.t("features.mvl.details.hasAttachments")}
          image={<Attachment width={16} height={16} fill={IOColors.bluegrey} />}
        />
      </>
    )}
  </View>
);

/**
 * The header for a legal message, including the OrganizationHeader, MessageTitle and LegalMessageHeader
 * @param props
 * @constructor
 */
const Header = (props: {
  message: UIMessageDetails;
  hasAttachments: boolean;
  service?: UIService;
}) => (
  <>
    {props.service && (
      <OrganizationHeader
        serviceName={props.service.name}
        organizationName={props.service.organizationName}
        logoURLs={props.service.logoURLs}
      />
    )}
    <View spacer={true} large={true} />

    <MessageTitle title={props.message.subject} isPrescription={false} />
    <View spacer={true} small={true} />
    <View spacer={true} xsmall={true} />
    <LegalMessageHeader hasAttachments={props.hasAttachments} />

    <View spacer={true} />
  </>
);

/**
 * This screen displays all the details for a MVL:
 * - Body
 * - Attachments
 * - Metadata
 * @constructor
 * @param props
 */
export const MvlDetailsScreen = (props: Props): React.ReactElement => {
  const hasAttachments = props.mvl.legalMessage.attachments.length > 0;

  return (
    <BaseScreenComponent goBack={true} contextualHelp={emptyContextualHelp}>
      <SafeAreaView style={IOStyles.flex} testID={"MvlDetailsScreen"}>
        <ScrollView style={[IOStyles.horizontalContentPadding]}>
          <Header message={props.mvl.message} hasAttachments={hasAttachments} />
        </ScrollView>
      </SafeAreaView>
    </BaseScreenComponent>
  );
};

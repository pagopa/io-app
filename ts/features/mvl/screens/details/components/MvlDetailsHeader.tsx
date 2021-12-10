import { View } from "native-base";
import * as React from "react";
import { StyleSheet } from "react-native";
import Attachment from "../../../../../../img/features/mvl/attachment.svg";
import LegalMessage from "../../../../../../img/features/mvl/legalMessage.svg";
import { H5 } from "../../../../../components/core/typography/H5";
import { IOColors } from "../../../../../components/core/variables/IOColors";
import { HeaderDueDateBar } from "../../../../../components/messages/paginated/MessageDetail/common/HeaderDueDateBar";
import { MessageTitle } from "../../../../../components/messages/paginated/MessageDetail/common/MessageTitle";
import OrganizationHeader from "../../../../../components/OrganizationHeader";
import I18n from "../../../../../i18n";
import { UIMessageDetails } from "../../../../../store/reducers/entities/messages/types";
import { UIService } from "../../../../../store/reducers/entities/services/types";
import themeVariables from "../../../../../theme/variables";

type Props = {
  message: UIMessageDetails;
  hasAttachments: boolean;
  service?: UIService;
};

const styles = StyleSheet.create({
  row: { flexDirection: "row", flexWrap: "wrap" },
  rightElement: { paddingLeft: 8 },
  spacer: {
    marginLeft: 8,
    marginRight: 8,
    backgroundColor: IOColors.greyLight,
    width: 1
  },
  withoutHorizontalContentPadding: {
    marginLeft: -themeVariables.contentPadding,
    marginRight: -themeVariables.contentPadding
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
 * The header for a legal message, including the
 * - OrganizationHeader (name of the sender organization, service and logo)
 * - MessageTitle (title of the message)
 * - LegalMessageHeader (default text + icons) to identify a legal message and, optionally, if has attachment
 * - HeaderDueDateBar (the bar in case of due date of the message)
 * @param props
 * @constructor
 */
export const MvlDetailsHeader = (props: Props) => (
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

    <View style={styles.withoutHorizontalContentPadding}>
      {/* TODO: TMP, how is calculated hasPaidBadge without using the paginated data? https://pagopa.atlassian.net/browse/IAMVL-22 */}
      <HeaderDueDateBar hasPaidBadge={false} messageDetails={props.message} />
    </View>
  </>
);

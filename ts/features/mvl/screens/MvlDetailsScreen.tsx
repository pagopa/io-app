import { View } from "native-base";
import * as React from "react";
import { SafeAreaView, ScrollView, StyleSheet } from "react-native";
import { Body } from "../../../components/core/typography/Body";
import { H5 } from "../../../components/core/typography/H5";
import { IOStyles } from "../../../components/core/variables/IOStyles";
import { MessageTitle } from "../../../components/messages/paginated/MessageDetail/common/MessageTitle";
import OrganizationHeader from "../../../components/OrganizationHeader";
import BaseScreenComponent from "../../../components/screens/BaseScreenComponent";
import { UIMessageDetails } from "../../../store/reducers/entities/messages/types";
import { UIService } from "../../../store/reducers/entities/services/types";
import { emptyContextualHelp } from "../../../utils/emptyContextualHelp";
import { Mvl } from "../types/mvlData";
import LegalMessage from "../../../../img/features/mvl/legalMessage.svg";
import Attachment from "../../../../img/features/mvl/attachment.svg";
import { IOColors } from "../../../components/core/variables/IOColors";
import I18n from "../../../i18n";

type Props = { mvl: Mvl };

const styles = StyleSheet.create({
  row: { flexDirection: "row", justifyContent: "space-between" }
});

const LegalMessageHeader = (props: { hasAttachments: boolean }) => (
  <View style={styles.row}>
    <H5 weight={"Regular"} color={"greyGradientTop"}>
      {I18n.t("features.mvl.title")}
    </H5>
    {props.hasAttachments && (
      <H5 weight={"Regular"} color={"greyGradientTop"}>
        {I18n.t("features.mvl.details.hasAttachments")}
      </H5>
    )}
  </View>
);

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

    <LegalMessageHeader hasAttachments={props.hasAttachments} />
    {/* <LegalMessage width={64} height={64} fill={IOColors.red} /> */}
    {/* <Attachment width={64} height={64} fill={IOColors.red} /> */}

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

import * as pot from "@pagopa/ts-commons/lib/pot";
import _ from "lodash";
import { Content as NBContent, View as NBView } from "native-base";
import * as React from "react";
import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import DeviceInfo from "react-native-device-info";
import I18n from "i18n-js";
import { OrganizationFiscalCode } from "../../../../definitions/backend/OrganizationFiscalCode";

import { ServiceMetadata } from "../../../../definitions/backend/ServiceMetadata";
import { ThirdPartyMessageWithContent } from "../../../../definitions/backend/ThirdPartyMessageWithContent";
import { MessageAttachments } from "../../../features/messages/components/MessageAttachments";
import { loadThirdPartyMessage } from "../../../features/messages/store/actions";
import { useIODispatch, useIOSelector } from "../../../store/hooks";
import { thirdPartyFromIdSelector } from "../../../store/reducers/entities/messages/thirdPartyById";
import {
  UIMessage,
  UIMessageDetails
} from "../../../store/reducers/entities/messages/types";
import { attachmentsFromThirdPartyMessage } from "../../../store/reducers/entities/messages/transformers";
import { UIService } from "../../../store/reducers/entities/services/types";
import variables from "../../../theme/variables";
import { cleanMarkdownFromCTAs } from "../../../utils/messages";
import OrganizationHeader from "../../OrganizationHeader";
import { H2 } from "../../core/typography/H2";
import CtaBar from "./common/CtaBar";
import { HeaderDueDateBar } from "./common/HeaderDueDateBar";
import { MessageTitle } from "./common/MessageTitle";
import MessageContent from "./Content";
import MedicalPrescriptionAttachments from "./MedicalPrescriptionAttachments";
import MessageMarkdown from "./MessageMarkdown";
import AttachmentsUnavailableComponent from "./AttachmentsUnavailable";

const styles = StyleSheet.create({
  padded: {
    paddingHorizontal: variables.contentPadding
  },
  webview: {
    marginLeft: variables.contentPadding,
    marginRight: variables.contentPadding
  },
  attachmentsTitle: {
    paddingHorizontal: variables.spacerLargeHeight,
    marginBottom: variables.spacerHeight
  },
  viewFooter: {
    marginBottom: 32
  }
});

type Props = Readonly<{
  hasPaidBadge: boolean;
  message: UIMessage;
  messageDetails: UIMessageDetails;
  onServiceLinkPress?: () => void;
  organizationFiscalCode?: OrganizationFiscalCode;
  serviceMetadata?: ServiceMetadata;
  service?: UIService;
}>;

const OrganizationTitle = ({ name, organizationName, logoURLs }: UIService) => (
  <OrganizationHeader
    serviceName={name}
    organizationName={organizationName}
    logoURLs={logoURLs}
  />
);

const renderThirdPartyAttachmentsError = () => (
  <>
    <AttachmentsUnavailableComponent />
    <View style={styles.viewFooter} />
  </>
);

const renderThirdPartyAttachmentsLoading = () => (
  <>
    <ActivityIndicator
      size={"large"}
      color={variables.brandPrimary}
      accessible={true}
      accessibilityHint={I18n.t("global.accessibility.activityIndicator.hint")}
      accessibilityLabel={I18n.t(
        "global.accessibility.activityIndicator.label"
      )}
      importantForAccessibility={"no-hide-descendants"}
    />
    <View style={styles.viewFooter} />
  </>
);

const renderThirdPartyAttachments = (
  thirdPartyMessage: ThirdPartyMessageWithContent
): React.ReactNode => {
  const thirdPartyMessageAttachments =
    attachmentsFromThirdPartyMessage(thirdPartyMessage);
  return thirdPartyMessageAttachments ? (
    <View style={styles.padded}>
      <MessageAttachments
        attachments={thirdPartyMessageAttachments}
        openPreview={_ => _}
      />
    </View>
  ) : (
    renderThirdPartyAttachmentsError()
  );
};

/**
 * Render a single message with all of its details
 */
const MessageDetailsComponent = ({
  hasPaidBadge,
  message,
  messageDetails,
  onServiceLinkPress,
  service,
  serviceMetadata
}: Props) => {
  const dispatch = useIODispatch();
  const [isContentLoadCompleted, setIsContentLoadCompleted] = useState(false);
  const { prescriptionAttachments, markdown, prescriptionData } =
    messageDetails;
  const isPrescription = prescriptionData !== undefined;

  const messageId = message.id;
  const hasThirdPartyDataAttachments =
    messageDetails.hasThirdPartyDataAttachments;
  const thirdPartyDataPot = useIOSelector(state =>
    thirdPartyFromIdSelector(state, messageId)
  );

  useEffect(() => {
    if (hasThirdPartyDataAttachments && pot.isNone(thirdPartyDataPot)) {
      dispatch(loadThirdPartyMessage.request(messageId));
    }
  }, [dispatch, hasThirdPartyDataAttachments, messageId, thirdPartyDataPot]);

  return (
    <>
      <NBContent noPadded={true}>
        <View style={styles.padded}>
          <NBView spacer={true} />

          {service && <OrganizationTitle {...service} />}

          <NBView spacer={true} large={true} />

          <MessageTitle title={message.title} isPrescription={isPrescription} />

          <NBView spacer={true} />
        </View>
        <HeaderDueDateBar
          hasPaidBadge={hasPaidBadge}
          messageDetails={messageDetails}
        />
        <MessageMarkdown
          webViewStyle={styles.webview}
          onLoadEnd={() => {
            setIsContentLoadCompleted(true);
          }}
        >
          {cleanMarkdownFromCTAs(markdown)}
        </MessageMarkdown>
        <NBView spacer={true} large={true} />
        {prescriptionAttachments &&
          !hasThirdPartyDataAttachments &&
          isContentLoadCompleted && (
            <>
              <MedicalPrescriptionAttachments
                prescriptionData={prescriptionData}
                prescriptionAttachments={prescriptionAttachments}
                organizationName={message.organizationName}
              />
              <NBView spacer={true} large={true} />
            </>
          )}
        {hasThirdPartyDataAttachments && isContentLoadCompleted && (
          <>
            <H2 color="bluegrey" style={styles.attachmentsTitle}>
              {I18n.t("features.pn.details.attachmentsSection.title")}
            </H2>
            {pot.fold(
              thirdPartyDataPot,
              () => (
                <></>
              ),
              () => renderThirdPartyAttachmentsLoading(),
              _ => renderThirdPartyAttachmentsLoading(),
              _ => renderThirdPartyAttachmentsError(),
              thirdPartyMessage =>
                renderThirdPartyAttachments(thirdPartyMessage),
              _ => renderThirdPartyAttachmentsLoading(),
              _ => renderThirdPartyAttachmentsLoading(),
              _ => renderThirdPartyAttachmentsError()
            )}
          </>
        )}
        {isContentLoadCompleted && (
          <MessageContent
            message={message}
            serviceContacts={{
              phone: serviceMetadata?.phone,
              email: serviceMetadata?.email
            }}
            goToServiceDetail={onServiceLinkPress}
          />
        )}
      </NBContent>

      <>
        {DeviceInfo.hasNotch() && (
          <React.Fragment>
            <NBView spacer={true} large={true} />
            <NBView spacer={true} small={true} />
          </React.Fragment>
        )}

        <CtaBar
          isPaid={hasPaidBadge}
          messageDetails={messageDetails}
          service={service}
          serviceMetadata={serviceMetadata}
        />
      </>
    </>
  );
};

export default MessageDetailsComponent;

import React, { useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View
} from "react-native";
import {
  IOColors,
  IOStyles,
  VSpacer,
  makeFontStyleObject
} from "@pagopa/io-app-design-system";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import * as RA from "fp-ts/lib/ReadonlyArray";
import I18n from "../../../../i18n";
import { OrganizationFiscalCode } from "../../../../../definitions/backend/OrganizationFiscalCode";
import { ServiceMetadata } from "../../../../../definitions/backend/ServiceMetadata";
import { useIOSelector } from "../../../../store/hooks";
import {
  messageMarkdownSelector,
  messageTitleSelector,
  thirdPartyFromIdSelector
} from "../../store/reducers/thirdPartyById";
import { UIMessage, UIMessageDetails } from "../../types";
import { UIService } from "../../../../store/reducers/entities/services/types";
import variables from "../../../../theme/variables";
import { cleanMarkdownFromCTAs } from "../../utils/messages";
import OrganizationHeader from "../../../../components/OrganizationHeader";
import { H1 } from "../../../../components/core/typography/H1";
import { H2 } from "../../../../components/core/typography/H2";
import StatusContent from "../../../../components/SectionStatus/StatusContent";

import CtaBar from "./CtaBar";
import { HeaderDueDateBar } from "./HeaderDueDateBar";
import MessageContent from "./Content";
import { MessageMarkdown } from "./MessageMarkdown";

const styles = StyleSheet.create({
  webview: {
    marginHorizontal: variables.contentPadding
  },
  attachmentsTitle: {
    paddingHorizontal: variables.spacerLargeHeight,
    marginBottom: variables.spacerHeight
  },
  message: {
    paddingStart: variables.spacerWidth,
    color: IOColors.white,
    fontSize: variables.headerBodyFontSize,
    ...makeFontStyleObject("Regular", undefined, "TitilliumSansPro")
  },
  messageBold: {
    ...makeFontStyleObject("Bold", undefined, "TitilliumSansPro")
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
    <StatusContent
      backgroundColor={"orange"}
      foregroundColor={"white"}
      iconName={"notice"}
      labelPaddingVertical={16}
    >
      <Text style={styles.message}>
        {I18n.t("messageDetails.attachments.unavailable.firstPart")}
        <Text style={styles.messageBold}>
          {I18n.t("messageDetails.attachments.unavailable.secondPart")}
        </Text>
        {I18n.t("messageDetails.attachments.unavailable.thirdPart")}
      </Text>
    </StatusContent>
    <VSpacer size={24} />
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
    <VSpacer size={24} />
  </>
);

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
  // This is used to make sure that no attachments are shown before the
  // markdown content has rendered
  const [isContentLoadCompleted, setIsContentLoadCompleted] = useState(false);
  const { markdown } = messageDetails;

  const { id: messageId, title } = message;
  const thirdPartyDataPot = useIOSelector(state =>
    thirdPartyFromIdSelector(state, messageId)
  );
  const hasThirdPartyDataAttachments = pipe(
    thirdPartyDataPot,
    pot.toOption,
    O.chainNullableK(
      thirdPartyData => thirdPartyData.third_party_message.attachments
    ),
    O.map(RA.isNonEmpty),
    O.getOrElse(() => false)
  );

  const messageMarkdown =
    useIOSelector(state => messageMarkdownSelector(state, messageId)) ??
    markdown;

  const messageTitle =
    useIOSelector(state => messageTitleSelector(state, messageId)) ?? title;

  return (
    <>
      <ScrollView>
        <View style={IOStyles.horizontalContentPadding}>
          <VSpacer size={16} />

          {service && <OrganizationTitle {...service} />}

          <VSpacer size={24} />

          <H1>{messageTitle}</H1>

          <VSpacer size={24} />
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
          {cleanMarkdownFromCTAs(messageMarkdown)}
        </MessageMarkdown>
        <VSpacer size={24} />

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
              _ => renderThirdPartyAttachmentsLoading(),
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
      </ScrollView>

      <CtaBar
        isPaid={hasPaidBadge}
        messageDetails={messageDetails}
        service={service}
        serviceMetadata={serviceMetadata}
      />
    </>
  );
};

export default MessageDetailsComponent;

import React, { PropsWithChildren } from "react";
import {
  ContentWrapper,
  Divider,
  H3,
  LabelSmall,
  VSpacer
} from "@pagopa/io-app-design-system";
import { localeDateFormat } from "../../../../utils/locale";
import I18n from "../../../../i18n";
import { ServicePublic } from "../../../../../definitions/backend/ServicePublic";
import { logosForService } from "../../../../utils/services";
import { OrganizationHeader } from "./OrganizationHeader";

export type MessageDetailHeaderProps = PropsWithChildren<{
  createdAt: Date;
  subject: string;
  sender?: string;
  service?: ServicePublic;
}>;

const MessageHeaderContent = ({
  subject,
  createdAt
}: MessageDetailHeaderProps) => (
  <>
    <H3 testID="message-header-subject">{subject}</H3>
    <VSpacer size={8} />
    <LabelSmall fontSize="regular" color="grey-700">
      {localeDateFormat(
        createdAt,
        I18n.t("global.dateFormats.fullFormatShortMonthLiteralWithTime")
      )}
    </LabelSmall>
  </>
);

export const MessageDetailHeader = ({
  children,
  service,
  ...rest
}: MessageDetailHeaderProps) => (
  <ContentWrapper>
    {children}
    <MessageHeaderContent {...rest} />
    <VSpacer size={8} />
    <Divider />
    {service && (
      <>
        {/* TODO: update logoUri when MultiImage component will be available in DS */}
        <OrganizationHeader
          logoUri={logosForService(service)[0]}
          organizationName={service.organization_name}
          serviceName={service.service_name}
        />
        <Divider />
      </>
    )}
  </ContentWrapper>
);

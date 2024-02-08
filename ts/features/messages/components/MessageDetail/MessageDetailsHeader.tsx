import React, { PropsWithChildren } from "react";
import { StyleSheet, View } from "react-native";
import {
  ContentWrapper,
  Divider,
  H3,
  LabelSmall,
  VSpacer
} from "@pagopa/io-app-design-system";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { ServiceId } from "../../../../../definitions/backend/ServiceId";
import { localeDateFormat } from "../../../../utils/locale";
import I18n from "../../../../i18n";
import { logosForService } from "../../../../utils/services";
import { useIOSelector } from "../../../../store/hooks";
import { serviceByIdSelector } from "../../../../store/reducers/entities/services/servicesById";
import { gapBetweenItemsInAGrid } from "../../utils";
import { OrganizationHeader } from "./OrganizationHeader";

const styles = StyleSheet.create({
  tagsWrapper: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
    marginHorizontal: -(gapBetweenItemsInAGrid / 2),
    marginVertical: -(gapBetweenItemsInAGrid / 2)
  }
});

export type MessageDetailsHeaderProps = PropsWithChildren<{
  createdAt: Date;
  subject: string;
  serviceId: ServiceId;
}>;

const MessageDetailsHeaderContent = ({
  subject,
  createdAt
}: Pick<MessageDetailsHeaderProps, "createdAt" | "subject">) => (
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

export const MessageDetailsHeader = ({
  children,
  serviceId,
  ...rest
}: MessageDetailsHeaderProps) => {
  const service = pipe(
    useIOSelector(state => serviceByIdSelector(state, serviceId)),
    pot.toOption,
    O.toUndefined
  );

  return (
    <ContentWrapper>
      <View style={styles.tagsWrapper}>{children}</View>
      <VSpacer size={8} />
      <MessageDetailsHeaderContent {...rest} />
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
};

import { PropsWithChildren } from "react";
import { StyleSheet, View } from "react-native";
import { Divider, H3, BodySmall, VSpacer } from "@pagopa/io-app-design-system";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { ServiceId } from "../../../../../definitions/backend/ServiceId";
import { localeDateFormat } from "../../../../utils/locale";
import I18n from "../../../../i18n";
import { logosForService } from "../../../services/common/utils";
import { useIOSelector } from "../../../../store/hooks";
import { serviceByIdPotSelector } from "../../../services/details/store/reducers";
import { gapBetweenItemsInAGrid } from "../../utils";
import { UIMessageId } from "../../types";
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
  messageId: UIMessageId;
  serviceId: ServiceId;
  subject: string;
}>;

const MessageDetailsHeaderContent = ({
  subject,
  createdAt
}: Pick<MessageDetailsHeaderProps, "createdAt" | "subject">) => (
  <>
    <H3 testID="message-header-subject">{subject}</H3>
    <VSpacer size={8} />
    <BodySmall weight="Regular" color="grey-700">
      {localeDateFormat(
        createdAt,
        I18n.t("global.dateFormats.fullFormatShortMonthLiteralWithTime")
      )}
    </BodySmall>
  </>
);

export const MessageDetailsHeader = ({
  children,
  messageId,
  serviceId,
  ...rest
}: MessageDetailsHeaderProps) => {
  const service = pipe(
    useIOSelector(state => serviceByIdPotSelector(state, serviceId)),
    pot.toOption,
    O.toUndefined
  );

  return (
    <>
      <View style={styles.tagsWrapper}>{children}</View>
      <VSpacer size={8} />
      <MessageDetailsHeaderContent {...rest} />
      <VSpacer size={8} />
      <Divider />
      {service && (
        <>
          <OrganizationHeader
            messageId={messageId}
            logoUri={logosForService(service)}
            organizationName={service.organization_name}
            serviceId={serviceId}
            serviceName={service.service_name}
          />
          <Divider />
        </>
      )}
    </>
  );
};

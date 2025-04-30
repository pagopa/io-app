import { PropsWithChildren } from "react";
import { ImageSourcePropType, StyleSheet, View } from "react-native";
import { Divider, H3, BodySmall, VSpacer } from "@pagopa/io-app-design-system";
import { ServiceId } from "../../../../../definitions/services/ServiceId";
import { localeDateFormat } from "../../../../utils/locale";
import I18n from "../../../../i18n";
import { logosForService } from "../../../services/common/utils";
import { useIOSelector } from "../../../../store/hooks";
import { serviceByIdSelector } from "../../../services/details/store/reducers";
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
    <H3 accessibilityRole="header" testID="message-header-subject">
      {subject}
    </H3>
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
  const service = useIOSelector(state => serviceByIdSelector(state, serviceId));

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
            logoUri={logosForService(service) as ImageSourcePropType}
            organizationName={service.organization.name}
            serviceId={serviceId}
            serviceName={service.name}
          />
          <Divider />
        </>
      )}
    </>
  );
};

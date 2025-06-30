import { BodySmall, H3, VStack } from "@pagopa/io-app-design-system";
import { PropsWithChildren } from "react";
import { ImageSourcePropType, StyleSheet, View } from "react-native";
import { ServiceId } from "../../../../../definitions/backend/ServiceId";
import I18n from "../../../../i18n";
import { useIOSelector } from "../../../../store/hooks";
import { localeDateFormat } from "../../../../utils/locale";
import { logosForService } from "../../../services/common/utils";
import { serviceDetailsByIdSelector } from "../../../services/details/store/reducers";
import { UIMessageId } from "../../types";
import { OrganizationHeader } from "./OrganizationHeader";

const styles = StyleSheet.create({
  tagsWrapper: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    justifyContent: "flex-start",
    gap: 8
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
  <VStack space={8}>
    <H3 accessibilityRole="header" testID="message-header-subject">
      {subject}
    </H3>
    <BodySmall weight="Regular">
      {localeDateFormat(
        createdAt,
        I18n.t("global.dateFormats.fullFormatShortMonthLiteralWithTime")
      )}
    </BodySmall>
  </VStack>
);

export const MessageDetailsHeader = ({
  children,
  messageId,
  serviceId,
  ...rest
}: MessageDetailsHeaderProps) => {
  const service = useIOSelector(state =>
    serviceDetailsByIdSelector(state, serviceId)
  );

  return (
    <VStack space={8}>
      <View style={styles.tagsWrapper}>{children}</View>
      <MessageDetailsHeaderContent {...rest} />
      {service && (
        <OrganizationHeader
          messageId={messageId}
          logoUri={logosForService(service) as ImageSourcePropType}
          organizationName={service.organization.name}
          serviceId={serviceId}
          serviceName={service.name}
        />
      )}
    </VStack>
  );
};

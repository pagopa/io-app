import { BodySmall, H3, VStack } from "@io-app/design-system";
import { PropsWithChildren } from "react";
import { ImageSourcePropType, StyleSheet, View } from "react-native";
import { ServiceId } from "../../../../../definitions/services/ServiceId";
import { useIOSelector } from "../../../../store/hooks";
import { logosForService } from "../../../services/common/utils";
import { serviceDetailsByIdSelector } from "../../../services/details/store/selectors";
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

// Italian locale is intentional for message timestamps; these formatters are
// hoisted out of JSX both to avoid re-instantiating them on every render and
// because the locale/format tokens are technical, not localizable copy.
const messageDateFormatter = new Intl.DateTimeFormat("it", {
  day: "2-digit",
  month: "short",
  year: "numeric"
});
const messageTimeFormatter = new Intl.DateTimeFormat("it", {
  hour: "2-digit",
  minute: "2-digit"
});

export type MessageDetailsHeaderProps = PropsWithChildren<{
  createdAt: Date | undefined;
  messageId: string;
  serviceId: ServiceId;
  subject: string;
  canNavigateToServiceDetails?: boolean;
  thirdPartySenderDenomination?: string;
}>;

const MessageDetailsHeaderContent = ({
  subject,
  createdAt
}: Pick<MessageDetailsHeaderProps, "createdAt" | "subject">) => (
  <VStack space={8}>
    <H3 accessibilityRole="header" testID="message-header-subject">
      {subject}
    </H3>
    {createdAt && (
      <BodySmall weight="Regular" testID="date">
        {`${messageDateFormatter.format(
          createdAt
        )}, ${messageTimeFormatter.format(createdAt)}`}
      </BodySmall>
    )}
  </VStack>
);

export const MessageDetailsHeader = ({
  children,
  messageId,
  serviceId,
  thirdPartySenderDenomination,
  canNavigateToServiceDetails = true,
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
          thirdPartySenderDenomination={thirdPartySenderDenomination}
          canNavigateToServiceDetails={canNavigateToServiceDetails}
        />
      )}
    </VStack>
  );
};

import React from "react";
import { StyleSheet, View } from "react-native";
import { IOColors, IOStyles, VSpacer } from "@pagopa/io-app-design-system";
import { useIOSelector } from "../../../../store/hooks";
import { serviceMetadataByIdSelector } from "../../../services/details/store/reducers/servicesById";
import { ServiceId } from "../../../../../definitions/backend/ServiceId";
import { UIMessageId } from "../../types";
import { ContactsListItem } from "./ContactsListItem";
import { ShowMoreListItem } from "./ShowMoreListItem";

const styles = StyleSheet.create({
  container: {
    backgroundColor: IOColors["grey-50"],
    paddingBottom: "75%",
    marginBottom: "-75%"
  }
});

export type MessageDetailsFooterProps = {
  messageId: UIMessageId;
  noticeNumber?: string;
  payeeFiscalCode?: string;
  serviceId: ServiceId;
};

export const MessageDetailsFooter = ({
  messageId,
  noticeNumber,
  payeeFiscalCode,
  serviceId
}: MessageDetailsFooterProps) => {
  const serviceMetadata = useIOSelector(state =>
    serviceMetadataByIdSelector(state, serviceId)
  );

  return (
    <View style={[IOStyles.horizontalContentPadding, styles.container]}>
      <VSpacer size={16} />
      {(serviceMetadata?.email || serviceMetadata?.phone) && (
        <ContactsListItem
          email={serviceMetadata.email}
          phone={serviceMetadata.phone}
        />
      )}

      <ShowMoreListItem
        messageId={messageId}
        noticeNumber={noticeNumber}
        payeeFiscalCode={payeeFiscalCode}
      />
    </View>
  );
};

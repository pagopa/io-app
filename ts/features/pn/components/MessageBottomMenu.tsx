import { IOColors, IOStyles, VSpacer } from "@pagopa/io-app-design-system";
import React from "react";
import { StyleSheet, View } from "react-native";
import { ContactsListItem } from "../../messages/components/MessageDetail/ContactsListItem";
import { useIOSelector } from "../../../store/hooks";
import { serviceMetadataByIdSelector } from "../../../store/reducers/entities/services/servicesById";
import { ServiceId } from "../../../../definitions/backend/ServiceId";

const styles = StyleSheet.create({
  container: {
    backgroundColor: IOColors["grey-50"],
    paddingBottom: "95%",
    marginBottom: "-95%",
    paddingHorizontal: IOStyles.horizontalContentPadding.paddingHorizontal,
    paddingTop: IOStyles.footer.paddingTop
  }
});

type MessageBottomMenuProps = {
  serviceId: ServiceId;
};

export const MessageBottomMenu = ({ serviceId }: MessageBottomMenuProps) => {
  const serviceMetadata = useIOSelector(state =>
    serviceMetadataByIdSelector(state, serviceId)
  );
  return (
    <View style={styles.container}>
      {(serviceMetadata?.email || serviceMetadata?.phone) && (
        <ContactsListItem
          email={serviceMetadata.email}
          phone={serviceMetadata.phone}
        />
      )}
      <VSpacer size={16} />
    </View>
  );
};

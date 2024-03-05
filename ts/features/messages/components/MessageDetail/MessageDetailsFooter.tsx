import React from "react";
import { StyleSheet, View } from "react-native";
import {
  IOColors,
  IOStyles,
  ListItemAction,
  VSpacer
} from "@pagopa/io-app-design-system";
import I18n from "../../../../i18n";
import { useIOSelector } from "../../../../store/hooks";
import { serviceMetadataByIdSelector } from "../../../../store/reducers/entities/services/servicesById";
import { ServiceId } from "../../../../../definitions/backend/ServiceId";
import { UIMessageId } from "../../types";
import { useMessageMoreDataBottomSheet } from "../../hooks/useMessageMoreDataBottomSheet";
import { useMessageContactsBottomSheet } from "../../hooks/useMessageContactsBottomSheet";

const styles = StyleSheet.create({
  container: {
    backgroundColor: IOColors["grey-50"],
    paddingBottom: "75%",
    marginBottom: "-75%"
  }
});

export type MessageDetailsFooterProps = {
  messageId: UIMessageId;
  serviceId: ServiceId;
};

export const MessageDetailsFooter = ({
  messageId,
  serviceId
}: MessageDetailsFooterProps) => {
  const serviceMetadata = useIOSelector(state =>
    serviceMetadataByIdSelector(state, serviceId)
  );

  const { bottomSheet, present } = useMessageMoreDataBottomSheet(messageId);

  return (
    <View style={[IOStyles.horizontalContentPadding, styles.container]}>
      <VSpacer size={16} />
      {(serviceMetadata?.email || serviceMetadata?.phone) && (
        <ContactsAction
          email={serviceMetadata.email}
          phone={serviceMetadata.phone}
        />
      )}

      <ListItemAction
        accessibilityLabel={I18n.t("messageDetails.footer.showMoreData")}
        icon="terms"
        label={I18n.t("messageDetails.footer.showMoreData")}
        onPress={present}
        testID="show-more-data-action"
        variant="primary"
      />
      {bottomSheet}
    </View>
  );
};

type ContactsActionProps = {
  email?: string;
  phone?: string;
};

const ContactsAction = ({ email, phone }: ContactsActionProps) => {
  const { bottomSheet, present } = useMessageContactsBottomSheet(email, phone);

  return (
    <>
      <ListItemAction
        accessibilityLabel={I18n.t("messageDetails.footer.contacts")}
        icon="message"
        label={I18n.t("messageDetails.footer.contacts")}
        onPress={present}
        testID="contacts-action"
        variant="primary"
      />
      {bottomSheet}
    </>
  );
};

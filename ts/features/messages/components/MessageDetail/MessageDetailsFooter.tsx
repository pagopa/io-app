import React from "react";
import { StyleSheet, View } from "react-native";
import {
  IOColors,
  IOStyles,
  ListItemAction,
  VSpacer
} from "@pagopa/io-app-design-system";
import { constNull } from "fp-ts/lib/function";
import I18n from "../../../../i18n";
import { useIOSelector } from "../../../../store/hooks";
import { serviceMetadataByIdSelector } from "../../../../store/reducers/entities/services/servicesById";
import { ServiceId } from "../../../../../definitions/backend/ServiceId";

const styles = StyleSheet.create({
  container: {
    backgroundColor: IOColors["grey-50"],
    paddingBottom: "75%",
    marginBottom: "-75%"
  }
});

export type MessageDetailsFooterProps = {
  serviceId: ServiceId;
};

export const MessageDetailsFooter = ({
  serviceId
}: MessageDetailsFooterProps) => {
  const serviceMetadata = useIOSelector(state =>
    serviceMetadataByIdSelector(state, serviceId)
  );

  return (
    <View style={[IOStyles.horizontalContentPadding, styles.container]}>
      <VSpacer size={16} />
      {serviceMetadata?.email || serviceMetadata?.phone ? (
        <ListItemAction
          variant="primary"
          icon="message"
          label={I18n.t("messageDetails.footer.contact")}
          onPress={constNull}
          accessibilityLabel={I18n.t("messageDetails.footer.contact")}
        />
      ) : null}

      <ListItemAction
        variant="primary"
        icon="terms"
        label={I18n.t("messageDetails.footer.showMore")}
        onPress={constNull}
        accessibilityLabel={I18n.t("messageDetails.footer.showMore")}
      />
    </View>
  );
};

import React from "react";
import { Linking } from "react-native";
import { Body, ListItemAction, VSpacer } from "@pagopa/io-app-design-system";
import { useIOBottomSheetAutoresizableModal } from "../../../utils/hooks/bottomSheet";
import I18n from "../../../i18n";

export const useMessageContactsBottomSheet = (
  email?: string,
  phone?: string
) => {
  const { present, bottomSheet } = useIOBottomSheetAutoresizableModal(
    {
      component: (
        <>
          <Body color="grey-700">
            {I18n.t("messageDetails.contactsBottomSheet.body")}
          </Body>
          <VSpacer size={8} />
          {email && (
            <ListItemAction
              accessibilityLabel={I18n.t(
                "messageDetails.contactsBottomSheet.actions.email"
              )}
              icon="email"
              label={I18n.t("messageDetails.contactsBottomSheet.actions.email")}
              onPress={() => Linking.openURL(`mailto:${email}`)}
              variant="primary"
            />
          )}
          {phone && (
            <ListItemAction
              accessibilityLabel={I18n.t(
                "messageDetails.contactsBottomSheet.actions.call"
              )}
              icon="phone"
              label={I18n.t("messageDetails.contactsBottomSheet.actions.call")}
              onPress={() => Linking.openURL(`tel:${phone}`)}
              variant="primary"
            />
          )}
        </>
      ),
      title: I18n.t("messageDetails.contactsBottomSheet.title")
    },
    100
  );

  return {
    bottomSheet,
    present
  };
};

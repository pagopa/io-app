import { Body, ListItemAction, VSpacer } from "@io-app/design-system";
import I18n from "i18next";

import { useIOBottomSheetModal } from "../../../../utils/hooks/bottomSheet";
import { ServiceContactListItem } from "../../../services/common/components/ServiceContactListItem";

export type ContactsListItemProps = {
  email?: string;
  pec?: string;
  phone?: string;
  support_url?: string;
  web_url?: string;
};

export const ContactsListItem = ({
  email,
  pec,
  phone,
  support_url,
  web_url
}: ContactsListItemProps) => {
  // we hold web_url as fallback, and avoid rendering a listItem in case both are missing
  const webUrl = support_url || web_url;

  const { present, bottomSheet } = useIOBottomSheetModal({
    component: (
      <>
        <Body color="grey-700">
          {I18n.t("messageDetails.contactsBottomSheet.body")}
        </Body>
        <VSpacer size={8} />
        <ServiceContactListItem
          testID="contacts-web-url"
          value={webUrl}
          variant="web_url"
        />
        <ServiceContactListItem
          testID="contacts-phone"
          value={phone}
          variant="phone"
        />
        <ServiceContactListItem
          testID="contacts-email"
          value={email}
          variant="email"
        />
        <ServiceContactListItem
          testID="contacts-pec"
          value={pec}
          variant="pec"
        />
      </>
    ),
    title: I18n.t("messageDetails.contactsBottomSheet.title")
  });

  if (!webUrl && !phone && !email && !pec) {
    return null;
  }

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

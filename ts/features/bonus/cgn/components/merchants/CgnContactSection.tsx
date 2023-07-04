import * as React from "react";
import { Linking } from "react-native";
import { constNull } from "fp-ts/lib/function";

import { openWebUrl } from "../../../../../utils/url";
import { showToast } from "../../../../../utils/showToast";
import I18n from "../../../../../i18n";
// import {
//   MerchantContactTypeEnum,
//   MerchantContacts
// } from "../../../../../../definitions/cgn/merchants/Merchant";
import ListItemAction from "../../../../../components/ui/ListItemAction";
import { H2 } from "../../../../../components/core/typography/H2";
import { CGN_MERCHANT_CONTACT_ICONS } from "../../utils/constants";

type CgnContactSectionProps = {
  contact: { text: string; type: MerchantContactTypeEnum };
};

export enum MerchantContactTypeEnum {
  EMAIL = "EMAIL",
  WEBSITE = "WEBSITE",
  PHONE = "PHONE"
}

/**
 * Renders a single merchant contact item with a copy button
 * - If the contact is a website, it will open the url in the browser
 * - If the contact is an email, it will open the email app
 * - If the contact is a phone number, it will open the phone app
 */
const CgnContactSection: React.FC<CgnContactSectionProps> = ({
  contact
}: CgnContactSectionProps) => {
  const handleOnPress = () => {
    switch (contact.type) {
      case MerchantContactTypeEnum.EMAIL:
        return Linking.openURL(`mailto:${contact}`).catch(constNull);
      case MerchantContactTypeEnum.WEBSITE:
        return openWebUrl(contact.text, () =>
          showToast(I18n.t("bonus.cgn.generic.linkError"))
        );
      case MerchantContactTypeEnum.PHONE:
        return Linking.openURL(`tel:${contact}`).catch(constNull);
      default:
        return showToast(I18n.t("bonus.cgn.generic.linkError"));
    }
  };

  const contactIcon = React.useMemo(
    () => CGN_MERCHANT_CONTACT_ICONS[contact.type],
    [contact]
  );

  return (
    <>
      <H2>{I18n.t("bonus.cgn.merchantDetail.title.contacts")}</H2>
      <ListItemAction
        accessibilityLabel={contact.text}
        label={contact.text}
        onPress={handleOnPress}
        variant="primary"
        icon={contactIcon}
      />
    </>
  );
};

export default CgnContactSection;

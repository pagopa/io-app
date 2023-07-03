import * as React from "react";
import { StyleSheet, Linking, View } from "react-native";
import { constNull } from "fp-ts/lib/function";

import { IOStyles } from "../../../../../components/core/variables/IOStyles";
import { openWebUrl } from "../../../../../utils/url";
import { showToast } from "../../../../../utils/showToast";
import I18n from "../../../../../i18n";
import { clipboardSetStringWithFeedback } from "../../../../../utils/clipboard";
import IconButton from "../../../../../components/ui/IconButton";
import { Link } from "../../../../../components/core/typography/Link";
import {
  MerchantContactTypeEnum,
  MerchantContacts
} from "../../../../../../definitions/cgn/merchants/Merchant";

type CgnContactItemProps = {
  contact: MerchantContacts;
};

const styles = StyleSheet.create({
  content: {
    paddingVertical: 10
  }
});

/**
 * Renders a single merchant contact item with a copy button
 * - If the contact is a website, it will open the url in the browser
 * - If the contact is an email, it will open the email app
 * - If the contact is a phone number, it will open the phone app
 */
const CgnContactItem: React.FC<CgnContactItemProps> = ({
  contact
}: CgnContactItemProps) => {
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

  return (
    <View style={[IOStyles.rowSpaceBetween, styles.content]}>
      <View style={IOStyles.flex}>
        <Link numberOfLines={0} onPress={handleOnPress}>
          {contact}
        </Link>
      </View>
      <IconButton
        icon="copy"
        accessibilityLabel="copy"
        onPress={() => clipboardSetStringWithFeedback(contact.text)}
      />
    </View>
  );
};

export default CgnContactItem;

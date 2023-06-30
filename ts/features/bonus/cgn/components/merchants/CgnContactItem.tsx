import * as React from "react";
import { StyleSheet, Linking, View } from "react-native";
import { constNull } from "fp-ts/lib/function";

import { IOStyles } from "../../../../../components/core/variables/IOStyles";
import { isHttp, openWebUrl } from "../../../../../utils/url";
import { showToast } from "../../../../../utils/showToast";
import I18n from "../../../../../i18n";
import { clipboardSetStringWithFeedback } from "../../../../../utils/clipboard";
import IconButton from "../../../../../components/ui/IconButton";
import ButtonLink from "../../../../../components/ui/ButtonLink";

type CgnContactItemProps = {
  contact: string;
};

const styles = StyleSheet.create({
  content: {
    paddingVertical: 10
  }
});

/**
 * Regex to check if a string is a valid phone number
 */
const isPhoneNumber = (phoneNumber: string) =>
  phoneNumber.match(/^[0-9\-+]{9,15}$/);

const isWebsite = (contact: string) => isHttp(contact);

const isEmail = (contact: string) =>
  contact.match(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/);

const CgnContactItem: React.FC<CgnContactItemProps> = ({
  contact
}: CgnContactItemProps) => {
  const handleOnPress = () => {
    const normalizedContact = contact.trim();
    if (isPhoneNumber(normalizedContact)) {
      Linking.openURL(`tel:${normalizedContact}`).catch(constNull);
    } else if (isEmail(normalizedContact)) {
      Linking.openURL(`mailto:${normalizedContact}`).catch(constNull);
    } else if (isWebsite(normalizedContact)) {
      openWebUrl(normalizedContact, () =>
        showToast(I18n.t("bonus.cgn.generic.linkError"))
      );
    }
  };

  return (
    <View style={[IOStyles.rowSpaceBetween, styles.content]}>
      <ButtonLink label={contact} numberOfLines={0} onPress={handleOnPress} />
      <IconButton
        icon="copy"
        accessibilityLabel="copy"
        onPress={() => clipboardSetStringWithFeedback(contact)}
      />
    </View>
  );
};

export default CgnContactItem;

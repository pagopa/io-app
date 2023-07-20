import * as React from "react";
import { Linking } from "react-native";
import { constNull } from "fp-ts/lib/function";

import { openWebUrl } from "../../../../../utils/url";
import { showToast } from "../../../../../utils/showToast";
import I18n from "../../../../../i18n";
import ListItemAction from "../../../../../components/ui/ListItemAction";
import { H2 } from "../../../../../components/core/typography/H2";
import { CGN_MERCHANT_CONTACT_ICONS } from "../../utils/constants";
import {
  SupportType,
  SupportTypeEnum
} from "../../../../../../definitions/cgn/merchants/SupportType";

type CgnContactSectionProps = {
  supportValue: string;
  supportType: SupportType;
};

/**
 * Renders a merchant support contact item with the following behaviour:
 * - If the supportType is a website, it will open the url in the browser
 * - If the supportType is an email, it will open the email app
 * - If the supportType is a phone number, it will open the phone app
 */
const CgnContactSection = ({
  supportType,
  supportValue
}: CgnContactSectionProps) => {
  const handleOnPress = () => {
    switch (supportType) {
      case SupportTypeEnum.EMAILADDRESS:
        return Linking.openURL(`mailto:${supportValue}`).catch(constNull);
      case SupportTypeEnum.WEBSITE:
        return openWebUrl(supportValue, () =>
          showToast(I18n.t("bonus.cgn.generic.linkError"))
        );
      case SupportTypeEnum.PHONENUMBER:
        return Linking.openURL(`tel:${supportValue}`).catch(constNull);
      default:
        return showToast(I18n.t("bonus.cgn.generic.linkError"));
    }
  };

  const contactIcon = React.useMemo(
    () => CGN_MERCHANT_CONTACT_ICONS[supportType],
    [supportType]
  );

  return (
    <>
      <H2>{I18n.t("bonus.cgn.merchantDetail.title.contacts")}</H2>
      <ListItemAction
        accessibilityLabel={supportValue}
        label={supportValue}
        onPress={handleOnPress}
        variant="primary"
        icon={contactIcon}
      />
    </>
  );
};

export default CgnContactSection;

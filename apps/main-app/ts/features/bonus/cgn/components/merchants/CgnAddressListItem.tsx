import { ListItemInfo, ListItemInfoCopy } from "@io-app/design-system";
import I18n from "i18next";

import { Address } from "../../../../../../definitions/cgn/merchants/Address";
import { clipboardSetStringWithFeedback } from "../../../../../utils/clipboard";

type CgnAddressListItemProps = {
  isAllNationalAddress: boolean;
  item: Address;
};

export const CgnAddressListItem = ({
  item,
  isAllNationalAddress
}: CgnAddressListItemProps) => {
  if (isAllNationalAddress) {
    return (
      <ListItemInfo
        icon="mapPin"
        label={I18n.t("bonus.cgn.merchantDetail.information.address")}
        value={I18n.t("bonus.cgn.merchantDetail.information.allNational")}
      />
    );
  }
  return (
    <ListItemInfoCopy
      accessibilityLabel={`${I18n.t(
        "bonus.cgn.merchantDetail.information.address"
      )}: ${item.full_address}`}
      icon="mapPin"
      label={I18n.t("bonus.cgn.merchantDetail.information.address")}
      onPress={() => clipboardSetStringWithFeedback(item.full_address)}
      value={item.full_address}
    />
  );
};

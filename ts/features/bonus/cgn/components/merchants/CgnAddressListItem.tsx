import { ListItemInfo, ListItemInfoCopy } from "@pagopa/io-app-design-system";
import I18n from "i18next";
import { Address } from "../../../../../../definitions/cgn/merchants/Address";
import { clipboardSetStringWithFeedback } from "../../../../../utils/clipboard";

type CgnAddressListItemProps = {
  item: Address;
  isAllNationalAddress: boolean;
};

export const CgnAddressListItem = ({
  item,
  isAllNationalAddress
}: CgnAddressListItemProps) => {
  if (isAllNationalAddress) {
    return (
      <ListItemInfo
        label={I18n.t("bonus.cgn.merchantDetail.information.address")}
        value={I18n.t("bonus.cgn.merchantDetail.information.allNational")}
        icon="mapPin"
      />
    );
  }
  return (
    <ListItemInfoCopy
      accessibilityLabel={`${I18n.t(
        "bonus.cgn.merchantDetail.information.address"
      )}: ${item.full_address}`}
      label={I18n.t("bonus.cgn.merchantDetail.information.address")}
      value={item.full_address}
      icon="mapPin"
      onPress={() => clipboardSetStringWithFeedback(item.full_address)}
    />
  );
};

import { ListItemInfo } from "@pagopa/io-app-design-system";
import React from "react";
import ScreenWithListItems from "../screens/ScreenWithListItems";
import { openNFCSettings } from "../../utils/cie";
import I18n from "../../i18n";

const ActivateNfcScreen = () => {
  const renderItems: Array<ListItemInfo> = [
    {
      label: I18n.t("authentication.cie.nfc.listItemLabel1"),
      value: I18n.t("authentication.cie.nfc.listItemValue1"),
      icon: "systemSettingsAndroid"
    },
    {
      label: I18n.t("authentication.cie.nfc.listItemLabel2"),
      value: I18n.t("authentication.cie.nfc.listItemValue2"),
      icon: "systemAppsAndroid"
    },
    {
      label: I18n.t("authentication.cie.nfc.listItemLabel3"),
      value: I18n.t("authentication.cie.nfc.listItemValue3"),
      icon: "systemToggleInstructions"
    }
  ];

  return (
    <ScreenWithListItems
      isHeaderVisible={true}
      title={I18n.t("authentication.cie.nfc.title")}
      subtitle={I18n.t("authentication.cie.nfc.subtitle")}
      listItemHeaderLabel={I18n.t("authentication.cie.nfc.listItemTitle")}
      renderItems={renderItems}
      action={{
        label: I18n.t("authentication.cie.nfc.action"),
        onPress: openNFCSettings
      }}
    />
  );
};

export default ActivateNfcScreen;

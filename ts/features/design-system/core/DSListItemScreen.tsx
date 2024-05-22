import React from "react";
import { Alert } from "react-native";
import { ListItemInfo } from "@pagopa/io-app-design-system";
import ScreenWithListItems from "../../../components/screens/ScreenWithListItems";
import { useHeaderSecondLevel } from "../../../hooks/useHeaderSecondLevel";
import { useIONavigation } from "../../../navigation/params/AppParamsList";
import I18n from "../../../i18n";

const DSListItemScreen = () => {
  const navigation = useIONavigation();
  const onButtonPress = () => {
    Alert.alert("Alert", "Action triggered");
  };

  useHeaderSecondLevel({
    goBack: () => navigation.goBack(),
    title: ""
  });

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
        onPress: onButtonPress
      }}
    />
  );
};

export default DSListItemScreen;

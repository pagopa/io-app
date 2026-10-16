import { ListItemHeader, ListItemInfo } from "@io-app/design-system";
import I18n from "i18next";
import { useState } from "react";
import { Alert } from "react-native";

import { IOListViewWithLargeHeader } from "../../../components/ui/IOListViewWithLargeHeader";

export const DSIOListViewWithLargeHeader = () => {
  const [refreshing, setRefreshing] = useState(false);

  const pullAction = () => {
    setRefreshing(true);
    Alert.alert("Alert", "Action triggered");
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  };

  const renderItems: Array<ListItemInfo & { id: string }> = [
    {
      id: "1",
      label: I18n.t("authentication.cie.nfc.listItemLabel1"),
      value: I18n.t("authentication.cie.nfc.listItemValue1"),
      icon: "systemSettingsAndroid"
    },
    {
      id: "2",
      label: I18n.t("authentication.cie.nfc.listItemLabel2"),
      value: I18n.t("authentication.cie.nfc.listItemValue2"),
      icon: "systemAppsAndroid"
    },
    {
      id: "3",
      label: I18n.t("authentication.cie.nfc.listItemLabel3"),
      value: I18n.t("authentication.cie.nfc.listItemValue3"),
      icon: "systemToggleInstructions"
    },
    {
      id: "4",
      label: I18n.t("authentication.cie.nfc.listItemLabel3"),
      value: I18n.t("authentication.cie.nfc.listItemValue3"),
      icon: "systemToggleInstructions"
    },
    {
      id: "5",
      label: I18n.t("authentication.cie.nfc.listItemLabel3"),
      value: I18n.t("authentication.cie.nfc.listItemValue3"),
      icon: "systemToggleInstructions"
    },
    {
      id: "6",
      label: I18n.t("authentication.cie.nfc.listItemLabel3"),
      value: I18n.t("authentication.cie.nfc.listItemValue3"),
      icon: "systemToggleInstructions"
    },
    {
      id: "7",
      label: I18n.t("authentication.cie.nfc.listItemLabel3"),
      value: I18n.t("authentication.cie.nfc.listItemValue3"),
      icon: "systemToggleInstructions"
    },
    {
      id: "8",
      label: I18n.t("authentication.cie.nfc.listItemLabel3"),
      value: I18n.t("authentication.cie.nfc.listItemValue3"),
      icon: "systemToggleInstructions"
    },
    {
      id: "9",
      label: I18n.t("authentication.cie.nfc.listItemLabel1"),
      value: I18n.t("authentication.cie.nfc.listItemValue1"),
      icon: "systemSettingsAndroid"
    },
    {
      id: "10",
      label: I18n.t("authentication.cie.nfc.listItemLabel2"),
      value: I18n.t("authentication.cie.nfc.listItemValue2"),
      icon: "systemAppsAndroid"
    }
  ];

  return (
    <IOListViewWithLargeHeader
      data={renderItems}
      headerActionsProp={{
        showHelp: true
      }}
      keyExtractor={item => item.id}
      ListHeaderComponent={
        <ListItemHeader
          label={I18n.t("authentication.cie.nfc.listItemTitle")}
        />
      }
      refreshControlProps={{
        onRefresh: pullAction,
        refreshing
      }}
      renderItem={({ item }) => (
        <ListItemInfo
          {...item}
          accessibilityLabel={`${item.label}; ${item.value}`}
        />
      )}
      subtitle={I18n.t("authentication.cie.nfc.subtitle")}
      testID="io-list-view-large-header"
      title={{
        label: I18n.t("authentication.cie.nfc.title")
      }}
    />
  );
};

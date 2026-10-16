import { ListItemInfo } from "@io-app/design-system";
import I18n from "i18next";
import { Alert } from "react-native";

import { IOScrollViewWithListItems } from "../../../components/ui/IOScrollViewWithListItems";
import { useHeaderSecondLevel } from "../../../hooks/useHeaderSecondLevel";
import { useIONavigation } from "../../../navigation/params/AppParamsList";

export const DSIOScrollViewWithListItems = () => {
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
    <IOScrollViewWithListItems
      actions={{
        type: "TwoButtons",
        primary: {
          label: I18n.t("authentication.cie.nfc.action"),
          onPress: onButtonPress
        },
        secondary: {
          label: I18n.t("global.buttons.continue"),
          onPress: onButtonPress
        }
      }}
      isHeaderVisible={true}
      listItemHeaderLabel={I18n.t("authentication.cie.nfc.listItemTitle")}
      renderItems={renderItems}
      subtitle={I18n.t("authentication.cie.nfc.subtitle")}
      title={I18n.t("authentication.cie.nfc.title")}
    />
  );
};

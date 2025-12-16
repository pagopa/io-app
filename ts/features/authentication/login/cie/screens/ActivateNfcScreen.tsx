import { ListItemInfo } from "@pagopa/io-app-design-system";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { Route, useRoute } from "@react-navigation/native";
import { useCallback } from "react";
import { Alert } from "react-native";
import I18n from "i18next";
import { IOScrollViewWithListItems } from "../../../../../components/ui/IOScrollViewWithListItems";
import { useIOSelector } from "../../../../../store/hooks";
import { isNfcEnabledSelector } from "../store/selectors";
import * as cieUtils from "../utils/cie";
import { AUTHENTICATION_ROUTES } from "../../../common/navigation/routes";
import useActiveSessionLoginNavigation from "../../../activeSessionLogin/utils/useActiveSessionLoginNavigation";
import { CieCardReaderScreenNavigationParams } from "./CieCardReaderScreen";

const ActivateNfcScreen = () => {
  const isEnabled = useIOSelector(isNfcEnabledSelector);
  const isNfcEnabled = pot.getOrElse(isEnabled, false);

  const route =
    useRoute<
      Route<
        typeof AUTHENTICATION_ROUTES.CIE_ACTIVATE_NFC_SCREEN,
        CieCardReaderScreenNavigationParams
      >
    >();

  const { ciePin, authorizationUri } = route.params;
  const { navigateToCieCardReaderScreen } = useActiveSessionLoginNavigation();

  const openSettings = useCallback(async () => {
    await cieUtils.openNFCSettings();
  }, []);

  const onContinue = useCallback(async () => {
    if (isNfcEnabled) {
      navigateToCieCardReaderScreen({ ciePin, authorizationUri });
    } else {
      Alert.alert(I18n.t("authentication.cie.nfc.activeNfcAlert"), "", [
        {
          text: I18n.t("global.buttons.cancel"),
          style: "cancel"
        },
        {
          text: I18n.t("authentication.cie.nfc.activeNFCAlertButton"),
          onPress: openSettings
        }
      ]);
    }
  }, [
    authorizationUri,
    ciePin,
    isNfcEnabled,
    navigateToCieCardReaderScreen,
    openSettings
  ]);

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
      isHeaderVisible={true}
      title={I18n.t("authentication.cie.nfc.title")}
      subtitle={I18n.t("authentication.cie.nfc.subtitle")}
      listItemHeaderLabel={I18n.t("authentication.cie.nfc.listItemTitle")}
      renderItems={renderItems}
      actions={{
        type: "TwoButtons",
        primary: {
          label: I18n.t("authentication.cie.nfc.action"),
          onPress: openSettings
        },
        secondary: {
          label: I18n.t("global.buttons.continue"),
          onPress: onContinue
        }
      }}
    />
  );
};

export default ActivateNfcScreen;

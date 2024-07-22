import { ListItemInfo } from "@pagopa/io-app-design-system";
import React, { useCallback } from "react";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { Route, useNavigation, useRoute } from "@react-navigation/native";
import { Alert } from "react-native";
import I18n from "../../../../../i18n";
import { useIOSelector } from "../../../../../store/hooks";
import { IOStackNavigationProp } from "../../../../../navigation/params/AppParamsList";
import * as cieUtils from "../../../../../utils/cie";
import ScreenWithListItems from "../../../../../components/screens/ScreenWithListItems";
import { ITW_ROUTES } from "../../../navigation/routes";
import { ItwParamsList } from "../../../navigation/ItwParamsList";
import { itwIsNfcEnabledSelector } from "../../store/selectors";
import { CieCardReaderScreenNavigationParams } from "./ItwCieCardReaderScreen";

export const ItwActivateNfcScreen = () => {
  const isEnabled = useIOSelector(itwIsNfcEnabledSelector);
  const isNfcEnabled = pot.getOrElse(isEnabled, false);
  const navigation =
    useNavigation<
      IOStackNavigationProp<
        ItwParamsList,
        typeof ITW_ROUTES.IDENTIFICATION.CIE.ACTIVATE_NFC
      >
    >();
  const route =
    useRoute<
      Route<
        typeof ITW_ROUTES.IDENTIFICATION.CIE.ACTIVATE_NFC,
        CieCardReaderScreenNavigationParams
      >
    >();

  const { ciePin, authorizationUri } = route.params;

  const openSettings = useCallback(async () => {
    await cieUtils.openNFCSettings();
  }, []);

  const onContinue = useCallback(async () => {
    if (isNfcEnabled) {
      navigation.replace(ITW_ROUTES.ISSUANCE.EID_CIE.CARD_READER_SCREEN, {
        ciePin,
        authorizationUri
      });
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
  }, [authorizationUri, ciePin, isNfcEnabled, navigation, openSettings]);

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
      primaryActionProps={{
        label: I18n.t("authentication.cie.nfc.action"),
        onPress: openSettings
      }}
      secondaryActionProps={{
        label: I18n.t("global.buttons.continue"),
        onPress: onContinue
      }}
    />
  );
};

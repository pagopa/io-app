import {
  ContentWrapper,
  ListItemHeader,
  ModuleCredential,
  VSpacer
} from "@pagopa/io-app-design-system";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { useFocusEffect } from "@react-navigation/native";
import React from "react";
import { Alert } from "react-native";
import { RNavScreenWithLargeHeader } from "../../../../components/ui/RNavScreenWithLargeHeader";
import I18n from "../../../../i18n";
import { nfcIsEnabled } from "../../../../store/actions/cie";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import {
  isCieSupportedSelector,
  isNfcEnabledSelector
} from "../../../../store/reducers/cie";
import { cieFlowForDevServerEnabled } from "../../../cieLogin/utils";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { ITW_ROUTES } from "../../navigation/routes";

export const ItwAuthModeSelectionScreen = () => {
  const navigation = useIONavigation();
  const dispatch = useIODispatch();

  const isCieSupportedPot = useIOSelector(isCieSupportedSelector);
  const isNfcEnabledPot = useIOSelector(isNfcEnabledSelector);

  useFocusEffect(
    React.useCallback(() => {
      dispatch(nfcIsEnabled.request());
    }, [dispatch])
  );

  const isCieSupported = React.useMemo(
    () => cieFlowForDevServerEnabled || pot.getOrElse(isCieSupportedPot, false),
    [isCieSupportedPot]
  );

  const isNfcEnabled = React.useMemo(
    () => pot.getOrElse(isNfcEnabledPot, false),
    [isNfcEnabledPot]
  );

  const handleSpidPress = () => {
    Alert.alert("Not implemented");
  };

  const handleCiePinPress = () => {
    if (isNfcEnabled) {
      Alert.alert("Not implemented");
    } else {
      navigation.navigate(ITW_ROUTES.MAIN, {
        screen: ITW_ROUTES.AUTH.NFC_INSTRUCTIONS
      });
    }
  };

  const handleCieIdPress = () => {
    Alert.alert("Not implemented");
  };

  return (
    <RNavScreenWithLargeHeader
      title={{ label: I18n.t("features.itWallet.authentication.title") }}
    >
      <ContentWrapper>
        <ListItemHeader
          label={I18n.t("features.itWallet.authentication.header")}
        />
        <ModuleCredential
          label={I18n.t("features.itWallet.authentication.method.spid.title")}
          // description="Usa credenziali e app (o SMS)"
          icon="spid"
          onPress={handleSpidPress}
        />
        <VSpacer size={8} />
        {isCieSupported && (
          <>
            <ModuleCredential
              label={I18n.t(
                "features.itWallet.authentication.method.ciePin.title"
              )}
              // description="Usa Carta d’Identità Elettronica e PIN"
              icon="fiscalCodeIndividual"
              onPress={handleCiePinPress}
            />
            <VSpacer size={8} />
          </>
        )}
        <ModuleCredential
          label={I18n.t("features.itWallet.authentication.method.cieId.title")}
          // description="Usa credenziali e app CieID"
          icon="device"
          onPress={handleCieIdPress}
        />
      </ContentWrapper>
    </RNavScreenWithLargeHeader>
  );
};

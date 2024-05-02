import {
  ContentWrapper,
  ListItemHeader,
  ModuleNavigation,
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

export const ItwAuthModeSelectionScreen = () => {
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
      Alert.alert("NFC not enabled");
    } else {
      Alert.alert("Not implemented");
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
        <ModuleNavigation
          title={I18n.t("features.itWallet.authentication.method.spid.title")}
          subtitle="Usa credenziali e app (o SMS)"
          icon="spid"
          onPress={handleSpidPress}
        />
        <VSpacer size={8} />
        {isCieSupported && (
          <>
            <ModuleNavigation
              title={I18n.t(
                "features.itWallet.authentication.method.ciePin.title"
              )}
              subtitle="Usa Carta d’Identità Elettronica e PIN"
              icon="fiscalCodeIndividual"
              onPress={handleCiePinPress}
            />
            <VSpacer size={8} />
          </>
        )}
        <ModuleNavigation
          title={I18n.t("features.itWallet.authentication.method.cieId.title")}
          subtitle="Usa credenziali e app CieID"
          icon="device"
          onPress={handleCieIdPress}
        />
      </ContentWrapper>
    </RNavScreenWithLargeHeader>
  );
};

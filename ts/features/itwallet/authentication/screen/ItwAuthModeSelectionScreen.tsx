import {
  ContentWrapper,
  ListItemHeader,
  ModuleCredential,
  VSpacer
} from "@pagopa/io-app-design-system";
import * as pot from "@pagopa/ts-commons/lib/pot";
import React from "react";
import { Alert } from "react-native";
import { RNavScreenWithLargeHeader } from "../../../../components/ui/RNavScreenWithLargeHeader";
import I18n from "../../../../i18n";
import { useIOSelector } from "../../../../store/hooks";
import { isCieSupportedSelector } from "../../../../store/reducers/cie";
import { cieFlowForDevServerEnabled } from "../../../cieLogin/utils";

export const ItwAuthModeSelectionScreen = () => {
  const isCIEAuthenticationSupported = useIOSelector(isCieSupportedSelector);

  const isCieSupported = React.useMemo(
    () =>
      cieFlowForDevServerEnabled ||
      pot.getOrElse(isCIEAuthenticationSupported, false),
    [isCIEAuthenticationSupported]
  );

  const handleSpidPress = () => {
    Alert.alert("Not implemented");
  };

  const handleCiePinPress = () => {
    Alert.alert("Not implemented");
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

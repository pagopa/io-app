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

export const ItwIdentificationModeSelectionScreen = () => {
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
      title={{ label: I18n.t("features.itWallet.identification.mode.title") }}
    >
      <ContentWrapper>
        <ListItemHeader
          label={I18n.t("features.itWallet.identification.mode.header")}
        />
        <ModuleNavigation
          title={I18n.t(
            "features.itWallet.identification.mode.method.spid.title"
          )}
          subtitle={I18n.t(
            "features.itWallet.identification.mode.method.spid.subtitle"
          )}
          icon="spid"
          onPress={handleSpidPress}
        />
        <VSpacer size={8} />
        {isCieSupported && (
          <>
            <ModuleNavigation
              title={I18n.t(
                "features.itWallet.identification.mode.method.ciePin.title"
              )}
              subtitle={I18n.t(
                "features.itWallet.identification.mode.method.ciePin.subtitle"
              )}
              icon="fiscalCodeIndividual"
              onPress={handleCiePinPress}
            />
            <VSpacer size={8} />
          </>
        )}
        <ModuleNavigation
          title={I18n.t(
            "features.itWallet.identification.mode.method.cieId.title"
          )}
          subtitle={I18n.t(
            "features.itWallet.identification.mode.method.cieId.subtitle"
          )}
          icon="device"
          onPress={handleCieIdPress}
        />
      </ContentWrapper>
    </RNavScreenWithLargeHeader>
  );
};

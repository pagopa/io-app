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
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { isCieSupportedSelector } from "../../../../store/reducers/cie";
import { cieFlowForDevServerEnabled } from "../../../cieLogin/utils";
import { itwNfcIsEnabled } from "../store/actions";
import { itwIsNfcEnabledSelector } from "../store/selectors";
import { ITW_ROUTES } from "../../navigation/routes";
import { ItWalletIssuanceMachineContext } from "../../machine/provider";

export const ItwIdentificationModeSelectionScreen = () => {
  const navigation = useIONavigation();
  const dispatch = useIODispatch();
  const machine = ItWalletIssuanceMachineContext.useActorRef();

  const isCieSupportedPot = useIOSelector(isCieSupportedSelector);
  const isNfcEnabledPot = useIOSelector(itwIsNfcEnabledSelector);

  useFocusEffect(
    React.useCallback(() => {
      dispatch(itwNfcIsEnabled.request());
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
    machine.send({ type: "identification.select-mode", mode: 0 });
  };

  const handleCiePinPress = () => {
    if (isNfcEnabled) {
      Alert.alert("Not implemented");
    } else {
      navigation.navigate(ITW_ROUTES.MAIN, {
        screen: ITW_ROUTES.IDENTIFICATION.NFC_INSTRUCTIONS
      });
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

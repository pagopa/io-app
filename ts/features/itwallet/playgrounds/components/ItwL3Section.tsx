import {
  ListItemHeader,
  ListItemInfo,
  ListItemNav,
  ListItemSwitch
} from "@pagopa/io-app-design-system";
import { View } from "react-native";
import { useCallback } from "react";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import {
  itwIsFiscalCodeWhitelistedSelector,
  itwIsL3LocallyEnabledSelector
} from "../../../../features/itwallet/common/store/selectors/preferences";
import { itwSetL3LocallyEnabled } from "../../../../features/itwallet/common/store/actions/preferences";
import { ItwEidIssuanceMachineContext } from "../../machine/provider";
import { ITW_ROUTES } from "../../navigation/routes";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";

export const ItwL3Section = () => {
  const dispatch = useIODispatch();
  const machineRef = ItwEidIssuanceMachineContext.useActorRef();
  const navigation = useIONavigation();

  const isL3LocallyEnabled = useIOSelector(itwIsL3LocallyEnabledSelector);
  const isFiscalCodeWhitelisted = useIOSelector(
    itwIsFiscalCodeWhitelistedSelector
  );

  const navigateToTosL3Screen = useCallback(() => {
    machineRef.send({
      type: "start",
      isL3: true
    });
  }, [machineRef]);

  const handleCredentialPress = (credentialType: string) => {
    navigation.navigate(ITW_ROUTES.MAIN, {
      screen: ITW_ROUTES.PRESENTATION.CREDENTIAL_DETAIL,
      params: {
        credentialType,
        isL3Enabled: true
      }
    });
  };

  return (
    <View>
      <ListItemHeader label="IT Wallet (L3 locally)" />
      <ListItemSwitch
        label="Enable locally L3 wallet"
        value={isL3LocallyEnabled}
        onSwitchValueChange={() => {
          dispatch(itwSetL3LocallyEnabled(!isL3LocallyEnabled));
        }}
      />
      <ListItemInfo
        label={"Fiscal code whitelisted"}
        value={isFiscalCodeWhitelisted ? "YES" : "NO"}
      />
      <ListItemNav
        value="Discovery L3"
        description="Navigate to the Discovery L3 info screen"
        onPress={navigateToTosL3Screen}
      />
      <ListItemNav
        value="Driving License L3"
        description="Navigate to the Driving License detail screen"
        onPress={() => handleCredentialPress("MDL")}
      />
      <ListItemNav
        value="EU Health Insurance Card L3"
        description="Navigate to the EHIC detail screen"
        onPress={() => handleCredentialPress("EuropeanHealthInsuranceCard")}
      />
    </View>
  );
};

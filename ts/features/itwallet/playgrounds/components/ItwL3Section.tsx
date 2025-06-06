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
import { useIONavigation } from "../../../../navigation/params/AppParamsList.ts";
import { CredentialL3Key } from "../../common/utils/itwMocksUtils.ts";
import { itwLifecycleIsValidSelector } from "../../lifecycle/store/selectors";
import { ITW_PLAYGROUND_ROUTES } from "../navigation/routes.ts";

export const ItwL3Section = () => {
  const dispatch = useIODispatch();
  const machineRef = ItwEidIssuanceMachineContext.useActorRef();

  const isL3LocallyEnabled = useIOSelector(itwIsL3LocallyEnabledSelector);
  const isFiscalCodeWhitelisted = useIOSelector(
    itwIsFiscalCodeWhitelistedSelector
  );
  const isItwValid = useIOSelector(itwLifecycleIsValidSelector);
  const navigation = useIONavigation();

  const navigateToTosL3Screen = useCallback(() => {
    machineRef.send({
      type: "start",
      isL3: true
    });
  }, [machineRef]);

  const handleCredentialPress = (credentialType: CredentialL3Key) => {
    navigation.navigate(ITW_PLAYGROUND_ROUTES.MAIN, {
      screen: ITW_PLAYGROUND_ROUTES.CREDENTIAL_DETAIL,
      params: {
        credentialType
      }
    });
  };

  return (
    <View>
      <ListItemHeader label="IT Wallet (L3)" />
      <ListItemSwitch
        label="Enable local feature flag"
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
      <ListItemHeader label="L3 credentials" />
      <ListItemNav
        value="Driving License L3"
        description="Navigate to the Driving License detail screen"
        onPress={() => handleCredentialPress("mdl")}
      />
      {isItwValid && (
        <ListItemNav
          value="EU Health Insurance Card L3"
          description="Navigate to the EHIC detail screen"
          onPress={() => handleCredentialPress("ts")}
        />
      )}
      <ListItemNav
        value="Disability Card L3"
        description="Navigate to the Disability Card detail screen"
        onPress={() => handleCredentialPress("dc")}
      />
    </View>
  );
};

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


export const ItwL3Section = () => {
  const dispatch = useIODispatch();
  const machineRef = ItwEidIssuanceMachineContext.useActorRef();

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
    </View>
  );
};

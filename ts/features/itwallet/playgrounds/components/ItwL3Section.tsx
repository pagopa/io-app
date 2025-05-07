import {
  ListItemHeader,
  ListItemNav,
  ListItemSwitch
} from "@pagopa/io-app-design-system";
import { View } from "react-native";
import { useCallback } from "react";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { itwIsL3EnabledSelector } from "../../../../features/itwallet/common/store/selectors/preferences";
import { itwSetL3Enabled } from "../../../../features/itwallet/common/store/actions/preferences";
import { ItwEidIssuanceMachineContext } from "../../machine/provider";

export const ItwL3Section = () => {
  const dispatch = useIODispatch();
  const machineRef = ItwEidIssuanceMachineContext.useActorRef();

  const isL3Enabled = useIOSelector(itwIsL3EnabledSelector);

  const navigateToTosL3Screen = useCallback(() => {
    machineRef.send({
      type: "start",
      isL3: true
    });
  }, [machineRef]);

  return (
    <View>
      <ListItemHeader label="IT Wallet (L3)" />
      <ListItemSwitch
        label="Enable L3 wallet"
        value={isL3Enabled}
        onSwitchValueChange={() => {
          dispatch(itwSetL3Enabled(!isL3Enabled));
        }}
      />
      <ListItemNav
        value="Discovery L3"
        description="Navigate to the Discovery L3 info screen"
        onPress={navigateToTosL3Screen}
      />
    </View>
  );
};

import {
  ListItemHeader,
  ListItemInfo,
  ListItemNav,
  ListItemSwitch
} from "@pagopa/io-app-design-system";
import { View } from "react-native";
import { useCallback } from "react";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { itwIsL3EnabledSelector } from "../../../../features/itwallet/common/store/selectors/preferences";
import { ItwEidIssuanceMachineContext } from "../../machine/provider";
import { itwSetFiscalCodeWhitelisted } from "../../common/store/actions/preferences";

export const ItwL3Section = () => {
  const machineRef = ItwEidIssuanceMachineContext.useActorRef();
  const dispatch = useIODispatch();
  const isFiscalCodeWhitelisted = useIOSelector(itwIsL3EnabledSelector);

  const navigateToTosL3Screen = useCallback(() => {
    machineRef.send({
      type: "start",
      isL3: true
    });
  }, [machineRef]);

  return (
    <View>
      <ListItemHeader label="IT Wallet (L3)" />
      <ListItemInfo
        label={"Fiscal code whitelisted"}
        value={isFiscalCodeWhitelisted ? "YES" : "NO"}
      />
      <ListItemSwitch
        label="Disable L3 ( this is only for testing purposes to return to L2 )"
        value={isFiscalCodeWhitelisted}
        onSwitchValueChange={() => {
          dispatch(itwSetFiscalCodeWhitelisted(false));
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

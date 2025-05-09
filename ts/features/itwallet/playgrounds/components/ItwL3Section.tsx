import {
  ListItemHeader,
  ListItemInfo,
  ListItemSwitch
} from "@pagopa/io-app-design-system";
import { View } from "react-native";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import {
  itwIsFiscalCodeWhitelistedSelector,
  itwIsL3EnabledSelector
} from "../../../../features/itwallet/common/store/selectors/preferences";
import { itwSetL3Enabled } from "../../../../features/itwallet/common/store/actions/preferences";

export const ItwL3Section = () => {
  const dispatch = useIODispatch();

  const isL3Enabled = useIOSelector(itwIsL3EnabledSelector);
  const isFiscalCodeWhitelisted = useIOSelector(
    itwIsFiscalCodeWhitelistedSelector
  );

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
      <ListItemInfo
        label={"Fiscal code whitelisted"}
        value={isFiscalCodeWhitelisted ? "YES" : "NO"}
      />
    </View>
  );
};

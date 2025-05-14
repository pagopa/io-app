import {
  ListItemHeader,
  ListItemInfo,
  ListItemSwitch
} from "@pagopa/io-app-design-system";
import { View } from "react-native";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import {
  itwIsFiscalCodeWhitelistedSelector,
  itwIsL3LocallyEnabledSelector
} from "../../../../features/itwallet/common/store/selectors/preferences";
import { itwSetL3LocallyEnabled } from "../../../../features/itwallet/common/store/actions/preferences";

export const ItwL3Section = () => {
  const dispatch = useIODispatch();

  const isL3LocallyEnabled = useIOSelector(itwIsL3LocallyEnabledSelector);
  const isFiscalCodeWhitelisted = useIOSelector(
    itwIsFiscalCodeWhitelistedSelector
  );

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
    </View>
  );
};

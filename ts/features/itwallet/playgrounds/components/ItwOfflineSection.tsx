import {
  ListItemHeader,
  ListItemNav,
  ListItemSwitch
} from "@pagopa/io-app-design-system";
import { View } from "react-native";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { setItwOfflineAccessEnabled } from "../../../../store/actions/persistedPreferences";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { isItwOfflineAccessEnabledSelector } from "../../../../store/reducers/persistedPreferences";
import { ITW_ROUTES } from "../../navigation/routes";

export const ItwOfflineSection = () => {
  const navigation = useIONavigation();
  const dispatch = useIODispatch();

  const isOfflineAccessEnabled = useIOSelector(
    isItwOfflineAccessEnabledSelector
  );

  return (
    <View>
      <ListItemHeader label="Offline" />
      <ListItemSwitch
        label="Enable offline access"
        value={isOfflineAccessEnabled}
        onSwitchValueChange={() => {
          dispatch(setItwOfflineAccessEnabled(!isOfflineAccessEnabled));
        }}
      />
      <ListItemNav
        value="Offline wallet screen"
        accessibilityLabel={"Offline wallet screen"}
        description="Navigate to the offline version of the wallet"
        onPress={() =>
          navigation.navigate(ITW_ROUTES.MAIN, {
            screen: ITW_ROUTES.OFFLINE.WALLET
          })
        }
      />
    </View>
  );
};

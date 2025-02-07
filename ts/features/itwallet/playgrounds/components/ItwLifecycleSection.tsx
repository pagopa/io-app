import { ListItemHeader, ListItemInfo } from "@pagopa/io-app-design-system";
import { View } from "react-native";
import { useIOSelector } from "../../../../store/hooks";
import {
  itwLifecycleIsInstalledSelector,
  itwLifecycleIsOperationalSelector,
  itwLifecycleIsValidSelector
} from "../../lifecycle/store/selectors";

export const ItwLifecycleSection = () => {
  const isItwInstalled = useIOSelector(itwLifecycleIsInstalledSelector);
  const isItwOperational = useIOSelector(itwLifecycleIsOperationalSelector);
  const isItwValid = useIOSelector(itwLifecycleIsValidSelector);

  const getLifecycleStateLabel = () => {
    if (isItwInstalled) {
      return "INSTALLED";
    } else if (isItwOperational) {
      return "OPERATIONAL";
    } else if (isItwValid) {
      return "VALID";
    } else {
      return "UNKNOWN";
    }
  };

  return (
    <View>
      <ListItemHeader label="Wallet Instance" />
      <ListItemInfo label="Lifecycle status" value={getLifecycleStateLabel()} />
    </View>
  );
};

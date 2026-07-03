import {
  ListItemHeader,
  ListItemInfo,
  VSpacer
} from "@pagopa/io-app-design-system";
import { View } from "react-native";
import { useIOSelector } from "../../../../store/hooks";
import { selectItwSpecsVersion } from "../../common/store/selectors/environment";

export const ItwSpecsVersionSection = () => {
  const itwVersion = useIOSelector(selectItwSpecsVersion);

  return (
    <View>
      <VSpacer />
      <ListItemHeader label="IT-Wallet Specifications" />
      <ListItemInfo label="Current version" value={itwVersion} />
    </View>
  );
};

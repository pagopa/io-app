import { ListItemHeader, ListItemNav } from "@pagopa/io-app-design-system";
import { View } from "react-native";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { ITW_ROUTES } from "../../navigation/routes";

export const ItwL2Section = () => {
  const navigation = useIONavigation();

  const navigateToDiscoveryInfoScreen = () => {
    navigation.navigate(ITW_ROUTES.MAIN, {
      screen: ITW_ROUTES.PLAYGROUNDS.DISCOVERY_INFO_NEW
    });
  };

  return (
    <View>
      <ListItemHeader label="Documenti su IO (L2) screens" />
      <ListItemNav
        value="Discovery L2"
        description="Navigate to the new Discovery L2 info screen"
        onPress={navigateToDiscoveryInfoScreen}
      />
    </View>
  );
};

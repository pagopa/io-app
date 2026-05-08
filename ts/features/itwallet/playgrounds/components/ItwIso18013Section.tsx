import { ListItemHeader, ListItemNav } from "@pagopa/io-app-design-system";
import { View } from "react-native";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { ITW_ROUTES } from "../../navigation/routes";

export const ItwIso18013Section = () => {
  const navigation = useIONavigation();

  return (
    <View>
      <ListItemHeader label="ISO 18013" />
      <ListItemNav
        value="Proximity flow playground"
        description="Navigate to the ITW proximity flow playground"
        onPress={() =>
          navigation.navigate(ITW_ROUTES.MAIN, {
            screen: ITW_ROUTES.PLAYGROUNDS.ISO_18013_PROXIMITY
          })
        }
      />
    </View>
  );
};

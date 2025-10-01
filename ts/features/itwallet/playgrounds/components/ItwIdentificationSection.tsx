import { ListItemHeader, ListItemNav } from "@pagopa/io-app-design-system";
import { View } from "react-native";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { ITW_ROUTES } from "../../navigation/routes";

export const ItwIdentificationSection = () => {
  const navigation = useIONavigation();

  return (
    <View>
      <ListItemHeader label="IT Wallet Identification" />
      <ListItemNav
        value="CIE CAN Preparation screen"
        description="Navigate to the CAN instructions screen"
        onPress={() =>
          navigation.navigate(ITW_ROUTES.MAIN, {
            screen: ITW_ROUTES.IDENTIFICATION.CIE.CAN_PREPARATION_SCREEN
          })
        }
      />
      <ListItemNav
        value="CIE CAN Input screen"
        description="Navigate to the CAN input screen"
        onPress={() =>
          navigation.navigate(ITW_ROUTES.MAIN, {
            screen: ITW_ROUTES.IDENTIFICATION.CIE.CAN_SCREEN
          })
        }
      />
    </View>
  );
};

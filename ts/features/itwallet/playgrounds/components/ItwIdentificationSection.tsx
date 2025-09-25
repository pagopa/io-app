import { ListItemHeader, ListItemNav } from "@pagopa/io-app-design-system";
import { useCallback } from "react";
import { View } from "react-native";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { ITW_ROUTES } from "../../navigation/routes";

export const ItwIdentificationSection = () => {
  const navigation = useIONavigation();

  const navigateToCanPreparationScreen = useCallback(() => {
    navigation.navigate(ITW_ROUTES.MAIN, {
      screen: ITW_ROUTES.IDENTIFICATION.CIE.CAN_PREPARATION_SCREEN
    });
  }, [navigation]);

  const navigateToCardPreparationScreen = useCallback(() => {
    navigation.navigate(ITW_ROUTES.MAIN, {
      screen: ITW_ROUTES.IDENTIFICATION.CIE.PREPARATION_ALT_SCREEN
    });
  }, [navigation]);

  return (
    <View>
      <ListItemHeader label="IT Wallet Identification" />
      <ListItemNav
        value="CAN Preparation screen"
        description="Navigate to the CAN instructions screen"
        onPress={navigateToCanPreparationScreen}
      />
      <ListItemNav
        value="Card Preparation screen"
        description="Navigate to the card preparation screen"
        onPress={navigateToCardPreparationScreen}
      />
    </View>
  );
};

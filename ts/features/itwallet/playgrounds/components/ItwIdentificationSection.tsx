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

  const navigateToCanInputScreen = useCallback(() => {
    navigation.navigate(ITW_ROUTES.MAIN, {
      screen: ITW_ROUTES.IDENTIFICATION.CIE.CAN_SCREEN
    });
  }, [navigation]);

  return (
    <View>
      <ListItemHeader label="IT Wallet Identification" />
      <ListItemNav
        value="CIE CAN Preparation screen"
        description="Navigate to the CAN instructions screen"
        onPress={navigateToCanPreparationScreen}
      />
      <ListItemNav
        value="CIE CAN Input screen"
        description="Navigate to the CAN input screen"
        onPress={navigateToCanInputScreen}
      />
    </View>
  );
};

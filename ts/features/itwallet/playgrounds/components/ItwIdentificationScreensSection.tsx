import { ListItemHeader, ListItemNav } from "@pagopa/io-app-design-system";
import { View } from "react-native";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { ITW_ROUTES } from "../../navigation/routes";

export const ItwIdentificationScreensSection = () => {
  const navigation = useIONavigation();

  return (
    <View>
      <ListItemHeader label="IT Wallet Identification" />
      <ListItemNav
        value="Card preparation screen"
        description="Navigate to the card preparation screen"
        onPress={() =>
          navigation.navigate(ITW_ROUTES.MAIN, {
            screen: ITW_ROUTES.IDENTIFICATION.CIE.PREPARATION.CARD_SCREEN
          })
        }
      />
      <ListItemNav
        value="CAN instructions screen"
        description="Navigate to the CAN instructions screen"
        onPress={() =>
          navigation.navigate(ITW_ROUTES.MAIN, {
            screen: ITW_ROUTES.IDENTIFICATION.CIE.PREPARATION.CAN_SCREEN
          })
        }
      />
      <ListItemNav
        value="PIN instructions screen"
        description="Navigate to the PIN instructions screen"
        onPress={() =>
          navigation.navigate(ITW_ROUTES.MAIN, {
            screen: ITW_ROUTES.IDENTIFICATION.CIE.PREPARATION.PIN_SCREEN
          })
        }
      />
      <ListItemNav
        value="NFC instructions screen"
        description="Navigate to the NFC instructions screen"
        onPress={() =>
          navigation.navigate(ITW_ROUTES.MAIN, {
            screen: ITW_ROUTES.IDENTIFICATION.CIE.PREPARATION.NFC_SCREEN
          })
        }
      />
    </View>
  );
};

import { ListItemHeader, ListItemNav } from "@io-app/design-system";
import { View } from "react-native";

import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { ITW_ROUTES } from "../../navigation/routes";

export const ItwIdentificationScreensSection = () => {
  const navigation = useIONavigation();

  return (
    <View>
      <ListItemHeader label="IT Wallet Identification" />
      <ListItemNav
        description="Navigate to the card preparation screen"
        onPress={() =>
          navigation.navigate(ITW_ROUTES.MAIN, {
            screen: ITW_ROUTES.IDENTIFICATION.CIE.PREPARATION.CARD_SCREEN
          })
        }
        value="Card preparation screen"
      />
      <ListItemNav
        description="Navigate to the CAN instructions screen"
        onPress={() =>
          navigation.navigate(ITW_ROUTES.MAIN, {
            screen: ITW_ROUTES.IDENTIFICATION.CIE.PREPARATION.CAN_SCREEN
          })
        }
        value="CAN instructions screen"
      />
      <ListItemNav
        description="Navigate to the PIN instructions screen"
        onPress={() =>
          navigation.navigate(ITW_ROUTES.MAIN, {
            screen: ITW_ROUTES.IDENTIFICATION.CIE.PREPARATION.PIN_SCREEN
          })
        }
        value="PIN instructions screen"
      />
      <ListItemNav
        description="Navigate to the NFC instructions screen"
        onPress={() =>
          navigation.navigate(ITW_ROUTES.MAIN, {
            screen: ITW_ROUTES.IDENTIFICATION.CIE.PREPARATION.NFC_SCREEN
          })
        }
        value="NFC instructions screen"
      />
    </View>
  );
};

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
        label="Card preparation screen"
        onPress={() =>
          navigation.navigate(ITW_ROUTES.MAIN, {
            screen: ITW_ROUTES.IDENTIFICATION.CIE.PREPARATION.CARD_SCREEN
          })
        }
      />
      <ListItemNav
        description="Navigate to the CAN instructions screen"
        label="CAN instructions screen"
        onPress={() =>
          navigation.navigate(ITW_ROUTES.MAIN, {
            screen: ITW_ROUTES.IDENTIFICATION.CIE.PREPARATION.CAN_SCREEN
          })
        }
      />
      <ListItemNav
        description="Navigate to the PIN instructions screen"
        label="PIN instructions screen"
        onPress={() =>
          navigation.navigate(ITW_ROUTES.MAIN, {
            screen: ITW_ROUTES.IDENTIFICATION.CIE.PREPARATION.PIN_SCREEN
          })
        }
      />
      <ListItemNav
        description="Navigate to the NFC instructions screen"
        label="NFC instructions screen"
        onPress={() =>
          navigation.navigate(ITW_ROUTES.MAIN, {
            screen: ITW_ROUTES.IDENTIFICATION.CIE.PREPARATION.NFC_SCREEN
          })
        }
      />
    </View>
  );
};

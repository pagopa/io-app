import { ButtonSolid } from "@pagopa/io-app-design-system";
import { RouteProp, useRoute } from "@react-navigation/native";
import { View } from "react-native";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { MESSAGES_ROUTES } from "../../../messages/navigation/routes";
import { PnParamsList } from "../../navigation/params";
import PN_ROUTES from "../../navigation/routes";

export type SendAARTosScreenProps = {
  qrcode: string;
};

type RouteProps = RouteProp<PnParamsList, typeof PN_ROUTES.SEND_AAR_TOS_SCREEN>;

export const SendAARTosScreen = () => {
  const route = useRoute<RouteProps>();
  const { qrcode } = route.params;
  const navigation = useIONavigation();

  const onButtonPress = () => {
    navigation.replace(MESSAGES_ROUTES.MESSAGES_NAVIGATOR, {
      screen: PN_ROUTES.MAIN,
      params: {
        screen: PN_ROUTES.SEND_AAR_LOADING_SCREEN,
        params: { qrcode }
      }
    });
  };

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "flex-end",
        padding: 30
      }}
    >
      <ButtonSolid
        accessibilityLabel="Avanti"
        label={"Primary button"}
        onPress={onButtonPress}
      />
    </View>
  );
};

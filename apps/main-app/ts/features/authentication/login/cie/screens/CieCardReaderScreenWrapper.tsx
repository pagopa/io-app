/**
 * This screen is needed to wrap the CieCardReaderScreen to leave
 * this screen as a class component.
 *
 * TODO: remove this screen and refactor the CieCardReaderScreen to a functional component.
 * https://pagopa.atlassian.net/browse/IOPID-1857
 */
import { IOColors, useIOTheme } from "@pagopa/io-app-design-system";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { IOStackNavigationProp } from "../../../../../navigation/params/AppParamsList";
import { AuthenticationParamsList } from "../../../common/navigation/params/AuthenticationParamsList";
import CieCardReaderScreen from "./CieCardReaderScreen";

export const CieCardReaderScreenWrapper = () => {
  const navigation =
    useNavigation<
      IOStackNavigationProp<AuthenticationParamsList, "CIE_CARD_READER_SCREEN">
    >();
  const route =
    useRoute<RouteProp<AuthenticationParamsList, "CIE_CARD_READER_SCREEN">>();

  const theme = useIOTheme();

  return (
    <CieCardReaderScreen
      blueColorName={IOColors[theme["interactiveElem-default"]]}
      navigation={navigation}
      route={route}
      headerHeight={0}
    />
  );
};

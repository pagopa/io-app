import { RouteProp, useRoute } from "@react-navigation/native";
import { IdentificationParamsList } from "../../../common/navigation/params/IdentificationParamsList";
import CieIdLoginWebView from "../../../login/cie/components/CieIdLoginWebView";
import { IDENTIFICATION_ROUTES } from "../../../common/navigation/routes";

const CieIdLoginScreen = () => {
  const route =
    useRoute<
      RouteProp<
        IdentificationParamsList,
        typeof IDENTIFICATION_ROUTES.CIE_ID_LOGIN
      >
    >();

  return <CieIdLoginWebView {...route.params} />;
};

export default CieIdLoginScreen;

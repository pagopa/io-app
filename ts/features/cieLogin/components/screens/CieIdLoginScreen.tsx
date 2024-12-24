import { RouteProp, useRoute } from "@react-navigation/native";
import { AuthenticationParamsList } from "../../../../navigation/params/AuthenticationParamsList";
import ROUTES from "../../../../navigation/routes";
import CieIdLoginWebView from "../CieIdLoginWebView";

const CieIdLoginScreen = () => {
  const route =
    useRoute<
      RouteProp<
        AuthenticationParamsList,
        typeof ROUTES.AUTHENTICATION_CIE_ID_LOGIN
      >
    >();

  return <CieIdLoginWebView {...route.params} />;
};

export default CieIdLoginScreen;

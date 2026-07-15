import { RouteProp, useRoute } from "@react-navigation/native";

import { AuthenticationParamsList } from "../../../common/navigation/params/AuthenticationParamsList";
import { AUTHENTICATION_ROUTES } from "../../../common/navigation/routes";
import CieIdLoginWebView from "../../../login/cie/components/CieIdLoginWebView";

const CieIdLoginScreen = () => {
  const route =
    useRoute<
      RouteProp<
        AuthenticationParamsList,
        typeof AUTHENTICATION_ROUTES.CIE_ID_LOGIN
      >
    >();

  return <CieIdLoginWebView {...route.params} />;
};

export default CieIdLoginScreen;

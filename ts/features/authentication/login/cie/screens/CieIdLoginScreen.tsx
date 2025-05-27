import { RouteProp, useRoute } from "@react-navigation/native";
import { AuthenticationParamsList } from "../../../common/navigation/params/AuthenticationParamsList";
import CieIdLoginWebView from "../../../login/cie/components/CieIdLoginWebView";
import { AUTHENTICATION_ROUTES } from "../../../common/navigation/routes";

const CieIdLoginScreen = () => {
  const route =
    useRoute<
      RouteProp<
        AuthenticationParamsList,
        typeof AUTHENTICATION_ROUTES.CIE_ID_LOGIN
      >
    >();

  console.log("🔥 1. CieIdLoginScreen route params:", route.params);

  return <CieIdLoginWebView {...route.params} />;
};

export default CieIdLoginScreen;

import { useEffect } from "react";
import { RouteProp, useRoute } from "@react-navigation/native";
import CieIdNotInstalled from "../components/CieIdNotInstalled";
import { AuthenticationParamsList } from "../../../common/navigation/params/AuthenticationParamsList";
import { trackCieIdNotInstalledScreen } from "../analytics";
import { AUTHENTICATION_ROUTES } from "../../../common/navigation/routes";

const CieIdNotInstalledScreen = () => {
  const { params } =
    useRoute<
      RouteProp<
        AuthenticationParamsList,
        typeof AUTHENTICATION_ROUTES.CIE_NOT_INSTALLED
      >
    >();

  useEffect(() => {
    void trackCieIdNotInstalledScreen();
  }, []);

  return <CieIdNotInstalled {...params} />;
};

export default CieIdNotInstalledScreen;

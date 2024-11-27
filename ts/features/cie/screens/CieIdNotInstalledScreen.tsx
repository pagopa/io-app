import React, { useEffect } from "react";
import { RouteProp, useRoute } from "@react-navigation/native";
import CieIdNotInstalled from "../components/CieIdNotInstalled";
import { AuthenticationParamsList } from "../../../navigation/params/AuthenticationParamsList";
import ROUTES from "../../../navigation/routes";
import { trackCieIdNotInstalledScreen } from "../analytics";

const CieIdNotInstalledScreen = () => {
  const { params } =
    useRoute<
      RouteProp<AuthenticationParamsList, typeof ROUTES.CIE_NOT_INSTALLED>
    >();

  useEffect(() => {
    void trackCieIdNotInstalledScreen();
  }, []);

  return <CieIdNotInstalled {...params} />;
};

export default CieIdNotInstalledScreen;

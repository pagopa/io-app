import { useEffect } from "react";
import { RouteProp, useRoute } from "@react-navigation/native";
import CieIdNotInstalled from "../components/CieIdNotInstalled";
import { IdentificationParamsList } from "../../../common/navigation/params/IdentificationParamsList";
import { trackCieIdNotInstalledScreen } from "../analytics";
import { IDENTIFICATION_ROUTES } from "../../../common/navigation/routes";

const CieIdNotInstalledScreen = () => {
  const { params } =
    useRoute<
      RouteProp<
        IdentificationParamsList,
        typeof IDENTIFICATION_ROUTES.CIE_NOT_INSTALLED
      >
    >();

  useEffect(() => {
    void trackCieIdNotInstalledScreen();
  }, []);

  return <CieIdNotInstalled {...params} />;
};

export default CieIdNotInstalledScreen;

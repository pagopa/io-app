import { RouteProp, useRoute } from "@react-navigation/native";

import { useIOSelector } from "../../../../../store/hooks";
import { useOnFirstRender } from "../../../../../utils/hooks/useOnFirstRender";
import { isActiveSessionLoginSelector } from "../../../activeSessionLogin/store/selectors";
import { AuthenticationParamsList } from "../../../common/navigation/params/AuthenticationParamsList";
import { AUTHENTICATION_ROUTES } from "../../../common/navigation/routes";
import { trackCieIdNotInstalledScreen } from "../analytics";
import CieIdNotInstalled from "../components/CieIdNotInstalled";

const CieIdNotInstalledScreen = () => {
  const { params } =
    useRoute<
      RouteProp<
        AuthenticationParamsList,
        typeof AUTHENTICATION_ROUTES.CIE_NOT_INSTALLED
      >
    >();
  const isActiveSessionLogin = useIOSelector(isActiveSessionLoginSelector);

  useOnFirstRender(() => {
    void trackCieIdNotInstalledScreen(isActiveSessionLogin ? "reauth" : "auth");
  });

  return <CieIdNotInstalled {...params} />;
};

export default CieIdNotInstalledScreen;

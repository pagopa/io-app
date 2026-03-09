import { RouteProp, useRoute } from "@react-navigation/native";
import CieIdNotInstalled from "../components/CieIdNotInstalled";
import { AuthenticationParamsList } from "../../../common/navigation/params/AuthenticationParamsList";
import { trackCieIdNotInstalledScreen } from "../analytics";
import { AUTHENTICATION_ROUTES } from "../../../common/navigation/routes";
import { useOnFirstRender } from "../../../../../utils/hooks/useOnFirstRender";
import { useIOSelector } from "../../../../../store/hooks";
import { isActiveSessionLoginSelector } from "../../../activeSessionLogin/store/selectors";

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

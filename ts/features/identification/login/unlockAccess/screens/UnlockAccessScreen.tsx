import { Route, useRoute } from "@react-navigation/native";
import UnlockAccessComponent, {
  UnlockAccessProps
} from "../components/UnlockAccessComponent";
import { IDENTIFICATION_ROUTES } from "../../../common/navigation/routes";

const UnlockAccessScreen = () => {
  const route =
    useRoute<
      Route<
        typeof IDENTIFICATION_ROUTES.UNLOCK_ACCESS_SCREEN,
        UnlockAccessProps
      >
    >();
  const { authLevel } = route.params;

  return <UnlockAccessComponent authLevel={authLevel} />;
};

export default UnlockAccessScreen;

import { Route, useRoute } from "@react-navigation/native";
import ROUTES from "../../../navigation/routes";
import UnlockAccessComponent, {
  UnlockAccessProps
} from "./UnlockAccessComponent";

const UnlockAccessScreen = () => {
  const route =
    useRoute<Route<typeof ROUTES.UNLOCK_ACCESS_SCREEN, UnlockAccessProps>>();
  const { authLevel } = route.params;

  return <UnlockAccessComponent authLevel={authLevel} />;
};

export default UnlockAccessScreen;

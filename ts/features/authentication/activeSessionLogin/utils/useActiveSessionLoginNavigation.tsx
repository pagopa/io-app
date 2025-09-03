import { useCallback } from "react";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { AUTHENTICATION_ROUTES } from "../../common/navigation/routes";
import { isActiveSessionLoginSelector } from "../store/selectors";
import { setFinishedActiveSessionLoginFlow } from "../store/actions";

const useActiveSessionLoginNavigation = () => {
  const navigation = useIONavigation();
  const dispatch = useIODispatch();
  const isActiveSessionLogin = useIOSelector(isActiveSessionLoginSelector);

  const navigateToAuthenticationScreen = useCallback(() => {
    if (isActiveSessionLogin) {
      dispatch(setFinishedActiveSessionLoginFlow());
      navigation.popToTop();
    } else {
      navigation.reset({
        index: 0,
        routes: [{ name: AUTHENTICATION_ROUTES.MAIN }]
      });
    }
  }, [dispatch, isActiveSessionLogin, navigation]);

  return {
    navigateToAuthenticationScreen
  };
};

export default useActiveSessionLoginNavigation;

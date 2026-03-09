import { useEffect } from "react";
import I18n from "i18next";
import { logoutRequest } from "../../../authentication/common/store/actions";
import LoadingScreenContent from "../../../../components/screens/LoadingScreenContent";
import { useIODispatch } from "../../../../store/hooks";

/**
 * It handles the logout loading.
 * It doesn't handle any retry logics because even if the logout API fails
 * the app closes the session asymmetrical
 * logout success -> session closed client&server
 * logout failure/success -> app removes all session info from local storage
 */
const LogoutScreen = () => {
  const dispatch = useIODispatch();

  useEffect(() => {
    dispatch(logoutRequest({ withApiCall: true }));
  }, [dispatch]);

  return (
    <LoadingScreenContent
      testID="logout-test-id"
      title={I18n.t("profile.logout.loading")}
    />
  );
};

export default LogoutScreen;

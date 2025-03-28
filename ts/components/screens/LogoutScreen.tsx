import { connect } from "react-redux";
import { useEffect } from "react";
import { Dispatch } from "../../store/actions/types";
import { logoutRequest } from "../../features/identification/common/store/actions";
import I18n from "../../i18n";
import LoadingScreenContent from "./LoadingScreenContent";

type Props = ReturnType<typeof mapDispatchToProps>;

/**
 * It handles the logout loading.
 * It doesn't handle any retry logics because even if the logout API fails
 * the app closes the session asymmetrical
 * logout success -> session closed client&server
 * logout failure/success -> app removes all session info from local storage
 */
const LogoutScreen = (props: Props) => {
  // do logout on component mount
  const { logout } = props;
  useEffect(() => {
    logout();
  }, [logout]);

  return (
    <LoadingScreenContent contentTitle={I18n.t("profile.logout.loading")} />
  );
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
  // hard-logout
  logout: () => dispatch(logoutRequest({ withApiCall: true }))
});

export default connect(undefined, mapDispatchToProps)(LogoutScreen);

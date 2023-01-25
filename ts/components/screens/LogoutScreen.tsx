import { connect } from "react-redux";
import * as React from "react";
import { constNull } from "fp-ts/lib/function";
import { useEffect } from "react";
import { Dispatch } from "../../store/actions/types";
import { logoutRequest } from "../../store/actions/authentication";
import I18n from "../../i18n";
import { LoadingErrorComponent } from "../../features/bonus/bonusVacanze/components/loadingErrorScreen/LoadingErrorComponent";
import { HSpacer } from "../core/spacer/Spacer";
import BaseScreenComponent from "./BaseScreenComponent";

type Props = ReturnType<typeof mapDispatchToProps>;

/**
 * It handles the logout loading.
 * It doesn't handle any retry logics because even if the logout API fails
 * the app closes the session asymmetrical
 * logout success -> session closed client&server
 * logout failure -> app removes all session info from local storage
 */
const LogoutScreen = (props: Props) => {
  // do logout on component mount
  const { logout } = props;
  useEffect(() => {
    logout();
  }, [logout]);

  return (
    <BaseScreenComponent
      customGoBack={<HSpacer size={16} />}
      headerTitle={I18n.t("profile.logout.menulabel")}
    >
      <LoadingErrorComponent
        isLoading={true}
        loadingCaption={I18n.t("profile.logout.loading")}
        onRetry={constNull}
      />
    </BaseScreenComponent>
  );
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
  // hard-logout
  logout: () => dispatch(logoutRequest())
});

export default connect(undefined, mapDispatchToProps)(LogoutScreen);

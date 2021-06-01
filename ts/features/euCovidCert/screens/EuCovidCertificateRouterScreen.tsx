import * as React from "react";
import { useEffect } from "react";
import { NavigationInjectedProps } from "react-navigation";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { GlobalState } from "../../../store/reducers/types";
import { euCovidCertificateGet } from "../store/actions";
import { euCovidCertificateFromAuthCodeSelector } from "../store/reducers/byAuthCode";
import { EUCovidCertificateAuthCode } from "../types/EUCovidCertificate";

type NavigationParams = Readonly<{
  authCode: EUCovidCertificateAuthCode;
}>;

type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps> &
  NavigationInjectedProps<NavigationParams>;

/**
 * Router screen that triggers the first loading of the certificate (if not present in the store)
 * and dispatch the rendering, based on the results of the certificate received
 * @constructor
 * @param props
 */
const EuCovidCertificateRouterScreen = (
  props: Props
): React.ReactElement | null => {
  const authCode = props.navigation.getParam("authCode");

  useEffect(() => {
    if (props.euCovidCertificateResponse(authCode).kind !== "PotSome") {
      props.loadCertificate(authCode);
    }
  }, []);

  return null;
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
  loadCertificate: (authCode: EUCovidCertificateAuthCode) =>
    dispatch(euCovidCertificateGet.request(authCode))
});

const mapStateToProps = (state: GlobalState) => ({
  euCovidCertificateResponse: (authCode: EUCovidCertificateAuthCode) =>
    euCovidCertificateFromAuthCodeSelector(state, authCode)
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(EuCovidCertificateRouterScreen);

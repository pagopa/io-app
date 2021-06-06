import * as pot from "italia-ts-commons/lib/pot";
import * as React from "react";
import { useEffect } from "react";
import { NavigationInjectedProps } from "react-navigation";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { GlobalState } from "../../../store/reducers/types";
import { isStrictSome } from "../../../utils/pot";
import { euCovidCertificateGet } from "../store/actions";
import { euCovidCertificateFromAuthCodeSelector } from "../store/reducers/byAuthCode";
import { EUCovidCertificateAuthCode } from "../types/EUCovidCertificate";
import {
  EUCovidCertificateResponse,
  isEuCovidCertificateSuccessResponse
} from "../types/EUCovidCertificateResponse";
import EuCovidCertExpiredScreen from "./EuCovidCertExpiredScreen";
import EuCovidCertLoadingScreen from "./EuCovidCertLoadingScreen";
import EuCovidCertRevokedScreen from "./EuCovidCertRevokedScreen";
import EuCovidCertValidScreen from "./EuCovidCertValidScreen";
import EuCovidCertGenericErrorKoScreen from "./ko/EuCovidCertGenericErrorKoScreen";
import EuCovidCertNotFoundKoScreen from "./ko/EuCovidCertNotFoundKoScreen";
import EuCovidCertNotOperationalKoScreen from "./ko/EuCovidCertNotOperationalKoScreen";
import EuCovidCertTemporarilyNotAvailableKoScreen from "./ko/EuCovidCertTemporarilyNotAvailableKoScreen";
import EuCovidCertWrongFormatKoScreen from "./ko/EuCovidCertWrongFormatKoScreen";

type NavigationParams = Readonly<{
  authCode: EUCovidCertificateAuthCode;
}>;

type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps> &
  NavigationInjectedProps<NavigationParams>;

/**
 * Return the right screen based on the response value
 * @param response
 */
const routeEuCovidResponse = (
  response: EUCovidCertificateResponse
): React.ReactElement => {
  switch (response.kind) {
    case "notFound":
      return <EuCovidCertNotFoundKoScreen />;
    case "notOperational":
      return <EuCovidCertNotOperationalKoScreen />;
    case "temporarilyNotAvailable":
      return <EuCovidCertTemporarilyNotAvailableKoScreen />;
    case "wrongFormat":
      return <EuCovidCertWrongFormatKoScreen />;
    case "success":
      switch (response.value.kind) {
        case "valid":
          return <EuCovidCertValidScreen />;
        case "revoked":
          return (
            <EuCovidCertRevokedScreen revokeInfo={response.value.revokeInfo} />
          );
        case "expired":
          return <EuCovidCertExpiredScreen />;
      }
  }
};

/**
 * The data should be loaded or refreshed if:
 * - the response is not "potSome"
 * - the response is "potSome" and the certificate is not a SuccessResponse
 * @param response
 */
const loadRequired = (response: pot.Pot<EUCovidCertificateResponse, Error>) =>
  !isStrictSome(response) ||
  !isEuCovidCertificateSuccessResponse(response.value);

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
    if (loadRequired(props.euCovidCertificateResponse(authCode))) {
      props.loadCertificate(authCode);
    }
  }, []);

  // handle with the fold the remote state and with routeEuCovidResponse the different response values
  return pot.fold(
    props.euCovidCertificateResponse(authCode),
    () => <EuCovidCertLoadingScreen />,
    () => <EuCovidCertLoadingScreen />,
    _ => <EuCovidCertLoadingScreen />,
    _ => <EuCovidCertGenericErrorKoScreen />,
    response => routeEuCovidResponse(response),
    _ => <EuCovidCertLoadingScreen />,
    (_, __) => <EuCovidCertLoadingScreen />,
    _ => <EuCovidCertGenericErrorKoScreen />
  );
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

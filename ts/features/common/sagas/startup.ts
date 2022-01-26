import { SagaIterator } from "redux-saga";
import { fork } from "redux-saga/effects";
import { euCovidCertificateEnabled, mvlEnabled } from "../../../config";
import { authenticationSaga } from "../../../sagas/startup/authenticationSaga";
import { SagaCallReturnType } from "../../../types/utils";
import { watchEUCovidCertificateSaga } from "../../euCovidCert/saga";
import { watchMvlSaga } from "../../mvl/saga";

export function* watchFeaturesSagas(
  sessionToken: SagaCallReturnType<typeof authenticationSaga>
): SagaIterator {
  if (euCovidCertificateEnabled) {
    // Start watching for EU Covid Certificate actions
    yield fork(watchEUCovidCertificateSaga, sessionToken);
  }

  if (mvlEnabled) {
    // Start watching for MVL actions
    yield fork(watchMvlSaga, sessionToken);
  }
}

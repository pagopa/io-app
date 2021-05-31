import { delay, put } from "redux-saga/effects";
import { ActionType } from "typesafe-actions";
import { euCovidCertificateGet } from "../../store/actions";

/**
 * Handle the remote call to retrieve the certificate data
 * @param action
 */
export function* handleGetEuCovidCertificate(
  action: ActionType<typeof euCovidCertificateGet.request>
) {
  // TODO: add networking logic
  yield delay(500);
  yield put(
    euCovidCertificateGet.success({
      authCode: action.payload,
      kind: "notFound"
    })
  );
}

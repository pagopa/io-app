import { delay, put } from "redux-saga/effects";
import { cgnCodeFromBucket } from "../../../store/actions/bucket";

// handle the request for CGN bucket consumption
export function* cgnBucketConsuption(
  // TODO Replace with the proper client once defined
  _: unknown
) {
  // TODO Replace with the try-catch block to properly handle the code consuption API request
  yield delay(200);
  yield put(cgnCodeFromBucket.success({ code: "SAMPLECODEFROMBUCKET" }));
}

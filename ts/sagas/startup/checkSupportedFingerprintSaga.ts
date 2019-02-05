import { Effect } from "redux-saga";
import { call, put, take } from "redux-saga/effects";
import { getType } from "typesafe-actions";

import { navigateToOnboardingFingerprintScreenAction } from "../../store/actions/navigation";
import { fingerprintAcknowledge } from "../../store/actions/onboarding";

import TouchID, {
  IsSupportedConfig
} from "react-native-touch-id";

// Esistono 
// IsSupportedConfig

// const TouchID: {
//   /**
//    *
//    * @param reason String that provides a clear reason for requesting authentication.
//    * @param config Configuration object for more detailed dialog setup
//    */
//   authenticate(reason?: string, config?: AuthenticateConfig);
//   /**
//    * 
//    * @param config - Returns a `Promise` that rejects if TouchID is not supported. On iOS resolves with a `biometryType` `String` of `FaceID` or `TouchID`
//    */
//   isSupported(config?: IsSupportedConfig): Promise<BiometryType>;
// };
// export default TouchID;

export function* checkSupportedFingerprintSaga(): IterableIterator<
  Effect
> {
  // We check whether the user has already created a PIN by trying to retrieve
  // it from the Keychain
  const fingerprintSupported: string = yield call(getFingerprintSettings);

  // TODO: Salvare qui nella session se isFingerprintSupported?
  
  if (fingerprintSupported !== "Unavailable") {
    yield put(navigateToOnboardingFingerprintScreenAction(fingerprintSupported));
   
    // Here we wait the user accept the ToS
    yield take(getType(fingerprintAcknowledge.request));

    // We're done with accepting the ToS, dispatch the action that updates
    // the redux state.
    yield put(fingerprintAcknowledge.success());
  }
      
  return;
}

const isSupportedConfig: IsSupportedConfig = {
  unifiedErrors: true
};

/**
 * Retrieves fingerpint settings from the base system
 */
async function getFingerprintSettings():Promise<String> {
  return new Promise((resolve, _) => {
    TouchID.isSupported(isSupportedConfig)
    .then(
      biometryType => { console.log('is supported or enrolled', JSON.stringify(biometryType)); resolve(biometryType === true ? 'Fingerprint': biometryType)}
      )
    .catch(
      reason => {console.log('is not supported', JSON.stringify(reason)); resolve( reason.code === 'NOT_ENROLLED' || reason.code === 'NOT_AVAILABLE' ? "NotEnrolled" : "Unavailable")}
    );
  });   
}

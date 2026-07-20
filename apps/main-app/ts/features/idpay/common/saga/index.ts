import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import { SagaIterator } from "redux-saga";
import { fork, select } from "typed-redux-saga/macro";

import { PreferredLanguageEnum } from "../../../../../definitions/identity/PreferredLanguage";
import {
  idPayApiBaseUrl,
  idPayApiUatBaseUrl,
  idPayApiUatVersion,
  idPayApiVersion,
  idPayTestToken
} from "../../../../config";
import { isIdPayCiePaymentCodeEnabledSelector } from "../../../../store/reducers/backendStatus/remoteConfig";
import {
  isPagoPATestEnabledSelector,
  preferredLanguageSelector
} from "../../../../store/reducers/persistedPreferences";
import { fromLocaleToPreferredLanguage } from "../../../../utils/locale";
import { watchIDPayBarcodeSaga } from "../../barcode/saga";
import { watchIdPayCodeSaga } from "../../code/saga";
import { watchIDPayInitiativeConfigurationSaga } from "../../configuration/saga";
import { watchIDPayInitiativeDetailsSaga } from "../../details/saga";
import { watchIDPayTimelineSaga } from "../../timeline/saga";
import { watchIdPayUnsubscriptionSaga } from "../../unsubscription/saga";
import { watchIDPayWalletSaga } from "../../wallet/saga";
import { createIDPayClient } from "../api/client";

export function* watchIDPaySaga(bpdToken: string): SagaIterator {
  const isPagoPATestEnabled = yield* select(isPagoPATestEnabledSelector);

  const baseUrl = isPagoPATestEnabled ? idPayApiUatBaseUrl : idPayApiBaseUrl;
  const apiVersion = isPagoPATestEnabled ? idPayApiUatVersion : idPayApiVersion;
  const bearerToken = idPayTestToken ?? bpdToken;
  const isIdPayCiePaymentCodeEnabled = yield* select(
    isIdPayCiePaymentCodeEnabledSelector
  );

  const language = yield* select(preferredLanguageSelector);

  const preferredLanguage = pipe(
    language,
    O.map(fromLocaleToPreferredLanguage),
    O.getOrElse(() => PreferredLanguageEnum.it_IT)
  );

  const idPayClient = createIDPayClient(baseUrl, apiVersion);

  if (isIdPayCiePaymentCodeEnabled) {
    yield* fork(
      watchIdPayCodeSaga,
      idPayClient,
      bearerToken,
      preferredLanguage
    );
  }

  yield* fork(
    watchIDPayWalletSaga,
    idPayClient,
    bearerToken,
    preferredLanguage
  );
  yield* fork(
    watchIDPayInitiativeDetailsSaga,
    idPayClient,
    bearerToken,
    preferredLanguage
  );
  yield* fork(
    watchIDPayTimelineSaga,
    idPayClient,
    bearerToken,
    preferredLanguage
  );
  yield* fork(
    watchIDPayInitiativeConfigurationSaga,
    idPayClient,
    bearerToken,
    preferredLanguage
  );
  yield* fork(watchIDPayBarcodeSaga, idPayClient, bearerToken);
  yield* fork(
    watchIdPayUnsubscriptionSaga,
    idPayClient,
    bearerToken,
    preferredLanguage
  );
}

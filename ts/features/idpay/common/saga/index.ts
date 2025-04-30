import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import { SagaIterator } from "redux-saga";
import { fork, select } from "typed-redux-saga/macro";
import { PreferredLanguageEnum } from "../../../../../definitions/auth/PreferredLanguage";
import {
  idPayApiBaseUrl,
  idPayApiUatBaseUrl,
  idPayTestToken
} from "../../../../config";
import {
  isPagoPATestEnabledSelector,
  preferredLanguageSelector
} from "../../../../store/reducers/persistedPreferences";
import { fromLocaleToPreferredLanguage } from "../../../../utils/locale";
import { watchIdPayCodeSaga } from "../../code/saga";
import { watchIDPayWalletSaga } from "../../wallet/saga";
import { createIDPayClient } from "../api/client";
import { watchIDPayInitiativeDetailsSaga } from "../../details/saga";
import { watchIDPayTimelineSaga } from "../../timeline/saga";
import { watchIDPayInitiativeConfigurationSaga } from "../../configuration/saga";
import { watchIDPayBarcodeSaga } from "../../barcode/saga";
import { watchIdPayUnsubscriptionSaga } from "../../unsubscription/saga";

export function* watchIDPaySaga(bpdToken: string): SagaIterator {
  const isPagoPATestEnabled = yield* select(isPagoPATestEnabledSelector);

  const baseUrl = isPagoPATestEnabled ? idPayApiUatBaseUrl : idPayApiBaseUrl;
  const bearerToken = idPayTestToken ?? bpdToken;

  const language = yield* select(preferredLanguageSelector);

  const preferredLanguage = pipe(
    language,
    O.map(fromLocaleToPreferredLanguage),
    O.getOrElse(() => PreferredLanguageEnum.it_IT)
  );

  const idPayClient = createIDPayClient(baseUrl);

  yield* fork(watchIdPayCodeSaga, idPayClient, bearerToken, preferredLanguage);

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

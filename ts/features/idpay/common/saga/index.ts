import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import { SagaIterator } from "redux-saga";
import { fork, select } from "typed-redux-saga/macro";
import { PreferredLanguageEnum } from "../../../../../definitions/backend/PreferredLanguage";
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
import { watchIDPayInitiativeDetailsSaga } from "../../initiative/details/saga";
import { watchIDPayWalletSaga } from "../../wallet/saga";
import { createIDPayClient } from "../api/client";
import { watchIDPayTimelineSaga } from "../../initiative/timeline/saga";

export function* watchIDPaySaga(bpdToken: string): SagaIterator {
  const isPagoPATestEnabled = yield* select(isPagoPATestEnabledSelector);

  const baseUrl = isPagoPATestEnabled ? idPayApiUatBaseUrl : idPayApiBaseUrl;
  const token = idPayTestToken ?? bpdToken;

  const language = yield* select(preferredLanguageSelector);

  const preferredLanguage = pipe(
    language,
    O.map(fromLocaleToPreferredLanguage),
    O.getOrElse(() => PreferredLanguageEnum.it_IT)
  );

  const client = createIDPayClient(baseUrl);

  yield* fork(watchIDPayWalletSaga, client, token, preferredLanguage);
  yield* fork(
    watchIDPayInitiativeDetailsSaga,
    client,
    token,
    preferredLanguage
  );
  yield* fork(watchIDPayTimelineSaga, client, token, preferredLanguage);
}

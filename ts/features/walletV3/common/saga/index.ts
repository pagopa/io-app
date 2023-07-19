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
import { createWalletClient } from "../api/client";
import { watchWalletOnboardingSaga } from "../../onboarding/saga";

export function* watchWalletV3Saga(bpdToken: string): SagaIterator {
  const isPagoPATestEnabled = yield* select(isPagoPATestEnabledSelector);

  const baseUrl = isPagoPATestEnabled ? idPayApiUatBaseUrl : idPayApiBaseUrl;
  const token = idPayTestToken ?? bpdToken;

  const language = yield* select(preferredLanguageSelector);

  const preferredLanguage = pipe(
    language,
    O.map(fromLocaleToPreferredLanguage),
    O.getOrElse(() => PreferredLanguageEnum.it_IT)
  );

  const client = createWalletClient(baseUrl);

  yield* fork(watchWalletOnboardingSaga, client, token, preferredLanguage);
}

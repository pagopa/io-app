import { v4 as uuid } from "uuid";
import { put, select } from "typed-redux-saga/macro";
import { lollipopKeyTagSelector } from "../store/reducers/lollipop";
import { lollipopKeyTagSave } from "../store/actions/lollipop";
import { cryptoKeyGenerationSaga } from "../../../sagas/startup/generateCryptoKeyPair";

export function* generataLollipopKeySaga() {
  const maybeOldKeyTag = yield* select(lollipopKeyTagSelector);
  const newKeyTag = uuid();
  yield* put(lollipopKeyTagSave({ keyTag: newKeyTag }));
  yield* cryptoKeyGenerationSaga(newKeyTag, maybeOldKeyTag);
}

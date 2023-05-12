import { call } from "typed-redux-saga/macro";
import AsyncStorage from "@react-native-async-storage/async-storage";

// After making the states non-persistent
// because it is no longer necessary, the states
// must be manually removed from AsyncStorage
// because Rexud-persist keeps a copy of
// state in storage engine.
// If an error occurs while deleting, because the key is
// invalid or not present, it is not necessary
// to handle the exception
export function* removePersistedStatesSaga() {
  const keys = ["persist:mvl", "persist:pn"];

  try {
    yield* call(AsyncStorage.multiRemove, keys);
  } finally {
    // nothing to do
  }
}

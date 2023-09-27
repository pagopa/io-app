import { call } from "typed-redux-saga/macro";
import AsyncStorage from "@react-native-async-storage/async-storage";

// After making the states non-persistent
// because it is no longer necessary, the states
// must be manually removed from AsyncStorage
// because Rexud-persist keeps a copy of
// the state in the storage engine.
// If an error occurs while deleting, because the key is
// invalid or not present, it is not necessary to handle
// the exception because Rexud-persist doesn't read files
// from storage engine since the persistedReducer
// has been removed
export function* removePersistedStatesSaga() {
  // MVL was removed from app v2.33.x but we still need to
  // remove the persisted data until minimum app version
  // becomes greater or equal to v2.33.x
  const keys = ["persist:mvl", "persist:pn"];

  try {
    yield* call(AsyncStorage.multiRemove, keys);
  } finally {
    // nothing to do
  }
}

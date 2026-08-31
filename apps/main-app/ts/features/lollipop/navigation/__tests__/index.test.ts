import { testSaga } from "redux-saga-test-plan";

import { checkPublicKeyAndBlockIfNeeded } from "..";
import { lollipopSetSupportedDevice } from "../../store/actions/lollipop";
import { lollipopPublicKeySelector } from "../../store/reducers/lollipop";

describe("checkPublicKeyAndBlockIfNeeded", () => {
  it("should not block the navigation when publicKey is defined", () => {
    testSaga(checkPublicKeyAndBlockIfNeeded)
      .next()
      .select(lollipopPublicKeySelector)
      .next({ kty: "EC" } as any)
      .returns(false);
  });
  it("should block the navigation when publicKey is undefined", () => {
    testSaga(checkPublicKeyAndBlockIfNeeded)
      .next()
      .select(lollipopPublicKeySelector)
      .next(undefined)
      .put(lollipopSetSupportedDevice(false))
      .next()
      .returns(true);
  });
});

import { PublicKey } from "@pagopa/io-react-native-crypto";
import { createStore } from "redux";

import { applicationChangeState } from "../../../../../store/actions/application";
import { setDebugModeEnabled } from "../../../../../store/actions/debug";
import { appReducer } from "../../../../../store/reducers";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import {
  lollipopRemovePublicKey,
  lollipopSetPublicKey
} from "../../../../lollipop/store/actions/lollipop";
import DeveloperModeSection from "../DeveloperModeSection";

const mockPublicKey: PublicKey = {
  kty: "EC",
  crv: "P-256",
  x: "mock-x",
  y: "mock-y"
};

const renderComponent = (publicKey: PublicKey | undefined) => {
  const globalState = appReducer(undefined, applicationChangeState("active"));
  const store = createStore(appReducer, globalState as any);
  store.dispatch(setDebugModeEnabled(true));
  store.dispatch(
    publicKey != null
      ? lollipopSetPublicKey({ publicKey })
      : lollipopRemovePublicKey()
  );
  return renderScreenWithNavigationStoreContext(
    DeveloperModeSection,
    "DEVELOPER_MODE_SECTION",
    {},
    store
  );
};

describe("DeveloperModeSection", () => {
  it("should show the Thumbprint item when publicKey is defined", () => {
    const component = renderComponent(mockPublicKey);

    expect(component.getByText("Thumbprint")).toBeTruthy();
  });

  it("should not show the Thumbprint item when publicKey is undefined", () => {
    const component = renderComponent(undefined);

    expect(component.queryByText("Thumbprint")).toBeNull();
  });
});

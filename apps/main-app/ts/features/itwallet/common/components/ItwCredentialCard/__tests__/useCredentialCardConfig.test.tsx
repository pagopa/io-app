import { renderHook } from "@testing-library/react-native";
import { PropsWithChildren } from "react";
import { Provider } from "react-redux";
import { createStore } from "redux";

import { applicationChangeState } from "../../../../../../store/actions/application";
import { appReducer } from "../../../../../../store/reducers";
import { CredentialType } from "../../../utils/itwMocksUtils";
import { useCredentialCardConfig } from "../config";

const renderConfigHook = (credentialType: string) => {
  const store = createStore(
    appReducer,
    appReducer(undefined, applicationChangeState("active")) as any
  );
  const wrapper = ({ children }: PropsWithChildren) => (
    <Provider store={store}>{children}</Provider>
  );
  return renderHook(() => useCredentialCardConfig(credentialType), {
    wrapper
  });
};

describe("useCredentialCardConfig", () => {
  test.each([
    {
      name: "a static config",
      credentialType: CredentialType.DRIVING_LICENSE
    },
    {
      name: "a generated config",
      credentialType: CredentialType.EDUCATION_DEGREE
    }
  ])(
    "should return the same config across renders for $name",
    ({ credentialType }) => {
      const { result, rerender } = renderConfigHook(credentialType);
      const config = result.current;

      rerender({});

      expect(result.current).toBe(config);
    }
  );
});

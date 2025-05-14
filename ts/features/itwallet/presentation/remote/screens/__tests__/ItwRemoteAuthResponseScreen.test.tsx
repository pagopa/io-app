import { createActor } from "xstate";
import { render } from "@testing-library/react-native";
import { itwRemoteMachine } from "../../machine/machine";
import { ItwRemoteMachineContext } from "../../machine/provider";
import { ItwRemoteAuthResponseScreen } from "../ItwRemoteAuthResponseScreen";

describe("ItwRemoteAuthResponseScreen", () => {
  it("should match snapshot when no redirect_uri is available", () => {
    expect(renderComponent()).toMatchSnapshot();
  });

  it("should match snapshot when a redirect_uri is available", () => {
    expect(renderComponent("https://myrp/auth/success")).toMatchSnapshot();
  });
});

const renderComponent = (redirectUri?: string) => {
  const initialSnapshot = createActor(itwRemoteMachine).getSnapshot();
  const snapshot: typeof initialSnapshot = {
    ...initialSnapshot,
    value: "Success",
    context: {
      ...initialSnapshot.context,
      redirectUri
    }
  };

  return render(
    <ItwRemoteMachineContext.Provider options={{ snapshot }}>
      <ItwRemoteAuthResponseScreen />
    </ItwRemoteMachineContext.Provider>
  );
};

import { render } from "@testing-library/react-native";
import { ReactNode } from "react";
import { View } from "react-native";

import { useIOSelector } from "../../../../../../store/hooks.ts";
import { isDebugModeEnabledSelector } from "../../../../../../store/reducers/debug.ts";
import {
  ItwProximityMachineContext,
  ItwProximityMachineProvider
} from "../provider.tsx";

jest.mock("@xstate/react", () => ({
  createActorContext: jest.fn(() => ({
    Provider: ({ children }: { children: ReactNode }) => children,
    useActorRef: jest.fn(),
    useSelector: jest.fn()
  }))
}));

jest.mock("../../../../../../hooks/useDebugInfo.ts", () => ({
  useDebugInfo: jest.fn()
}));

jest.mock("../../../../../../navigation/params/AppParamsList.ts", () => ({
  useIONavigation: jest.fn(() => ({}))
}));

jest.mock("../../../../../../store/hooks.ts", () => ({
  useIOSelector: jest.fn(),
  useIOStore: jest.fn(() => ({}))
}));

jest.mock("../../../../common/utils/environment.ts", () => ({
  getEnv: jest.fn(() => ({}))
}));

jest.mock("../actions.ts", () => ({
  createProximityActionsImplementation: jest.fn(() => ({}))
}));

jest.mock("../actors.ts", () => ({
  createProximityActorsImplementation: jest.fn(() => ({}))
}));

jest.mock("../guards.ts", () => ({
  createProximityGuardsImplementation: jest.fn(() => ({}))
}));

const mockUseIOSelector = jest.mocked(useIOSelector);
const mockMachineUseSelector = jest.mocked(
  ItwProximityMachineContext.useSelector
);

const renderProvider = (isDebugModeEnabled: boolean) => {
  mockUseIOSelector.mockImplementation(selector =>
    selector === isDebugModeEnabledSelector ? isDebugModeEnabled : undefined
  );

  return render(
    <ItwProximityMachineProvider>
      <View testID="provider-child" />
    </ItwProximityMachineProvider>
  );
};

describe("ItwProximityMachineProvider", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("does not subscribe to machine debug data when debug mode is disabled", () => {
    const { getByTestId } = renderProvider(false);

    expect(getByTestId("provider-child")).toBeTruthy();
    expect(mockMachineUseSelector).not.toHaveBeenCalled();
  });

  it("subscribes to machine debug data when debug mode is enabled", () => {
    renderProvider(true);

    expect(mockMachineUseSelector).toHaveBeenCalledTimes(2);
  });
});

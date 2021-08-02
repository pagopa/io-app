import { render } from "@testing-library/react-native";
import { RemoteSwitch } from "../RemoteSwitch";

describe("RemoteSwitch tests", () => {
  jest.useFakeTimers();
  it("Snapshot a", () => {
    const component = render(() => <RemoteSwitch />);
  });
});

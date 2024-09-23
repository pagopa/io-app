import { render } from "@testing-library/react-native";
import React = require("react");
import CieIdWizard from "../wizards/CieIdWizard";
import CiePinWizard from "../wizards/CiePinWizard";
import SpidWizard from "../wizards/SpidWizard";
import IDActivationWizard from "../wizards/IDActivationWizard";

jest.mock("@react-navigation/native", () => ({
  useNavigation: () => ({
    navigate: jest.fn,
    setOptions: jest.fn
  }),
  useRoute: jest.fn,
  useFocusEffect: jest.fn
}));
jest.mock("@react-navigation/stack", () => ({ createStackNavigator: jest.fn }));
jest.mock("react-redux", () => ({
  ...jest.requireActual("react-redux"),
  useDispatch: jest.fn,
  useSelector: jest.fn,
  useStore: jest.fn
}));
jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: jest.fn
}));

describe(CieIdWizard, () => {
  afterEach(jest.clearAllMocks);

  it("Should match the snapshot", () => {
    const component = render(<CieIdWizard />);

    expect(component).toMatchSnapshot();
  });
});

describe(CiePinWizard, () => {
  afterEach(jest.clearAllMocks);

  it("Should match the snapshot", () => {
    const component = render(<CiePinWizard />);

    expect(component).toMatchSnapshot();
  });
});

describe(SpidWizard, () => {
  afterEach(jest.clearAllMocks);

  it("Should match the snapshot", () => {
    const component = render(<SpidWizard />);

    expect(component).toMatchSnapshot();
  });
});

describe(IDActivationWizard, () => {
  afterEach(jest.clearAllMocks);

  it("Should match the snapshot", () => {
    const component = render(<IDActivationWizard />);

    expect(component).toMatchSnapshot();
  });
});

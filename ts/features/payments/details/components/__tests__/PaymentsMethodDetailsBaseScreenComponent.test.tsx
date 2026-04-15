import { render } from "@testing-library/react-native";
import { PropsWithChildren } from "react";
import { Provider } from "react-redux";
import configureMockStore from "redux-mock-store";
import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import { GlobalState } from "../../../../../store/reducers/types";
import { PaymentCardComponentProps } from "../../../common/components/PaymentCard";
import { PaymentsMethodDetailsBaseScreenComponent } from "../PaymentsMethodDetailsBaseScreenComponent";

type Props = {
  card: PaymentCardComponentProps;
  headerTitle?: string;
};

jest.mock("react-native-safe-area-context", () => {
  const useSafeAreaInsets = () => ({ top: 0 });
  return {
    useSafeAreaInsets
  };
});

jest.mock("@react-navigation/native", () => {
  const actualNav = jest.requireActual("@react-navigation/native");
  return {
    ...actualNav,
    useRoute: () => ({
      name: ""
    }),
    useNavigation: () => ({
      setOptions: jest.fn
    }),
    useIsFocused: () => true
  };
});

jest.mock("react-native", () => {
  const RN = jest.requireActual("react-native");
  return {
    ...RN,
    AccessibilityInfo: {
      announceForAccessibility: jest.fn()
    }
  };
});

const globalState = appReducer(undefined, applicationChangeState("active"));
const mockStore = configureMockStore<GlobalState>();
const store: ReturnType<typeof mockStore> = mockStore(globalState);

const renderComponent = (props: PropsWithChildren<Props>) => {
  const { card, headerTitle, children } = props;

  return render(
    <Provider store={store}>
      <PaymentsMethodDetailsBaseScreenComponent
        card={card}
        headerTitle={headerTitle}
      >
        {children}
      </PaymentsMethodDetailsBaseScreenComponent>
    </Provider>
  );
};

describe("PaymentsMethodDetailsBaseScreenComponent", () => {
  it("should render correctly with default props", () => {
    const card: PaymentCardComponentProps = {
      brand: "VISA",
      holderName: "John Doe",
      hpan: "1234"
    };

    const { getByText } = renderComponent({
      card,
      headerTitle: "Payment Method Details"
    });

    expect(getByText("John Doe")).toBeTruthy();
    expect(getByText(/1234$/)).toBeTruthy();
  });
});

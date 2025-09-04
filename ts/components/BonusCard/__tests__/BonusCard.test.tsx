import { LabelMini } from "@pagopa/io-app-design-system";
import { render } from "@testing-library/react-native";
import { Provider } from "react-redux";
import configureMockStore from "redux-mock-store";
import I18n from "i18next";
import { applicationChangeState } from "../../../store/actions/application";
import { appReducer } from "../../../store/reducers";
import { GlobalState } from "../../../store/reducers/types";
import { format } from "../../../utils/dates";
import { BonusCard } from "../BonusCard";
import { BonusCardCounter } from "../BonusCardCounter";

jest.mock("react-native-safe-area-context", () => {
  const useSafeAreaInsets = () => ({ top: 0 });
  return {
    useSafeAreaInsets
  };
});

describe("Test BonusCard", () => {
  describe("when the component is loading", () => {
    it("should display the skeleton", () => {
      const { queryByTestId, queryAllByTestId } = renderComponent({
        isLoading: true
      });
      expect(queryByTestId("BonusCardSkeletonTestID")).not.toBeNull();
      expect(queryByTestId("BonusCardContentTestID")).toBeNull();
      expect(queryByTestId("BonusCardCounterTestID")).toBeNull();
      expect(queryAllByTestId("BonusCardCounterSkeletonTestID")).toHaveLength(
        2
      );
    });
  });
  describe("when the component is not loading", () => {
    it("should display the content", () => {
      const T_NAME = "Bonus name";
      const T_ORG_NAME = "Bonus name";
      const T_END_DATE = new Date(2023, 10, 10);

      const T_COUNTER_TEXT_1 = "Progress counter";
      const T_COUNTER_VALUE_1 = "9.999,99 €";

      const T_COUNTER_TEXT_2 = "Value counter";
      const T_COUNTER_VALUE_2 = "999,99 €";

      const T_COUNTER_WITH_PROGRESS: BonusCardCounter = {
        type: "ValueWithProgress",
        progress: 0.4,
        label: T_COUNTER_TEXT_1,
        value: T_COUNTER_VALUE_1
      };
      const T_COUNTER: BonusCardCounter = {
        type: "Value",
        label: T_COUNTER_TEXT_2,
        value: T_COUNTER_VALUE_2
      };

      const { queryByTestId, queryAllByTestId, queryByText } = renderComponent({
        name: T_NAME,
        organizationName: T_ORG_NAME,
        status: (
          <LabelMini weight="Regular" color="grey-650">
            {I18n.t("bonusCard.validUntil", {
              endDate: format(T_END_DATE, "DD/MM/YY")
            })}
          </LabelMini>
        ),
        counters: [T_COUNTER_WITH_PROGRESS, T_COUNTER]
      });

      expect(queryByTestId("BonusCardSkeletonTestID")).toBeNull();
      expect(queryByTestId("BonusCardContentTestID")).not.toBeNull();
      expect(queryAllByTestId("BonusCardCounterTestID")).toHaveLength(2);

      expect(queryByText(T_COUNTER_TEXT_1)).not.toBeNull();
      expect(queryByText(T_COUNTER_VALUE_1)).not.toBeNull();
      expect(queryByText(T_COUNTER_TEXT_2)).not.toBeNull();
      expect(queryByText(T_COUNTER_VALUE_2)).not.toBeNull();
    });
  });
});

const renderComponent = (props: BonusCard) => {
  const globalState = appReducer(undefined, applicationChangeState("active"));

  const mockStore = configureMockStore<GlobalState>();
  const store: ReturnType<typeof mockStore> = mockStore({
    ...globalState
  } as GlobalState);

  return render(
    <Provider store={store}>
      <BonusCard {...props} />
    </Provider>
  );
};

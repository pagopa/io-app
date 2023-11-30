import * as React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import renderer from "react-test-renderer";
import { cleanup } from "@testing-library/react-native";
import { NavigationContainer } from "@react-navigation/native";
import configureMockStore from "redux-mock-store";
import { Provider } from "react-redux";
import { PaidPaymentScreen } from "../PaidPaymentScreen";
import PN_ROUTES from "../../navigation/routes";
import { GlobalState } from "../../../../store/reducers/types";
import { applicationChangeState } from "../../../../store/actions/application";
import { appReducer } from "../../../../store/reducers";

describe("PaidPaymentScreen", () => {
  // Needed to avoid `ReferenceError: You are trying to `import` a file after the Jest environment has been torn down.`
  afterEach(cleanup);
  it("should render with back button, title, help button, paid banner, notice code and creditor tax id", () => {
    const tree = renderer
      .create(generateComponent(generateNoticeCode(), generateCreditorTaxId()))
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
  it("should render with back button, title, help button, paid banner and notice code but no creditor tax id", () => {
    const tree = renderer
      .create(generateComponent(generateNoticeCode()))
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
});

const generateNoticeCode = () => "018011988086479497";
const generateCreditorTaxId = () => "00000000009";

const generateComponent = (noticeCode: string, creditorTaxId?: string) => {
  const globalState = appReducer(undefined, applicationChangeState("active"));
  const store = configureMockStore<GlobalState>()(globalState);
  const Stack = createStackNavigator();
  return (
    <Provider store={store}>
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen
            name={PN_ROUTES.CANCELLED_MESSAGE_PAID_PAYMENT}
            component={PaidPaymentScreen}
            initialParams={{
              noticeCode,
              creditorTaxId
            }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </Provider>
  );
};

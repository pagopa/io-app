import { cleanup } from "@testing-library/react-native";
import configureMockStore from "redux-mock-store";
import { LegacyPaidPaymentScreen } from "../LegacyPaidPaymentScreen";
import PN_ROUTES from "../../navigation/routes";
import { GlobalState } from "../../../../store/reducers/types";
import { applicationChangeState } from "../../../../store/actions/application";
import { appReducer } from "../../../../store/reducers";
import { renderScreenWithNavigationStoreContext } from "../../../../utils/testWrapper";

describe("LegacyPaidPaymentScreen", () => {
  // Needed to avoid `ReferenceError: You are trying to `import` a file after the Jest environment has been torn down.`
  afterEach(cleanup);
  it("should render with back button, title, help button, paid banner, notice code and creditor tax id", () => {
    const component = generateComponent(
      generateNoticeCode(),
      generateCreditorTaxId()
    );
    expect(component.toJSON()).toMatchSnapshot();
  });
  it("should render with back button, title, help button, paid banner and notice code but no creditor tax id", () => {
    const component = generateComponent(generateNoticeCode());
    expect(component.toJSON()).toMatchSnapshot();
  });
});

const generateNoticeCode = () => "018011988086479497";
const generateCreditorTaxId = () => "00000000009";

const generateComponent = (noticeCode: string, creditorTaxId?: string) => {
  const globalState = appReducer(undefined, applicationChangeState("active"));
  const store = configureMockStore<GlobalState>()(globalState);

  return renderScreenWithNavigationStoreContext<GlobalState>(
    LegacyPaidPaymentScreen,
    PN_ROUTES.CANCELLED_MESSAGE_PAID_PAYMENT,
    { noticeCode, creditorTaxId },
    store
  );
};

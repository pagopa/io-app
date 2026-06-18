import { render } from "@testing-library/react-native";
import { Provider } from "react-redux";
import configureMockStore from "redux-mock-store";
import { Card } from "../../../../../../../definitions/cgn/Card";
import { StatusEnum as CgnActivatedStatusEnum } from "../../../../../../../definitions/cgn/CardActivated";
import { StatusEnum as CgnExpiredStatusEnum } from "../../../../../../../definitions/cgn/CardExpired";
import { StatusEnum as CgnPendingStatusEnum } from "../../../../../../../definitions/cgn/CardPending";
import {
  CardRevoked,
  StatusEnum as CgnRevokedStatusEnum
} from "../../../../../../../definitions/cgn/CardRevoked";
import { applicationChangeState } from "../../../../../../store/actions/application";
import { appReducer } from "../../../../../../store/reducers";
import { GlobalState } from "../../../../../../store/reducers/types";
import { CgnCardStatus } from "../../CgnCardStatus";

const cgnStatusActivated: Card = {
  status: CgnActivatedStatusEnum.ACTIVATED,
  activation_date: new Date("2020-03-04"),
  expiration_date: new Date("2037-02-20")
};

const cgnStatusRevoked: Card = {
  status: CgnRevokedStatusEnum.REVOKED,
  revocation_date: new Date("2030-02-20"),
  activation_date: new Date("2020-03-04"),
  expiration_date: new Date("2037-02-20"),
  revocation_reason: "A reason to revoke" as CardRevoked["revocation_reason"]
};

const cgnStatusExpired: Card = {
  status: CgnExpiredStatusEnum.EXPIRED,
  activation_date: new Date("2020-03-04"),
  expiration_date: new Date("2037-02-20")
};

const cgnStatusPending: Card = {
  status: CgnPendingStatusEnum.PENDING
};

describe("CgnCardComponent", () => {
  it("Activated card", () => {
    const component = getComponent(cgnStatusActivated);

    expect(component).not.toBeNull();

    const validityDate = component.queryByTestId("card-bottom-content");
    expect(validityDate).not.toBeNull();

    const revokedTag = component.queryByTestId("card-status-revoked");
    expect(revokedTag).toBeNull();

    const expiredTag = component.queryByTestId("card-status-expired");
    expect(expiredTag).toBeNull();
  });

  it("Revoked card", () => {
    const component = getComponent(cgnStatusRevoked);

    expect(component).not.toBeNull();

    const validityDate = component.queryByTestId("card-bottom-content");
    expect(validityDate).toBeNull();

    const revokedTag = component.queryByTestId("card-status-revoked");
    expect(revokedTag).not.toBeNull();

    const expiredTag = component.queryByTestId("card-status-expired");
    expect(expiredTag).toBeNull();
  });

  it("Expired card", () => {
    const component = getComponent(cgnStatusExpired);

    expect(component).not.toBeNull();

    const validityDate = component.queryByTestId("card-bottom-content");
    expect(validityDate).toBeNull();

    const revokedTag = component.queryByTestId("card-status-revoked");
    expect(revokedTag).toBeNull();

    const expiredTag = component.queryByTestId("card-status-expired");
    expect(expiredTag).not.toBeNull();
  });

  it("Pending card", () => {
    const component = getComponent(cgnStatusPending);

    expect(component).not.toBeNull();

    const validityDate = component.queryByTestId("card-bottom-content");
    expect(validityDate).toBeNull();

    const revokedTag = component.queryByTestId("card-status-revoked");
    expect(revokedTag).toBeNull();

    const expiredTag = component.queryByTestId("card-status-expired");
    expect(expiredTag).toBeNull();
  });
});

const getComponent = (card: Card) => {
  const globalState = appReducer(undefined, applicationChangeState("active"));
  const mockStore = configureMockStore<GlobalState>();

  const store = mockStore(globalState);
  return render(
    <Provider store={store}>
      <CgnCardStatus card={card} />
    </Provider>
  );
};

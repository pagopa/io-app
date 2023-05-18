import * as React from "react";
import { View } from "react-native";
import configureMockStore from "redux-mock-store";
import {
  InitiativeDTO,
  InitiativeRewardTypeEnum,
  StatusEnum
} from "../../../../../../../definitions/idpay/InitiativeDTO";
import { applicationChangeState } from "../../../../../../store/actions/application";
import { appReducer } from "../../../../../../store/reducers";
import { GlobalState } from "../../../../../../store/reducers/types";
import { renderScreenFakeNavRedux } from "../../../../../../utils/testWrapper";
import { IDPayDetailsRoutes } from "../../navigation";
import InitiativeDetailsBaseScreenComponent from "../InitiativeDetailsBaseScreenComponent";

const mockedInitiative: InitiativeDTO = {
  endDate: new Date(2023, 1, 1),
  initiativeId: "ABC123",
  initiativeName: "Fake initiative",
  organizationName: "Fake organization",
  nInstr: 2,
  status: StatusEnum.REFUNDABLE,
  initiativeRewardType: InitiativeRewardTypeEnum.REFUND,
  lastCounterUpdate: new Date(),
  logoURL: "ABC"
};

describe("Test InitiativeDetailsBaseScreenComponent component", () => {
  it("should render a InitiativeDetailsBaseScreenComponent component with props correctly", () => {
    const component = renderComponent(
      <InitiativeDetailsBaseScreenComponent
        isLoading={false}
        onHeaderDetailsPress={() => null}
        initiative={mockedInitiative}
      />
    );
    expect(component).toBeTruthy();
    expect(component).toMatchSnapshot();
  });
  it("should render its children", () => {
    const component = renderComponent(
      <InitiativeDetailsBaseScreenComponent
        isLoading={false}
        onHeaderDetailsPress={() => null}
        initiative={mockedInitiative}
      >
        <View testID="ChildTestID" />
      </InitiativeDetailsBaseScreenComponent>
    );
    expect(component).toBeTruthy();
    expect(component.queryByTestId("ChildTestID")).not.toBeNull();
  });
  it("should render skeleton if loading", () => {
    const component = renderComponent(
      <InitiativeDetailsBaseScreenComponent
        isLoading={true}
        onHeaderDetailsPress={() => null}
      />
    );
    expect(component).toBeTruthy();
    expect(
      component.queryByTestId("IDPayDetailsHeroSkeletonTestID")
    ).not.toBeNull();
    expect(component.queryByTestId("IDPayDetailsLastUpdatedTestID")).toBeNull();
    expect(component.queryByTestId("IDPayInitiativeLogoTestID")).toBeNull();
    expect(component.queryByTestId("IDPayDetailsHeroTestID")).toBeNull();
  });
  it("should render initiative data", () => {
    const component = renderComponent(
      <InitiativeDetailsBaseScreenComponent
        isLoading={false}
        onHeaderDetailsPress={() => null}
        initiative={mockedInitiative}
      />
    );
    expect(component).toBeTruthy();
    expect(
      component.queryByTestId("IDPayDetailsHeroSkeletonTestID")
    ).toBeNull();
    expect(
      component.queryByTestId("IDPayDetailsLastUpdatedTestID")
    ).not.toBeNull();
    expect(component.queryByTestId("IDPayInitiativeLogoTestID")).not.toBeNull();
    expect(component.queryByTestId("IDPayDetailsHeroTestID")).not.toBeNull();
  });
  it("should not render logo if empty logoURL", () => {
    const component = renderComponent(
      <InitiativeDetailsBaseScreenComponent
        isLoading={false}
        onHeaderDetailsPress={() => null}
        initiative={{ ...mockedInitiative, logoURL: undefined }}
      />
    );
    expect(component).toBeTruthy();
    expect(
      component.queryByTestId("IDPayDetailsHeroSkeletonTestID")
    ).toBeNull();
    expect(
      component.queryByTestId("IDPayDetailsLastUpdatedTestID")
    ).not.toBeNull();
    expect(component.queryByTestId("IDPayInitiativeLogoTestID")).toBeNull();
    expect(component.queryByTestId("IDPayDetailsHeroTestID")).not.toBeNull();
  });
});

const renderComponent = (component: React.ReactElement) => {
  const globalState = appReducer(undefined, applicationChangeState("active"));
  const mockStore = configureMockStore<GlobalState>();
  const store: ReturnType<typeof mockStore> = mockStore({
    ...globalState
  } as GlobalState);

  return renderScreenFakeNavRedux<GlobalState>(
    () => component,
    IDPayDetailsRoutes.IDPAY_DETAILS_MAIN,
    {},
    store
  );
};

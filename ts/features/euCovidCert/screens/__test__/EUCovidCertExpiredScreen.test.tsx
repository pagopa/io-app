import * as React from "react";
import { NavigationParams } from "react-navigation";
import { Store } from "redux";
import configureMockStore from "redux-mock-store";
import { applicationChangeState } from "../../../../store/actions/application";
import { appReducer } from "../../../../store/reducers";
import { GlobalState } from "../../../../store/reducers/types";
import { renderScreenFakeNavRedux } from "../../../../utils/testWrapper";
import EUCOVIDCERT_ROUTES from "../../navigation/routes";
import { expiredCertificate } from "../../types/__mock__/EUCovidCertificate.mock";
import { ExpiredCertificate } from "../../types/EUCovidCertificate";
import EuCovidCertExpiredScreen from "../EuCovidCertExpiredScreen";

describe("Test EuCovidCertExpiredScreen", () => {
  jest.useFakeTimers();

  it("With expiredCertificate, the header should match the data contained in the certificate", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const mockStore = configureMockStore<GlobalState>();
    const store: ReturnType<typeof mockStore> = mockStore(globalState);
    const render = renderComponent(store, {
      ...expiredCertificate,
      headerData: {
        title: "titleValid",
        subTitle: "subtitleValid",
        logoUrl: "logoUrlValid"
      }
    });
    expect(render.component.queryByText("titleValid")).not.toBeNull();
    expect(render.component.queryByText("subtitleValid")).not.toBeNull();
    expect(
      render.component.findByTestId("EuCovidCertHeaderLogoID")
    ).not.toBeNull();
  });
});

const renderComponent = (
  store: Store,
  revokedCertificate: ExpiredCertificate
) => ({
  component: renderScreenFakeNavRedux<GlobalState, NavigationParams>(
    () => (
      <EuCovidCertExpiredScreen headerData={revokedCertificate.headerData} />
    ),
    EUCOVIDCERT_ROUTES.CERTIFICATE,
    {},
    store
  ),
  store
});

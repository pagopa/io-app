import * as React from "react";

import { Store } from "redux";
import configureMockStore from "redux-mock-store";
import { applicationChangeState } from "../../../../store/actions/application";
import { appReducer } from "../../../../store/reducers";
import { GlobalState } from "../../../../store/reducers/types";
import { renderScreenFakeNavRedux } from "../../../../utils/testWrapper";
import EUCOVIDCERT_ROUTES from "../../navigation/routes";
import { revokedCertificate } from "../../types/__mock__/EUCovidCertificate.mock";
import { RevokedCertificate } from "../../types/EUCovidCertificate";
import EuCovidCertRevokedScreen from "../EuCovidCertRevokedScreen";

describe("Test EuCovidCertRevokedScreen", () => {
  jest.useFakeTimers();

  it("With revokedCertificate, the header should match the data contained in the certificate", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const mockStore = configureMockStore<GlobalState>();
    const store: ReturnType<typeof mockStore> = mockStore(globalState);
    const render = renderComponent(store, {
      ...revokedCertificate,
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
  revokedCertificate: RevokedCertificate
) => ({
  component: renderScreenFakeNavRedux<GlobalState>(
    () => (
      <EuCovidCertRevokedScreen headerData={revokedCertificate.headerData} />
    ),
    EUCOVIDCERT_ROUTES.CERTIFICATE,
    {},
    store
  ),
  store
});

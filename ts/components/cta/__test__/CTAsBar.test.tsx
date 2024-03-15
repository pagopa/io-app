import * as React from "react";
import { createStore } from "redux";
import { ServiceId } from "../../../../definitions/backend/ServiceId";
import { CTAS } from "../../../features/messages/types/MessageCTA";
import { appReducer } from "../../../store/reducers";
import { applicationChangeState } from "../../../store/actions/application";
import { renderScreenWithNavigationStoreContext } from "../../../utils/testWrapper";
import { CTAsBar } from "../CTAsBar";

describe("CTAsBar", () => {
  it("should match snapshot with one CTA", () => {
    const serviceId = "01HRW50F08QYXNP518JYCKVSHP" as ServiceId;
    const ctas = { cta_1: { text: "My CTA 1", action: "" } } as CTAS;
    const component = renderComponent(serviceId, ctas);
    expect(component.toJSON()).toMatchSnapshot();
  });
  it("should match snapshot with both CTAs", () => {
    const serviceId = "01HRW50F08QYXNP518JYCKVSHP" as ServiceId;
    const ctas = {
      cta_1: { text: "My CTA 1", action: "" },
      cta_2: { text: "My CTA 2", action: "" }
    } as CTAS;
    const component = renderComponent(serviceId, ctas);
    expect(component.toJSON()).toMatchSnapshot();
  });
});

const renderComponent = (serviceId: ServiceId, ctas: CTAS) => {
  const globalState = appReducer(undefined, applicationChangeState("active"));
  const store = createStore(appReducer, globalState as any);

  return renderScreenWithNavigationStoreContext(
    () => <CTAsBar serviceId={serviceId} ctas={ctas} />,
    "DUMMY",
    {},
    store
  );
};

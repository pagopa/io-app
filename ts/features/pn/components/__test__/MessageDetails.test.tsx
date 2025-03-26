import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import { ComponentProps } from "react";
import configureMockStore from "redux-mock-store";
import I18n from "../../../../i18n";
import { applicationChangeState } from "../../../../store/actions/application";
import { appReducer } from "../../../../store/reducers";
import { GlobalState } from "../../../../store/reducers/types";
import { renderScreenWithNavigationStoreContext } from "../../../../utils/testWrapper";
import { serviceId_1 } from "../../../messages/__mocks__/messages";
import { UIMessageId } from "../../../messages/types";
import { thirdPartyMessage } from "../../__mocks__/pnMessage";
import { toPNMessage } from "../../store/types/transformers";
import { PNMessage } from "../../store/types/types";
import { MessageDetails } from "../MessageDetails";

const pnMessage = pipe(thirdPartyMessage, toPNMessage, O.toUndefined)!;

describe("MessageDetails component", () => {
  it("should match the snapshot with default props", () => {
    const { component } = renderComponent(
      generateComponentProperties(pnMessage)
    );
    expect(component).toMatchSnapshot();
  });

  it("should display the legalMessage tag", () => {
    const { component } = renderComponent(
      generateComponentProperties(pnMessage)
    );
    expect(
      component.queryByText(I18n.t("features.pn.details.badge.legalValue"))
    ).not.toBeNull();
  });

  it("should display the attachment tag if there are attachments", () => {
    const { component } = renderComponent(
      generateComponentProperties(pnMessage)
    );
    expect(component.queryByTestId("attachment-tag")).not.toBeNull();
  });

  it("should NOT display the attachment tag if there are no attachments", () => {
    const { component } = renderComponent(
      generateComponentProperties({
        ...pnMessage,
        attachments: []
      })
    );
    expect(component.queryByTestId("attachment-tag")).toBeNull();
  });
});

const generateComponentProperties = (message: PNMessage) => ({
  messageId: "01HRYR6C761DGH3S84HBBXMMKT" as UIMessageId,
  message,
  payments: undefined,
  serviceId: serviceId_1
});

const renderComponent = (props: ComponentProps<typeof MessageDetails>) => {
  const globalState = appReducer(undefined, applicationChangeState("active"));
  const mockStore = configureMockStore<GlobalState>();
  const store: ReturnType<typeof mockStore> = mockStore(globalState);

  return {
    component: renderScreenWithNavigationStoreContext<GlobalState>(
      () => <MessageDetails {...props} />,
      "DUMMY_ROUTE",
      {},
      store
    ),
    store
  };
};

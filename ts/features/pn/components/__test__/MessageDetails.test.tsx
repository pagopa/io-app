import React from "react";
import configureMockStore from "redux-mock-store";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import { applicationChangeState } from "../../../../store/actions/application";
import { appReducer } from "../../../../store/reducers";
import { MessageDetails } from "../MessageDetails";
import { GlobalState } from "../../../../store/reducers/types";
import { renderScreenWithNavigationStoreContext } from "../../../../utils/testWrapper";
import { PNMessage } from "../../store/types/types";
import { thirdPartyMessage } from "../../__mocks__/message";
import { toPNMessage } from "../../store/types/transformers";
import { UIMessageId } from "../../../messages/types";
import I18n from "../../../../i18n";

const pnMessage = pipe(thirdPartyMessage, toPNMessage, O.toUndefined)!;

describe("MessageDetails component", () => {
  it("should match the snapshot with default props", () => {
    const { component } = renderComponent(
      generateComponentProperties(
        thirdPartyMessage.id as UIMessageId,
        pnMessage
      )
    );
    expect(component).toMatchSnapshot();
  });

  it("should display the legalMessage tag", () => {
    const { component } = renderComponent(
      generateComponentProperties(
        thirdPartyMessage.id as UIMessageId,
        pnMessage
      )
    );
    expect(
      component.queryByText(I18n.t("features.pn.details.badge.legalValue"))
    ).not.toBeNull();
  });

  it("should display the attachment tag if there are attachments", () => {
    const { component } = renderComponent(
      generateComponentProperties(
        thirdPartyMessage.id as UIMessageId,
        pnMessage
      )
    );
    expect(component.queryByTestId("attachment-tag")).not.toBeNull();
  });

  it("should NOT display the attachment tag if there are no attachments", () => {
    const { component } = renderComponent(
      generateComponentProperties(thirdPartyMessage.id as UIMessageId, {
        ...pnMessage,
        attachments: []
      })
    );
    expect(component.queryByTestId("attachment-tag")).toBeNull();
  });
});

const generateComponentProperties = (
  messageId: UIMessageId,
  message: PNMessage
) => ({
  messageId,
  message,
  payments: undefined,
  service: undefined
});

const renderComponent = (
  props: React.ComponentProps<typeof MessageDetails>
) => {
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

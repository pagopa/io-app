import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import { ComponentProps } from "react";
import configureMockStore from "redux-mock-store";
import I18n from "i18next";
import { applicationChangeState } from "../../../../store/actions/application";
import { appReducer } from "../../../../store/reducers";
import { GlobalState } from "../../../../store/reducers/types";
import { renderScreenWithNavigationStoreContext } from "../../../../utils/testWrapper";
import { serviceId_1 } from "../../../messages/__mocks__/messages";
import { thirdPartyMessage } from "../../__mocks__/pnMessage";
import { toPNMessage } from "../../store/types/transformers";
import { PNMessage } from "../../store/types/types";
import { MessageDetails } from "../MessageDetails";

jest.mock("../MessageBottomMenu");

const pnMessage = pipe(thirdPartyMessage, toPNMessage, O.toUndefined)!;

describe("MessageDetails component", () => {
  [false, true].forEach(isAARNotification => {
    it(`should match the snapshot with default props (is AAR ${isAARNotification})`, () => {
      const { component } = renderComponent(
        generateComponentProperties(isAARNotification, pnMessage)
      );
      expect(component).toMatchSnapshot();
    });

    it(`should display the legalMessage tag (is AAR ${isAARNotification})`, () => {
      const { component } = renderComponent(
        generateComponentProperties(isAARNotification, pnMessage)
      );
      expect(
        component.queryByText(I18n.t("features.pn.details.badge.legalValue"))
      ).not.toBeNull();
    });

    it(`should display the attachment tag if there are attachments (is AAR ${isAARNotification})`, () => {
      const { component } = renderComponent(
        generateComponentProperties(isAARNotification, pnMessage)
      );
      expect(component.queryByTestId("attachment-tag")).not.toBeNull();
    });

    it(`should NOT display the attachment tag if there are no attachments (is AAR ${isAARNotification})`, () => {
      const { component } = renderComponent(
        generateComponentProperties(isAARNotification, {
          ...pnMessage,
          attachments: []
        })
      );
      expect(component.queryByTestId("attachment-tag")).toBeNull();
    });
  });
});

const generateComponentProperties = (
  isAARNotification: boolean,
  message: PNMessage
) => ({
  isAARNotification,
  messageId: "01HRYR6C761DGH3S84HBBXMMKT",
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

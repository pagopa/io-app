import React from "react";
import * as pot from "@pagopa/ts-commons/lib/pot";
import * as O from "fp-ts/lib/Option";
import { act, fireEvent } from "@testing-library/react-native";
import { createStore } from "redux";
import { applicationChangeState } from "../../../../store/actions/application";
import { appReducer } from "../../../../store/reducers";
import { PnMessageDetails } from "../PnMessageDetails";
import { GlobalState } from "../../../../store/reducers/types";
import { renderScreenFakeNavRedux } from "../../../../utils/testWrapper";
import PN_ROUTES from "../../navigation/routes";
import {
  UIAttachment,
  UIMessageId
} from "../../../../store/reducers/entities/messages/types";
import { PNMessage } from "../../store/types/types";
import { InitializedProfile } from "../../../../../definitions/backend/InitializedProfile";
import { BackendStatusState } from "../../../../store/reducers/backendStatus";
import { Download } from "../../../../store/reducers/entities/messages/downloads";
import { NotificationRecipient } from "../../../../../definitions/pn/NotificationRecipient";

const mockedOnAttachmentSelect = jest.fn();

jest.mock("../../../messages/hooks/useAttachmentDownload", () => ({
  useAttachmentDownload: (
    _attachment: UIAttachment,
    _openPreview: (attachment: UIAttachment) => void
  ) => ({
    onAttachmentSelect: mockedOnAttachmentSelect,
    downloadPot: { kind: "PotNone" } as pot.Pot<Download, Error>
  })
}));

describe("PnMessageDetails component", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });
  it("should not show the cancelled banner when the PN message is not cancelled", () => {
    const { component } = renderComponent(
      generateComponentProperties(generatePnMessage())
    );
    expect(component.queryByTestId("PnCancelledMessageBanner")).toBeFalsy();
  });
  it("every attachment item should have a full opaque style when the PN message is not cancelled", () => {
    const { component } = renderComponent(
      generateComponentProperties(generatePnMessage())
    );
    const messageAttachmentComponents = component.queryAllByTestId(
      "MessageAttachmentTouchable"
    );
    expect(messageAttachmentComponents.length).toBe(2);

    messageAttachmentComponents.forEach(messageAttachmentComponent => {
      const opacity = messageAttachmentComponent?.props.style.opacity;
      expect(opacity).toBe(1.0);
    });
  });
  it("should show the cancelled banner when the PN message is cancelled", () => {
    const { component } = renderComponent(
      generateComponentProperties({
        ...generatePnMessage(),
        isCancelled: true
      })
    );
    expect(component.queryByTestId("PnCancelledMessageBanner")).toBeDefined();
  });
  it("every attachment item should have a semi-transparent style when the PN message is cancelled", () => {
    const { component } = renderComponent(
      generateComponentProperties({
        ...generatePnMessage(),
        isCancelled: true
      })
    );
    const messageAttachmentComponents = component.queryAllByTestId(
      "MessageAttachmentTouchable"
    );
    expect(messageAttachmentComponents.length).toBe(2);

    messageAttachmentComponents.forEach(messageAttachmentComponent => {
      const opacity = messageAttachmentComponent?.props.style.opacity;
      expect(opacity).toBe(0.35);
    });
  });
  it("every attachment item should handle input when the PN message not is cancelled", async () => {
    const { component } = renderComponent(
      generateComponentProperties(generatePnMessage())
    );
    const messageAttachmentComponents = component.queryAllByTestId(
      "MessageAttachmentTouchable"
    );
    expect(messageAttachmentComponents.length).toBe(2);
    await act(() => {
      messageAttachmentComponents.forEach(messageAttachmentComponent =>
        fireEvent.press(messageAttachmentComponent)
      );
    });
    expect(mockedOnAttachmentSelect).toHaveBeenCalledTimes(
      messageAttachmentComponents.length
    );
  });
  it("every attachment item should not handle input when the PN message is cancelled", async () => {
    const { component } = renderComponent(
      generateComponentProperties({ ...generatePnMessage(), isCancelled: true })
    );
    const messageAttachmentComponents = component.queryAllByTestId(
      "MessageAttachmentTouchable"
    );
    expect(messageAttachmentComponents.length).toBe(2);
    // eslint-disable-next-line sonarjs/no-identical-functions
    await act(() => {
      messageAttachmentComponents.forEach(messageAttachmentComponent =>
        fireEvent.press(messageAttachmentComponent)
      );
    });
    expect(mockedOnAttachmentSelect).toHaveBeenCalledTimes(0);
  });
});

const generateTestMessageId = () => "00000000000000000000000004" as UIMessageId;
const generateTestFiscalCode = () => "AAABBB00A00A000A";
const generatePnMessage = () =>
  ({
    iun: "731143-7-0317-8200-0",
    subject: "This is the message subject",
    senderDenomination: "Sender denomination",
    abstract: "Message abstract",
    notificationStatusHistory: [],
    recipients: [
      {
        recipientType: "-",
        taxId: generateTestFiscalCode(),
        denomination: "AaAaAa BbBbBb",
        payment: {
          noticeCode: "026773337463073118",
          creditorTaxId: "00000000009"
        }
      }
    ] as Array<NotificationRecipient>,
    attachments: [
      {
        messageId: generateTestMessageId(),
        id: "1",
        displayName: "A First Attachment",
        contentType: "application/pdf",
        category: "PN",
        resourceUrl: { href: "/resource/attachment1.pdf" }
      } as UIAttachment,
      {
        messageId: generateTestMessageId(),
        id: "2",
        displayName: "A Second Attachment",
        contentType: "application/pdf",
        category: "PN",
        resourceUrl: { href: "/resource/attachment2.pdf" }
      } as UIAttachment
    ]
  } as PNMessage);
const generateComponentProperties = (pnMessage: PNMessage) => ({
  payment: undefined,
  rptId: undefined,
  isRead: false,
  messageId: generateTestMessageId(),
  message: pnMessage,
  service: undefined
});

const renderComponent = (
  props: React.ComponentProps<typeof PnMessageDetails>
) => {
  const globalState = appReducer(undefined, applicationChangeState("active"));

  const store = createStore(appReducer, {
    ...globalState,
    features: {
      ...globalState.features
    },
    entities: {
      ...globalState.entities,
      messages: {
        ...globalState.entities.messages
      }
    },
    profile: pot.some({
      fiscal_code: generateTestFiscalCode()
    } as InitializedProfile),
    backendStatus: {
      status: O.some({
        config: {
          cgn: {
            enabled: false
          },
          fims: {
            enabled: false
          },
          pn: {
            frontend_url: ""
          }
        }
      })
    } as BackendStatusState,
    wallet: {
      payment: {
        verifica: pot.none
      }
    }
  } as any);

  return {
    component: renderScreenFakeNavRedux<GlobalState>(
      () => <PnMessageDetails {...props} />,
      PN_ROUTES.MESSAGE_DETAILS,
      {},
      store
    ),
    store
  };
};

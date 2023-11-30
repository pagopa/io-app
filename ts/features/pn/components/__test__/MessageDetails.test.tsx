import React from "react";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { act, fireEvent } from "@testing-library/react-native";
import { createStore } from "redux";
import { applicationChangeState } from "../../../../store/actions/application";
import { appReducer } from "../../../../store/reducers";
import { MessageDetails } from "../MessageDetails";
import { GlobalState } from "../../../../store/reducers/types";
import { renderScreenWithNavigationStoreContext } from "../../../../utils/testWrapper";
import PN_ROUTES from "../../navigation/routes";
import {
  UIAttachment,
  UIMessageId
} from "../../../../store/reducers/entities/messages/types";
import { PNMessage } from "../../store/types/types";
import { Download } from "../../../../store/reducers/entities/messages/downloads";
import { NotificationRecipient } from "../../../../../definitions/pn/NotificationRecipient";
import { ATTACHMENT_CATEGORY } from "../../../messages/types/attachmentCategory";

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

describe("MessageDetails component", () => {
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
      expect(opacity).toBe(0.5);
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

  it("should NOT render the F24 section if there are no multiple F24", () => {
    const { component } = renderComponent(
      generateComponentProperties(generatePnMessage())
    );
    expect(component.queryByTestId("pn-message-f24-section")).toBeFalsy();
  });
});

const generateTestMessageId = () => "00000000000000000000000004" as UIMessageId;
const generateTestFiscalCode = () => "AAABBB00A00A000A";
const generatePnMessage = (): PNMessage => ({
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
      category: ATTACHMENT_CATEGORY.DOCUMENT,
      resourceUrl: { href: "/resource/attachment1.pdf" }
    },
    {
      messageId: generateTestMessageId(),
      id: "2",
      displayName: "A Second Attachment",
      contentType: "application/pdf",
      category: ATTACHMENT_CATEGORY.DOCUMENT,
      resourceUrl: { href: "/resource/attachment2.pdf" }
    }
  ] as Array<UIAttachment>
});
const generateComponentProperties = (pnMessage: PNMessage) => ({
  payments: undefined,
  messageId: generateTestMessageId(),
  message: pnMessage,
  service: undefined
});

const renderComponent = (
  props: React.ComponentProps<typeof MessageDetails>
) => {
  const globalState = appReducer(undefined, applicationChangeState("active"));
  const store = createStore(appReducer, globalState as any);

  return {
    component: renderScreenWithNavigationStoreContext<GlobalState>(
      () => <MessageDetails {...props} />,
      PN_ROUTES.MESSAGE_DETAILS,
      {},
      store
    ),
    store
  };
};

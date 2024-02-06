import React from "react";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { act, fireEvent } from "@testing-library/react-native";
import { createStore } from "redux";
import { applicationChangeState } from "../../../../store/actions/application";
import { appReducer } from "../../../../store/reducers";
import { LegacyMessageDetails } from "../LegacyMessageDetails";
import { GlobalState } from "../../../../store/reducers/types";
import { renderScreenWithNavigationStoreContext } from "../../../../utils/testWrapper";
import PN_ROUTES from "../../navigation/routes";
import { UIMessageId } from "../../../messages/types";
import { PNMessage } from "../../store/types/types";
import { Download } from "../../../messages/store/reducers/downloads";
import { NotificationRecipient } from "../../../../../definitions/pn/NotificationRecipient";
import { ATTACHMENT_CATEGORY } from "../../../messages/types/attachmentCategory";
import { ThirdPartyAttachment } from "../../../../../definitions/backend/ThirdPartyAttachment";

const mockedOnAttachmentSelect = jest.fn();

jest.mock("../../../messages/hooks/useLegacyAttachmentDownload", () => ({
  useLegacyAttachmentDownload: (
    _attachment: ThirdPartyAttachment,
    _openPreview: (attachment: ThirdPartyAttachment) => void
  ) => ({
    onAttachmentSelect: mockedOnAttachmentSelect,
    downloadPot: { kind: "PotNone" } as pot.Pot<Download, Error>
  })
}));

describe("LegacyMessageDetails component", () => {
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
  created_at: new Date(),
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
      id: "1",
      name: "A First Attachment",
      content_type: "application/pdf",
      category: ATTACHMENT_CATEGORY.DOCUMENT,
      url: "/resource/attachment1.pdf"
    },
    {
      id: "2",
      name: "A Second Attachment",
      content_type: "application/pdf",
      category: ATTACHMENT_CATEGORY.DOCUMENT,
      url: "/resource/attachment2.pdf"
    }
  ] as Array<ThirdPartyAttachment>
});
const generateComponentProperties = (pnMessage: PNMessage) => ({
  payments: undefined,
  messageId: generateTestMessageId(),
  message: pnMessage,
  service: undefined
});

const renderComponent = (
  props: React.ComponentProps<typeof LegacyMessageDetails>
) => {
  const globalState = appReducer(undefined, applicationChangeState("active"));
  const store = createStore(appReducer, globalState as any);

  return {
    component: renderScreenWithNavigationStoreContext<GlobalState>(
      () => <LegacyMessageDetails {...props} />,
      PN_ROUTES.MESSAGE_DETAILS,
      {},
      store
    ),
    store
  };
};

import React from "react";
import { createStore } from "redux";
import { applicationChangeState } from "../../../../store/actions/application";
import { appReducer } from "../../../../store/reducers";
import { MessageDetails } from "../MessageDetails";
import { GlobalState } from "../../../../store/reducers/types";
import { renderScreenWithNavigationStoreContext } from "../../../../utils/testWrapper";
import PN_ROUTES from "../../navigation/routes";
import { UIAttachment, UIMessageId } from "../../../messages/types";
import { PNMessage } from "../../store/types/types";
import { NotificationRecipient } from "../../../../../definitions/pn/NotificationRecipient";
import { ATTACHMENT_CATEGORY } from "../../../messages/types/attachmentCategory";
import I18n from "../../../../i18n";

describe("MessageDetails component", () => {
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
});

const messageId = "00000000000000000000000004" as UIMessageId;
const fiscalCode = "AAABBB00A00A000A";
const pnMessage: PNMessage = {
  created_at: new Date(),
  iun: "731143-7-0317-8200-0",
  subject: "This is the message subject",
  senderDenomination: "Sender denomination",
  abstract: "Message abstract",
  notificationStatusHistory: [],
  recipients: [
    {
      recipientType: "-",
      taxId: fiscalCode,
      denomination: "AaAaAa BbBbBb",
      payment: {
        noticeCode: "026773337463073118",
        creditorTaxId: "00000000009"
      }
    }
  ] as Array<NotificationRecipient>,
  attachments: [
    {
      messageId,
      id: "1",
      displayName: "A First Attachment",
      contentType: "application/pdf",
      category: ATTACHMENT_CATEGORY.DOCUMENT,
      resourceUrl: { href: "/resource/attachment1.pdf" }
    },
    {
      messageId,
      id: "2",
      displayName: "A Second Attachment",
      contentType: "application/pdf",
      category: ATTACHMENT_CATEGORY.DOCUMENT,
      resourceUrl: { href: "/resource/attachment2.pdf" }
    }
  ] as Array<UIAttachment>
};
const generateComponentProperties = (pnMessage: PNMessage) => ({
  messageId,
  payments: undefined,
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

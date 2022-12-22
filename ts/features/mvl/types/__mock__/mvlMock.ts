import { CreatedMessageWithContentAndAttachments } from "../../../../../definitions/backend/CreatedMessageWithContentAndAttachments";
import { EmailAddress } from "../../../../../definitions/backend/EmailAddress";
import { message_1 } from "../../../../__mocks__/message";
import { toUIMessageDetails } from "../../../../store/reducers/entities/messages/transformers";
import { UIMessageId } from "../../../../store/reducers/entities/messages/types";
import { Mvl, MvlBody, MvlData, MvlId, MvlMetadata } from "../mvlData";
import {
  mockOtherAttachment,
  mockPdfAttachment
} from "../../../../__mocks__/attachment";

export const mvlMockId = "mockId" as UIMessageId;

export const mvlMockBody: MvlBody = {
  html:
    "<h1>This is a legal message</h1> " +
    "<h2>It contains information with legal value</h2>" +
    "<img " +
    'width="200" height="100" ' +
    'alt="IO Cat" ' +
    'style="align-self: center;" ' +
    'src="https://placekitten.com/g/200/100"' +
    "/>" +
    "This is the text of the <i>message</i> that could include some <b>additional information</b> or a <a href='https://io.italia.it/'>link</a>!\n" +
    "Lorem ipsum dolor sit amet, consectetur adipisci elit, sed do eiusmod tempor incidunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrum exercitationem ullamco laboriosam, nisi ut aliquid ex ea commodi consequatur. Duis aute irure reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
  plain:
    "This is a legal message\nIt contains information with legal value\n" +
    "This is the text of the message that could include some additional information or a link! " +
    "Lorem ipsum dolor sit amet, consectetur adipisci elit, sed do eiusmod tempor incidunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrum exercitationem ullamco laboriosam, nisi ut aliquid ex ea commodi consequatur. Duis aute irure reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur."
};

export const mvlMockMetadata: MvlMetadata = {
  id: "opec2951.20210927163605.31146.306.1.66@pec.poc.it" as MvlId,
  timestamp: new Date("2021-11-09T01:30:00.000Z"),
  subject: "Legal Message subject",
  sender: "sender@mailpec.com" as EmailAddress,
  receiver: "receiver@emailpec.com" as EmailAddress,
  cc: ["cc1@emailpec.com" as EmailAddress, "cc2@emailpec.com" as EmailAddress],
  certificates: [],
  signature: null
};

export const mvlMockData: MvlData = {
  body: mvlMockBody,
  attachments: [mockPdfAttachment, mockOtherAttachment],
  metadata: mvlMockMetadata
};

const message: CreatedMessageWithContentAndAttachments = {
  ...message_1,
  content: {
    ...message_1.content,
    due_date: undefined
  }
};

export const mvlMock: Mvl = {
  message: toUIMessageDetails(message),
  legalMessage: mvlMockData,
  id: mvlMockId
};

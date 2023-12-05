import * as pot from "@pagopa/ts-commons/lib/pot";
import { appReducer } from "../../..";
import { ThirdPartyMessageWithContent } from "../../../../../../definitions/backend/ThirdPartyMessageWithContent";
import { loadThirdPartyMessage } from "../../../../../features/messages/store/actions";
import { applicationChangeState } from "../../../../actions/application";
import {
  isThirdPartyMessageSelector,
  messageMarkdownSelector,
  messageTitleSelector,
  thirdPartyFromIdSelector
} from "../thirdPartyById";
import { UIMessageDetails, UIMessageId } from "../types";
import { loadMessageDetails } from "../../../../actions/messages";
import { ThirdPartyMessageDetails } from "../../../../../../definitions/backend/ThirdPartyMessage";

describe("thirdPartyFromIdSelector", () => {
  it("Should return pot none for an unmatching message id", () => {
    const messageId = "m1" as UIMessageId;
    const state = appReducer(undefined, applicationChangeState("active"));
    const thirdPartyMessageFromSelector = thirdPartyFromIdSelector(
      state,
      messageId
    );
    expect(thirdPartyMessageFromSelector).toStrictEqual(pot.none);
  });
  it("Should return the third party message for a matching message id", () => {
    const messageId = "m1" as UIMessageId;
    const thirdPartyMessage = {
      id: messageId as string
    } as ThirdPartyMessageWithContent;
    const loadThirdPartyMessageSuccess = loadThirdPartyMessage.success({
      id: messageId,
      content: thirdPartyMessage
    });
    const state = appReducer(undefined, loadThirdPartyMessageSuccess);
    const thirdPartyMessageFromSelector = thirdPartyFromIdSelector(
      state,
      messageId
    );
    expect(thirdPartyMessageFromSelector).toStrictEqual(
      pot.some(thirdPartyMessage)
    );
  });
});

describe("isThirdPartyMessageSelector", () => {
  it("Should return false for an unmatching message Id", () => {
    const messageId = "m1" as UIMessageId;
    const state = appReducer(undefined, applicationChangeState("active"));
    const isThirdPartyMessage = isThirdPartyMessageSelector(state, messageId);
    expect(isThirdPartyMessage).toBe(false);
  });
  it("Should return true for a matching message Id", () => {
    const messageId = "m1" as UIMessageId;
    const loadThirdPartyMessageSuccess = loadThirdPartyMessage.success({
      id: messageId,
      content: { id: messageId as string } as ThirdPartyMessageWithContent
    });
    const state = appReducer(undefined, loadThirdPartyMessageSuccess);
    const isThirdPartyMessage = isThirdPartyMessageSelector(state, messageId);
    expect(isThirdPartyMessage).toBe(true);
  });
});

describe("messageTitleSelector", () => {
  it("Should return undefined for an unmatching message Id", () => {
    const state = appReducer(undefined, applicationChangeState("active"));
    const messageTitle = messageTitleSelector(state, "m1" as UIMessageId);
    expect(messageTitle).toBeUndefined();
  });
  it("Should return undefined for a loading matching message", () => {
    const messageId = "m1" as UIMessageId;
    const loadMessageDetailsRequest = loadMessageDetails.request({
      id: messageId
    });
    const state = appReducer(undefined, loadMessageDetailsRequest);
    const messageTitle = messageTitleSelector(state, messageId);
    expect(messageTitle).toBeUndefined();
  });
  it("Should return undefined for a loading matching third party message", () => {
    const messageId = "m1" as UIMessageId;
    const loadThirdPartyMessageRequest =
      loadThirdPartyMessage.request(messageId);
    const state = appReducer(undefined, loadThirdPartyMessageRequest);
    const messageTitle = messageTitleSelector(state, messageId);
    expect(messageTitle).toBeUndefined();
  });
  it("Should return undefined for a matching loaded third party message with no details", () => {
    const messageId = "m1" as UIMessageId;
    const content = {
      id: messageId as string,
      third_party_message: {}
    } as ThirdPartyMessageWithContent;
    const loadThirdPartyMessageSuccess = loadThirdPartyMessage.success({
      id: messageId,
      content
    });
    const state = appReducer(undefined, loadThirdPartyMessageSuccess);
    const messageTitle = messageTitleSelector(state, messageId);
    expect(messageTitle).toBeUndefined();
  });
  it("Should return undefined for a matching loaded third party message with bad typed details", () => {
    const messageId = "m1" as UIMessageId;
    const content = {
      id: messageId as string,
      third_party_message: {
        details: {
          randomProperty: 5
        } as ThirdPartyMessageDetails
      }
    } as ThirdPartyMessageWithContent;
    const loadThirdPartyMessageSuccess = loadThirdPartyMessage.success({
      id: messageId,
      content
    });
    const state = appReducer(undefined, loadThirdPartyMessageSuccess);
    const messageTitle = messageTitleSelector(state, messageId);
    expect(messageTitle).toBeUndefined();
  });
  it("Should return the message title for a matching loaded third party message with proper typed details", () => {
    const messageId = "m1" as UIMessageId;
    const subject = "More than ten characters message title";
    const content = {
      id: messageId as string,
      third_party_message: {
        details: {
          subject,
          markdown:
            "This is a more than 80 characters message markdown length. The decoder needs this"
        } as ThirdPartyMessageDetails
      }
    } as ThirdPartyMessageWithContent;
    const loadThirdPartyMessageSuccess = loadThirdPartyMessage.success({
      id: messageId,
      content
    });
    const state = appReducer(undefined, loadThirdPartyMessageSuccess);
    const messageTitle = messageTitleSelector(state, messageId);
    expect(messageTitle).toBe(subject);
  });
  it("Should return the third party message title when there are both detailed and third party message", () => {
    const messageId = "m1" as UIMessageId;
    const thirdPartySubject = "More than ten characters message title";
    const content = {
      id: messageId as string,
      third_party_message: {
        details: {
          subject: thirdPartySubject,
          markdown:
            "This is a more than 80 characters message markdown length. The decoder needs this"
        } as ThirdPartyMessageDetails
      }
    } as ThirdPartyMessageWithContent;
    const loadThirdPartyMessageSuccess = loadThirdPartyMessage.success({
      id: messageId,
      content
    });
    const initialState = appReducer(undefined, loadThirdPartyMessageSuccess);
    const detailsSubject = "message subject";
    const loadMessageDetailsSuccess = loadMessageDetails.success({
      id: messageId,
      subject: detailsSubject
    } as UIMessageDetails);
    const finalState = appReducer(initialState, loadMessageDetailsSuccess);
    const messageTitle = messageTitleSelector(finalState, messageId);
    expect(messageTitle).toBe(thirdPartySubject);
  });
});

describe("messageMarkdownSelector", () => {
  it("Should return undefined for an unmatching message Id", () => {
    const state = appReducer(undefined, applicationChangeState("active"));
    const messageMarkdown = messageMarkdownSelector(state, "m1" as UIMessageId);
    expect(messageMarkdown).toBeUndefined();
  });
  it("Should return undefined for a loading matching message", () => {
    const messageId = "m1" as UIMessageId;
    const loadMessageDetailsRequest = loadMessageDetails.request({
      id: messageId
    });
    const state = appReducer(undefined, loadMessageDetailsRequest);
    const messageMarkdown = messageMarkdownSelector(state, messageId);
    expect(messageMarkdown).toBeUndefined();
  });
  it("Should return undefined for a loading matching third party message", () => {
    const messageId = "m1" as UIMessageId;
    const loadThirdPartyMessageRequest =
      loadThirdPartyMessage.request(messageId);
    const state = appReducer(undefined, loadThirdPartyMessageRequest);
    const messageMarkdown = messageMarkdownSelector(state, messageId);
    expect(messageMarkdown).toBeUndefined();
  });
  it("Should return undefined for a matching loaded third party message with no details", () => {
    const messageId = "m1" as UIMessageId;
    const content = {
      id: messageId as string,
      third_party_message: {}
    } as ThirdPartyMessageWithContent;
    const loadThirdPartyMessageSuccess = loadThirdPartyMessage.success({
      id: messageId,
      content
    });
    const state = appReducer(undefined, loadThirdPartyMessageSuccess);
    const messageMarkdown = messageMarkdownSelector(state, messageId);
    expect(messageMarkdown).toBeUndefined();
  });
  it("Should return undefined for a matching loaded third party message with bad typed details", () => {
    const messageId = "m1" as UIMessageId;
    const content = {
      id: messageId as string,
      third_party_message: {
        details: {
          randomProperty: 5
        } as ThirdPartyMessageDetails
      }
    } as ThirdPartyMessageWithContent;
    const loadThirdPartyMessageSuccess = loadThirdPartyMessage.success({
      id: messageId,
      content
    });
    const state = appReducer(undefined, loadThirdPartyMessageSuccess);
    const messageMarkdown = messageMarkdownSelector(state, messageId);
    expect(messageMarkdown).toBeUndefined();
  });
  it("Should return the message title for a matching loaded third party message with proper typed details", () => {
    const messageId = "m1" as UIMessageId;
    const markdown =
      "This is a more than 80 characters message markdown length. The decoder needs this";
    const content = {
      id: messageId as string,
      third_party_message: {
        details: {
          subject: "More than ten characters message title",
          markdown
        } as ThirdPartyMessageDetails
      }
    } as ThirdPartyMessageWithContent;
    const loadThirdPartyMessageSuccess = loadThirdPartyMessage.success({
      id: messageId,
      content
    });
    const state = appReducer(undefined, loadThirdPartyMessageSuccess);
    const messageMarkdown = messageMarkdownSelector(state, messageId);
    expect(messageMarkdown).toBe(markdown);
  });
  it("Should return the third party message title when there are both detailed and third party message", () => {
    const messageId = "m1" as UIMessageId;
    const thirdPartyMarkdown =
      "This is a more than 80 characters message markdown length. The decoder needs this";
    const content = {
      id: messageId as string,
      third_party_message: {
        details: {
          subject: "More than ten characters message title",
          markdown: thirdPartyMarkdown
        } as ThirdPartyMessageDetails
      }
    } as ThirdPartyMessageWithContent;
    const loadThirdPartyMessageSuccess = loadThirdPartyMessage.success({
      id: messageId,
      content
    });
    const initialState = appReducer(undefined, loadThirdPartyMessageSuccess);
    const detailsMarkdown = "message markdown";
    const loadMessageDetailsSuccess = loadMessageDetails.success({
      id: messageId,
      markdown: detailsMarkdown
    } as UIMessageDetails);
    const finalState = appReducer(initialState, loadMessageDetailsSuccess);
    const messageMarkdown = messageMarkdownSelector(finalState, messageId);
    expect(messageMarkdown).toBe(thirdPartyMarkdown);
  });
});

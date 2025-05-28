import * as pot from "@pagopa/ts-commons/lib/pot";
import { Action } from "redux";
import { appReducer } from "../../../../../store/reducers";
import { ThirdPartyMessageWithContent } from "../../../../../../definitions/backend/ThirdPartyMessageWithContent";
import { loadMessageDetails, loadThirdPartyMessage } from "../../actions";
import { applicationChangeState } from "../../../../../store/actions/application";
import {
  hasAttachmentsSelector,
  messageMarkdownSelector,
  messageTitleSelector,
  testable,
  ThirdPartyById,
  thirdPartyFromIdSelector,
  thirdPartyMessageAttachments
} from "../thirdPartyById";
import { UIMessageDetails, UIMessageId } from "../../../types";
import {
  ThirdPartyMessage,
  ThirdPartyMessageDetails
} from "../../../../../../definitions/backend/ThirdPartyMessage";
import { ServiceId } from "../../../../../../definitions/backend/ServiceId";
import { ThirdPartyAttachment } from "../../../../../../definitions/backend/ThirdPartyAttachment";
import { GlobalState } from "../../../../../store/reducers/types";
import { reproduceSequence } from "../../../../../utils/tests";
import { DetailsById } from "../detailsById";

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
    const loadThirdPartyMessageRequest = loadThirdPartyMessage.request({
      id: messageId,
      serviceId: "s1" as ServiceId,
      tag: "GENERIC"
    });
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
  it("should return the message title when we have the detail and third party message with bad typed details", () => {
    const messageId = "m1" as UIMessageId;
    const content = {
      id: messageId as string,
      third_party_message: {
        details: {
          randomProperty: 5
        } as ThirdPartyMessageDetails
      }
    } as ThirdPartyMessageWithContent;
    const detailsSubject = "message subject";

    const sequenceOfActions: ReadonlyArray<Action> = [
      applicationChangeState("active"),
      loadMessageDetails.success({
        id: messageId,
        subject: detailsSubject
      } as UIMessageDetails),
      loadThirdPartyMessage.success({
        id: messageId,
        content
      })
    ];
    const state: GlobalState = reproduceSequence(
      {} as GlobalState,
      appReducer,
      sequenceOfActions
    );
    const messageTitle = messageTitleSelector(state, messageId);
    expect(messageTitle).toBe(detailsSubject);
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
    const loadThirdPartyMessageRequest = loadThirdPartyMessage.request({
      id: messageId,
      serviceId: "s1" as ServiceId,
      tag: "GENERIC"
    });
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
  it("Should return the message markdown for a matching loaded third party message with proper typed details", () => {
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
  it("Should return the third party message markdown when there are both detailed and third party message", () => {
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
  it("should return the message markdown when we have the detail and third-party message with bad typed details", () => {
    const messageId = "m1" as UIMessageId;
    const content = {
      id: messageId as string,
      third_party_message: {
        details: {
          randomProperty: 5
        } as ThirdPartyMessageDetails
      }
    } as ThirdPartyMessageWithContent;
    const detailsMarkdown = "message markdown";

    const sequenceOfActions: ReadonlyArray<Action> = [
      applicationChangeState("active"),
      loadMessageDetails.success({
        id: messageId,
        subject: detailsMarkdown
      } as UIMessageDetails),
      loadThirdPartyMessage.success({
        id: messageId,
        content
      })
    ];
    const state: GlobalState = reproduceSequence(
      {} as GlobalState,
      appReducer,
      sequenceOfActions
    );
    const messageTitle = messageTitleSelector(state, messageId);
    expect(messageTitle).toBe(detailsMarkdown);
  });
});

describe("thirdPartyMessageAttachments", () => {
  it("should return an empty array on initial state", () => {
    const messageId = "01HNWRS7DP721KTC3SMCJ7G82E" as UIMessageId;
    const initialState = appReducer(
      undefined,
      applicationChangeState("active")
    );
    const attachments = thirdPartyMessageAttachments(initialState, messageId);
    expect(attachments).toBeDefined();
    expect(attachments.length).toBe(0);
  });
  it("should return an empty array on a third party message with no attachments", () => {
    const messageId = "01HNWRS7DP721KTC3SMCJ7G82E" as UIMessageId;
    const loadedThirdPartyMessage = appReducer(
      undefined,
      loadThirdPartyMessage.success({
        id: messageId,
        content: {
          third_party_message: {}
        } as ThirdPartyMessageWithContent
      })
    );
    const attachments = thirdPartyMessageAttachments(
      loadedThirdPartyMessage,
      messageId
    );
    expect(attachments).toBeDefined();
    expect(attachments.length).toBe(0);
  });
  it("should return an empty array on a third party message with empty attachments", () => {
    const messageId = "01HNWRS7DP721KTC3SMCJ7G82E" as UIMessageId;
    const loadedThirdPartyMessage = appReducer(
      undefined,
      loadThirdPartyMessage.success({
        id: messageId,
        content: {
          third_party_message: {
            attachments: []
          } as ThirdPartyMessage
        } as ThirdPartyMessageWithContent
      })
    );
    const attachments = thirdPartyMessageAttachments(
      loadedThirdPartyMessage,
      messageId
    );
    expect(attachments).toBeDefined();
    expect(attachments.length).toBe(0);
  });
  it("should return the first attachment on a third party message with just one attachment", () => {
    const messageId = "01HNWRS7DP721KTC3SMCJ7G82E" as UIMessageId;
    const thirdPartyAttachment = {
      id: "1",
      url: "https://invalid.url"
    } as ThirdPartyAttachment;
    const loadedThirdPartyMessage = appReducer(
      undefined,
      loadThirdPartyMessage.success({
        id: messageId,
        content: {
          third_party_message: {
            attachments: [thirdPartyAttachment]
          } as ThirdPartyMessage
        } as ThirdPartyMessageWithContent
      })
    );
    const attachments = thirdPartyMessageAttachments(
      loadedThirdPartyMessage,
      messageId
    );
    expect(attachments).toBeDefined();
    expect(attachments.length).toBe(1);
    expect(attachments[0]).toMatchObject(thirdPartyAttachment);
  });
});

describe("hasAttachmentsSelector", () => {
  it("should return false if there are no attachments", () => {
    const messageId = "01HNWRS7DP721KTC3SMCJ7G82E" as UIMessageId;
    const loadedThirdPartyMessage = appReducer(
      undefined,
      loadThirdPartyMessage.success({
        id: messageId,
        content: {
          third_party_message: {}
        } as ThirdPartyMessageWithContent
      })
    );
    const hasAttachments = hasAttachmentsSelector(
      loadedThirdPartyMessage,
      messageId
    );
    expect(hasAttachments).toBe(false);
  });

  it("should return true if there are attachments", () => {
    const messageId = "01HNWRS7DP721KTC3SMCJ7G82E" as UIMessageId;
    const thirdPartyAttachment = {
      id: "1",
      url: "https://invalid.url"
    } as ThirdPartyAttachment;
    const loadedThirdPartyMessage = appReducer(
      undefined,
      loadThirdPartyMessage.success({
        id: messageId,
        content: {
          third_party_message: {
            attachments: [thirdPartyAttachment]
          } as ThirdPartyMessage
        } as ThirdPartyMessageWithContent
      })
    );
    const hasAttachments = hasAttachmentsSelector(
      loadedThirdPartyMessage,
      messageId
    );
    expect(hasAttachments).toBe(true);
  });
});

describe("messageContentSelector", () => {
  const messageId = "01JKAPT00J32WEJ44NTRH05FVV" as UIMessageId;
  const remoteContentMarkdown =
    "A remote markdown which must be longer than eighty characters in order to be parsed properly";
  const remoteContentMessage = {
    id: messageId as string,
    third_party_message: {
      details: {
        subject: "The subject which must be longer than 10 characters",
        markdown: remoteContentMarkdown
      }
    } as ThirdPartyMessage
  } as ThirdPartyMessageWithContent;
  const standardMessageMarkdown = "A standard markdown";
  const standardMessage = {
    id: messageId,
    markdown: standardMessageMarkdown
  } as UIMessageDetails;
  it("should return data from third party message when both are defined", () => {
    const state = {
      entities: {
        messages: {
          detailsById: {
            [messageId]: pot.some(standardMessage)
          } as DetailsById,
          thirdPartyById: {
            [messageId]: pot.some(remoteContentMessage)
          } as ThirdPartyById
        }
      }
    } as GlobalState;

    const messageContent = testable!.messageContentSelector(
      state,
      messageId,
      input => input.markdown
    );
    expect(messageContent).toBe(remoteContentMarkdown);
  });
  it("should return data from third party message when only the third party message is defined", () => {
    const state = {
      entities: {
        messages: {
          detailsById: {},
          thirdPartyById: {
            [messageId]: pot.some(remoteContentMessage)
          } as ThirdPartyById
        }
      }
    } as GlobalState;

    const messageContent = testable!.messageContentSelector(
      state,
      messageId,
      input => input.markdown
    );
    expect(messageContent).toBe(remoteContentMarkdown);
  });
  it("should return data from standard message when only the standard message is defined", () => {
    const state = {
      entities: {
        messages: {
          detailsById: {
            [messageId]: pot.some(standardMessage)
          } as DetailsById,
          thirdPartyById: {}
        }
      }
    } as GlobalState;

    const messageContent = testable!.messageContentSelector(
      state,
      messageId,
      input => input.markdown
    );
    expect(messageContent).toBe(standardMessageMarkdown);
  });
  it("should return undefined when no message is defined", () => {
    const state = {
      entities: {
        messages: {
          detailsById: {},
          thirdPartyById: {}
        }
      }
    } as GlobalState;

    const messageContent = testable!.messageContentSelector(
      state,
      messageId,
      input => input.markdown
    );
    expect(messageContent).toBeUndefined();
  });
});

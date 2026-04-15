import * as pot from "@pagopa/ts-commons/lib/pot";
import { pipe } from "fp-ts/lib/function";
import { Action } from "redux";
import { ServiceId } from "../../../../../../definitions/backend/ServiceId";
import { ThirdPartyAttachment } from "../../../../../../definitions/backend/ThirdPartyAttachment";
import {
  ThirdPartyMessage,
  ThirdPartyMessageDetails
} from "../../../../../../definitions/backend/ThirdPartyMessage";
import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import { toSome } from "../../../../../store/reducers/IndexedByIdPot";
import { GlobalState } from "../../../../../store/reducers/types";
import { reproduceSequence } from "../../../../../utils/tests";
import {
  populateStoresWithEphemeralAarMessageData,
  terminateAarFlow
} from "../../../../pn/aar/store/actions";
import { mockEphemeralAarMessageDataActionPayload } from "../../../../pn/aar/utils/testUtils";
import { UIMessageDetails } from "../../../types";
import {
  ThirdPartyMessageUnion,
  thirdPartyKind
} from "../../../types/thirdPartyById";
import { loadMessageDetails, loadThirdPartyMessage } from "../../actions";
import { DetailsById } from "../detailsById";
import {
  ThirdPartyById,
  hasAttachmentsSelector,
  messageMarkdownSelector,
  messageTitleSelector,
  testable,
  thirdPartyByIdReducer,
  thirdPartyFromIdSelector,
  thirdPartyMessageAttachments,
  thirdPartyMessageSelector
} from "../thirdPartyById";

const thirdPartyKindsMock = Object.values(thirdPartyKind);

describe("thirdPartyFromIdSelector", () => {
  it("Should return pot none for an unmatching message id", () => {
    const messageId = "m1";
    const state = appReducer(undefined, applicationChangeState("active"));
    const thirdPartyMessageFromSelector = thirdPartyFromIdSelector(
      state,
      messageId
    );
    expect(thirdPartyMessageFromSelector).toStrictEqual(pot.none);
  });
  thirdPartyKindsMock.forEach(kind =>
    it(`Should return the third party message with kind='${kind}' for a matching message id`, () => {
      const messageId = "m1";
      const thirdPartyMessage = {
        kind,
        id: messageId as string
      } as ThirdPartyMessageUnion;
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
    })
  );
});

describe("messageTitleSelector", () => {
  it("Should return undefined for an unmatching message Id", () => {
    const state = appReducer(undefined, applicationChangeState("active"));
    const messageTitle = messageTitleSelector(state, "m1");
    expect(messageTitle).toBeUndefined();
  });
  it("Should return undefined for a loading matching message", () => {
    const messageId = "m1";
    const loadMessageDetailsRequest = loadMessageDetails.request({
      id: messageId
    });
    const state = appReducer(undefined, loadMessageDetailsRequest);
    const messageTitle = messageTitleSelector(state, messageId);
    expect(messageTitle).toBeUndefined();
  });
  it("Should return undefined for a loading matching third party message", () => {
    const messageId = "m1";
    const loadThirdPartyMessageRequest = loadThirdPartyMessage.request({
      id: messageId,
      serviceId: "s1" as ServiceId,
      tag: "GENERIC"
    });
    const state = appReducer(undefined, loadThirdPartyMessageRequest);
    const messageTitle = messageTitleSelector(state, messageId);
    expect(messageTitle).toBeUndefined();
  });
  thirdPartyKindsMock.forEach(kind =>
    it(`Should return undefined for a matching loaded third party message with no details and kind='${kind}'`, () => {
      const messageId = "m1";
      const content = {
        kind,
        id: messageId as string,
        third_party_message: {}
      } as ThirdPartyMessageUnion;
      const loadThirdPartyMessageSuccess = loadThirdPartyMessage.success({
        id: messageId,
        content
      });
      const state = appReducer(undefined, loadThirdPartyMessageSuccess);
      const messageTitle = messageTitleSelector(state, messageId);
      expect(messageTitle).toBeUndefined();
    })
  );
  thirdPartyKindsMock.forEach(kind =>
    it(`Should return undefined for a matching loaded third party message with bad typed details and kind='${kind}'`, () => {
      const messageId = "m1";
      const content = {
        kind,
        id: messageId as string,
        third_party_message: {
          details: {
            randomProperty: 5
          } as ThirdPartyMessageDetails
        }
      } as ThirdPartyMessageUnion;
      const loadThirdPartyMessageSuccess = loadThirdPartyMessage.success({
        id: messageId,
        content
      });
      const state = appReducer(undefined, loadThirdPartyMessageSuccess);
      const messageTitle = messageTitleSelector(state, messageId);
      expect(messageTitle).toBeUndefined();
    })
  );
  thirdPartyKindsMock.forEach(kind =>
    it(`Should return the message title for a matching loaded third party message with proper typed details and kind='${kind}'`, () => {
      const messageId = "m1";
      const subject = "More than ten characters message title";
      const content = {
        kind,
        id: messageId as string,
        third_party_message: {
          details: {
            subject,
            markdown:
              "This is a more than 80 characters message markdown length. The decoder needs this"
          } as ThirdPartyMessageDetails
        }
      } as ThirdPartyMessageUnion;
      const loadThirdPartyMessageSuccess = loadThirdPartyMessage.success({
        id: messageId,
        content
      });
      const state = appReducer(undefined, loadThirdPartyMessageSuccess);
      const messageTitle = messageTitleSelector(state, messageId);
      expect(messageTitle).toBe(subject);
    })
  );
  thirdPartyKindsMock.forEach(kind =>
    it(`Should return the third party message title when there are both detailed and third party message and kind='${kind}'`, () => {
      const messageId = "m1";
      const thirdPartySubject = "More than ten characters message title";
      const content = {
        kind,
        id: messageId as string,
        third_party_message: {
          details: {
            subject: thirdPartySubject,
            markdown:
              "This is a more than 80 characters message markdown length. The decoder needs this"
          } as ThirdPartyMessageDetails
        }
      } as ThirdPartyMessageUnion;
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
    })
  );
  thirdPartyKindsMock.forEach(kind =>
    it(`should return the message title when we have the detail and third party message with bad typed details and kind='${kind}'`, () => {
      const messageId = "m1";
      const content = {
        kind,
        id: messageId as string,
        third_party_message: {
          details: {
            randomProperty: 5
          } as ThirdPartyMessageDetails
        }
      } as ThirdPartyMessageUnion;
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
    })
  );
});

describe("messageMarkdownSelector", () => {
  it("Should return undefined for an unmatching message Id", () => {
    const state = appReducer(undefined, applicationChangeState("active"));
    const messageMarkdown = messageMarkdownSelector(state, "m1");
    expect(messageMarkdown).toBeUndefined();
  });
  it("Should return undefined for a loading matching message", () => {
    const messageId = "m1";
    const loadMessageDetailsRequest = loadMessageDetails.request({
      id: messageId
    });
    const state = appReducer(undefined, loadMessageDetailsRequest);
    const messageMarkdown = messageMarkdownSelector(state, messageId);
    expect(messageMarkdown).toBeUndefined();
  });
  it("Should return undefined for a loading matching third party message", () => {
    const messageId = "m1";
    const loadThirdPartyMessageRequest = loadThirdPartyMessage.request({
      id: messageId,
      serviceId: "s1" as ServiceId,
      tag: "GENERIC"
    });
    const state = appReducer(undefined, loadThirdPartyMessageRequest);
    const messageMarkdown = messageMarkdownSelector(state, messageId);
    expect(messageMarkdown).toBeUndefined();
  });
  thirdPartyKindsMock.forEach(kind =>
    it(`Should return undefined for a matching loaded third party message with no details and kind='${kind}'`, () => {
      const messageId = "m1";
      const content = {
        kind,
        id: messageId as string,
        third_party_message: {}
      } as ThirdPartyMessageUnion;
      const loadThirdPartyMessageSuccess = loadThirdPartyMessage.success({
        id: messageId,
        content
      });
      const state = appReducer(undefined, loadThirdPartyMessageSuccess);
      const messageMarkdown = messageMarkdownSelector(state, messageId);
      expect(messageMarkdown).toBeUndefined();
    })
  );
  thirdPartyKindsMock.forEach(kind =>
    it(`Should return undefined for a matching loaded third party message with bad typed details and kind='${kind}'`, () => {
      const messageId = "m1";
      const content = {
        kind,
        id: messageId as string,
        third_party_message: {
          details: {
            randomProperty: 5
          } as ThirdPartyMessageDetails
        }
      } as ThirdPartyMessageUnion;
      const loadThirdPartyMessageSuccess = loadThirdPartyMessage.success({
        id: messageId,
        content
      });
      const state = appReducer(undefined, loadThirdPartyMessageSuccess);
      const messageMarkdown = messageMarkdownSelector(state, messageId);
      expect(messageMarkdown).toBeUndefined();
    })
  );
  thirdPartyKindsMock.forEach(kind =>
    it(`Should return the message markdown for a matching loaded third party message with proper typed details and kind='${kind}'`, () => {
      const messageId = "m1";
      const markdown =
        "This is a more than 80 characters message markdown length. The decoder needs this";
      const content = {
        kind,
        id: messageId as string,
        third_party_message: {
          details: {
            subject: "More than ten characters message title",
            markdown
          } as ThirdPartyMessageDetails
        }
      } as ThirdPartyMessageUnion;
      const loadThirdPartyMessageSuccess = loadThirdPartyMessage.success({
        id: messageId,
        content
      });
      const state = appReducer(undefined, loadThirdPartyMessageSuccess);
      const messageMarkdown = messageMarkdownSelector(state, messageId);
      expect(messageMarkdown).toBe(markdown);
    })
  );
  thirdPartyKindsMock.forEach(kind =>
    it(`Should return the third party message markdown when there are both detailed and third party message and kind='${kind}'`, () => {
      const messageId = "m1";
      const thirdPartyMarkdown =
        "This is a more than 80 characters message markdown length. The decoder needs this";
      const content = {
        kind,
        id: messageId as string,
        third_party_message: {
          details: {
            subject: "More than ten characters message title",
            markdown: thirdPartyMarkdown
          } as ThirdPartyMessageDetails
        }
      } as ThirdPartyMessageUnion;
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
    })
  );
  thirdPartyKindsMock.forEach(kind =>
    it(`should return the message markdown when we have the detail and third-party message with bad typed details and kind='${kind}'`, () => {
      const messageId = "m1";
      const content = {
        kind,
        id: messageId as string,
        third_party_message: {
          details: {
            randomProperty: 5
          } as ThirdPartyMessageDetails
        }
      } as ThirdPartyMessageUnion;
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
    })
  );
});

describe("thirdPartyMessageAttachments", () => {
  it("should return an empty array on initial state", () => {
    const messageId = "01HNWRS7DP721KTC3SMCJ7G82E";
    const initialState = appReducer(
      undefined,
      applicationChangeState("active")
    );
    const attachments = thirdPartyMessageAttachments(initialState, messageId);
    expect(attachments).toBeDefined();
    expect(attachments.length).toBe(0);
  });
  thirdPartyKindsMock.forEach(kind =>
    it(`should return an empty array on a third party message with no attachments and kind='${kind}'`, () => {
      const messageId = "01HNWRS7DP721KTC3SMCJ7G82E";
      const loadedThirdPartyMessage = appReducer(
        undefined,
        loadThirdPartyMessage.success({
          id: messageId,
          content: {
            kind,
            third_party_message: {}
          } as ThirdPartyMessageUnion
        })
      );
      const attachments = thirdPartyMessageAttachments(
        loadedThirdPartyMessage,
        messageId
      );
      expect(attachments).toBeDefined();
      expect(attachments.length).toBe(0);
    })
  );
  thirdPartyKindsMock.forEach(kind =>
    it(`should return an empty array on a third party message with empty attachments and kind='${kind}'`, () => {
      const messageId = "01HNWRS7DP721KTC3SMCJ7G82E";
      const loadedThirdPartyMessage = appReducer(
        undefined,
        loadThirdPartyMessage.success({
          id: messageId,
          content: {
            kind,
            third_party_message: {
              attachments: []
            } as ThirdPartyMessage
          } as ThirdPartyMessageUnion
        })
      );
      const attachments = thirdPartyMessageAttachments(
        loadedThirdPartyMessage,
        messageId
      );
      expect(attachments).toBeDefined();
      expect(attachments.length).toBe(0);
    })
  );
  thirdPartyKindsMock.forEach(kind =>
    it(`should return the first attachment on a third party message with just one attachment kind='${kind}'`, () => {
      const messageId = "01HNWRS7DP721KTC3SMCJ7G82E";
      const thirdPartyAttachment = {
        id: "1",
        url: "https://invalid.url"
      } as ThirdPartyAttachment;
      const loadedThirdPartyMessage = appReducer(
        undefined,
        loadThirdPartyMessage.success({
          id: messageId,
          content: {
            kind,
            third_party_message: {
              attachments: [thirdPartyAttachment]
            } as ThirdPartyMessage
          } as ThirdPartyMessageUnion
        })
      );
      const attachments = thirdPartyMessageAttachments(
        loadedThirdPartyMessage,
        messageId
      );
      expect(attachments).toBeDefined();
      expect(attachments.length).toBe(1);
      expect(attachments[0]).toMatchObject(thirdPartyAttachment);
    })
  );
});

describe("hasAttachmentsSelector", () => {
  thirdPartyKindsMock.forEach(kind =>
    it(`should return false if there are no attachments and kind='${kind}'`, () => {
      const messageId = "01HNWRS7DP721KTC3SMCJ7G82E";
      const loadedThirdPartyMessage = appReducer(
        undefined,
        loadThirdPartyMessage.success({
          id: messageId,
          content: {
            kind,
            third_party_message: {}
          } as ThirdPartyMessageUnion
        })
      );
      const hasAttachments = hasAttachmentsSelector(
        loadedThirdPartyMessage,
        messageId
      );
      expect(hasAttachments).toBe(false);
    })
  );

  thirdPartyKindsMock.forEach(kind =>
    it(`should return true if there are attachments and kind='${kind}'`, () => {
      const messageId = "01HNWRS7DP721KTC3SMCJ7G82E";
      const thirdPartyAttachment = {
        id: "1",
        url: "https://invalid.url"
      } as ThirdPartyAttachment;
      const loadedThirdPartyMessage = appReducer(
        undefined,
        loadThirdPartyMessage.success({
          id: messageId,
          content: {
            kind,
            third_party_message: {
              attachments: [thirdPartyAttachment]
            } as ThirdPartyMessage
          } as ThirdPartyMessageUnion
        })
      );
      const hasAttachments = hasAttachmentsSelector(
        loadedThirdPartyMessage,
        messageId
      );
      expect(hasAttachments).toBe(true);
    })
  );
});

describe("messageContentSelector", () => {
  const messageId = "01JKAPT00J32WEJ44NTRH05FVV";
  const remoteContentMarkdown =
    "A remote markdown which must be longer than eighty characters in order to be parsed properly";
  const standardMessageMarkdown = "A standard markdown";
  const standardMessage = {
    id: messageId,
    markdown: standardMessageMarkdown
  } as UIMessageDetails;
  thirdPartyKindsMock.forEach(kind => {
    const remoteContentMessage = {
      kind,
      id: messageId as string,
      third_party_message: {
        details: {
          subject: "The subject which must be longer than 10 characters",
          markdown: remoteContentMarkdown
        }
      } as ThirdPartyMessage
    } as ThirdPartyMessageUnion;
    it(`should return data from third party message when both are defined and kind='${kind}'`, () => {
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
    it(`should return data from third party message when only the third party message is defined and kind='${kind}'`, () => {
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

describe("thirdPartyMessageSelector", () => {
  const fakeThirdPartyMessage = {} as ThirdPartyMessageUnion;
  [
    undefined,
    pot.none,
    pot.noneLoading,
    pot.noneUpdating(fakeThirdPartyMessage),
    pot.noneError(Error("")),
    pot.some(fakeThirdPartyMessage),
    pot.someLoading(fakeThirdPartyMessage),
    pot.someUpdating(fakeThirdPartyMessage, fakeThirdPartyMessage),
    pot.someError(fakeThirdPartyMessage, Error(""))
  ].forEach(input => {
    const shouldReturnSomething = input != null && pot.isSome(input);
    it(`should return ${
      shouldReturnSomething ? "the third party message" : "undefined"
    } for a matching third party id which value is ${JSON.stringify(
      input
    )}`, () => {
      const state = {
        entities: {
          messages: {
            thirdPartyById: {
              m1: input
            }
          }
        }
      } as unknown as GlobalState;
      const result = thirdPartyMessageSelector(state, "m1");
      expect(result).toEqual(
        shouldReturnSomething ? fakeThirdPartyMessage : undefined
      );
    });
  });
  it(`should return 'undefined' for an unmatching third party id`, () => {
    const state = {
      entities: {
        messages: {
          thirdPartyById: {
            m1: pot.some({})
          }
        }
      }
    } as unknown as GlobalState;
    const result = thirdPartyMessageSelector(state, "m2");
    expect(result).toBeUndefined();
  });
});

describe("reducer", () => {
  it("should handle populateStoresWithEphemeralAarMessageData action", () => {
    const action = populateStoresWithEphemeralAarMessageData(
      mockEphemeralAarMessageDataActionPayload
    );
    const { iun, mandateId, subject, markdown, fiscalCode } =
      mockEphemeralAarMessageDataActionPayload;
    const nextState = appReducer(undefined, action).entities.messages
      .thirdPartyById;
    expect(nextState[iun]).toBeDefined();
    expect(pot.isSome(nextState[iun]!)).toBe(true);
    const value = pot.toUndefined(nextState[iun]!) as Extract<
      ThirdPartyMessageUnion,
      { kind: "AAR" }
    >;
    expect(value?.kind).toBe("AAR");
    expect(value.mandateId).toBe(mandateId);
    expect(value?.content.subject).toBe(subject);
    expect(value?.content.markdown).toBe(markdown);
    expect(value?.fiscal_code).toBe(fiscalCode);
  });

  it("should handle terminateAarFlow action and remove ephemeral AAR messages", () => {
    const { iun } = mockEphemeralAarMessageDataActionPayload;
    const populateAction = populateStoresWithEphemeralAarMessageData(
      mockEphemeralAarMessageDataActionPayload
    );
    const populatedState = thirdPartyByIdReducer(undefined, populateAction);

    const messageIdGENERIC = "messageIdGENERIC";
    const populatedStateWithNonAarMessage: ThirdPartyById = toSome(
      messageIdGENERIC,
      populatedState,
      pipe(populatedState[iun]!, pot.toUndefined, data => ({
        ...data!,
        kind: "TPM"
      }))
    );

    const clearAction = terminateAarFlow({ messageId: iun });
    const clearedState = thirdPartyByIdReducer(
      populatedStateWithNonAarMessage,
      clearAction
    );

    expect(populatedState[iun]).toBeDefined();
    expect(clearedState[iun]).toBeUndefined();
    expect(clearedState[messageIdGENERIC]).toBeDefined();
    expect(pot.isSome(clearedState[messageIdGENERIC]!)).toBe(true);
  });
});

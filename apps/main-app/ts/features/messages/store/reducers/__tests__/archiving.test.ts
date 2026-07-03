import { GlobalState } from "../../../../../store/reducers/types";
import { Action } from "../../../../../store/actions/types";
import { MessageListCategory } from "../../../types/messageListCategory";
import {
  interruptMessageArchivingProcessingAction,
  removeScheduledMessageArchivingAction,
  resetMessageArchivingAction,
  startProcessingMessageArchivingAction,
  toggleScheduledMessageArchivingAction
} from "../../actions/archiving";
import {
  Archiving,
  INITIAL_STATE,
  ProcessingResult,
  archivingReducer,
  areThereEntriesForShownMessageListCategorySelector,
  isArchivingDisabledSelector,
  isArchivingInProcessingModeSelector,
  isArchivingInSchedulingModeSelector,
  nextQueuedMessageDataUncachedSelector,
  processingResultReasonSelector,
  processingResultTypeSelector,
  isMessageScheduledForArchivingSelector
} from "../archiving";

const messageId = "01K1QB59HSR7JX4TV5FEAR7PB6";
const otherMessageId = "01K1QB67E8VCZBMS0JNQD6PYPE";
const processingResult: ProcessingResult = {
  reason: "Processing completed",
  type: "success"
};

const stateWithArchiving = (archiving: Archiving) =>
  ({
    entities: {
      messages: {
        archiving
      }
    }
  }) as GlobalState;

describe("archivingReducer", () => {
  it("should return the initial state when no state is provided", () => {
    const output = archivingReducer(undefined, {} as Action);

    expect(output).toEqual(INITIAL_STATE);
  });

  it("should schedule a message from inbox to archive", () => {
    const output = archivingReducer(
      INITIAL_STATE,
      toggleScheduledMessageArchivingAction({
        fromInboxToArchive: true,
        messageId
      })
    );

    expect(output).toEqual({
      ...INITIAL_STATE,
      fromInboxToArchive: new Set([messageId]),
      status: "enabled"
    });
  });

  it("should schedule a message from archive to inbox", () => {
    const output = archivingReducer(
      INITIAL_STATE,
      toggleScheduledMessageArchivingAction({
        fromInboxToArchive: false,
        messageId
      })
    );

    expect(output).toEqual({
      ...INITIAL_STATE,
      fromArchiveToInbox: new Set([messageId]),
      status: "enabled"
    });
  });

  it("should unschedule a message when toggling the same inbox-to-archive entry twice", () => {
    const scheduledState = archivingReducer(
      INITIAL_STATE,
      toggleScheduledMessageArchivingAction({
        fromInboxToArchive: true,
        messageId
      })
    );

    const output = archivingReducer(
      scheduledState,
      toggleScheduledMessageArchivingAction({
        fromInboxToArchive: true,
        messageId
      })
    );

    expect(output).toEqual({
      ...INITIAL_STATE,
      status: "enabled"
    });
  });

  it("should ignore toggle requests while processing", () => {
    const processingState: Archiving = {
      ...INITIAL_STATE,
      fromInboxToArchive: new Set([otherMessageId]),
      status: "processing"
    };

    const output = archivingReducer(
      processingState,
      toggleScheduledMessageArchivingAction({
        fromInboxToArchive: true,
        messageId
      })
    );

    expect(output).toBe(processingState);
  });

  it("should remove a scheduled inbox-to-archive message", () => {
    const state: Archiving = {
      ...INITIAL_STATE,
      fromArchiveToInbox: new Set([otherMessageId]),
      fromInboxToArchive: new Set([messageId, otherMessageId]),
      status: "enabled"
    };

    const output = archivingReducer(
      state,
      removeScheduledMessageArchivingAction({
        fromInboxToArchive: true,
        messageId
      })
    );

    expect(output).toEqual({
      ...state,
      fromInboxToArchive: new Set([otherMessageId])
    });
  });

  it("should remove a scheduled archive-to-inbox message", () => {
    const state: Archiving = {
      ...INITIAL_STATE,
      fromArchiveToInbox: new Set([messageId, otherMessageId]),
      fromInboxToArchive: new Set([otherMessageId]),
      status: "enabled"
    };

    const output = archivingReducer(
      state,
      removeScheduledMessageArchivingAction({
        fromInboxToArchive: false,
        messageId
      })
    );

    expect(output).toEqual({
      ...state,
      fromArchiveToInbox: new Set([otherMessageId])
    });
  });

  it("should start processing scheduled messages and clear any previous result", () => {
    const state: Archiving = {
      ...INITIAL_STATE,
      fromInboxToArchive: new Set([messageId]),
      processingResult,
      status: "enabled"
    };

    const output = archivingReducer(
      state,
      startProcessingMessageArchivingAction()
    );

    expect(output).toEqual({
      ...state,
      processingResult: undefined,
      status: "processing"
    });
  });

  it("should interrupt processing with the provided result", () => {
    const state: Archiving = {
      ...INITIAL_STATE,
      fromInboxToArchive: new Set([messageId]),
      status: "processing"
    };

    const output = archivingReducer(
      state,
      interruptMessageArchivingProcessingAction(processingResult)
    );

    expect(output).toEqual({
      ...state,
      processingResult,
      status: "enabled"
    });
  });

  it("should ignore interruption requests when not processing", () => {
    const state: Archiving = {
      ...INITIAL_STATE,
      fromInboxToArchive: new Set([messageId]),
      status: "enabled"
    };

    const output = archivingReducer(
      state,
      interruptMessageArchivingProcessingAction(processingResult)
    );

    expect(output).toBe(state);
  });

  it("should reset scheduled messages while preserving the provided result", () => {
    const state: Archiving = {
      ...INITIAL_STATE,
      fromArchiveToInbox: new Set([otherMessageId]),
      fromInboxToArchive: new Set([messageId]),
      status: "enabled"
    };

    const output = archivingReducer(
      state,
      resetMessageArchivingAction(processingResult)
    );

    expect(output).toEqual({
      ...INITIAL_STATE,
      processingResult
    });
  });
});

describe("archiving status selectors", () => {
  [
    {
      status: "disabled" as const,
      expectedDisabled: true,
      expectedScheduling: false,
      expectedProcessing: false
    },
    {
      status: "enabled" as const,
      expectedDisabled: false,
      expectedScheduling: true,
      expectedProcessing: false
    },
    {
      status: "processing" as const,
      expectedDisabled: false,
      expectedScheduling: false,
      expectedProcessing: true
    }
  ].forEach(
    ({ status, expectedDisabled, expectedScheduling, expectedProcessing }) => {
      it(`should return expected status flags when archiving is ${status}`, () => {
        const state = stateWithArchiving({
          ...INITIAL_STATE,
          status
        });

        expect(isArchivingDisabledSelector(state)).toBe(expectedDisabled);
        expect(isArchivingInSchedulingModeSelector(state)).toBe(
          expectedScheduling
        );
        expect(isArchivingInProcessingModeSelector(state)).toBe(
          expectedProcessing
        );
      });
    }
  );
});

describe("isMessageScheduledForArchivingSelector", () => {
  [
    {
      name: "from inbox to archive",
      archiving: {
        ...INITIAL_STATE,
        fromInboxToArchive: new Set([messageId])
      }
    },
    {
      name: "from archive to inbox",
      archiving: {
        ...INITIAL_STATE,
        fromArchiveToInbox: new Set([messageId])
      }
    }
  ].forEach(({ name, archiving }) => {
    it(`should return false when archiving is disabled even if the message is scheduled ${name}`, () => {
      const state = stateWithArchiving({
        ...archiving,
        status: "disabled"
      });

      const output = isMessageScheduledForArchivingSelector(state, messageId);

      expect(output).toBe(false);
    });

    it(`should return true when archiving is enabled and the message is scheduled ${name}`, () => {
      const state = stateWithArchiving({
        ...archiving,
        status: "enabled"
      });

      const output = isMessageScheduledForArchivingSelector(state, messageId);

      expect(output).toBe(true);
    });
  });

  it("should return true when archiving is processing and the message is scheduled", () => {
    const state = stateWithArchiving({
      ...INITIAL_STATE,
      fromInboxToArchive: new Set([messageId]),
      status: "processing"
    });

    const output = isMessageScheduledForArchivingSelector(state, messageId);

    expect(output).toBe(true);
  });

  it("should return false when archiving is enabled and the message is not scheduled", () => {
    const state = stateWithArchiving({
      ...INITIAL_STATE,
      fromInboxToArchive: new Set([otherMessageId]),
      status: "enabled"
    });

    const output = isMessageScheduledForArchivingSelector(state, messageId);

    expect(output).toBe(false);
  });
});

describe("areThereEntriesForShownMessageListCategorySelector", () => {
  [
    {
      name: "inbox category with inbox-to-archive entries",
      category: "INBOX" as MessageListCategory,
      archiving: {
        ...INITIAL_STATE,
        fromInboxToArchive: new Set([messageId])
      },
      expected: true
    },
    {
      name: "inbox category with only archive-to-inbox entries",
      category: "INBOX" as MessageListCategory,
      archiving: {
        ...INITIAL_STATE,
        fromArchiveToInbox: new Set([messageId])
      },
      expected: false
    },
    {
      name: "archive category with archive-to-inbox entries",
      category: "ARCHIVE" as MessageListCategory,
      archiving: {
        ...INITIAL_STATE,
        fromArchiveToInbox: new Set([messageId])
      },
      expected: true
    },
    {
      name: "archive category with only inbox-to-archive entries",
      category: "ARCHIVE" as MessageListCategory,
      archiving: {
        ...INITIAL_STATE,
        fromInboxToArchive: new Set([messageId])
      },
      expected: false
    }
  ].forEach(({ name, category, archiving, expected }) => {
    it(`should return ${expected} for ${name}`, () => {
      const state = stateWithArchiving({
        ...archiving,
        status: "enabled"
      });

      const output = areThereEntriesForShownMessageListCategorySelector(
        state,
        category
      );

      expect(output).toBe(expected);
    });
  });

  it("should return true when the shown category has entries even if archiving is disabled", () => {
    const state = stateWithArchiving({
      ...INITIAL_STATE,
      fromInboxToArchive: new Set([messageId]),
      status: "disabled"
    });

    const output = areThereEntriesForShownMessageListCategorySelector(
      state,
      "INBOX"
    );

    expect(output).toBe(true);
  });
});

describe("nextQueuedMessageDataUncachedSelector", () => {
  it("should return undefined when there are no queued messages", () => {
    const state = stateWithArchiving(INITIAL_STATE);

    const output = nextQueuedMessageDataUncachedSelector(state);

    expect(output).toBeUndefined();
  });

  it("should return the first inbox-to-archive queued message before archive-to-inbox messages", () => {
    const state = stateWithArchiving({
      ...INITIAL_STATE,
      fromArchiveToInbox: new Set([otherMessageId]),
      fromInboxToArchive: new Set([messageId]),
      status: "enabled"
    });

    const output = nextQueuedMessageDataUncachedSelector(state);

    expect(output).toEqual({
      archiving: true,
      messageId
    });
  });

  it("should return the first archive-to-inbox queued message when there are no inbox-to-archive messages", () => {
    const state = stateWithArchiving({
      ...INITIAL_STATE,
      fromArchiveToInbox: new Set([otherMessageId, messageId]),
      status: "enabled"
    });

    const output = nextQueuedMessageDataUncachedSelector(state);

    expect(output).toEqual({
      archiving: false,
      messageId: otherMessageId
    });
  });
});

describe("processing result selectors", () => {
  it("should return undefined when there is no processing result", () => {
    const state = stateWithArchiving(INITIAL_STATE);

    expect(processingResultTypeSelector(state)).toBeUndefined();
    expect(processingResultReasonSelector(state)).toBeUndefined();
  });

  it("should return the processing result fields", () => {
    const state = stateWithArchiving({
      ...INITIAL_STATE,
      processingResult
    });

    expect(processingResultTypeSelector(state)).toBe(processingResult.type);
    expect(processingResultReasonSelector(state)).toBe(processingResult.reason);
  });
});

/* eslint-disable sonarjs/no-nested-switch */
import { ActionType } from "typesafe-actions";
import { TagEnum } from "../../../../../../definitions/backend/MessageCategoryBase";
import { TagEnum as PaymentTagEnum } from "../../../../../../definitions/backend/MessageCategoryPayment";
import { TagEnum as SENDTagEnum } from "../../../../../../definitions/backend/MessageCategoryPN";
import {
  errorPreconditionStatusAction,
  idlePreconditionStatusAction,
  loadingContentPreconditionStatusAction,
  retrievingDataPreconditionStatusAction,
  scheduledPreconditionStatusAction,
  shownPreconditionStatusAction,
  toErrorPayload,
  toIdlePayload,
  toLoadingContentPayload,
  toRetrievingDataPayload,
  toScheduledPayload,
  toShownPayload,
  toUpdateRequiredPayload,
  updateRequiredPreconditionStatusAction
} from "../../actions/preconditions";
import {
  MessagePreconditionStatus,
  foldPreconditionStatus,
  preconditionReducer,
  preconditionsCategoryTagSelector,
  preconditionsContentMarkdownSelector,
  preconditionsContentSelector,
  preconditionsFooterSelector,
  preconditionsMessageIdSelector,
  preconditionsRequireAppUpdateSelector,
  preconditionsTitleContentSelector,
  preconditionsTitleSelector,
  shouldPresentPreconditionsBottomSheetSelector,
  toErrorMPS,
  toIdleMPS,
  toLoadingContentMPS,
  toRetrievingDataMPS,
  toScheduledMPS,
  toShownMPS,
  toUpdateRequiredMPS
} from "../messagePrecondition";
import { GlobalState } from "../../../../../store/reducers/types";
import * as backendStatus from "../../../../../store/reducers/backendStatus/remoteConfig";
import { MessageCategory } from "../../../../../../definitions/backend/MessageCategory";

const messageId = "01J1FJADCJ53SN4A11J3TBSKQE";
const categoryTag = TagEnum.GENERIC;
const errorReason = "An error reason";
const content = {
  title: "A title",
  markdown: "A markdown"
};
const messagePreconditionStatusesGenerator = (
  inputCategoryTag: MessageCategory["tag"]
) => [
  toErrorMPS(messageId, inputCategoryTag, errorReason),
  toIdleMPS(),
  toLoadingContentMPS(messageId, inputCategoryTag, content),
  toRetrievingDataMPS(messageId, inputCategoryTag),
  toScheduledMPS(messageId, inputCategoryTag),
  toShownMPS(messageId, inputCategoryTag, content),
  toUpdateRequiredMPS()
];

// eslint-disable-next-line complexity
const computeExpectedOutput = (
  fromStatus: MessagePreconditionStatus,
  withAction: ActionType<
    | typeof errorPreconditionStatusAction
    | typeof idlePreconditionStatusAction
    | typeof loadingContentPreconditionStatusAction
    | typeof retrievingDataPreconditionStatusAction
    | typeof scheduledPreconditionStatusAction
    | typeof shownPreconditionStatusAction
    | typeof updateRequiredPreconditionStatusAction
  >
) => {
  switch (fromStatus.state) {
    case "error":
      switch (withAction.type) {
        case "TO_IDLE_PRECONDITION_STATUS":
          return toIdleMPS();
        case "TO_RETRIEVING_DATA_PRECONDITION_STATUS":
          return toRetrievingDataMPS(
            fromStatus.messageId,
            fromStatus.categoryTag
          );
      }
      break;
    case "idle":
      switch (withAction.type) {
        case "TO_SCHEDULED_PRECONDITION_STATUS":
          return toScheduledMPS(
            withAction.payload.messageId,
            withAction.payload.categoryTag
          );
      }
      break;
    case "loadingContent":
      switch (withAction.type) {
        case "TO_IDLE_PRECONDITION_STATUS":
          return toIdleMPS();
        case "TO_ERROR_PRECONDITION_STATUS":
          return toErrorMPS(
            fromStatus.messageId,
            fromStatus.categoryTag,
            withAction.payload.reason
          );
        case "TO_SHOWN_PRECONDITION_STATUS":
          return toShownMPS(
            fromStatus.messageId,
            fromStatus.categoryTag,
            fromStatus.content
          );
      }
      break;
    case "retrievingData":
      switch (withAction.type) {
        case "TO_IDLE_PRECONDITION_STATUS":
          return toIdleMPS();
        case "TO_ERROR_PRECONDITION_STATUS":
          return toErrorMPS(
            fromStatus.messageId,
            fromStatus.categoryTag,
            withAction.payload.reason
          );
        case "TO_LOADING_CONTENT_PRECONDITION_STATUS":
          return toLoadingContentMPS(
            fromStatus.messageId,
            fromStatus.categoryTag,
            withAction.payload.content
          );
      }
      break;
    case "scheduled":
      switch (withAction.type) {
        case "TO_RETRIEVING_DATA_PRECONDITION_STATUS":
          return toRetrievingDataMPS(
            fromStatus.messageId,
            fromStatus.categoryTag
          );
        case "TO_UPDATE_REQUIRED_PRECONDITION_STATUS":
          return toUpdateRequiredMPS();
      }
      break;
    case "shown":
      switch (withAction.type) {
        case "TO_IDLE_PRECONDITION_STATUS":
          return toIdleMPS();
        case "TO_ERROR_PRECONDITION_STATUS":
          return toErrorMPS(
            fromStatus.messageId,
            fromStatus.categoryTag,
            withAction.payload.reason
          );
      }
      break;
    case "updateRequired":
      switch (withAction.type) {
        case "TO_IDLE_PRECONDITION_STATUS":
          return toIdleMPS();
      }
      break;
  }
  return fromStatus;
};

describe("messagePrecondition reducer", () => {
  const changeStatusActions = [
    errorPreconditionStatusAction(toErrorPayload(errorReason)),
    idlePreconditionStatusAction(toIdlePayload()),
    loadingContentPreconditionStatusAction(
      toLoadingContentPayload(content, false)
    ),
    retrievingDataPreconditionStatusAction(toRetrievingDataPayload()),
    scheduledPreconditionStatusAction(
      toScheduledPayload(messageId, categoryTag)
    ),
    shownPreconditionStatusAction(toShownPayload()),
    updateRequiredPreconditionStatusAction(toUpdateRequiredPayload())
  ];
  messagePreconditionStatusesGenerator(TagEnum.GENERIC).forEach(initialStatus =>
    changeStatusActions.forEach(changeStatusAction => {
      const expectedStatus = computeExpectedOutput(
        initialStatus,
        changeStatusAction
      );
      it(`should output '${expectedStatus.state}', starting from '${initialStatus.state}', after receiving action '${changeStatusAction.type}'`, () => {
        const preconditionStatus = preconditionReducer(
          initialStatus,
          changeStatusAction
        );
        expect(preconditionStatus).toStrictEqual(expectedStatus);
      });
    })
  );
});

describe("Message precondition status generators", () => {
  it("should return proper istance for 'toErrorMPS'", () => {
    const expectedMPS = {
      state: "error",
      messageId,
      categoryTag,
      reason: "An error reason"
    };
    const mps = toErrorMPS(
      expectedMPS.messageId,
      expectedMPS.categoryTag,
      expectedMPS.reason
    );
    expect(mps).toStrictEqual(expectedMPS);
  });
  it("should return proper istance for 'toIdleMPS'", () => {
    const expectedMPS = {
      state: "idle"
    };
    const mps = toIdleMPS();
    expect(mps).toStrictEqual(expectedMPS);
  });
  it("should return proper istance for 'toLoadingContentMPS'", () => {
    const expectedMPS = {
      state: "loadingContent",
      messageId,
      categoryTag,
      content: {
        title: "A title",
        markdown: "A markdown content"
      }
    };
    const mps = toLoadingContentMPS(
      expectedMPS.messageId,
      expectedMPS.categoryTag,
      expectedMPS.content
    );
    expect(mps).toStrictEqual(expectedMPS);
  });
  it("should return proper istance for 'toRetrievingDataMPS'", () => {
    const expectedMPS = {
      state: "retrievingData",
      messageId,
      categoryTag
    };
    const mps = toRetrievingDataMPS(
      expectedMPS.messageId,
      expectedMPS.categoryTag
    );
    expect(mps).toStrictEqual(expectedMPS);
  });
  it("should return proper istance for 'toScheduledMPS'", () => {
    const expectedMPS = {
      state: "scheduled",
      messageId,
      categoryTag
    };
    const mps = toScheduledMPS(expectedMPS.messageId, expectedMPS.categoryTag);
    expect(mps).toStrictEqual(expectedMPS);
  });
  it("should return proper istance for 'toShownMPS'", () => {
    const expectedMPS = {
      state: "shown",
      messageId,
      categoryTag,
      content
    };
    const mps = toShownMPS(
      expectedMPS.messageId,
      expectedMPS.categoryTag,
      expectedMPS.content
    );
    expect(mps).toStrictEqual(expectedMPS);
  });
  it("should return proper istance for 'toUpdateRequiredMPS'", () => {
    const expectedMPS = {
      state: "updateRequired"
    };
    const mps = toUpdateRequiredMPS();
    expect(mps).toStrictEqual(expectedMPS);
  });
});

describe("foldPreconditionStatus", () => {
  const mocks = [
    jest.fn(),
    jest.fn(),
    jest.fn(),
    jest.fn(),
    jest.fn(),
    jest.fn(),
    jest.fn()
  ];

  messagePreconditionStatusesGenerator(TagEnum.GENERIC).forEach(
    (status, statusIndex) => {
      afterEach(() => {
        jest.resetAllMocks();
        jest.clearAllMocks();
      });
      it(`should call function argument at index '${statusIndex}' for status '${status.state}'`, () => {
        foldPreconditionStatus(
          mocks[0],
          mocks[1],
          mocks[2],
          mocks[3],
          mocks[4],
          mocks[5],
          mocks[6]
        )(status);
        mocks.forEach((mock, mockIndex) => {
          if (statusIndex === mockIndex) {
            expect(mock.mock.calls.length).toBe(1);
            expect(mock.mock.calls[0][0]).toStrictEqual(status);
          } else {
            expect(mock.mock.calls.length).toBe(0);
          }
        });
      });
    }
  );
});

describe("shouldPresentPreconditionsBottomSheetSelector", () => {
  messagePreconditionStatusesGenerator(TagEnum.GENERIC).forEach(status => {
    const expectedOutput = status.state === "scheduled";
    it(`should return '${expectedOutput}' for status '${status.state}'`, () => {
      const globalState = {
        entities: {
          messages: {
            precondition: status
          }
        }
      } as GlobalState;

      const shouldPresent =
        shouldPresentPreconditionsBottomSheetSelector(globalState);
      expect(shouldPresent).toBe(expectedOutput);
    });
  });
});

describe("preconditionsRequireAppUpdateSelector", () => {
  [
    TagEnum.GENERIC,
    TagEnum.EU_COVID_CERT,
    TagEnum.LEGAL_MESSAGE,
    PaymentTagEnum.PAYMENT,
    SENDTagEnum.PN
  ].forEach(tagEnum =>
    messagePreconditionStatusesGenerator(tagEnum).forEach(status =>
      [false, true].forEach(pnAppVersionSupported => {
        const expectedOutput =
          status.state === "updateRequired" ||
          (status.state === "scheduled" &&
            tagEnum === SENDTagEnum.PN &&
            !pnAppVersionSupported);
        afterEach(() => {
          jest.resetAllMocks();
          jest.clearAllMocks();
        });
        it(`should return '${expectedOutput}' for status '${
          status.state
        }', category '${tagEnum}', SEND app version is ${
          pnAppVersionSupported ? "" : "not"
        } supported`, () => {
          const globalState = {
            entities: {
              messages: {
                precondition: status
              }
            }
          } as GlobalState;
          jest
            .spyOn(backendStatus, "isPnAppVersionSupportedSelector")
            .mockImplementation(_ => pnAppVersionSupported);
          const shouldPresent =
            preconditionsRequireAppUpdateSelector(globalState);
          expect(shouldPresent).toBe(expectedOutput);
        });
      })
    )
  );
});

describe("preconditionsTitleContentSelector", () => {
  const expectedOutput = [
    "empty",
    undefined,
    "header",
    "loading",
    undefined,
    "header",
    "empty"
  ];
  messagePreconditionStatusesGenerator(TagEnum.GENERIC).forEach(
    (status, statusIndex) =>
      it(`should return '${expectedOutput[statusIndex]}' for status '${status.state}'`, () => {
        const globalStatus = {
          entities: {
            messages: {
              precondition: status
            }
          }
        } as GlobalState;
        const titleContent = preconditionsTitleContentSelector(globalStatus);
        expect(titleContent).toStrictEqual(expectedOutput[statusIndex]);
      })
  );
});

describe("preconditionsTitleSelector", () => {
  messagePreconditionStatusesGenerator(TagEnum.GENERIC).forEach(status => {
    const expectedOutput =
      status.state === "loadingContent" || status.state === "shown"
        ? status.content.title
        : undefined;
    it(`should return '${expectedOutput}' for status '${status.state}'`, () => {
      const globalStatus = {
        entities: {
          messages: {
            precondition: status
          }
        }
      } as GlobalState;
      const title = preconditionsTitleSelector(globalStatus);
      expect(title).toStrictEqual(expectedOutput);
    });
  });
});

describe("preconditionsContentSelector", () => {
  const expectedOutput = [
    "error",
    undefined,
    "content",
    "loading",
    undefined,
    "content",
    "update"
  ];
  messagePreconditionStatusesGenerator(TagEnum.GENERIC).forEach(
    (status, statusIndex) =>
      it(`should return '${expectedOutput[statusIndex]}' for status '${status.state}'`, () => {
        const globalStatus = {
          entities: {
            messages: {
              precondition: status
            }
          }
        } as GlobalState;
        const contentStatus = preconditionsContentSelector(globalStatus);
        expect(contentStatus).toStrictEqual(expectedOutput[statusIndex]);
      })
  );
});

describe("preconditionsContentMarkdownSelector", () => {
  messagePreconditionStatusesGenerator(TagEnum.GENERIC).forEach(status => {
    const expectedOutput =
      status.state === "loadingContent" || status.state === "shown"
        ? status.content.markdown
        : undefined;
    it(`should return '${expectedOutput}' for status '${status.state}'`, () => {
      const globalStatus = {
        entities: {
          messages: {
            precondition: status
          }
        }
      } as GlobalState;
      const internalContent =
        preconditionsContentMarkdownSelector(globalStatus);
      expect(internalContent).toStrictEqual(expectedOutput);
    });
  });
});

describe("preconditionsFooterSelector", () => {
  const expectedOutput = [
    "view",
    undefined,
    "view",
    "view",
    undefined,
    "content",
    "update"
  ];
  messagePreconditionStatusesGenerator(TagEnum.GENERIC).forEach(
    (status, statusIndex) => {
      it(`should return '${expectedOutput[statusIndex]}' for status '${status.state}'`, () => {
        const globalStatus = {
          entities: {
            messages: {
              precondition: status
            }
          }
        } as GlobalState;
        const footerContent = preconditionsFooterSelector(globalStatus);
        expect(footerContent).toStrictEqual(expectedOutput[statusIndex]);
      });
    }
  );
});

describe("preconditionsCategoryTagSelector", () => {
  messagePreconditionStatusesGenerator(TagEnum.GENERIC).forEach(status => {
    const expectedOutput =
      status.state === "idle" || status.state === "updateRequired"
        ? undefined
        : status.categoryTag;
    it(`should return '${expectedOutput}' for status '${status.state}'`, () => {
      const globalStatus = {
        entities: {
          messages: {
            precondition: status
          }
        }
      } as GlobalState;
      const internalCategoryTag =
        preconditionsCategoryTagSelector(globalStatus);
      expect(internalCategoryTag).toStrictEqual(expectedOutput);
    });
  });
});

describe("preconditionsMessageIdSelector", () => {
  messagePreconditionStatusesGenerator(TagEnum.GENERIC).forEach(status => {
    const expectedOutput =
      status.state === "idle" || status.state === "updateRequired"
        ? undefined
        : status.messageId;
    it(`should return '${expectedOutput}' for status '${status.state}'`, () => {
      const globalStatus = {
        entities: {
          messages: {
            precondition: status
          }
        }
      } as GlobalState;
      const internalMessageId = preconditionsMessageIdSelector(globalStatus);
      expect(internalMessageId).toStrictEqual(expectedOutput);
    });
  });
});

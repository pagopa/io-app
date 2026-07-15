import { ActionType } from "typesafe-actions";

import { MessageCategory } from "../../../../../../definitions/communication/MessageCategory";
import { TagEnum } from "../../../../../../definitions/communication/MessageCategoryBase";
import { TagEnum as PaymentTagEnum } from "../../../../../../definitions/communication/MessageCategoryPayment";
import { TagEnum as SENDTagEnum } from "../../../../../../definitions/communication/MessageCategoryPN";
import * as backendStatus from "../../../../../store/reducers/backendStatus/remoteConfig";
import { GlobalState } from "../../../../../store/reducers/types";
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
  preconditionReducer,
  preconditionsCategoryTagSelector,
  preconditionsContentMarkdownSelector,
  preconditionsContentSelector,
  preconditionsFooterSelector,
  preconditionsMessageIdSelector,
  preconditionsRequireAppUpdateSelector,
  preconditionsTitleContentSelector,
  preconditionsTitleSelector,
  shouldPresentPreconditionsBottomSheetSelector
} from "../messagePrecondition";

const messageId = "01J1FJADCJ53SN4A11J3TBSKQE";
const categoryTag = TagEnum.GENERIC;
const errorReason = "An error reason";
const content = {
  title: "A title",
  markdown: "A markdown"
};

type ChangeStatusAction = ActionType<
  | typeof errorPreconditionStatusAction
  | typeof idlePreconditionStatusAction
  | typeof loadingContentPreconditionStatusAction
  | typeof retrievingDataPreconditionStatusAction
  | typeof scheduledPreconditionStatusAction
  | typeof shownPreconditionStatusAction
  | typeof updateRequiredPreconditionStatusAction
>;

type PreconditionContent = Extract<
  MessagePreconditionStatus,
  { state: "loadingContent" }
>["content"];

type ReducerScenario = {
  action: ChangeStatusAction;
  expectedStatus: MessagePreconditionStatus;
  initialStatus: MessagePreconditionStatus;
  name: string;
};

const toErrorMPS = (
  inputMessageId: string,
  inputCategoryTag: MessageCategory["tag"],
  reason: string
): MessagePreconditionStatus => ({
  state: "error",
  messageId: inputMessageId,
  categoryTag: inputCategoryTag,
  reason
});

const toIdleMPS = (): MessagePreconditionStatus => ({
  state: "idle"
});

const toLoadingContentMPS = (
  inputMessageId: string,
  inputCategoryTag: MessageCategory["tag"],
  inputContent: PreconditionContent
): MessagePreconditionStatus => ({
  state: "loadingContent",
  messageId: inputMessageId,
  categoryTag: inputCategoryTag,
  content: inputContent
});

const toRetrievingDataMPS = (
  inputMessageId: string,
  inputCategoryTag: MessageCategory["tag"]
): MessagePreconditionStatus => ({
  state: "retrievingData",
  messageId: inputMessageId,
  categoryTag: inputCategoryTag
});

const toScheduledMPS = (
  inputMessageId: string,
  inputCategoryTag: MessageCategory["tag"]
): MessagePreconditionStatus => ({
  state: "scheduled",
  messageId: inputMessageId,
  categoryTag: inputCategoryTag
});

const toShownMPS = (
  inputMessageId: string,
  inputCategoryTag: MessageCategory["tag"],
  inputContent: PreconditionContent
): MessagePreconditionStatus => ({
  state: "shown",
  messageId: inputMessageId,
  categoryTag: inputCategoryTag,
  content: inputContent
});

const toUpdateRequiredMPS = (): MessagePreconditionStatus => ({
  state: "updateRequired"
});

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

describe("messagePrecondition reducer", () => {
  const errorAction = errorPreconditionStatusAction(
    toErrorPayload(errorReason)
  );
  const idleAction = idlePreconditionStatusAction(toIdlePayload());
  const loadingContentAction = loadingContentPreconditionStatusAction(
    toLoadingContentPayload(content, false)
  );
  const retrievingDataAction = retrievingDataPreconditionStatusAction(
    toRetrievingDataPayload()
  );
  const scheduledAction = scheduledPreconditionStatusAction(
    toScheduledPayload(messageId, categoryTag)
  );
  const shownAction = shownPreconditionStatusAction(toShownPayload());
  const skipLoadingContentAction = loadingContentPreconditionStatusAction(
    toLoadingContentPayload(content, true)
  );
  const updateRequiredAction = updateRequiredPreconditionStatusAction(
    toUpdateRequiredPayload()
  );

  const errorStatus = toErrorMPS(messageId, categoryTag, errorReason);
  const idleStatus = toIdleMPS();
  const loadingContentStatus = toLoadingContentMPS(
    messageId,
    categoryTag,
    content
  );
  const retrievingDataStatus = toRetrievingDataMPS(messageId, categoryTag);
  const scheduledStatus = toScheduledMPS(messageId, categoryTag);
  const shownStatus = toShownMPS(messageId, categoryTag, content);
  const updateRequiredStatus = toUpdateRequiredMPS();

  const changeStatusActions: ReadonlyArray<ChangeStatusAction> = [
    errorAction,
    idleAction,
    loadingContentAction,
    skipLoadingContentAction,
    retrievingDataAction,
    scheduledAction,
    shownAction,
    updateRequiredAction
  ];
  const changeStatusScenarios: ReadonlyArray<ReducerScenario> = [
    {
      action: idleAction,
      expectedStatus: idleStatus,
      initialStatus: errorStatus,
      name: "error to idle"
    },
    {
      action: retrievingDataAction,
      expectedStatus: retrievingDataStatus,
      initialStatus: errorStatus,
      name: "error to retrieving data"
    },
    {
      action: scheduledAction,
      expectedStatus: scheduledStatus,
      initialStatus: idleStatus,
      name: "idle to scheduled"
    },
    {
      action: errorAction,
      expectedStatus: errorStatus,
      initialStatus: loadingContentStatus,
      name: "loading content to error"
    },
    {
      action: idleAction,
      expectedStatus: idleStatus,
      initialStatus: loadingContentStatus,
      name: "loading content to idle"
    },
    {
      action: shownAction,
      expectedStatus: shownStatus,
      initialStatus: loadingContentStatus,
      name: "loading content to shown"
    },
    {
      action: errorAction,
      expectedStatus: errorStatus,
      initialStatus: retrievingDataStatus,
      name: "retrieving data to error"
    },
    {
      action: idleAction,
      expectedStatus: idleStatus,
      initialStatus: retrievingDataStatus,
      name: "retrieving data to idle"
    },
    {
      action: loadingContentAction,
      expectedStatus: loadingContentStatus,
      initialStatus: retrievingDataStatus,
      name: "retrieving data to loading content"
    },
    {
      action: skipLoadingContentAction,
      expectedStatus: shownStatus,
      initialStatus: retrievingDataStatus,
      name: "retrieving data to shown when loading is skipped"
    },
    {
      action: retrievingDataAction,
      expectedStatus: retrievingDataStatus,
      initialStatus: scheduledStatus,
      name: "scheduled to retrieving data"
    },
    {
      action: updateRequiredAction,
      expectedStatus: updateRequiredStatus,
      initialStatus: scheduledStatus,
      name: "scheduled to update required"
    },
    {
      action: errorAction,
      expectedStatus: errorStatus,
      initialStatus: shownStatus,
      name: "shown to error"
    },
    {
      action: idleAction,
      expectedStatus: idleStatus,
      initialStatus: shownStatus,
      name: "shown to idle"
    },
    {
      action: idleAction,
      expectedStatus: idleStatus,
      initialStatus: updateRequiredStatus,
      name: "update required to idle"
    }
  ];
  const unchangedStatusScenarios: ReadonlyArray<ReducerScenario> = [
    errorStatus,
    idleStatus,
    loadingContentStatus,
    retrievingDataStatus,
    scheduledStatus,
    shownStatus,
    updateRequiredStatus
  ].flatMap(initialStatus =>
    changeStatusActions
      .filter(
        action =>
          !changeStatusScenarios.some(
            scenario =>
              scenario.initialStatus === initialStatus &&
              scenario.action === action
          )
      )
      .map(action => ({
        action,
        expectedStatus: initialStatus,
        initialStatus,
        name: `${initialStatus.state} ignores ${action.type}`
      }))
  );

  test.each(changeStatusScenarios)("$name", scenario => {
    expect(
      preconditionReducer(scenario.initialStatus, scenario.action)
    ).toEqual(scenario.expectedStatus);
  });

  test.each(unchangedStatusScenarios)("$name", scenario => {
    expect(
      preconditionReducer(scenario.initialStatus, scenario.action)
    ).toStrictEqual(scenario.expectedStatus);
  });
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

import { MessageCategory } from "../../../../../../definitions/backend/MessageCategory";
import { ThirdPartyMessagePrecondition } from "../../../../../../definitions/backend/ThirdPartyMessagePrecondition";
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
} from "../preconditions";

describe("Action payload generators", () => {
  it("should generate proper payload with 'toErrorPayload'", () => {
    const reason = "The reason";
    const errorPayload = toErrorPayload(reason);
    expect(errorPayload.nextStatus).toStrictEqual("error");
    expect(errorPayload.reason).toStrictEqual(reason);
  });
  it("should generate proper payload with 'toIdlePayload'", () => {
    const idlePayload = toIdlePayload();
    expect(idlePayload.nextStatus).toStrictEqual("idle");
  });
  it("should generate proper payload with 'toLoadingContentPayload'", () => {
    const content: ThirdPartyMessagePrecondition = {
      title: "The title",
      markdown: "The content"
    };
    const loadingContentPayload = toLoadingContentPayload(content, false);
    expect(loadingContentPayload.nextStatus).toStrictEqual("loadingContent");
    expect(loadingContentPayload.content).toStrictEqual(content);
  });
  it("should generate proper payload with 'toRetrievingDataPayload'", () => {
    const retrievingDataPayload = toRetrievingDataPayload();
    expect(retrievingDataPayload.nextStatus).toStrictEqual("retrievingData");
  });
  it("should generate proper payload with 'toScheduledPayload'", () => {
    const messageId = "01J1F5K8D1S71NZJNCDBWN4RYP";
    const categoryTag = "GENERIC" as MessageCategory["tag"];
    const scheduledPayload = toScheduledPayload(messageId, categoryTag);
    expect(scheduledPayload.nextStatus).toStrictEqual("scheduled");
    expect(scheduledPayload.messageId).toStrictEqual(messageId);
    expect(scheduledPayload.categoryTag).toStrictEqual(categoryTag);
  });
  it("should generate proper payload with 'toShownPayload'", () => {
    const shownPayload = toShownPayload();
    expect(shownPayload.nextStatus).toStrictEqual("shown");
  });
  it("should generate proper payload with 'toUpdateRequiredPayload'", () => {
    const updateRequiredPayload = toUpdateRequiredPayload();
    expect(updateRequiredPayload.nextStatus).toStrictEqual("updateRequired");
  });
});

describe("Action generators", () => {
  it("should return the proper action data for 'errorPreconditionStatusAction'", () => {
    const errorPayload = toErrorPayload("reason");
    const errorPSA = errorPreconditionStatusAction(errorPayload);
    expect(errorPSA.type).toStrictEqual("TO_ERROR_PRECONDITION_STATUS");
    expect(errorPSA.payload).toStrictEqual(errorPayload);
  });
  it("should return the proper action data for 'idlePreconditionStatusAction'", () => {
    const idlePayload = toIdlePayload();
    const idlePSA = idlePreconditionStatusAction(idlePayload);
    expect(idlePSA.type).toStrictEqual("TO_IDLE_PRECONDITION_STATUS");
    expect(idlePSA.payload).toStrictEqual(idlePayload);
  });
  it("should return the proper action data for 'loadingContentPreconditionStatusAction'", () => {
    const loadingContentPayload = toLoadingContentPayload(
      {
        title: "",
        markdown: ""
      },
      false
    );
    const loadingContentPSA = loadingContentPreconditionStatusAction(
      loadingContentPayload
    );
    expect(loadingContentPSA.type).toStrictEqual(
      "TO_LOADING_CONTENT_PRECONDITION_STATUS"
    );
    expect(loadingContentPSA.payload).toStrictEqual(loadingContentPayload);
  });
  it("should return the proper action data for 'retrievingDataPreconditionStatusAction'", () => {
    const retrievingDatPayload = toRetrievingDataPayload();
    const rerievingDataPSA =
      retrievingDataPreconditionStatusAction(retrievingDatPayload);
    expect(rerievingDataPSA.type).toStrictEqual(
      "TO_RETRIEVING_DATA_PRECONDITION_STATUS"
    );
    expect(rerievingDataPSA.payload).toStrictEqual(retrievingDatPayload);
  });
  it("should return the proper action data for 'scheduledPreconditionStatusAction'", () => {
    const scheduledPayload = toScheduledPayload(
      "01J1F6DVSZF2SMV2T8635D25BQ",
      "GENERIC" as MessageCategory["tag"]
    );
    const scheduledPSA = scheduledPreconditionStatusAction(scheduledPayload);
    expect(scheduledPSA.type).toStrictEqual("TO_SCHEDULED_PRECONDITION_STATUS");
    expect(scheduledPSA.payload).toStrictEqual(scheduledPayload);
  });
  it("should return the proper action data for 'shownPreconditionStatusAction'", () => {
    const shownPayload = toShownPayload();
    const shownPSA = shownPreconditionStatusAction(shownPayload);
    expect(shownPSA.type).toStrictEqual("TO_SHOWN_PRECONDITION_STATUS");
    expect(shownPSA.payload).toStrictEqual(shownPayload);
  });
  it("should return the proper action data for 'updateRequiredPreconditionStatusAction'", () => {
    const updateRequiredPayload = toUpdateRequiredPayload();
    const updateRequiredPSA = updateRequiredPreconditionStatusAction(
      updateRequiredPayload
    );
    expect(updateRequiredPSA.type).toStrictEqual(
      "TO_UPDATE_REQUIRED_PRECONDITION_STATUS"
    );
    expect(updateRequiredPSA.payload).toStrictEqual(updateRequiredPayload);
  });
});

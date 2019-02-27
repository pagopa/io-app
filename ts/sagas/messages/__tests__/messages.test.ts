import { left, right } from "fp-ts/lib/Either";
import * as pot from "italia-ts-commons/lib/pot";
import { testSaga } from "redux-saga-test-plan";

import { CreatedMessageWithContent } from "../../../../definitions/backend/CreatedMessageWithContent";
import { loadMessage as loadMessageAction } from "../../../store/actions/messages";
import { toMessageWithContentPO } from "../../../types/MessageWithContentPO";
import { fetchMessage, loadMessage } from "../messages";

const testMessageId1 = "01BX9NSMKAAAS5PSP2FATZM6BQ";
const testServiceId1 = "5a563817fcc896087002ea46c49a";

const testMessageWithContent1: CreatedMessageWithContent = {
  id: testMessageId1,
  fiscal_code: "" as any,
  created_at: new Date(),
  content: {
    markdown: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin eget fringilla neque, laoreet volutpat elit. Nunc leo nisi, dignissim eget lobortis non, faucibus in augue." as any,
    subject: "Lorem ipsum..." as any
  },
  sender_service_id: testServiceId1
};

describe("messages", () => {
  describe("fetchMessage test plan", () => {
    it("should call getMessage with the right parameters", () => {
      const getMessage = jest.fn();
      testSaga(fetchMessage, getMessage, { id: testMessageId1 })
        .next()
        .call(getMessage, { id: testMessageId1 });
    });

    it("should only return an empty error if the getMessage response is undefined (can't be decoded)", () => {
      const getMessage = jest.fn();
      testSaga(fetchMessage, getMessage, { id: testMessageId1 })
        .next()
        // Return undefined as getMessage response
        .next(undefined)
        .returns(left(Error()));
    });

    it("should only return the error if the getMessage response status is not 200", () => {
      const getMessage = jest.fn();
      const error = Error("Backend error");
      testSaga(fetchMessage, getMessage, { id: testMessageId1 })
        .next()
        // Return 500 with an error message as getMessage response
        .next({ status: 500, value: { title: error.message } })
        .returns(left(error));
    });

    it("should return the message if the getMessage response status is 200", () => {
      const getMessage = jest.fn();
      testSaga(fetchMessage, getMessage, { id: testMessageId1 })
        .next()
        // Return 500 with an error message as getMessage response
        .next({ status: 200, value: testMessageWithContent1 })
        .returns(right(toMessageWithContentPO(testMessageWithContent1)));
    });
  });

  describe("loadMessage test plan", () => {
    it("should return the cached message if the message is in the cache", () => {
      const getMessage = jest.fn();
      testSaga(loadMessage, getMessage, { id: testMessageId1 })
        .next()
        .next({
          message: pot.some(toMessageWithContentPO(testMessageWithContent1))
        })
        .returns(
          right({
            message: pot.some(toMessageWithContentPO(testMessageWithContent1))
          })
        );
    });

    it("should call fetchMessage with the right parameters", () => {
      const getMessage = jest.fn();
      testSaga(loadMessage, getMessage, { id: testMessageId1 })
        .next()
        .next()
        .call(fetchMessage, getMessage, { id: testMessageId1 });
    });

    it("should put MESSAGE_LOAD_FAILURE and return the error if the message can't be fetched", () => {
      const getMessage = jest.fn();
      testSaga(loadMessage, getMessage, { id: testMessageId1 })
        .next()
        .next()
        .call(fetchMessage, getMessage, { id: testMessageId1 })
        // Return 200 with a valid message as getMessage response
        .next(left(Error("Error")))
        .put(loadMessageAction.failure({ id: testMessageId1, error: "Error" }))
        .next()
        .returns(left(Error("Error")));
    });

    it("should put MESSAGE_LOAD_SUCCESS and return the message if the message is fetched sucessfully", () => {
      const getMessage = jest.fn();
      testSaga(loadMessage, getMessage, { id: testMessageId1 })
        .next()
        .next()
        .call(fetchMessage, getMessage, { id: testMessageId1 })
        // Return 200 with a valid message as getMessage response
        .next(right(toMessageWithContentPO(testMessageWithContent1)))
        .put(
          loadMessageAction.success(
            toMessageWithContentPO(testMessageWithContent1)
          )
        )
        .next()
        .returns(right(toMessageWithContentPO(testMessageWithContent1)));
    });
  });
});

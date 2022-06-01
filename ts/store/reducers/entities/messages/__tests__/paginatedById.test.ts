import reducer from "../paginatedById";
import { reloadAllMessages } from "../../../../actions/messages";
import { successReloadMessagesPayload } from "../../../../../__mocks__/messages";

describe("paginatedById reducer", () => {
  describe("given an empty initial state", () => {
    const initialState = {};

    describe("when reloadAllMessages succeeds", () => {
      const action = reloadAllMessages.success(successReloadMessagesPayload);
      it("then messages are stored by their ID", () => {
        const state = reducer(initialState, action);
        expect(Object.keys(state)).toEqual(
          successReloadMessagesPayload.messages.map(_ => _.id)
        );
      });
    });
  });
});

import configureMockStore from "redux-mock-store";

import { GlobalState } from "../../store/reducers/types";
import { appReducer } from "../../store/reducers";
import { applicationChangeState } from "../../store/actions/application";
import { MessagesStatus } from "../../store/reducers/entities/messages/messagesStatus";
import migrateToPagination from "../migrateToPagination";
import { removeMessages } from "../../store/actions/messages";

const mockUpsert = jest.fn();

const makeStore = (messagesStatus: MessagesStatus = {}) => {
  const globalState = appReducer(undefined, applicationChangeState("active"));
  const mockStore = configureMockStore<GlobalState>();
  const store: ReturnType<typeof mockStore> = mockStore({
    ...globalState,
    entities: {
      ...globalState.entities,
      messagesStatus
    }
  } as GlobalState);
  const originalDispatch = store.dispatch;
  // eslint-disable-next-line functional/immutable-data
  store.dispatch = jest.fn((...args) =>
    originalDispatch.apply(store, args)
  ) as typeof originalDispatch;
  return store;
};

describe("migrateToPagination module", function () {
  afterEach(() => {
    mockUpsert.mockReset();
  });

  describe("when the messageStatus collection is empty", function () {
    it("doesn't start the migration", async () => {
      const store = makeStore();
      const result = await migrateToPagination(store, mockUpsert);
      expect(result).toEqual({ failed: [], succeeded: [] });
      expect(store.dispatch).not.toHaveBeenCalled();
    });
  });

  describe("when the messageStatus collection has messages", function () {
    it("migrates the messages status", async () => {
      const statuses = {
        A: { isRead: true, isArchived: true },
        B: { isRead: true, isArchived: false },
        C: { isRead: false, isArchived: true },
        D: { isRead: false, isArchived: false } // doesn't require migration
      };
      const store = makeStore(statuses);
      const result = await migrateToPagination(store, mockUpsert);
      expect(result).toEqual({ failed: [], succeeded: Object.keys(statuses) });
      expect(mockUpsert).toHaveBeenCalledWith("A", statuses.A);
      expect(mockUpsert).toHaveBeenCalledWith("B", statuses.B);
      expect(mockUpsert).toHaveBeenCalledWith("C", statuses.C);
      expect(mockUpsert).toHaveBeenCalledTimes(3);
      expect(store.dispatch).toHaveBeenCalledWith(
        removeMessages(Object.keys(statuses))
      );
    });

    describe("and there is at least one failure", function () {
      it("migrates the messages status returning the error for the failing one only ", async () => {
        const statuses = {
          A: { isRead: true, isArchived: true },
          B: { isRead: true, isArchived: false },
          C: { isRead: false, isArchived: true },
          D: { isRead: false, isArchived: false } // doesn't require migration
        };
        const store = makeStore(statuses);
        const result = await migrateToPagination(
          store,
          mockUpsert.mockImplementation(id => {
            if (id === "B") {
              throw new Error("Network error");
            }
          })
        );
        expect(result).toEqual({
          failed: [{ error: new Error("Network error"), messageId: "B" }],
          succeeded: ["A", "C", "D"]
        });
        expect(mockUpsert).toHaveBeenCalledWith("A", statuses.A);
        expect(mockUpsert).toHaveBeenCalledWith("B", statuses.B);
        expect(mockUpsert).toHaveBeenCalledWith("C", statuses.C);
        expect(mockUpsert).toHaveBeenCalledTimes(3);
        expect(store.dispatch).toHaveBeenCalledWith(
          removeMessages(["A", "C", "D"])
        );
      });
    });
  });
});

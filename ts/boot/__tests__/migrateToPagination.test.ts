import * as Either from "fp-ts/lib/Either";

import migrateToPagination from "../migrateToPagination";

const mockUpsert = jest.fn().mockResolvedValue(Either.right({ status: 200 }));

describe("migrateToPagination module", function () {
  afterEach(() => {
    mockUpsert.mockClear();
  });

  describe("when the messageStatus collection is empty", function () {
    it("doesn't start the migration", async () => {
      const result = await migrateToPagination([], mockUpsert);
      expect(result).toEqual({ failed: [], succeeded: [] });
    });
  });

  describe("when the messageStatus collection has messages", function () {
    afterEach(() => {
      mockUpsert.mockClear();
    });

    const statuses = [
      { id: "A", isRead: true, isArchived: true },
      { id: "B", isRead: true, isArchived: false },
      { id: "C", isRead: false, isArchived: true },
      { id: "D", isRead: false, isArchived: false } // doesn't require migration
    ];

    it("migrates the messages status", async () => {
      const result = await migrateToPagination(statuses, mockUpsert);
      expect(result).toEqual({
        failed: [],
        succeeded: statuses.map(_ => _.id)
      });
      expect(mockUpsert).toHaveBeenCalledWith("A", {
        isArchived: true,
        isRead: true
      });
      expect(mockUpsert).toHaveBeenCalledWith("B", {
        isArchived: false,
        isRead: true
      });
      expect(mockUpsert).toHaveBeenCalledWith("C", {
        isArchived: true,
        isRead: false
      });
      expect(mockUpsert).toHaveBeenCalledTimes(3);
    });

    describe("and there is at least one failure", function () {
      it("migrates the messages status returning the error for the failing one only ", async () => {
        const result = await migrateToPagination(
          statuses,
          mockUpsert.mockImplementation(id => {
            if (id === "B") {
              return Promise.resolve(Either.right({ status: 500 }));
            }
            return Promise.resolve(Either.right({ status: 200 }));
          })
        );
        expect(result).toEqual({
          failed: [{ error: new Error("UNKNOWN"), messageId: "B" }],
          succeeded: ["A", "C", "D"]
        });
        expect(mockUpsert).toHaveBeenCalledWith("A", {
          isArchived: true,
          isRead: true
        });
        expect(mockUpsert).toHaveBeenCalledWith("B", {
          isArchived: false,
          isRead: true
        });
        expect(mockUpsert).toHaveBeenCalledWith("C", {
          isArchived: true,
          isRead: false
        });
        expect(mockUpsert).toHaveBeenCalledTimes(3);
      });
    });
  });
});

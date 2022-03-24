import migrateToPagination from "../migrateToPagination";

const mockUpsert = jest.fn();

describe("migrateToPagination module", function () {
  afterEach(() => {
    mockUpsert.mockReset();
  });

  describe("when the messageStatus collection is empty", function () {
    it("doesn't start the migration", async () => {
      const result = await migrateToPagination([], mockUpsert);
      expect(result).toEqual({ failed: [], succeeded: [] });
    });
  });

  describe("when the messageStatus collection has messages", function () {
    const statuses = [
      { id: "A", isRead: true, isArchived: true },
      { id: "B", isRead: true, isArchived: false },
      { id: "C", isRead: false, isArchived: true },
      { id: "D", isRead: false, isArchived: false } // doesn't require migration
    ];

    it("migrates the messages status", async () => {
      const result = await migrateToPagination(statuses, mockUpsert);
      expect(result).toEqual({ failed: [], succeeded: Object.keys(statuses) });
      expect(mockUpsert).toHaveBeenCalledWith(
        "A",
        expect.objectContaining(statuses[0])
      );
      expect(mockUpsert).toHaveBeenCalledWith(
        "B",
        expect.objectContaining(statuses[1])
      );
      expect(mockUpsert).toHaveBeenCalledWith(
        "C",
        expect.objectContaining(statuses[2])
      );
      expect(mockUpsert).toHaveBeenCalledTimes(3);
    });

    describe("and there is at least one failure", function () {
      it("migrates the messages status returning the error for the failing one only ", async () => {
        const result = await migrateToPagination(
          statuses,
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
        expect(mockUpsert).toHaveBeenCalledWith("A", statuses[0]);
        expect(mockUpsert).toHaveBeenCalledWith("B", statuses[1]);
        expect(mockUpsert).toHaveBeenCalledWith("C", statuses[2]);
        expect(mockUpsert).toHaveBeenCalledTimes(3);
      });
    });
  });
});

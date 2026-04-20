import { fold, foldK } from "../messageListCategory";

describe("messageListCategory", () => {
  it("'fold' should call inbox function for INBOX value", () => {
    const inboxFn = jest.fn();
    const archivedFn = jest.fn();
    fold("INBOX", inboxFn, archivedFn);
    expect(inboxFn).toHaveBeenCalledTimes(1);
    expect(archivedFn).toHaveBeenCalledTimes(0);
  });
  it("'fold' should call archive function for ARCHIVE value", () => {
    const inboxFn = jest.fn();
    const archivedFn = jest.fn();
    fold("ARCHIVE", inboxFn, archivedFn);
    expect(inboxFn).toHaveBeenCalledTimes(0);
    expect(archivedFn).toHaveBeenCalledTimes(1);
  });
  it("'foldK' should call inbox function for INBOX value", () => {
    const inboxFn = jest.fn();
    const archivedFn = jest.fn();
    foldK(inboxFn, archivedFn)("INBOX");
    expect(inboxFn).toHaveBeenCalledTimes(1);
    expect(archivedFn).toHaveBeenCalledTimes(0);
  });
  it("'foldK' should call archive function for ARCHIVE value", () => {
    const inboxFn = jest.fn();
    const archivedFn = jest.fn();
    foldK(inboxFn, archivedFn)("ARCHIVE");
    expect(inboxFn).toHaveBeenCalledTimes(0);
    expect(archivedFn).toHaveBeenCalledTimes(1);
  });
});

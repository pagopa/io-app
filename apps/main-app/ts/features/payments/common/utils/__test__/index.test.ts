import { formatPaymentNoticeNumber } from "..";

describe("formatPaymentNoticeNumber", () => {
  it("should properly format a standard notice number", () => {
    const noticeNumber = "111122223333444455";
    const expectedFormattedNoticeNumber = "1111  2222  3333  4444  55";
    const formattedNoticeNumber = formatPaymentNoticeNumber(noticeNumber);
    expect(formattedNoticeNumber).toBe(expectedFormattedNoticeNumber);
  });
  it("should do nothing for an empty notice number", () => {
    const emptyNoticeNumber = "";
    const formattedNoticeNumber = formatPaymentNoticeNumber(emptyNoticeNumber);
    expect(formattedNoticeNumber).toBe(emptyNoticeNumber);
  });
  it("should do nothing for a non-numeric notice number", () => {
    const nonNumericNoticeNumber = "aaaabbbbccccddddee";
    const formattedNoticeNumber = formatPaymentNoticeNumber(
      nonNumericNoticeNumber
    );
    expect(formattedNoticeNumber).toBe(nonNumericNoticeNumber);
  });
  it("should do nothing for a notice number whith a content that is not groupable by four digits", () => {
    const nonGroupableNoticeNumber = "111a222b333d444d55";
    const formattedNoticeNumber = formatPaymentNoticeNumber(
      nonGroupableNoticeNumber
    );
    expect(formattedNoticeNumber).toBe(nonGroupableNoticeNumber);
  });
});

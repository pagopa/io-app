import { getProgressEmojis } from "..";

describe("getProgressEmojis", () => {
  test.each([
    [-1.0, "⚪⚪⚪⚪⚪⚪⚪⚪"],
    [0.01, "⚪⚪⚪⚪⚪⚪⚪⚪"],
    [0.41, "🔵🔵🔵⚪⚪⚪⚪⚪"],
    [0.99, "🔵🔵🔵🔵🔵🔵🔵⚪"],
    [2.99, "🔵🔵🔵🔵🔵🔵🔵🔵"]
  ])("When progress is %p, return %p", (progress, emojis) => {
    expect(getProgressEmojis(progress)).toStrictEqual(emojis);
  });
});

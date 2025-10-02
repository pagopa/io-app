import { fillerEphemeralAARMarkdown, isAarDetailById } from "../detailsById";

describe("detailsById Aar utils", () => {
  it("fillerEphemeralAARMarkdown should match snapshot", () => {
    expect(fillerEphemeralAARMarkdown).toMatchSnapshot();
  });
  it("isAarDetailById should return true if message.markdown matches fillerEphemeralAARMarkdown", () => {
    const message = { markdown: fillerEphemeralAARMarkdown } as any;
    expect(isAarDetailById(message)).toBe(true);
  });
  it("isAarDetailById should return false if message.markdown does not match fillerEphemeralAARMarkdown", () => {
    const message = { markdown: "some other markdown" } as any;
    expect(isAarDetailById(message)).toBe(false);
  });
});

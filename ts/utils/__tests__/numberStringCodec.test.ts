import { isRight } from "fp-ts/lib/Either";
import { NumberFromString } from "../number";

describe("should convert a string representin a number into a number", () => {
  it("should convert an int number in its string representation", () => {
    const integer = 100;
    expect(NumberFromString.encode(integer)).toBe("100");
  });

  it("should convert a string representing a integer number in number object", () => {
    const integer = "100";
    const validation = NumberFromString.decode(integer);
    expect(isRight(validation)).toBeTruthy();
  });

  it("should convert an float number in its string representation", () => {
    const integer = 100.2;
    expect(NumberFromString.encode(integer)).toBe("100.2");
  });

  it("should convert a float representing a integer number in number object", () => {
    const integer = "100.2";
    const validation = NumberFromString.decode(integer);
    expect(isRight(validation)).toBeTruthy();
  });

  it("should fail to convert a string representing a wrong number", () => {
    const wrong = "ab14c";
    const validation = NumberFromString.decode(wrong);
    expect(isRight(validation)).toBeFalsy();
  });
});

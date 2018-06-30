import { fixExpirationDate, fixPan } from "../input";

import { none, Option, some } from "fp-ts/lib/Option";
import _ from "lodash";

describe("fixExpirationDate", () => {
  it("should add a / when needed", () => {
    const ioMap = {
      "0": some("0"), // will necessarily be followed by a digit
      "01": some("01/"), // can't be anything other than 01
      "02": some("02/"), // can't be anything other than 02
      "1": some("1"), // 1, or 10-11-12? can't tell: don't add a /
      "2": some("2/"), // can't add an additional digit
      "10": some("10/"), // can't add an additional digit
      "20": some("20") // month out of bounds, ignore
    };
    _.entries(ioMap).forEach(([i, o]: [string, Option<string>]) =>
      expect(o).toEqual(fixExpirationDate(i))
    );
  });

  it("should remove invalid characters", () => {
    const ioMap = {
      "01234": some("01234"), // all good here
      "012/": some("012/"), // all good here
      " abc012": some("012"), // get rid of " abc"
      " abc": none, // get rid of " abc" (left with nothing)
      "01/23/xx/xx": some("0123/"), // get rid of 2nd and 3rd / and x's
      "!@#$%/^&*()-=/": some("/"), // get rid of everything but the 1st /
      "!@#$%^&*()-=": none // get rid of it all
    };
    _.entries(ioMap).forEach(([i, o]: [string, Option<string>]) =>
      expect(o).toEqual(fixExpirationDate(i))
    );
  });

  it("should correctly format the year", () => {
    const ioMap = {
      "01/": some("01/"), // no year specified
      "01/2": some("01/2"), // 1st digit, leave it
      "01/20": some("01/20"), // 2nd digit, leave it
      "01/203": some("01/03"), // 3rd digit, drop 1st one
      "01/2034": some("01/34") // 4 digits, drop first two ones
    };
    _.entries(ioMap).forEach(([i, o]: [string, Option<string>]) =>
      expect(o).toEqual(fixExpirationDate(i))
    );
  });
});

describe("fixPan", () => {
  it("should remove invalid characters", () => {
    const ioMap = {
      "012": some("012"), // all good here
      " abc012": some("012"), // get rid of " abc"
      " abc": none, // get rid of " abc" (left with nothing)
      "01/2/xx/xx": some("012"), // get rid everything but the digits
      "!@#$%/^&*()-=/": none, // get rid of it all
      "0!@#$1%^&*()2-=": some("012") // get rid of all but \d
    };
    _.entries(ioMap).forEach(([i, o]: [string, Option<string>]) =>
      expect(o).toEqual(fixPan(i))
    );
  });

  it("should correctly format the pan", () => {
    const ioMap = {
      "": none, // nothing in, nothing out (NINO!)
      "0": some("0"), // normal behavior
      "01": some("01"), // normal behavior
      "012": some("012"), // normal
      "0123": some("0123 "), // add space after first quadruplet
      "01234567": some("0123 4567 "), // add space after second quadruplet
      "0123456789": some("0123 4567 89") // do not add space here
    };
    _.entries(ioMap).forEach(([i, o]: [string, Option<string>]) =>
      expect(o).toEqual(fixPan(i))
    );
  });
});

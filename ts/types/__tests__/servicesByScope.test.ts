import { ServicesByScope } from "../../../definitions/content/ServicesByScope";

const validServicesByScope1 = {
  NATIONAL: ["id1", "id2", "id3"],
  LOCAL: ["id4", "id5", "id6"]
};

const validServicesByScope2 = {
  NATIONAL: ["id1", "id2", "id3"],
  LOCAL: []
};

const localMissing = {
  NATIONAL: ["id1", "id2", "id3"]
};

const wrongType1 = {
  NATIONAL: true,
  LOCAL: ["id4", "id5", "id6"]
};

const wrongType2 = {
  NATIONAL: ["id1", "id2", "id3"],
  LOCAL: [1, "id5", "id6"]
};

describe("ServicesByScope", () => {
  it("should recognize a valid ServicesByScope", () => {
    expect(
      ServicesByScope.decode(validServicesByScope1).isRight()
    ).toBeTruthy();
  });

  it("should recognize a valid ServicesByScope", () => {
    expect(
      ServicesByScope.decode(validServicesByScope2).isRight()
    ).toBeTruthy();
  });

  it("should fails to decode a value where a scope is missing", () => {
    expect(ServicesByScope.decode(localMissing).isLeft()).toBeTruthy();
  });

  it("should fails to decode a value where the value of a scope is not a string array", () => {
    expect(ServicesByScope.decode(wrongType1).isLeft()).toBeTruthy();
  });

  it("should fails to decode a value where the value of a scope is not a string array", () => {
    expect(ServicesByScope.decode(wrongType2).isLeft()).toBeTruthy();
  });
});

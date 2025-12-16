import * as pot from "@pagopa/ts-commons/lib/pot";
import {
  foldK,
  isLoadingOrUpdating,
  isSomeLoadingOrSomeUpdating,
  isSomeOrSomeError,
  isStrictNone,
  isStrictSome,
  isStrictSomeError,
  toUndefinedOptional
} from "../pot";

const potInstances = [
  pot.none,
  pot.noneLoading,
  pot.noneUpdating({}),
  pot.noneError(""),
  pot.some({}),
  pot.someLoading({}),
  pot.someUpdating({}, {}),
  pot.someError({}, "")
];

describe("isStrictNone", () => {
  potInstances.forEach(potInstance => {
    const expectedOutput = potInstance.kind === "PotNone";
    it(`should return '${expectedOutput}' for ${potInstance.kind}`, () => {
      const output = isStrictNone(potInstance);
      expect(output).toBe(expectedOutput);
    });
  });
});

describe("isStrictSome", () => {
  potInstances.forEach(potInstance => {
    const expectedOutput = potInstance.kind === "PotSome";
    it(`should return '${expectedOutput}' for ${potInstance.kind}`, () => {
      const output = isStrictSome(potInstance);
      expect(output).toBe(expectedOutput);
    });
  });
});

describe("foldK", () => {
  it("should only invoke foldNone for pot.none", () => {
    const mockFoldInstance = generateMockFoldInstance();
    foldK(
      mockFoldInstance.foldNone,
      mockFoldInstance.foldNoneLoading,
      mockFoldInstance.foldNoneUpdating,
      mockFoldInstance.foldNoneError,
      mockFoldInstance.foldSome,
      mockFoldInstance.foldSomeLoading,
      mockFoldInstance.foldSomeUpdating,
      mockFoldInstance.foldSomeError
    )(pot.none);
    expect(mockFoldInstance.foldNone).toHaveBeenCalled();
    verifyZeroCallMock(mockFoldInstance, "foldNone");
  });
  it("should only invoke foldNoneLoading for pot.noneLoading", () => {
    const mockFoldInstance = generateMockFoldInstance();
    foldK(
      mockFoldInstance.foldNone,
      mockFoldInstance.foldNoneLoading,
      mockFoldInstance.foldNoneUpdating,
      mockFoldInstance.foldNoneError,
      mockFoldInstance.foldSome,
      mockFoldInstance.foldSomeLoading,
      mockFoldInstance.foldSomeUpdating,
      mockFoldInstance.foldSomeError
    )(pot.noneLoading);
    expect(mockFoldInstance.foldNoneLoading).toHaveBeenCalled();
    verifyZeroCallMock(mockFoldInstance, "foldNoneLoading");
  });
  it("should only invoke foldNoneUpdating for pot.noneUpdating", () => {
    const inputObject = {};
    const mockFoldInstance = generateMockFoldInstance();
    foldK(
      mockFoldInstance.foldNone,
      mockFoldInstance.foldNoneLoading,
      mockFoldInstance.foldNoneUpdating,
      mockFoldInstance.foldNoneError,
      mockFoldInstance.foldSome,
      mockFoldInstance.foldSomeLoading,
      mockFoldInstance.foldSomeUpdating,
      mockFoldInstance.foldSomeError
    )(pot.noneUpdating(inputObject));
    expect(mockFoldInstance.foldNoneUpdating).toHaveBeenCalled();
    expect(mockFoldInstance.foldNoneUpdating.mock.calls[0][0]).toBe(
      inputObject
    );
    verifyZeroCallMock(mockFoldInstance, "foldNoneUpdating");
  });
  it("should only invoke foldNoneError for pot.noneError", () => {
    const inputError = new Error("");
    const mockFoldInstance = generateMockFoldInstance();
    foldK(
      mockFoldInstance.foldNone,
      mockFoldInstance.foldNoneLoading,
      mockFoldInstance.foldNoneUpdating,
      mockFoldInstance.foldNoneError,
      mockFoldInstance.foldSome,
      mockFoldInstance.foldSomeLoading,
      mockFoldInstance.foldSomeUpdating,
      mockFoldInstance.foldSomeError
    )(pot.noneError(inputError));
    expect(mockFoldInstance.foldNoneError).toHaveBeenCalled();
    expect(mockFoldInstance.foldNoneError.mock.calls[0][0]).toBe(inputError);
    verifyZeroCallMock(mockFoldInstance, "foldNoneError");
  });
  it("should only invoke foldSome for pot.some", () => {
    const inputObject = {};
    const mockFoldInstance = generateMockFoldInstance();
    foldK(
      mockFoldInstance.foldNone,
      mockFoldInstance.foldNoneLoading,
      mockFoldInstance.foldNoneUpdating,
      mockFoldInstance.foldNoneError,
      mockFoldInstance.foldSome,
      mockFoldInstance.foldSomeLoading,
      mockFoldInstance.foldSomeUpdating,
      mockFoldInstance.foldSomeError
    )(pot.some(inputObject));
    expect(mockFoldInstance.foldSome).toHaveBeenCalled();
    expect(mockFoldInstance.foldSome.mock.calls[0][0]).toBe(inputObject);
    verifyZeroCallMock(mockFoldInstance, "foldSome");
  });
  it("should only invoke foldSomeLoading for pot.someLoading", () => {
    const inputObject = {};
    const mockFoldInstance = generateMockFoldInstance();
    foldK(
      mockFoldInstance.foldNone,
      mockFoldInstance.foldNoneLoading,
      mockFoldInstance.foldNoneUpdating,
      mockFoldInstance.foldNoneError,
      mockFoldInstance.foldSome,
      mockFoldInstance.foldSomeLoading,
      mockFoldInstance.foldSomeUpdating,
      mockFoldInstance.foldSomeError
    )(pot.someLoading(inputObject));
    expect(mockFoldInstance.foldSomeLoading).toHaveBeenCalled();
    expect(mockFoldInstance.foldSomeLoading.mock.calls[0][0]).toBe(inputObject);
    verifyZeroCallMock(mockFoldInstance, "foldSomeLoading");
  });
  it("should only invoke foldSomeUpdating for pot.someUpdating", () => {
    const inputObject = {};
    const updatingObject = {};
    const mockFoldInstance = generateMockFoldInstance();
    foldK(
      mockFoldInstance.foldNone,
      mockFoldInstance.foldNoneLoading,
      mockFoldInstance.foldNoneUpdating,
      mockFoldInstance.foldNoneError,
      mockFoldInstance.foldSome,
      mockFoldInstance.foldSomeLoading,
      mockFoldInstance.foldSomeUpdating,
      mockFoldInstance.foldSomeError
    )(pot.someUpdating(inputObject, updatingObject));
    expect(mockFoldInstance.foldSomeUpdating).toHaveBeenCalled();
    expect(mockFoldInstance.foldSomeUpdating.mock.calls[0][0]).toBe(
      inputObject
    );
    expect(mockFoldInstance.foldSomeUpdating.mock.calls[0][1]).toBe(
      updatingObject
    );
    verifyZeroCallMock(mockFoldInstance, "foldSomeUpdating");
  });
  it("should only invoke foldSomeError for pot.someError", () => {
    const inputObject = {};
    const inputError = new Error("");
    const mockFoldInstance = generateMockFoldInstance();
    foldK(
      mockFoldInstance.foldNone,
      mockFoldInstance.foldNoneLoading,
      mockFoldInstance.foldNoneUpdating,
      mockFoldInstance.foldNoneError,
      mockFoldInstance.foldSome,
      mockFoldInstance.foldSomeLoading,
      mockFoldInstance.foldSomeUpdating,
      mockFoldInstance.foldSomeError
    )(pot.someError(inputObject, inputError));
    expect(mockFoldInstance.foldSomeError).toHaveBeenCalled();
    expect(mockFoldInstance.foldSomeError.mock.calls[0][0]).toBe(inputObject);
    expect(mockFoldInstance.foldSomeError.mock.calls[0][1]).toBe(inputError);
    verifyZeroCallMock(mockFoldInstance, "foldSomeError");
  });
});

describe("isStrictSomeError", () => {
  potInstances.forEach(potInstance => {
    const expectedOutput = potInstance.kind === "PotSomeError";
    it(`should return '${expectedOutput}' for ${potInstance.kind}`, () => {
      const output = isStrictSomeError(potInstance);
      expect(output).toBe(expectedOutput);
    });
  });
});

describe("isSomeLoadingOrSomeUpdating", () => {
  potInstances.forEach(potInstance => {
    const expectedOutput =
      potInstance.kind === "PotSomeLoading" ||
      potInstance.kind === "PotSomeUpdating";
    it(`should return '${expectedOutput}' for ${potInstance.kind}`, () => {
      const output = isSomeLoadingOrSomeUpdating(potInstance);
      expect(output).toBe(expectedOutput);
    });
  });
});

describe("isSomeOrSomeError", () => {
  potInstances.forEach(potInstance => {
    const expectedOutput =
      potInstance.kind === "PotSome" || potInstance.kind === "PotSomeError";
    it(`should return '${expectedOutput}' for ${potInstance.kind}`, () => {
      const output = isSomeOrSomeError(potInstance);
      expect(output).toBe(expectedOutput);
    });
  });
});

describe("isLoadingOrUpdating", () => {
  potInstances.forEach(potInstance => {
    const expectedOutput =
      potInstance.kind === "PotNoneLoading" ||
      potInstance.kind === "PotNoneUpdating" ||
      potInstance.kind === "PotSomeLoading" ||
      potInstance.kind === "PotSomeUpdating";
    it(`should return '${expectedOutput}' for ${potInstance.kind}`, () => {
      const output = isLoadingOrUpdating(potInstance);
      expect(output).toBe(expectedOutput);
    });
  });
});

const generateMockFoldInstance = () => ({
  foldNone: jest.fn(),
  foldNoneLoading: jest.fn(),
  foldNoneUpdating: jest.fn(),
  foldNoneError: jest.fn(),
  foldSome: jest.fn(),
  foldSomeLoading: jest.fn(),
  foldSomeUpdating: jest.fn(),
  foldSomeError: jest.fn()
});

const verifyZeroCallMock = (
  zeroCallMock: any,
  propertyToRemove: keyof typeof zeroCallMock
) => {
  // eslint-disable-next-line functional/immutable-data
  zeroCallMock[propertyToRemove] = undefined;
  // eslint-disable-next-line functional/immutable-data
  delete zeroCallMock[propertyToRemove];
  // eslint-disable-next-line functional/no-let
  let key: keyof typeof zeroCallMock;
  // eslint-disable-next-line guard-for-in
  for (key in zeroCallMock) {
    const value = zeroCallMock[key];
    expect(value).not.toHaveBeenCalled();
  }
};

describe("toUndefinedOptional", () => {
  [undefined, ...potInstances].forEach(aPot => {
    const expectedOutput =
      aPot?.kind === "PotSome" ||
      aPot?.kind === "PotSomeError" ||
      aPot?.kind === "PotSomeLoading" ||
      aPot?.kind === "PotSomeUpdating"
        ? aPot!.value
        : undefined;
    it(`should output (${
      expectedOutput != null ? "data" : "undefined"
    }) for a pot of type ${aPot?.kind}`, () => {
      const output = toUndefinedOptional(aPot);
      expect(output).toBe(expectedOutput);
    });
  });
});

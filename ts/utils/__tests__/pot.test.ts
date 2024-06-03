import * as pot from "@pagopa/ts-commons/lib/pot";
import { foldK, isStrictNone, isStrictSome } from "../pot";

describe("isStrictNone", () => {
  it("should return true for pot.none", () => {
    expect(isStrictNone(pot.none)).toBe(true);
  });
  it("should return false for pot.noneLoading", () => {
    expect(isStrictNone(pot.noneLoading)).toBe(false);
  });
  it("should return false for pot.noneUpdating", () => {
    expect(isStrictNone(pot.noneUpdating({}))).toBe(false);
  });
  it("should return false for pot.noneError", () => {
    expect(isStrictNone(pot.noneError(""))).toBe(false);
  });
  it("should return false for pot.some", () => {
    expect(isStrictNone(pot.some({}))).toBe(false);
  });
  it("should return false for pot.someLoading", () => {
    expect(isStrictNone(pot.someLoading({}))).toBe(false);
  });
  it("should return false for pot.someUpdating", () => {
    expect(isStrictNone(pot.someUpdating({}, {}))).toBe(false);
  });
  it("should return false for pot.someError", () => {
    expect(isStrictNone(pot.someError({}, ""))).toBe(false);
  });
});

describe("isStrictSome", () => {
  it("should return false for pot.none", () => {
    expect(isStrictSome(pot.none)).toBe(false);
  });
  it("should return false for pot.noneLoading", () => {
    expect(isStrictSome(pot.noneLoading)).toBe(false);
  });
  it("should return false for pot.noneUpdating", () => {
    expect(isStrictSome(pot.noneUpdating({}))).toBe(false);
  });
  it("should return false for pot.noneError", () => {
    expect(isStrictSome(pot.noneError(""))).toBe(false);
  });
  it("should return true for pot.some", () => {
    expect(isStrictSome(pot.some({}))).toBe(true);
  });
  it("should return false for pot.someLoading", () => {
    expect(isStrictSome(pot.someLoading({}))).toBe(false);
  });
  it("should return false for pot.someUpdating", () => {
    expect(isStrictSome(pot.someUpdating({}, {}))).toBe(false);
  });
  it("should return false for pot.someError", () => {
    expect(isStrictSome(pot.someError({}, ""))).toBe(false);
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

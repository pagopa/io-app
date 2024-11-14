import { pollForStoreValue } from "../itwStoreUtils";

describe("pollForStoreValue", () => {
  const getStateMock = jest.fn();
  const selectorMock = jest.fn();
  const conditionMock = jest.fn();

  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  it("resolves with the store value once the condition is met", async () => {
    const mockValue = "resolvedValue";
    getStateMock.mockReturnValue({ key: mockValue });
    selectorMock.mockImplementation(state => state.key);
    conditionMock.mockImplementation(value => value === mockValue);

    const pollOptions = {
      getState: getStateMock,
      selector: selectorMock,
      condition: conditionMock,
      interval: 200,
      timeout: 300
    };

    const promise = pollForStoreValue(pollOptions);

    jest.advanceTimersByTime(200);

    await expect(promise).resolves.toBe(mockValue);

    expect(getStateMock).toHaveBeenCalledTimes(1);
    expect(selectorMock).toHaveBeenCalledWith(getStateMock());
    expect(conditionMock).toHaveBeenCalledWith(mockValue);
  });

  it("rejects with an error if the timeout is exceeded", async () => {
    getStateMock.mockReturnValue({ key: "rejectedValue" });
    selectorMock.mockImplementation(state => state.key);
    conditionMock.mockImplementation(value => value === "resolvedValue");

    const pollOptions = {
      getState: getStateMock,
      selector: selectorMock,
      condition: conditionMock,
      interval: 200,
      timeout: 800
    };

    const promise = pollForStoreValue(pollOptions);

    jest.advanceTimersByTime(800);

    await expect(promise).rejects.toThrow(
      "Timeout exceeded while waiting for store value"
    );

    expect(getStateMock).toHaveBeenCalledTimes(5); // called at each interval (500ms) until timeout
  });

  it("polls at the specified interval", async () => {
    getStateMock.mockReturnValue({ key: "value" });
    selectorMock.mockImplementation(state => state.key);
    conditionMock.mockImplementation(() => false);

    const pollOptions = {
      getState: getStateMock,
      selector: selectorMock,
      condition: conditionMock,
      interval: 100,
      timeout: 500
    };

    const promise = pollForStoreValue(pollOptions);

    jest.advanceTimersByTime(500);

    await expect(promise).rejects.toThrow(
      "Timeout exceeded while waiting for store value"
    );
    expect(getStateMock).toHaveBeenCalledTimes(6); // 6 times at 100ms intervals
  });

  it("stops polling once the condition is met", async () => {
    const mockValues = ["value1", "resolvedValue"];

    getStateMock.mockImplementation(() => {
      const index = getStateMock.mock.calls.length - 1;
      return { key: mockValues[index] };
    });

    selectorMock.mockImplementation(state => state.key);
    conditionMock.mockImplementation(value => value === "resolvedValue");

    const pollOptions = {
      getState: getStateMock,
      selector: selectorMock,
      condition: conditionMock,
      interval: 300,
      timeout: 1000
    };

    const promise = pollForStoreValue(pollOptions);

    jest.advanceTimersByTime(300);
    // Fast-forward time by another 300ms to reach the second call, where condition should be met
    jest.advanceTimersByTime(300);

    await expect(promise).resolves.toBe("resolvedValue");

    // Verify that polling stopped after condition was met, with exactly two calls
    expect(getStateMock).toHaveBeenCalledTimes(2);
    expect(selectorMock).toHaveBeenNthCalledWith(1, { key: "value1" });
    expect(selectorMock).toHaveBeenNthCalledWith(2, {
      key: "resolvedValue"
    });
    expect(conditionMock).toHaveBeenNthCalledWith(1, "value1");
    expect(conditionMock).toHaveBeenNthCalledWith(2, "resolvedValue");
  });
});

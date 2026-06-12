/**
 * A mocked version of the BackgroundTimer
 */

const setTimeout = jest.fn();

const BackgroundTimer = {
  setTimeout
};

export default BackgroundTimer;

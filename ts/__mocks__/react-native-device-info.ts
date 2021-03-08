/**
 * A mocked version of the DeviceInfo
 */

const getReadableVersion = jest.fn();
const getDeviceIdMock = jest.fn();
getDeviceIdMock.mockReturnValue("");

const DeviceInfo = {
  getReadableVersion,
  getDeviceId: getDeviceIdMock
};

export default DeviceInfo;

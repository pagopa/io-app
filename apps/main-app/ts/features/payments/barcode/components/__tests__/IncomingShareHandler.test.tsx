import { IOToast } from "@io-app/design-system";
import * as Sharing from "@io-app/expo-share-pdf";
import { act, render, waitFor } from "@testing-library/react-native";
import { Linking } from "react-native";

import NavigationService from "../../../../../navigation/NavigationService";
import { useIOSelector } from "../../../../../store/hooks";
import { StartupStatusEnum } from "../../../../../store/reducers/startup";
import { progressSelector } from "../../../../identification/store/selectors";
import { PaymentsBarcodeRoutes } from "../../navigation/routes";
import { IncomingShareHandler } from "../IncomingShareHandler";

jest.mock("@io-app/expo-share-pdf", () => ({
  getSharedPayloads: jest.fn(),
  clearSharedPayloads: jest.fn(),
  discardSharedFile: jest.fn()
}));
jest.mock("../../../../../navigation/NavigationService", () => ({
  __esModule: true,
  default: { navigate: jest.fn() }
}));
jest.mock("../../../../../store/hooks", () => ({
  useIOSelector: jest.fn()
}));

const pdf = {
  shareType: "file" as const,
  mimeType: "application/pdf",
  value: "content://provider/notice.pdf"
};
const jpeg = {
  shareType: "image" as const,
  mimeType: "image/jpeg",
  value: "content://provider/notice.jpg"
};
const mockSelector = jest.mocked(useIOSelector);
const mockGetSharedPayloads = jest.mocked(Sharing.getSharedPayloads);

beforeEach(() => {
  jest.clearAllMocks();
  mockGetSharedPayloads.mockReturnValue([]);
  mockSelector.mockImplementation(selector =>
    selector === progressSelector
      ? { kind: "identified" }
      : StartupStatusEnum.AUTHENTICATED
  );
  jest.spyOn(Linking, "getInitialURL").mockResolvedValue(null);
});

afterEach(() => jest.restoreAllMocks());

it("keeps a cold-start PDF until login and navigation are ready", async () => {
  jest.mocked(Linking.getInitialURL).mockResolvedValue("ioit://expo-sharing");
  mockSelector.mockImplementation(selector =>
    selector === progressSelector
      ? { kind: "unidentified" }
      : StartupStatusEnum.NOT_AUTHENTICATED
  );
  mockGetSharedPayloads.mockReturnValue([pdf]);

  const screen = render(<IncomingShareHandler isReady={false} />);
  await waitFor(() => expect(Sharing.clearSharedPayloads).toHaveBeenCalled());
  expect(NavigationService.navigate).not.toHaveBeenCalled();

  mockSelector.mockImplementation(selector =>
    selector === progressSelector
      ? { kind: "identified" }
      : StartupStatusEnum.AUTHENTICATED
  );
  screen.rerender(<IncomingShareHandler isReady={true} />);
  await waitFor(() =>
    expect(NavigationService.navigate).toHaveBeenCalledWith(
      PaymentsBarcodeRoutes.PAYMENT_BARCODE_NAVIGATOR,
      {
        screen: PaymentsBarcodeRoutes.PAYMENT_BARCODE_SCAN,
        params: {
          sharedFile: {
            kind: "pdf",
            uri: pdf.value,
            mimeType: pdf.mimeType
          }
        }
      }
    )
  );
});

it("handles an incoming share while the app is running", async () => {
  const subscription = Linking.addEventListener("url", () => {});
  subscription.remove();
  const listenerSpy = jest
    .spyOn(Linking, "addEventListener")
    .mockReturnValue(subscription);
  listenerSpy.mockClear();
  mockGetSharedPayloads.mockReturnValue([pdf]);
  render(<IncomingShareHandler isReady={true} />);

  act(() =>
    listenerSpy.mock.calls[0][1]({
      url: "it.pagopa.app.io://expo-sharing"
    })
  );
  await waitFor(() => expect(NavigationService.navigate).toHaveBeenCalled());
});

it("waits for identification before starting the payment flow", async () => {
  jest.mocked(Linking.getInitialURL).mockResolvedValue("ioit://expo-sharing");
  mockGetSharedPayloads.mockReturnValue([pdf]);
  mockSelector.mockImplementation(selector =>
    selector === progressSelector
      ? { kind: "started" }
      : StartupStatusEnum.AUTHENTICATED
  );
  const screen = render(<IncomingShareHandler isReady={true} />);
  await waitFor(() => expect(Sharing.clearSharedPayloads).toHaveBeenCalled());
  expect(NavigationService.navigate).not.toHaveBeenCalled();

  mockSelector.mockImplementation(selector =>
    selector === progressSelector
      ? { kind: "identified" }
      : StartupStatusEnum.AUTHENTICATED
  );
  screen.rerender(<IncomingShareHandler isReady={true} />);
  await waitFor(() => expect(NavigationService.navigate).toHaveBeenCalled());
});

it("rejects unsupported shared files without starting a payment", async () => {
  jest.mocked(Linking.getInitialURL).mockResolvedValue("ioit://expo-sharing");
  mockGetSharedPayloads.mockReturnValue([
    { ...pdf, mimeType: "video/mp4", shareType: "video" }
  ]);
  const toast = jest.spyOn(IOToast, "error").mockImplementation(() => {});

  render(<IncomingShareHandler isReady={true} />);
  await waitFor(() => expect(toast).toHaveBeenCalled());
  expect(NavigationService.navigate).not.toHaveBeenCalled();
});

it("rejects and discards multiple shared payloads", async () => {
  jest.mocked(Linking.getInitialURL).mockResolvedValue("ioit://expo-sharing");
  mockGetSharedPayloads.mockReturnValue([pdf, jpeg]);
  const toast = jest.spyOn(IOToast, "error").mockImplementation(() => {});

  render(<IncomingShareHandler isReady={true} />);
  await waitFor(() => expect(toast).toHaveBeenCalled());

  expect(Sharing.discardSharedFile).toHaveBeenCalledWith(pdf.value);
  expect(Sharing.discardSharedFile).toHaveBeenCalledWith(jpeg.value);
  expect(NavigationService.navigate).not.toHaveBeenCalled();
});

it("routes a shared JPEG to the payment barcode scanner", async () => {
  jest.mocked(Linking.getInitialURL).mockResolvedValue("ioit://expo-sharing");
  mockGetSharedPayloads.mockReturnValue([jpeg]);

  render(<IncomingShareHandler isReady={true} />);
  await waitFor(() =>
    expect(NavigationService.navigate).toHaveBeenCalledWith(
      PaymentsBarcodeRoutes.PAYMENT_BARCODE_NAVIGATOR,
      {
        screen: PaymentsBarcodeRoutes.PAYMENT_BARCODE_SCAN,
        params: {
          sharedFile: {
            kind: "image",
            uri: jpeg.value,
            mimeType: jpeg.mimeType
          }
        }
      }
    )
  );
});

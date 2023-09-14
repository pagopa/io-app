import * as E from "fp-ts/lib/Either";
import { FullReceivedNotification } from "../types";

describe("FullReceivedNotification type", () => {
  it("should decode a cancelled notification with completed payments list", () => {
    const completedPayments = [
      "046096624997957981",
      "077496787518185745",
      "069152067937239906"
    ];
    const fullReceivedNotification = {
      subject: "The subject",
      iun: "731143-7-0317-8200-0",
      recipients: [],
      notificationStatusHistory: [],
      isCancelled: true,
      completedPayments
    };
    const maybeFullReceivedNotification = FullReceivedNotification.decode(
      fullReceivedNotification
    );
    expect(E.isRight(maybeFullReceivedNotification)).toBe(true);
    expect(
      (maybeFullReceivedNotification as E.Right<FullReceivedNotification>).right
        .isCancelled
    ).toBe(true);
    expect(
      (maybeFullReceivedNotification as E.Right<FullReceivedNotification>).right
        .completedPayments
    ).toBe(completedPayments);
  });
  it("should decode a cancelled notification with no completed payments list", () => {
    const fullReceivedNotification = {
      subject: "The subject",
      iun: "731143-7-0317-8200-0",
      recipients: [],
      notificationStatusHistory: [],
      isCancelled: true
    };
    const maybeFullReceivedNotification = FullReceivedNotification.decode(
      fullReceivedNotification
    );
    expect(E.isRight(maybeFullReceivedNotification)).toBe(true);
    expect(
      (maybeFullReceivedNotification as E.Right<FullReceivedNotification>).right
        .isCancelled
    ).toBe(true);
    expect(
      (maybeFullReceivedNotification as E.Right<FullReceivedNotification>).right
        .completedPayments
    ).toBeUndefined();
  });
  it("should decode an explicitly not cancelled notification with no completed payments list", () => {
    const fullReceivedNotification = {
      subject: "The subject",
      iun: "731143-7-0317-8200-0",
      recipients: [],
      notificationStatusHistory: [],
      isCancelled: false
    };
    const maybeFullReceivedNotification = FullReceivedNotification.decode(
      fullReceivedNotification
    );
    expect(E.isRight(maybeFullReceivedNotification)).toBe(true);
    expect(
      (maybeFullReceivedNotification as E.Right<FullReceivedNotification>).right
        .isCancelled
    ).toBe(false);
    expect(
      (maybeFullReceivedNotification as E.Right<FullReceivedNotification>).right
        .completedPayments
    ).toBeUndefined();
  });
  it("should decode an implicitly not cancelled notification with no completed payments list", () => {
    const fullReceivedNotification = {
      subject: "The subject",
      iun: "731143-7-0317-8200-0",
      recipients: [],
      notificationStatusHistory: []
    };
    const maybeFullReceivedNotification = FullReceivedNotification.decode(
      fullReceivedNotification
    );
    expect(E.isRight(maybeFullReceivedNotification)).toBe(true);
    expect(
      (maybeFullReceivedNotification as E.Right<FullReceivedNotification>).right
        .isCancelled
    ).toBeUndefined();
    expect(
      (maybeFullReceivedNotification as E.Right<FullReceivedNotification>).right
        .completedPayments
    ).toBeUndefined();
  });
});

import MockDate from "mockdate";
import { testableOtpCodeRefreshComponent } from "../merchants/discount/OtpCodeComponent";
import { OtpCode } from "../../../../../../definitions/cgn/OtpCode";

describe("getOtpTTL", () => {
  it("should return the difference in millis from now to expires date", () => {
    const startDate = new Date(2000, 1, 1, 1, 0, 0);
    const millisInFuture = 10 * 1000;
    const otp = {
      code: "XXR3E4PNG36" as OtpCode,
      expires_at: new Date(startDate.getTime() + millisInFuture),
      ttl: 10
    };
    MockDate.set(startDate);
    expect(testableOtpCodeRefreshComponent!.getOtpTTL(otp)).toEqual(
      millisInFuture
    );
  });

  it("should return the ttl in millis when expires date is less than now", () => {
    const startDate = new Date(2000, 1, 1, 1, 0, 0);
    const millisInFuture = 10 * 1000;
    const otp = {
      code: "XXR3E4PNG36" as OtpCode,
      expires_at: new Date(startDate.getTime() - millisInFuture),
      ttl: 100
    };
    MockDate.set(startDate);
    expect(testableOtpCodeRefreshComponent!.getOtpTTL(otp)).toEqual(
      otp.ttl * 1000
    );
  });

  it("should return the minimum between computed date and ttl", () => {
    const startDate = new Date(2000, 1, 1, 1, 0, 0);
    const millisInFuture = 10 * 1000;
    const otp = {
      code: "XXR3E4PNG36" as OtpCode,
      expires_at: new Date(startDate.getTime() - millisInFuture),
      ttl: 1
    };
    MockDate.set(startDate);
    expect(testableOtpCodeRefreshComponent!.getOtpTTL(otp)).toEqual(
      otp.ttl * 1000
    );
  });
});

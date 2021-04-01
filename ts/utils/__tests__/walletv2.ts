import {
  isRawBancomat,
  isRawBPay,
  isRawCreditCard,
  isRawSatispay,
  PatchedWalletV2
} from "../../types/pagopa";
import {
  walletsV2_1,
  walletsV2_2,
  walletsV2_3
} from "../../store/reducers/wallet/__mocks__/wallets";
import { convertWalletV2toWalletV1 } from "../walletv2";

describe("convert and recognize 2 bancomat and 1 credit card", () => {
  const wallets = (walletsV2_1.data as ReadonlyArray<PatchedWalletV2>).map(
    convertWalletV2toWalletV1
  );
  it("should convert walletv2 to walletv1", () => {
    expect(wallets.length).toEqual(3);
  });
  it("should recognize credit card", () => {
    expect(
      wallets.filter(w => isRawCreditCard(w.paymentMethod)).length
    ).toEqual(1);
  });
  it("should recognize bancomat", () => {
    expect(wallets.filter(w => isRawBancomat(w.paymentMethod)).length).toEqual(
      2
    );
  });
});

describe("convert and recognize 1 bancomat and 1 credit card", () => {
  const wallets = (walletsV2_2.data as ReadonlyArray<PatchedWalletV2>).map(
    convertWalletV2toWalletV1
  );
  it("should convert walletv2 to walletv1", () => {
    expect(wallets.length).toEqual(2);
  });
  // eslint-disable-next-line sonarjs/no-identical-functions
  it("should recognize credit card", () => {
    expect(
      wallets.filter(w => isRawCreditCard(w.paymentMethod)).length
    ).toEqual(1);
  });
  it("should recognize bancomat", () => {
    expect(wallets.filter(w => isRawBancomat(w.paymentMethod)).length).toEqual(
      1
    );
  });
});

describe("convert and recognize 1 bancomat, 1 satispay, 1 bancomat pay, 1 credit card", () => {
  const wallets = (walletsV2_3.data as ReadonlyArray<PatchedWalletV2>).map(
    convertWalletV2toWalletV1
  );
  it("should convert walletv2 to walletv1", () => {
    expect(wallets.length).toEqual(4);
  });
  // eslint-disable-next-line sonarjs/no-identical-functions
  it("should recognize credit card", () => {
    expect(
      wallets.filter(w => isRawCreditCard(w.paymentMethod)).length
    ).toEqual(1);
  });
  // eslint-disable-next-line sonarjs/no-identical-functions
  it("should recognize bancomat", () => {
    expect(wallets.filter(w => isRawBancomat(w.paymentMethod)).length).toEqual(
      1
    );
  });

  it("should recognize bancomatPay", () => {
    expect(wallets.filter(w => isRawBPay(w.paymentMethod)).length).toEqual(1);
  });

  it("should recognize satispay", () => {
    expect(wallets.filter(w => isRawSatispay(w.paymentMethod)).length).toEqual(
      1
    );
  });
});

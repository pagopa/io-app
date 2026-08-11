import { EnableableFunctionsEnum } from "@io-app/api-types/generated/definitions/pagopa/EnableableFunctions";
import { PspDataListResponse } from "@io-app/api-types/generated/definitions/pagopa/PspDataListResponse";
import { Psp } from "@io-app/api-types/generated/definitions/pagopa/walletv2/Psp";
import { SessionResponse } from "@io-app/api-types/generated/definitions/pagopa/walletv2/SessionResponse";
import { TransactionListResponse } from "@io-app/api-types/generated/definitions/pagopa/walletv2/TransactionListResponse";
import { WalletListResponse } from "@io-app/api-types/generated/definitions/pagopa/walletv2/WalletListResponse";
import * as E from "fp-ts/lib/Either";
import supertest, { Response } from "supertest";

import { sessionToken } from "../../payloads/wallet";
import app from "../../server";
import { PatchedWalletV2 } from "../../types/PatchedWalletV2";
import { PatchedWalletV2ListResponse } from "../../types/PatchedWalletV2ListResponse";
import { PatchedWalletV2Response } from "../../types/PatchedWalletV2Response";
import { appendWalletV1Prefix, appendWalletV2Prefix } from "../../utils/wallet";
import {
  transactionPageSize,
  transactions,
  transactionsTotal,
  walletCount
} from "../wallet";

const request = supertest(app);
const testGetWallets = (response: Response) => {
  expect(response.status).toBe(200);
  const wallets = WalletListResponse.decode(response.body);
  expect(E.isRight(wallets)).toBeTruthy();
  if (E.isRight(wallets)) {
    if (wallets.right.data) {
      expect(wallets.right.data.length).toBe(walletCount);
    }
    return wallets.right;
  } else {
    return wallets.left;
  }
};

const testGetWalletsV2 = (
  response: Response
): ReadonlyArray<PatchedWalletV2> => {
  expect(response.status).toBe(200);
  const wallets = PatchedWalletV2ListResponse.decode(response.body);
  expect(E.isRight(wallets)).toBeTruthy();
  if (E.isRight(wallets) && wallets.right.data) {
    expect(wallets.right.data.length ?? 0).toBe(walletCount);
    return wallets.right.data;
  }
  return [];
};

it("/wallet should return a list of wallets (payments method instances)", async () => {
  const response = await request.get(appendWalletV1Prefix("/wallet"));
  testGetWallets(response);
});

it("should start a valid session", async () => {
  const response = await request.get(
    appendWalletV1Prefix("/users/actions/start-session")
  );
  expect(response.status).toBe(200);
  const session = SessionResponse.decode(response.body);
  expect(E.isRight(session)).toBeTruthy();
  if (E.isRight(session)) {
    expect(session.right).toEqual(sessionToken);
  }
});

it("should set a wallet as favourite", async () => {
  const responseWallets = await request.get(appendWalletV2Prefix("/wallet"));
  const wallets = testGetWalletsV2(responseWallets);
  const firstWallet = wallets[0];
  const response = await request.post(
    appendWalletV1Prefix(`/wallet/${firstWallet.idWallet}/actions/favourite`)
  );
  expect(response.status).toBe(200);
});

it("should set pagoPa flag to false (if credit card > 1)", async () => {
  const responseWallets = await request.get(appendWalletV2Prefix("/wallet"));
  const wallets = testGetWalletsV2(responseWallets);
  const firstWallet = wallets.find(w =>
    (w.enableableFunctions ?? []).some(
      ef => ef === EnableableFunctionsEnum.pagoPA
    )
  );
  // wallet should include at least 1 credit card (check global/config)
  expect(firstWallet).toBeDefined();
  const response = await request
    .put(
      appendWalletV2Prefix(`/wallet/${firstWallet!.idWallet}/payment-status`)
    )
    .send({ data: { pagoPA: false } });
  expect(response.status).toBe(200);
  const responsePayload = PatchedWalletV2Response.decode(response.body);
  expect(E.isRight(responsePayload)).toBeTruthy();
  if (E.isRight(responsePayload)) {
    expect(responsePayload.right).toEqual({
      data: { ...firstWallet, favourite: false, pagoPA: false }
    });
  }
  // invert
  const responseInvert = await request
    .put(
      appendWalletV2Prefix(`/wallet/${firstWallet!.idWallet}/payment-status`)
    )
    .send({ data: { pagoPA: true } });
  expect(responseInvert.status).toBe(200);
  const responsePayloadInvert = PatchedWalletV2Response.decode(
    responseInvert.body
  );
  expect(E.isRight(responsePayloadInvert)).toBeTruthy();
  if (E.isRight(responsePayloadInvert)) {
    expect(responsePayloadInvert.right).toEqual({
      data: { ...firstWallet, favourite: false, pagoPA: true }
    });
  }
});

it("should remove in bulk all these methods that have a specific function enabled", async () => {
  const responseWallets = await request.get(appendWalletV2Prefix("/wallet"));
  const wallets = testGetWalletsV2(responseWallets);
  wallets.filter(w =>
    (w.enableableFunctions ?? []).includes(EnableableFunctionsEnum.pagoPA)
  );
  wallets.filter(w =>
    (w.enableableFunctions ?? []).includes(EnableableFunctionsEnum.BPD)
  );
  wallets.filter(w =>
    (w.enableableFunctions ?? []).includes(EnableableFunctionsEnum.FA)
  );
  await request.delete(
    appendWalletV2Prefix(
      `/wallet/delete-wallets?service=${EnableableFunctionsEnum.pagoPA}`
    )
  );
  await request.delete(
    appendWalletV2Prefix(
      `/wallet/delete-wallets?service=${EnableableFunctionsEnum.BPD}`
    )
  );
  await request.delete(
    appendWalletV2Prefix(
      `/wallet/delete-wallets?service=${EnableableFunctionsEnum.FA}`
    )
  );
});

it("should fails to set a non existing wallet as favourite", async () => {
  const response = await request.post(
    appendWalletV1Prefix(`/wallet/-1234/actions/favourite`)
  );
  expect(response.status).toBe(404);
});

it("services should return a valid transactions list", async () => {
  const response = await request.get(appendWalletV1Prefix("/transactions"));
  expect(response.status).toBe(200);
  const list = TransactionListResponse.decode(response.body);
  expect(E.isRight(list)).toBeTruthy();
  if (E.isRight(list)) {
    expect(list.right.data).toEqual(transactions.slice(0, transactionPageSize));
    if (list.right.data) {
      expect(list.right.data.length).toEqual(
        Math.min(transactionPageSize, transactions.length)
      );
    }
  }
});

it("services should return a valid transactions list slice", async () => {
  const response = await request.get(
    appendWalletV1Prefix(`/transactions?start=${transactionsTotal - 1}`)
  );
  expect(response.status).toBe(200);
  const list = TransactionListResponse.decode(response.body);
  expect(E.isRight(list)).toBeTruthy();
  if (E.isRight(list) && list.right.data) {
    expect(list.right.data.length).toEqual(1);
  }
});

it("services should return an empty data transactions", async () => {
  const response = await request.get(
    appendWalletV1Prefix(`/transactions?start=${transactionsTotal + 1}`)
  );
  expect(response.status).toBe(200);
  const list = TransactionListResponse.decode(response.body);
  expect(E.isRight(list)).toBeTruthy();
  if (E.isRight(list) && list.right.data) {
    expect(list.right.data.length).toEqual(0);
  }
});

it("should return a valid psp", async () => {
  const response = await request.get(appendWalletV1Prefix(`/psps/43188`));
  expect(response.status).toBe(200);
  const psp = Psp.decode(response.body);
  expect(E.isRight(psp)).toBeTruthy();
});

it("should return a valid psp list (v2)", async () => {
  const response = await request.get(
    appendWalletV2Prefix(`/payments/1234/psps?idWallet=1`)
  );
  expect(response.status).toBe(200);
  const psp = PspDataListResponse.decode(response.body);
  expect(E.isRight(psp)).toBeTruthy();
});

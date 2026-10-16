import { CardInfo } from "@io-app/api-types/generated/definitions/pagopa/walletv2/CardInfo";
import { CobadegPaymentInstrumentsRequest } from "@io-app/api-types/generated/definitions/pagopa/walletv2/CobadegPaymentInstrumentsRequest";
import { CobadgeResponse } from "@io-app/api-types/generated/definitions/pagopa/walletv2/CobadgeResponse";
import {
  PaymentInstrument,
  PaymentNetworkEnum,
  ProductTypeEnum,
  ValidityStatusEnum
} from "@io-app/api-types/generated/definitions/pagopa/walletv2/PaymentInstrument";
import { RestCobadgeResponse } from "@io-app/api-types/generated/definitions/pagopa/walletv2/RestCobadgeResponse";
import { WalletTypeEnum } from "@io-app/api-types/generated/definitions/pagopa/walletv2/WalletV2";
import { readableReport } from "@pagopa/ts-commons/lib/reporters";
import { Request, Response, Router } from "express";
import * as E from "fp-ts/lib/Either";
import fs from "fs";

import { assetsFolder } from "../../../config";
import { addHandler } from "../../../payloads/response";
import { readFileAsJSON } from "../../../utils/file";
import { appendWalletV1Prefix } from "../../../utils/wallet";
import {
  addWalletV2,
  citizenCreditCardCoBadge,
  citizenPrivativeCard,
  getWalletV2
} from "../index";
import { bancomatRouter } from "./bancomat";

const productTypes = Object.values(ProductTypeEnum);
const paymentNetworks = Object.values(PaymentNetworkEnum);
export const cobadgeRouter = Router();

const fromCardInfoToCardBadge = (
  idWallet: number,
  card: CardInfo
): PaymentInstrument => ({
  abiCode: card.issuerAbiCode,
  expiringDate: new Date(
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    parseInt(card.expireYear!, 10),
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    parseInt(card.expireMonth!, 10) - 1,
    1
  ),
  hpan: card.hashPan,
  panCode: "123",
  panPartialNumber: card.blurredNumber,
  productType: productTypes[idWallet % productTypes.length],
  paymentNetwork: paymentNetworks[idWallet % paymentNetworks.length],
  validityStatus: ValidityStatusEnum.VALID,
  tokenMac: "tokenMac"
});

const handleCobadge = (req: Request, res: Response) => {
  // load the stub and fill it with cobadge cards
  const pansStubData = fs
    .readFileSync(assetsFolder + "/pm/cobadge/pans.json")
    .toString();
  const maybeResponse = CobadgeResponse.decode(JSON.parse(pansStubData));
  if (E.isLeft(maybeResponse)) {
    res.status(400).send(readableReport(maybeResponse.left));
    return;
  }
  const queryAbi: string | undefined =
    typeof req.query.abiCode === "string" ? req.query.abiCode : undefined;
  const paymentInstruments: ReadonlyArray<PaymentInstrument> =
    citizenCreditCardCoBadge
      .filter(cb =>
        // filter only the card that match the query abi if it is defined
        queryAbi ? queryAbi === (cb.info as CardInfo).issuerAbiCode : true
      )
      .map<PaymentInstrument>(cb =>
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        fromCardInfoToCardBadge(cb.idWallet!, cb.info as CardInfo)
      );
  const cobadgeResponse = maybeResponse.right;
  const response = {
    ...cobadgeResponse,
    payload: { ...cobadgeResponse.payload, paymentInstruments }
  };
  const validResponse = RestCobadgeResponse.decode({ data: response });
  if (E.isLeft(validResponse)) {
    res.status(500).send(readableReport(validResponse.left));
    return;
  }
  res.status(200).json(validResponse.right);
};

const handlePrivative = (req: Request, res: Response) => {
  const maybeResponse = CobadgeResponse.decode(
    readFileAsJSON(assetsFolder + "/pm/cobadge/pans.json")
  );
  if (E.isLeft(maybeResponse)) {
    res.status(400).send(readableReport(maybeResponse.left));
    return;
  }
  const queryAbi: string | undefined =
    typeof req.query.abiCode === "string" ? req.query.abiCode : undefined;
  const foundPrivative = citizenPrivativeCard.filter(cb =>
    // filter only the card that match the query abi if it is defined
    queryAbi ? queryAbi === (cb.info as CardInfo).issuerAbiCode : true
  );
  const paymentInstruments: ReadonlyArray<PaymentInstrument> =
    foundPrivative.map<PaymentInstrument>(cp => ({
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      ...fromCardInfoToCardBadge(cp.idWallet!, cp.info as CardInfo),
      productType: ProductTypeEnum.PRIVATIVE
    }));
  const cobadgeResponse = maybeResponse.right;
  const response = {
    ...cobadgeResponse,
    payload: {
      ...cobadgeResponse.payload,
      paymentInstruments
    }
  };
  const validResponse = RestCobadgeResponse.decode({ data: response });
  if (E.isLeft(validResponse)) {
    res.status(500).send(readableReport(validResponse.left));
    return;
  }
  res.status(200).json(validResponse.right);
};

/** Return the cobadge list owned by the citizen */
addHandler(
  bancomatRouter,
  "get",
  appendWalletV1Prefix("/cobadge/pans"),
  (req, res) => {
    if (req.headers.pancode !== undefined) {
      handlePrivative(req, res);
    } else {
      handleCobadge(req, res);
    }
  }
);

/**
 * Return the cobadge list owned by the citizen (when pans can't return a
 * response)
 */
addHandler(
  bancomatRouter,
  "get",
  appendWalletV1Prefix("/cobadge/search/:searchRequestId"),
  (req, res) => {
    if (req.params.searchRequestId === undefined) {
      res.sendStatus(400);
      return;
    }
    // load the stub and fill it with cobadge cards
    const pansStubData = fs
      .readFileSync(assetsFolder + "/pm/cobadge/search.json")
      .toString();
    const maybeResponse = CobadgeResponse.decode(JSON.parse(pansStubData));
    if (E.isLeft(maybeResponse)) {
      res.status(400).send(readableReport(maybeResponse.left));
      return;
    }
    const paymentInstruments: ReadonlyArray<PaymentInstrument> =
      citizenCreditCardCoBadge.map<PaymentInstrument>(cb =>
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        fromCardInfoToCardBadge(cb.idWallet!, cb.info as CardInfo)
      );
    const cobadgeResponse = maybeResponse.right;
    const response = {
      ...cobadgeResponse,
      payload: { ...cobadgeResponse.payload, paymentInstruments }
    };
    const validResponse = RestCobadgeResponse.decode({ data: response });
    if (E.isLeft(validResponse)) {
      res.status(500).send(readableReport(validResponse.left));
      return;
    }
    res.status(200).json(validResponse.right);
  }
);

/**
 * Return the cobadge list owned by the citizen (when pans can't return a
 * response)
 */
addHandler(
  bancomatRouter,
  "post",
  appendWalletV1Prefix("/cobadge/add-wallets"),
  (req, res) => {
    const data = req.body;
    const maybeData = CobadegPaymentInstrumentsRequest.decode(data);
    // cant decode the body
    if (E.isLeft(maybeData)) {
      res.status(400).send(readableReport(maybeData.left));
      return;
    }
    // assume the request includes only ONE card
    const paymentInstrument =
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      maybeData.right.data!.payload!.paymentInstruments![0];
    const cobadge = [...citizenCreditCardCoBadge, ...citizenPrivativeCard].find(
      cc => (cc.info as CardInfo).issuerAbiCode === paymentInstrument.abiCode
    );
    if (cobadge === undefined) {
      res.sendStatus(400);
      return;
    }
    const walletData = getWalletV2();
    const walletV2 = walletData.find(
      w =>
        w.info &&
        w.walletType === WalletTypeEnum.Card &&
        (w.info as CardInfo).hashPan === paymentInstrument.hpan
    );
    // already present
    if (walletV2) {
      res.json({ data: [walletV2] });
      return;
    }
    addWalletV2([cobadge], true);
    res.json({ data: [cobadge] });
  }
);

import { EnableableFunctionsEnum } from "@io-app/api-types/generated/definitions/pagopa/EnableableFunctions";
import { BPay } from "@io-app/api-types/generated/definitions/pagopa/walletv2/BPay";
import { BPayInfo } from "@io-app/api-types/generated/definitions/pagopa/walletv2/BPayInfo";
import { BPayRequest } from "@io-app/api-types/generated/definitions/pagopa/walletv2/BPayRequest";
import { WalletTypeEnum } from "@io-app/api-types/generated/definitions/pagopa/walletv2/WalletV2";
import { Router } from "express";
import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";

import { addHandler } from "../../../payloads/response";
import { generateWalletV2FromSatispayOrBancomatPay } from "../../../payloads/wallet_v2";
import { appendWalletV1Prefix } from "../../../utils/wallet";
import { addWalletV2, bPayResponse, getWalletV2 } from "../index";

export const bpayRouter = Router();
// add the given list of bpay to the wallet
addHandler(
  bpayRouter,
  "post",
  appendWalletV1Prefix("/bpay/add-wallets"),
  (req, res) => {
    pipe(
      req.body,
      BPayRequest.decode,
      E.fold(
        () => {
          res.sendStatus(400);
        },
        bpay => {
          pipe(
            bpay.data,
            O.fromNullable,
            O.fold(
              () => {
                res.sendStatus(400);
              },
              (bPayList: ReadonlyArray<BPay>) => {
                const walletData = getWalletV2();
                // all method different from the adding ones
                const walletsBPay = walletData.filter(
                  w =>
                    w.walletType !== WalletTypeEnum.BPay ||
                    (w.walletType === WalletTypeEnum.BPay &&
                      !bPayList.some(
                        (bp: BPay) =>
                          bp.uidHash === (w.info as BPayInfo).uidHash
                      ))
                );
                const w2BpayList = bPayList.map(bp =>
                  generateWalletV2FromSatispayOrBancomatPay(
                    bp,
                    WalletTypeEnum.BPay,
                    [EnableableFunctionsEnum.pagoPA],
                    true
                  )
                );
                addWalletV2([...walletsBPay, ...w2BpayList], false);
                res.json({ data: w2BpayList });
              }
            )
          );
        }
      )
    );
  }
);

// return the bpay owned by the citizen
addHandler(bpayRouter, "get", appendWalletV1Prefix("/bpay/list"), (req, res) =>
  res.json(bPayResponse)
);

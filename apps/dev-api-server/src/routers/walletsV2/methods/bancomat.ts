import { EnableableFunctionsEnum } from "@io-app/api-types/generated/definitions/pagopa/EnableableFunctions";
import { BancomatCardsRequest } from "@io-app/api-types/generated/definitions/pagopa/walletv2/BancomatCardsRequest";
import { Card } from "@io-app/api-types/generated/definitions/pagopa/walletv2/Card";
import { Message } from "@io-app/api-types/generated/definitions/pagopa/walletv2/Message";
import { WalletTypeEnum } from "@io-app/api-types/generated/definitions/pagopa/walletv2/WalletV2";
import { Router } from "express";
import * as E from "fp-ts/lib/Either";
import { constUndefined, pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import fs from "fs";
import * as t from "io-ts";

import { assetsFolder } from "../../../config";
import { addHandler } from "../../../payloads/response";
import { generateWalletV2FromCard } from "../../../payloads/wallet_v2";
import { appendWalletV1Prefix } from "../../../utils/wallet";
import { abiResponse, addWalletV2, getWalletV2, pansResponse } from "../index";

export const bancomatRouter = Router();
/**
 * Return the banks list if 'abiQuery' is defined in query string a filter on
 * name and abi will be applied NOTE: actually the app doesn't use this API, it
 * uses /services_metadata.ts/api.json instead
 */
addHandler(
  bancomatRouter,
  "get",
  appendWalletV1Prefix("/bancomat/abi"),
  (req, res) => {
    const abiQuery =
      typeof req.query.abiQuery === "string" ? req.query.abiQuery : null;
    if (abiQuery) {
      const s = abiQuery.toLowerCase().trim();
      return {
        payload: {
          ...abiResponse,
          data: (abiResponse.data ?? []).filter(
            a =>
              // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
              a.name!.toLowerCase().indexOf(s) !== -1 ||
              // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
              a.abi!.toLowerCase().indexOf(s) !== -1
          )
        }
      };
    }
    res.json(abiResponse);
  }
);

/**
 * Return the pans list (bancomat) if 'abi' is defined in query string a filter
 * on abi will be applied
 */
addHandler(
  bancomatRouter,
  "get",
  appendWalletV1Prefix("/bancomat/pans"),
  (req, res) => {
    const abi = typeof req.query.abi === "string" ? req.query.abi : null;
    const msg = fs
      .readFileSync(assetsFolder + "/pm/pans/messages.json")
      .toString();
    const response = {
      ...pansResponse,
      data: {
        ...pansResponse.data,
        messages: pipe(
          JSON.parse(msg),
          t.readonlyArray(Message).decode,
          E.getOrElseW(constUndefined)
        )
      }
    };
    if (!abi) {
      res.json(response);
      return;
    }
    // return only the bancomat that match the abi query
    res.json({
      ...response,
      data: {
        data:
          response.data &&
          response.data.data !== undefined &&
          response.data.data.length > 0
            ? response.data.data.filter(c =>
                c.abi ? c.abi.indexOf(abi) !== -1 : false
              )
            : []
      }
    });
  }
);

// add a list of bancomat to the wallet
addHandler(
  bancomatRouter,
  "post",
  appendWalletV1Prefix("/bancomat/add-wallets"),
  (req, res) => {
    const data = req.body;
    const maybeData = BancomatCardsRequest.decode(data);
    // cant decode the body
    if (E.isLeft(maybeData)) {
      res.sendStatus(400);
      return;
    }
    const walletData = getWalletV2();
    const bancomatsToAdd = maybeData.right.data?.data ?? [];
    // check if a bancomat is already present in the wallet list
    const findBancomat = (card: Card): Card | undefined =>
      walletData.find(nc =>
        pipe(
          O.fromNullable(nc),

          O.map<typeof nc, any>(
            v => v.info !== undefined && card.hpan === (v.info as any).hashPan
          ),
          O.getOrElse(() => false)
        )
      );
    // don't add bancomat already present in wallet list (same hpan)
    const bancomatNotPresent = bancomatsToAdd.filter(
      c => findBancomat(c) === undefined
    );
    const bancomatAlreadyPresent = bancomatsToAdd.filter(
      c => findBancomat(c) !== undefined
    );
    const bancomatAdded: ReadonlyArray<Card> = [
      ...bancomatNotPresent,
      ...bancomatAlreadyPresent
    ];
    // transform bancomat to walletv2
    const addedBancomatsWalletV2 = bancomatNotPresent.map(c =>
      generateWalletV2FromCard(c, WalletTypeEnum.Bancomat, false, [
        EnableableFunctionsEnum.BPD,
        EnableableFunctionsEnum.FA
      ])
    );
    addWalletV2([...walletData, ...addedBancomatsWalletV2], false);
    res.json({
      data: bancomatAdded.map(c =>
        generateWalletV2FromCard(c, WalletTypeEnum.Bancomat, false, [
          EnableableFunctionsEnum.BPD,
          EnableableFunctionsEnum.FA
        ])
      )
    });
  }
);

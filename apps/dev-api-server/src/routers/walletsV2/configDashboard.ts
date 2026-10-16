import { BPayInfo } from "@io-app/api-types/generated/definitions/pagopa/walletv2/BPayInfo";
import { CardInfo } from "@io-app/api-types/generated/definitions/pagopa/walletv2/CardInfo";
import { SatispayInfo } from "@io-app/api-types/generated/definitions/pagopa/walletv2/SatispayInfo";
import { WalletTypeEnum } from "@io-app/api-types/generated/definitions/pagopa/walletv2/WalletV2";
import { Router } from "express";

import { ioDevServerConfig } from "../../config";
import { addHandler } from "../../payloads/response";
import {
  isCobadge,
  isPrivative,
  resetCardConfig
} from "../../payloads/wallet_v2";
import {
  generateWalletV2Data,
  getWalletV2,
  updateWalletV2Config,
  walletV2Config
} from "./index";

export const dashboardWalletV2Router = Router();

// get walletv2-bpd config (dashboard web)
addHandler(dashboardWalletV2Router, "get", "/walletv2/config", (_, res) =>
  res.json(walletV2Config)
);

// update walletv2-bpd config (dashboard web)
addHandler(dashboardWalletV2Router, "post", "/walletv2/config", (req, res) => {
  updateWalletV2Config(req.body);
  resetCardConfig();
  generateWalletV2Data();
  res.json(walletV2Config);
});

// get all payment methods compliant with BPD (dashboard web)
const getBPDPaymentMethod = () =>
  getWalletV2().map(bpd => {
    if (
      bpd.walletType === WalletTypeEnum.Card ||
      bpd.walletType === WalletTypeEnum.Bancomat
    ) {
      return {
        hpan: (bpd.info as CardInfo).hashPan,
        pan: (bpd.info as CardInfo).blurredNumber,
        type: isPrivative(bpd, bpd.info as CardInfo)
          ? "Privative"
          : isCobadge(bpd, bpd.info as CardInfo)
            ? "Cobadge"
            : bpd.walletType,
        pagopa: bpd.pagoPA,
        abiCode: isCobadge(bpd, bpd.info as CardInfo)
          ? (bpd.info as CardInfo).issuerAbiCode
          : undefined
      };
    }
    if (bpd.walletType === WalletTypeEnum.Satispay) {
      return {
        hpan: (bpd.info as SatispayInfo).uuid,
        pan: "--",
        type: bpd.walletType,
        pagopa: bpd.pagoPA
      };
    }
    if (bpd.walletType === WalletTypeEnum.BPay) {
      return {
        hpan: (bpd.info as BPayInfo).uidHash,
        pan: "--",
        type: bpd.walletType,
        pagopa: bpd.pagoPA
      };
    }
    return {
      hpan: "--",
      pan: "--",
      type: bpd.walletType
    };
  });

// get the hpans of walletv2 that support BPD (dashboard web)
addHandler(
  dashboardWalletV2Router,
  "get",
  "/walletv2/table-details",
  (req, res) => {
    res.json(getBPDPaymentMethod());
  }
);

// reset walletv2-bpd config (dashboard web)
addHandler(dashboardWalletV2Router, "get", "/walletv2/reset", (_, res) => {
  updateWalletV2Config(ioDevServerConfig.wallet.methods);
  generateWalletV2Data();
  res.json(walletV2Config);
});

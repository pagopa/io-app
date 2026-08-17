/* eslint-disable @typescript-eslint/no-misused-promises */
import { JwkPublicKey, parseJwkOrError } from "@pagopa/ts-commons/lib/jwk";
import chalk from "chalk";
import { Response, Router } from "express";
import * as E from "fp-ts/lib/Either";
import * as jose from "jose";
import { parseStringPromise } from "xml2js";
/**
 * this router serves all public API (those ones don't need session)
 */
import * as zlib from "zlib";

import { assetsFolder, ioDevServerConfig } from "../config";
import { WALLET_ONBOARDING_PATH } from "../features/payments/utils/onboarding";
import { WALLET_PAYMENT_PATH } from "../features/payments/utils/payment";
import { backendInfo } from "../payloads/backend";
import {
  AppUrlLoginScheme,
  errorRedirectUrl,
  loginLolliPopRedirect,
  redirectUrl
} from "../payloads/login";
import { addHandler } from "../payloads/response";
import { clearSessionTokens } from "../payloads/session";
import { clearAppInfo, setAppInfo } from "../persistence/appInfo";
import {
  clearEphemeralLollipopInfo,
  clearLollipopInfo,
  concretizeEphemeralInfo,
  setLollipopInfo,
  setLollipopInfoEphemeral
} from "../persistence/lollipop";
import {
  setProfileEmailAlreadyTaken,
  setProfileEmailValidated
} from "../persistence/profile/profile";
import {
  clearLoginSessionTokenInfo,
  createOrRefreshEverySessionToken,
  getLoginSessionToken,
  setSessionAuthenticationProvider,
  setSessionLoginType
} from "../persistence/sessionInfo";
import { readFileAsJSON, sendFileFromRootPath } from "../utils/file";
import { getSamlRequest } from "../utils/login";
import { addApiAuthV1Prefix } from "../utils/strings";
import { resetCgn } from "./features/cgn";
import { isFeatureFlagWithMinVersionEnabled } from "./features/featureFlagUtils";
import { resetProfile } from "./profile";
import { resetWalletV2 } from "./walletsV2";

export const publicRouter = Router();

export const DEFAULT_LOLLIPOP_HASH_ALGORITHM = "sha256";
const DEFAULT_HEADER_LOLLIPOP_PUB_KEY = "x-pagopa-lollipop-pub-key";

addHandler(
  publicRouter,
  "get",
  addApiAuthV1Prefix("/login"),
  async (req, res) => {
    setAppInfo(req);
    setSessionLoginType(req);
    setSessionAuthenticationProvider(req);

    const lollipopPublicKeyHeaderValue = req.get(
      DEFAULT_HEADER_LOLLIPOP_PUB_KEY
    );
    const lollipopHashAlgorithmHeaderValue = req.get(
      "x-pagopa-lollipop-pub-key-hash-algo"
    );
    if (!lollipopPublicKeyHeaderValue || !lollipopHashAlgorithmHeaderValue) {
      const samlRequest = getSamlRequest();
      handleLollipopLoginRedirect(res, samlRequest);
      return;
    }

    const jwkPK = parseJwkOrError(lollipopPublicKeyHeaderValue);

    if (E.isLeft(jwkPK) || !JwkPublicKey.is(jwkPK.right)) {
      res.sendStatus(400);
      return;
    }

    const thumbprint = await jose.calculateJwkThumbprint(
      jwkPK.right,
      DEFAULT_LOLLIPOP_HASH_ALGORITHM
    );

    setLollipopInfoEphemeral(thumbprint, jwkPK.right);

    const samlRequest = getSamlRequest(
      DEFAULT_LOLLIPOP_HASH_ALGORITHM,
      thumbprint
    );
    handleLollipopLoginRedirect(res, samlRequest, thumbprint);
  }
);

addHandler(publicRouter, "get", "/idp-login", (req, res) => {
  const urlLoginScheme = isFeatureFlagWithMinVersionEnabled("nativeLogin")
    ? AppUrlLoginScheme.native
    : AppUrlLoginScheme.webview;

  const baseURL = `${urlLoginScheme}://${req.headers.host}`;

  if (req.query.authorized === "1" || ioDevServerConfig.global.autoLogin) {
    concretizeEphemeralInfo();
    createOrRefreshEverySessionToken();

    const token = getLoginSessionToken() ?? "";
    const urlInstance = new URL(redirectUrl, baseURL);

    if (ioDevServerConfig.global.sendSessionTokenAsQueryParam) {
      urlInstance.searchParams.append("token", token);
    }
    // eslint-disable-next-line functional/immutable-data
    urlInstance.hash = `token=${token}`;

    const url = urlInstance.toString();
    res.redirect(url);
    return;
  }
  if (req.query.error && typeof req.query.error === "string") {
    clearEphemeralLollipopInfo();

    const urlInstance = new URL(errorRedirectUrl, baseURL);

    if (req.query.error.includes("errorMessage:")) {
      const errorMessage = req.query.error.split(":")[1];

      urlInstance.searchParams.append("errorMessage", errorMessage);
    } else {
      const errorCode = req.query.error;

      urlInstance.searchParams.append("errorCode", errorCode);
    }

    const url = urlInstance.toString();
    res.redirect(url);
    return;
  }
  sendFileFromRootPath("assets/html/login.html", res);
});

addHandler(publicRouter, "get", "/error.html", (req, res) => {
  sendFileFromRootPath("assets/html/error.html", res);
});

addHandler(publicRouter, "get", WALLET_ONBOARDING_PATH, (req, res) => {
  sendFileFromRootPath("assets/wallet/wallet_onboarding.html", res);
});

addHandler(publicRouter, "get", WALLET_PAYMENT_PATH, (req, res) => {
  sendFileFromRootPath("assets/wallet/wallet_payment.html", res);
});

addHandler(publicRouter, "get", "/assets/imgs/how_to_login.png", (_, res) => {
  sendFileFromRootPath("assets/imgs/how_to_login.png", res);
});

addHandler(publicRouter, "post", addApiAuthV1Prefix("/logout"), (_, res) => {
  clearAppInfo();
  clearLollipopInfo();
  clearLoginSessionTokenInfo();
  clearSessionTokens();
  res.status(200).send({ message: "ok" });
});

addHandler(publicRouter, "get", "/info", (_, res) => res.json(backendInfo));

// test login
addHandler(
  publicRouter,
  "post",
  addApiAuthV1Prefix("/test-login"),
  async (req, res) => {
    const { password } = req.body;
    if (password === "error") {
      res.status(500).json({ token: getLoginSessionToken() });
    } else if (password === "delay") {
      setTimeout(() => {
        res.json({ token: getLoginSessionToken() });
      }, 3000);
    } else {
      const lollipopPublicKeyHeaderValue = req.get(
        DEFAULT_HEADER_LOLLIPOP_PUB_KEY
      );
      const jwkPK = parseJwkOrError(lollipopPublicKeyHeaderValue);

      if (E.isLeft(jwkPK) || !JwkPublicKey.is(jwkPK.right)) {
        res.sendStatus(400);
        return;
      }
      const thumbprint = await jose.calculateJwkThumbprint(
        jwkPK.right,
        DEFAULT_LOLLIPOP_HASH_ALGORITHM
      );
      setLollipopInfo(thumbprint, jwkPK.right);

      createOrRefreshEverySessionToken();
      res.json({ token: getLoginSessionToken() });
    }
  }
);

addHandler(publicRouter, "get", "/paywebview", (_, res) => {
  sendFileFromRootPath("assets/imgs/how_to_login.png", res);
});

// it should be useful to reset some states
addHandler(publicRouter, "get", "/reset", (_, res) => {
  type emptyFunc = () => void;
  const resets: ReadonlyArray<readonly [emptyFunc, string]> = [
    [resetProfile, "bonus vacanze"],
    [resetCgn, "cgn"],
    [resetWalletV2, "walletV2"]
  ];
  res.send(
    "<h2>reset:</h2>" +
      resets
        .map(r => {
          r[0]();
          return `<li>${r[1]}</li>`;
        })
        .join("<br/>")
  );
});

addHandler(publicRouter, "get", "/donate", (req, res) => {
  sendFileFromRootPath("assets/html/donate.html", res);
});

addHandler(publicRouter, "get", "/donations/availabledonations", (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.json(readFileAsJSON(assetsFolder + "/data/availableDonations.json"));
});

const handleLollipopLoginRedirect = (
  res: Response,
  samlRequest: string,
  thumbprint?: string
) => {
  const base64EncodedSAMLReq = zlib
    .deflateRawSync(samlRequest)
    .toString("base64");
  void debugSamlRequestIfNeeded(base64EncodedSAMLReq, thumbprint);

  const redirectUrl = `${loginLolliPopRedirect}?SAMLRequest=${encodeURIComponent(
    base64EncodedSAMLReq
  )}`;
  res.redirect(redirectUrl);
};

const debugSamlRequestIfNeeded = async (
  samlReq: string,
  thumbprint?: string
) => {
  if (!ioDevServerConfig.global.logSAMLRequest) {
    return;
  }

  const decoded = decodeURIComponent(samlReq);

  const deflated = zlib
    .inflateRawSync(Buffer.from(decoded, "base64"))
    .toString();

  // eslint-disable-next-line no-console
  console.log(chalk.bgBlack(chalk.green(`Deflated samlReq: ${deflated}`)));

  const xmlToJson = await parseStringPromise(deflated);

  const authnRequest = xmlToJson["samlp:AuthnRequest"];
  if (authnRequest) {
    // eslint-disable-next-line no-console
    console.log(
      chalk.bgBlack(
        chalk.green(`Authn Request Algorithm-Id: ${authnRequest.$.ID}`)
      )
    );
  }
  if (thumbprint) {
    // eslint-disable-next-line no-console
    console.log(chalk.bgBlack(chalk.green(`Stored Thumbprint: ${thumbprint}`)));
  }
};

addHandler(publicRouter, "post", "/validate-profile-email", (req, res) => {
  if (req.body && req.body.value !== undefined) {
    setProfileEmailValidated(req.body.value);
    res.status(200).send({ message: "OK" });
  } else {
    res.status(500).send({ message: "KO" });
  }
});

addHandler(publicRouter, "post", "/set-email-already-taken", (req, res) => {
  if (req.body && req.body.value !== undefined) {
    setProfileEmailAlreadyTaken(req.body.value);
    res.status(200).send({ message: "OK" });
  } else {
    res.status(500).send({ message: "KO" });
  }
});

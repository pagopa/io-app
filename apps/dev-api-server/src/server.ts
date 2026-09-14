import { Millisecond } from "@pagopa/ts-commons/lib/units";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import express, { Application } from "express";
import morgan from "morgan";

import { ioDevServerConfig } from "./config";
import { cdcRouter } from "./features/cdc/routers";
import { fimsHistoryRouter } from "./features/fims/routers/historyRouter";
import { fimsProviderRouter } from "./features/fims/routers/providerRouter";
import { fimsRelyingPartyRouter } from "./features/fims/routers/relyingPartyRouter";
import { ioSendRouter } from "./features/messages/routers/ioSendRouter";
import {
  communicationRouter,
  messageRouter
} from "./features/messages/routers/messagesRouter";
import { productionCrawlerRouter } from "./features/messages/routers/productionCrawlerRouter";
import { walletRouter as newWalletRouter } from "./features/payments";
import { sendAARRouter } from "./features/pn/routers/aarRouter";
import { sendDocumentsRouter } from "./features/pn/routers/documentsRouter";
import { sendLollipopLambdaRouter } from "./features/pn/routers/lollipopLambda";
import { sendMandatesRouter } from "./features/pn/routers/mandatesRouter";
import { sendNotificationsRouter } from "./features/pn/routers/notificationsRouter";
import { sendPrevalidatedUrisRouter } from "./features/pn/routers/prevalidatedUrisRouter";
import { sendServiceRouter } from "./features/pn/routers/serviceRouter";
import { serviceRouter as newServiceRouter } from "./features/services";
import { trialSystemRouter } from "./features/trialSystem/routers";
import { errorMiddleware } from "./middleware/errorMiddleware";
import { fastLoginMiddleware } from "./middleware/fastLoginMiddleware";
import { dashboardHomeRouter } from "./routers/configHomeDashboard/configHomeDashboard";
import { cgnRouter } from "./routers/features/cgn";
import { cgnGeoRouter } from "./routers/features/cgn/geocoding";
import { cgnMerchantsRouter } from "./routers/features/cgn/merchants";
import { fastLoginRouter } from "./routers/features/fastLogin";
import { fciRouter } from "./routers/features/fci";
import { idpayRouter } from "./routers/features/idpay";
import { lollipopRouter } from "./routers/features/lollipop";
import { miscRouter } from "./routers/misc";
import { profileRouter } from "./routers/profile";
import { publicRouter } from "./routers/public";
import { serviceRouter } from "./routers/service";
import { servicesMetadataRouter } from "./routers/services_metadata";
import { sessionRouter } from "./routers/session";
import { walletRouter } from "./routers/wallet";
import { wallet2Router } from "./routers/walletsV2";
import { dashboardWalletV2Router } from "./routers/walletsV2/configDashboard";
import { bancomatRouter } from "./routers/walletsV2/methods/bancomat";
import { bpayRouter } from "./routers/walletsV2/methods/bpay";
import { cobadgeRouter } from "./routers/walletsV2/methods/cobadge";
import { satispayRouter } from "./routers/walletsV2/methods/satispay";
import { delayer } from "./utils/delay_middleware";

// create express server
const app: Application = express();
// Disable ETag to prevent 304 responses (native HTTP clients cache ETags automatically)
app.set("etag", false);
// parse body request as json
app.use(bodyParser.json());
app.use(express.text());
app.use(bodyParser.urlencoded({ extended: true }));
// set middlewares
// if you want to add a delay in your server, use a global delayer (utils/delay_middleware)
app.use(delayer(ioDevServerConfig.global.delay as Millisecond));
// set middleware logger
app.use(
  morgan(
    ":date[iso] :method :url :status :res[content-length] - :response-time ms"
  )
);
app.use(errorMiddleware);
app.use(cookieParser());
app.use(fastLoginMiddleware);

[
  publicRouter,
  profileRouter,
  sessionRouter,
  messageRouter,
  communicationRouter,
  productionCrawlerRouter,
  serviceRouter,
  walletRouter,
  wallet2Router,
  satispayRouter,
  bpayRouter,
  bancomatRouter,
  cobadgeRouter,
  dashboardWalletV2Router,
  dashboardHomeRouter,
  servicesMetadataRouter,
  miscRouter,
  cgnRouter,
  cgnMerchantsRouter,
  cgnGeoRouter,
  fciRouter,
  sendAARRouter,
  sendDocumentsRouter,
  sendLollipopLambdaRouter,
  sendMandatesRouter,
  sendNotificationsRouter,
  sendPrevalidatedUrisRouter,
  sendServiceRouter,
  ioSendRouter,
  idpayRouter,
  lollipopRouter,
  fastLoginRouter,
  newWalletRouter,
  newServiceRouter,
  fimsRelyingPartyRouter,
  fimsProviderRouter,
  fimsHistoryRouter,
  trialSystemRouter,
  cdcRouter
].forEach(r => app.use(r));

export default app;

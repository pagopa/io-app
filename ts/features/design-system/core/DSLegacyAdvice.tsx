import { Body, Icon, VSpacer } from "@pagopa/io-app-design-system";
import * as React from "react";
import PaymentBannerComponent from "../../../components/wallet/PaymentBannerComponent";
import { DSFullWidthComponent } from "../components/DSFullWidthComponent";

/* Types */
import { ImportoEuroCents } from "../../../../definitions/backend/ImportoEuroCents";
import { InfoScreenComponent } from "../../../components/infoScreen/InfoScreenComponent";
import { DesignSystemScreen } from "../components/DesignSystemScreen";

export const DSLegacyAdvice = () => (
  <DesignSystemScreen title={"Advice & Banners"}>
    <InfoScreenComponent
      image={<Icon name="info" />}
      title={"Title"}
      body={
        <Body style={{ textAlign: "center" }}>
          Lorem ipsum dolor sit amet, consectetur adipisci elit, sed do eiusmod
          tempor incidunt ut labore et dolore magna aliqua.
        </Body>
      }
    />
    <VSpacer size={16} />
    <DSFullWidthComponent>
      <PaymentBannerComponent
        paymentReason={"Pagamento buoni pasto mensa scuola"}
        fee={100 as ImportoEuroCents}
        currentAmount={30000 as ImportoEuroCents}
      />
    </DSFullWidthComponent>
    <VSpacer size={24} />
    <VSpacer size={40} />
  </DesignSystemScreen>
);

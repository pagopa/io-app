import { Icon, VSpacer } from "@pagopa/io-app-design-system";
import * as React from "react";
import { StyleSheet, View } from "react-native";
import { InfoBox } from "../../../components/box/InfoBox";
import PaymentBannerComponent from "../../../components/wallet/PaymentBannerComponent";
import { DSFullWidthComponent } from "../components/DSFullWidthComponent";

/* Types */
import { ImportoEuroCents } from "../../../../definitions/backend/ImportoEuroCents";
import AdviceComponent from "../../../components/AdviceComponent";
import { Body } from "../../../components/core/typography/Body";
import { H5 } from "../../../components/core/typography/H5";
import { Label } from "../../../components/core/typography/Label";
import { IOStyles } from "../../../components/core/variables/IOStyles";
import { InfoScreenComponent } from "../../../components/infoScreen/InfoScreenComponent";
import { DesignSystemScreen } from "../components/DesignSystemScreen";

const styles = StyleSheet.create({
  content: {
    flex: 1,
    width: "100%",
    justifySelf: "flex-start",
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-around"
  }
});

export const DSLegacyAdvice = () => (
  <DesignSystemScreen title={"Advice & Banners"}>
    <AdviceComponent
      text={
        "Dopo questo passaggio non sarà più possibile annullare il pagamento."
      }
    />
    <VSpacer size={16} />
    <View style={[styles.content, IOStyles.horizontalContentPadding]}>
      <InfoBox>
        <Body>
          Lorem ipsum dolor sit amet, consectetur adipisci elit, sed do eiusmod
          tempor incidunt ut labore et dolore magna aliqua. Ut enim ad minim
          veniam, quis nostrum exercitationem ullamco laboriosam, nisi ut
          aliquid ex ea commodi consequatur.
        </Body>
      </InfoBox>
    </View>
    <InfoBox alignedCentral={true} iconSize={24} iconColor={"bluegreyDark"}>
      <H5 weight={"Regular"}>
        {
          "Per verificare la tua carta, tratteniamo € 0.02. Non preoccuparti: ti restituiremo l'importo al più presto."
        }
      </H5>
    </InfoBox>
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
    <View style={[styles.content, IOStyles.horizontalContentPadding]}>
      <InfoBox iconName="profile" iconColor="bluegrey">
        <Label color={"bluegrey"} weight={"Regular"}>
          Puoi aggiungere o modificare i tuoi IBAN in qualsiasi momento
          visitando la sezione Profilo
        </Label>
      </InfoBox>
    </View>
    <VSpacer size={40} />
  </DesignSystemScreen>
);

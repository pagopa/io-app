import * as React from "react";
import { View, StyleSheet, Alert } from "react-native";
import PaymentBannerComponent from "../../../components/wallet/PaymentBannerComponent";
import { DSFullWidthComponent } from "../components/DSFullWidthComponent";
import { InfoBox } from "../../../components/box/InfoBox";

/* Types */
import { ImportoEuroCents } from "../../../../definitions/backend/ImportoEuroCents";
import { IOStyles } from "../../../components/core/variables/IOStyles";
import { Label } from "../../../components/core/typography/Label";
import { ActivateBonusReminder } from "../../bonus/bonusVacanze/screens/activation/request/ActivateBonusReminder";
import { DesignSystemScreen } from "../components/DesignSystemScreen";
import { VSpacer } from "../../../components/core/spacer/Spacer";
import AdviceComponent from "../../../components/AdviceComponent";
import { Body } from "../../../components/core/typography/Body";
import { H2 } from "../../../components/core/typography/H2";
import { InfoScreenComponent } from "../../../components/infoScreen/InfoScreenComponent";
import { Icon } from "../../../components/core/icons";
import { H5 } from "../../../components/core/typography/H5";
import { FeatureInfo } from "../../../components/FeatureInfo";

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

const onLinkPress = () => {
  Alert.alert("Alert", "Action triggered");
};

export const DSAdvice = () => (
  <DesignSystemScreen title={"Advice & Banners"}>
    <H2 color={"bluegrey"} weight={"SemiBold"} style={{ marginBottom: 16 }}>
      FeatureInfo
    </H2>
    <FeatureInfo
      body={
        "Dopo questo passaggio non sarà più possibile annullare il pagamento"
      }
    />
    <VSpacer size={24} />
    <FeatureInfo
      iconName="gallery"
      body={
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor ut labore et dolore magna aliqua"
      }
    />
    <VSpacer size={24} />
    <FeatureInfo
      iconName="security"
      actionLabel="Si applicano i Termini e condizioni d’uso e l’Informativa Privacy di Paytipper"
      actionOnPress={onLinkPress}
    />
    <VSpacer size={24} />
    <FeatureInfo
      pictogramName="followMessage"
      body={
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor ut labore et dolore magna aliqua. sed do eiusmod tempor ut labore et dolore magna aliqua"
      }
    />
    <VSpacer size={24} />
    <FeatureInfo
      pictogramName="manual"
      body={
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor ut labore et dolore magna aliqua"
      }
    />
    <VSpacer size={24} />
    <FeatureInfo
      pictogramName="followMessage"
      body={
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor ut labore et dolore magna aliqua. sed do eiusmod tempor ut labore et dolore magna aliqua"
      }
      actionLabel="Scopri di più"
      actionOnPress={onLinkPress}
    />

    <VSpacer size={40} />
    <H2 color={"bluegrey"} weight={"SemiBold"} style={{ marginBottom: 16 }}>
      Legacy components
    </H2>
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
    <VSpacer size={16} />
    <ActivateBonusReminder
      text={
        "Puoi aggiungere o modificare i tuoi IBAN in qualsiasi momento visitando la sezione Profilo"
      }
    />
    <VSpacer size={24} />
    <View style={[styles.content, IOStyles.horizontalContentPadding]}>
      <InfoBox iconName="profileAlt" iconColor="bluegrey">
        <Label color={"bluegrey"} weight={"Regular"}>
          Puoi aggiungere o modificare i tuoi IBAN in qualsiasi momento
          visitando la sezione Profilo
        </Label>
      </InfoBox>
    </View>
    <VSpacer size={40} />
  </DesignSystemScreen>
);

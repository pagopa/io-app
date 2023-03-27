import * as React from "react";
import { View, StyleSheet } from "react-native";
import PaymentBannerComponent from "../../../components/wallet/PaymentBannerComponent";
import { DSFullWidthComponent } from "../components/DSFullWidthComponent";
import { InfoBox } from "../../../components/box/InfoBox";

/* Types */
import { ImportoEuroCents } from "../../../../definitions/backend/ImportoEuroCents";
import { IOStyles } from "../../../components/core/variables/IOStyles";
import { IOColors } from "../../../components/core/variables/IOColors";

import { Label } from "../../../components/core/typography/Label";
import { ActivateBonusReminder } from "../../bonus/bonusVacanze/screens/activation/request/ActivateBonusReminder";
import { DesignSystemScreen } from "../components/DesignSystemScreen";
import { VSpacer } from "../../../components/core/spacer/Spacer";

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

export const DSAdvice = () => (
  <DesignSystemScreen title={"Advice & Banners"}>
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
      <InfoBox iconName={"io-titolare"} iconColor={IOColors.bluegrey}>
        <Label color={"bluegrey"} weight={"Regular"}>
          Puoi aggiungere o modificare i tuoi IBAN in qualsiasi momento
          visitando la sezione Profilo
        </Label>
      </InfoBox>
    </View>

    <VSpacer size={40} />
  </DesignSystemScreen>
);

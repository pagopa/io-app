import * as React from "react";
import { View, StyleSheet } from "react-native";
import AdviceComponent from "../../../components/AdviceComponent";
import PaymentBannerComponent from "../../../components/wallet/PaymentBannerComponent";
import StatusContent from "../../../components/SectionStatus/StatusContent";
import SectionStatusComponent, {
  getStatusTextColor,
  statusColorMap,
  statusIconMap
} from "../../../components/SectionStatus";
import { DSFullWidthComponent } from "../components/DSFullWidthComponent";
import { InfoBox } from "../../../components/box/InfoBox";
import { Body } from "../../../components/core/typography/Body";

/* Types */
import { ImportoEuroCents } from "../../../../definitions/backend/ImportoEuroCents";
import { IOStyles } from "../../../components/core/variables/IOStyles";
import { LevelEnum } from "../../../../definitions/content/SectionStatus";
import { IOColors } from "../../../components/core/variables/IOColors";
import { Icon } from "../../../components/core/icons";
import { InfoScreenComponent } from "../../../components/infoScreen/InfoScreenComponent";
import { H5 } from "../../../components/core/typography/H5";
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

export const DSAdvice = () => {
  const viewRef = React.createRef<View>();

  return (
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
            Lorem ipsum dolor sit amet, consectetur adipisci elit, sed do
            eiusmod tempor incidunt ut labore et dolore magna aliqua. Ut enim ad
            minim veniam, quis nostrum exercitationem ullamco laboriosam, nisi
            ut aliquid ex ea commodi consequatur.
          </Body>
        </InfoBox>
      </View>
      <InfoBox
        alignedCentral={true}
        iconSize={24}
        iconColor={IOColors.bluegreyDark}
      >
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
            Lorem ipsum dolor sit amet, consectetur adipisci elit, sed do
            eiusmod tempor incidunt ut labore et dolore magna aliqua.
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
      <DSFullWidthComponent>
        <StatusContent
          accessibilityLabel={`Accessibility text for the advice component`}
          backgroundColor={statusColorMap.normal}
          iconColor={
            IOColors[getStatusTextColor(LevelEnum.normal as LevelEnum)]
          }
          iconName={statusIconMap.normal}
          testID={"SectionStatusComponentContent"}
          viewRef={viewRef}
          labelColor={getStatusTextColor(LevelEnum.normal)}
        >
          {
            "L’invio dei Certificati Verdi è in corso e potrebbe richiedere diversi giorni."
          }
        </StatusContent>
      </DSFullWidthComponent>
      <VSpacer size={16} />
      <DSFullWidthComponent>
        <SectionStatusComponent sectionKey={"favourite_language"} />
      </DSFullWidthComponent>
      <VSpacer size={16} />
      <DSFullWidthComponent>
        <StatusContent
          accessibilityLabel={`Accessibility text for the advice component`}
          backgroundColor={statusColorMap.warning}
          iconColor={
            IOColors[getStatusTextColor(LevelEnum.warning as LevelEnum)]
          }
          iconName={statusIconMap.warning}
          testID={"SectionStatusComponentContent"}
          viewRef={viewRef}
          labelColor={getStatusTextColor(LevelEnum.warning)}
        >
          {"La sezione Messaggi è in manutenzione, tornerà operativa a breve"}
        </StatusContent>
      </DSFullWidthComponent>
      <VSpacer size={16} />
      <DSFullWidthComponent>
        <StatusContent
          accessibilityLabel={`Accessibility text for the advice component`}
          backgroundColor={statusColorMap.critical}
          iconColor={
            IOColors[getStatusTextColor(LevelEnum.critical as LevelEnum)]
          }
          iconName={statusIconMap.critical}
          testID={"SectionStatusComponentContent"}
          viewRef={viewRef}
          labelColor={getStatusTextColor(LevelEnum.critical)}
        >
          {
            "I nostri sistemi potrebbero rispondere con lentezza, ci scusiamo per il disagio."
          }
        </StatusContent>
      </DSFullWidthComponent>

      <VSpacer size={16} />

      <ActivateBonusReminder
        text={
          "Puoi aggiungere o modificare i tuoi IBAN in qualsiasi momento visitando la sezione Profilo"
        }
      />

      <VSpacer size={16} />

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
};

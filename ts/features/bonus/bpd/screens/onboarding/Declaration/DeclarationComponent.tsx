import { View } from "native-base";
import * as React from "react";
import { SafeAreaView, ScrollView } from "react-native";
import { InfoBox } from "../../../../../../components/box/InfoBox";
import { H1 } from "../../../../../../components/core/typography/H1";
import BaseScreenComponent from "../../../../../../components/screens/BaseScreenComponent";
import { FooterTwoButtons } from "../../../../bonusVacanze/components/markdown/FooterTwoButtons";
import { bonusVacanzeStyle } from "../../../../bonusVacanze/components/Styles";
import { Body } from "../../../../../../components/core/typography/Body";
import { DeclarationEntry } from "./DeclarationEntry";

type OwnProps = {
  onCancel: () => void;
  onConfirm: () => void;
};

/**
 * This screen allows the user to declare the required conditions
 */
export const DeclarationComponent: React.FunctionComponent<OwnProps> = props => (
  <BaseScreenComponent
    goBack={props.onCancel}
    headerTitle={"Cashback Pagamenti Digitali"}
  >
    <SafeAreaView style={bonusVacanzeStyle.flex}>
      <ScrollView>
        <View style={bonusVacanzeStyle.horizontalPadding}>
          <View spacer={true} large={true} />
          <H1>Per poter attivare il cashback devi dichiarare</H1>
          <View spacer={true} extralarge={true} />
          <DeclarationEntry text={"di essere maggiorenne"} />
          <DeclarationEntry text={"di risiedere in Italia"} />
          <DeclarationEntry
            text={
              "che userai gli strumenti di pagamento su cui è attivo il cashback solo per acquisti effettuati fuori dall'esercizio di attività di Impresa, Arte o Professione "
            }
          />
          <View spacer={true} small={true} />
          <InfoBox>
            <Body>
              Questa autodichirazione è resa ai sensi del dpr 28 dicembre 2000
              n. 445 art 46 e 47
            </Body>
          </InfoBox>
        </View>
      </ScrollView>
      <FooterTwoButtons
        onCancel={props.onCancel}
        onRight={props.onConfirm}
        title={"Continua"}
      />
    </SafeAreaView>
  </BaseScreenComponent>
);

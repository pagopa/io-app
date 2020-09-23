import { View } from "native-base";
import * as React from "react";
import { SafeAreaView, ScrollView } from "react-native";
import { H1 } from "../../../../../../components/core/typography/H1";
import BaseScreenComponent from "../../../../../../components/screens/BaseScreenComponent";
import { FooterTwoButtons } from "../../../../bonusVacanze/components/markdown/FooterTwoButtons";
import { bonusVacanzeStyle } from "../../../../bonusVacanze/components/Styles";
import { CheckBox } from "../../../../../../components/core/selection/CheckBox";

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
          <CheckBox
            checked={true}
            onValueChange={newval => console.log("TOCCA" + newval)}
          />
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

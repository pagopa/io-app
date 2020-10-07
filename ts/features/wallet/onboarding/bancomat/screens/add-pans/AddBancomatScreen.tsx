import * as React from "react";
import { View } from "native-base";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { SafeAreaView } from "react-native";
import { GlobalState } from "../../../../../../store/reducers/types";
import BaseScreenComponent from "../../../../../../components/screens/BaseScreenComponent";
import { pans } from "../../mock/mockData";
import { H1 } from "../../../../../../components/core/typography/H1";
import customVariables from "../../../../../../theme/variables";

type Props = ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps>;

/**
 * This screen is displayed when Bancomat are found and ready to be added in wallet
 * @constructor
 */
export const AddBancomatScreen: React.FunctionComponent<Props> = (
  props: Props
) => (
  <BaseScreenComponent headerTitle={"Aggiungi bancomat"}>
    <SafeAreaView style={{ flex: 1 }}>
      <View spacer={true} />
      <View
        style={{
          flex: 1,
          alignItems: "center",
          paddingHorizontal: customVariables.contentPadding
        }}
      >
        <H1>{"Vuoi aggiungere questa carta?"}</H1>
      </View>
    </SafeAreaView>
  </BaseScreenComponent>
);

const mapDispatchToProps = (_: Dispatch) => ({});

const mapStateToProps = (_: GlobalState) => ({
  pans
});

export default connect(mapStateToProps, mapDispatchToProps)(AddBancomatScreen);

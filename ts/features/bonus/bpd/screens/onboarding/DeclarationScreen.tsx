import { Button } from "native-base";
import * as React from "react";
import { SafeAreaView } from "react-native";
import { connect } from "react-redux";
import { H1 } from "../../../../../components/core/typography/H1";
import { Label } from "../../../../../components/core/typography/Label";
import { Dispatch } from "../../../../../store/actions/types";
import { BpdOnboardingAcceptDeclaration } from "../../store/actions/onboarding";

export type Props = ReturnType<typeof mapDispatchToProps>;

/**
 * This screen allows the user to declare the required conditions
 */

const DeclarationScreen: React.FunctionComponent<Props> = props => (
  <SafeAreaView style={{ flex: 1 }}>
    <H1>Autodichiarazione</H1>
    <Button>
      <Label color={"white"} onPress={() => props.userAcceptDeclaration()}>
        Dichiaro&Attivo
      </Label>
    </Button>
  </SafeAreaView>
);

const mapDispatchToProps = (dispatch: Dispatch) => ({
  userAcceptDeclaration: () => dispatch(BpdOnboardingAcceptDeclaration())
});

export default connect(undefined, mapDispatchToProps)(DeclarationScreen);

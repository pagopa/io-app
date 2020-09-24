import { Button } from "native-base";
import * as React from "react";
import { SafeAreaView } from "react-native";
import { connect } from "react-redux";
import { H1 } from "../../../../../components/core/typography/H1";
import { Label } from "../../../../../components/core/typography/Label";
import { Dispatch } from "../../../../../store/actions/types";
import { BpdUserActivate } from "../../store/actions/onboarding";

export type Props = ReturnType<typeof mapDispatchToProps>;

/**
 * This Screen shows all the information about the bpd program, with the rules and t&c.
 */

const BpdInformationScreen: React.FunctionComponent<Props> = props => (
  <SafeAreaView style={{ flex: 1 }}>
    <H1>Information & tos</H1>
    <Button>
      <Label color={"white"} onPress={() => props.userActivateBpd()}>
        Attiva
      </Label>
    </Button>
  </SafeAreaView>
);

const mapDispatchToProps = (dispatch: Dispatch) => ({
  userActivateBpd: () => dispatch(BpdUserActivate())
});

export default connect(undefined, mapDispatchToProps)(BpdInformationScreen);

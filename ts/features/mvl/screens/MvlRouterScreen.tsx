import * as React from "react";
import { SafeAreaView, ScrollView } from "react-native";
import { H1 } from "../../../components/core/typography/H1";
import { IOStyles } from "../../../components/core/variables/IOStyles";
import BaseScreenComponent from "../../../components/screens/BaseScreenComponent";
import { emptyContextualHelp } from "../../../utils/emptyContextualHelp";

type Props = unknown;

/**
 * Entrypoint for the MVL, handle the loading, error, success and future business logic ko, routing the screen rendering
 * @param _
 * @constructor
 */
export const MvlRouterScreen = (_: Props): React.ReactElement => (
  <BaseScreenComponent goBack={true} contextualHelp={emptyContextualHelp}>
    <SafeAreaView style={IOStyles.flex} testID={"MVLRouterScreen"}>
      <ScrollView style={[IOStyles.horizontalContentPadding]}>
        <H1>MVLRouterScreen</H1>
      </ScrollView>
    </SafeAreaView>
  </BaseScreenComponent>
);

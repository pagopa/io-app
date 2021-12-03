import * as React from "react";
import { SafeAreaView, ScrollView } from "react-native";
import { NavigationInjectedProps } from "react-navigation";
import { H1 } from "../../../components/core/typography/H1";
import { IOStyles } from "../../../components/core/variables/IOStyles";
import BaseScreenComponent from "../../../components/screens/BaseScreenComponent";
import { emptyContextualHelp } from "../../../utils/emptyContextualHelp";
import { MvlId } from "../types/mvlData";

type NavigationParams = Readonly<{
  // TODO: assumption, we have an unique id that we should use to retrieve the MVL, maybe this could be the messageId? let's see!
  id: MvlId;
}>;

/**
 * Entrypoint for the MVL, handle the loading, error, success and future business logic ko, routing the screen rendering
 * @param _
 * @constructor
 */
export const MvlRouterScreen = (
  _: NavigationInjectedProps<NavigationParams>
): React.ReactElement => (
  <BaseScreenComponent goBack={true} contextualHelp={emptyContextualHelp}>
    <SafeAreaView style={IOStyles.flex} testID={"MVLRouterScreen"}>
      <ScrollView style={[IOStyles.horizontalContentPadding]}>
        <H1>MVLRouterScreen</H1>
      </ScrollView>
    </SafeAreaView>
  </BaseScreenComponent>
);

import * as React from "react";
import { SafeAreaView, ScrollView } from "react-native";
import { IOStyles } from "../../../components/core/variables/IOStyles";
import BaseScreenComponent from "../../../components/screens/BaseScreenComponent";

import { IOStackNavigationRouteProps } from "../../../navigation/params/AppParamsList";
import { UIMessageId } from "../../../store/reducers/entities/messages/types";
import { emptyContextualHelp } from "../../../utils/emptyContextualHelp";
import { MessageLoading } from "../../messages/components/MessageLoading";
import { PnParamsList } from "../navigation/params";

export type PnMessageDetailsScreenNavigationParams = Readonly<{
  id: UIMessageId;
}>;

export const PnMessageDetailsScreen = (
  props: IOStackNavigationRouteProps<PnParamsList, "PN_ROUTES_MESSAGE_DETAILS">
): React.ReactElement => (
  <BaseScreenComponent goBack={true} contextualHelp={emptyContextualHelp}>
    <SafeAreaView style={IOStyles.flex}>
      <MessageLoading />
    </SafeAreaView>
  </BaseScreenComponent>
);

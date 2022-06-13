import * as React from "react";

import { IOStackNavigationRouteProps } from "../../../navigation/params/AppParamsList";
import { UIMessageId } from "../../../store/reducers/entities/messages/types";
import { PnParamsList } from "../navigation/params";

export type PnMessageDetailsScreenNavigationParams = Readonly<{
  id: UIMessageId;
}>;

export const PnMessageDetailsScreen = (
  props: IOStackNavigationRouteProps<PnParamsList, "PN_DETAILS">
): React.ReactElement => <></>;

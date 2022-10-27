import * as pot from "@pagopa/ts-commons/lib/pot";
import * as React from "react";
import { IOStackNavigationRouteProps } from "../../../navigation/params/AppParamsList";
import { useIODispatch, useIOSelector } from "../../../store/hooks";
import { UIMessageId } from "../../../store/reducers/entities/messages/types";
import { useOnFirstRender } from "../../../utils/hooks/useOnFirstRender";
import { MvlParamsList } from "../navigation/params";
import { mvlDetailsLoad } from "../store/actions";
import { mvlFromIdSelector } from "../store/reducers/byId";
import { Mvl } from "../types/mvlData";
import { MvlDetailsScreen } from "./details/MvlDetailsScreen";
import { MvlGenericErrorScreen } from "./ko/MvlGenericErrorScreen";
import { MvlLoadingScreen } from "./MvlLoadingScreen";

export type MvlRouterScreenNavigationParams = Readonly<{
  id: UIMessageId;
}>;

/**
 * Render the view based on pot
 * @param id
 * @param value
 */
const renderByPot = (
  id: UIMessageId,
  value: pot.Pot<Mvl, Error>
): React.ReactElement =>
  pot.fold(
    value,
    () => <MvlLoadingScreen />,
    () => <MvlLoadingScreen />,
    _ => <MvlLoadingScreen />,
    _ => <MvlGenericErrorScreen id={id} />,
    mvl => <MvlDetailsScreen mvl={mvl} />,
    _ => <MvlLoadingScreen />,
    (_, __) => <MvlLoadingScreen />,
    _ => <MvlGenericErrorScreen id={id} />
  );

/**
 * Entrypoint for the MVL, handle the loading, error, success and future business logic ko, routing the screen rendering
 * @constructor
 * @param props
 */
export const MvlRouterScreen = (
  props: IOStackNavigationRouteProps<MvlParamsList, "MVL_DETAILS">
): React.ReactElement => {
  const mvlId = props.route.params.id;
  const mvlPot = useIOSelector(state => mvlFromIdSelector(state, mvlId));
  const dispatch = useIODispatch();
  useOnFirstRender(() => {
    if (!pot.isSome(mvlPot)) {
      dispatch(mvlDetailsLoad.request(mvlId));
    }
  });
  return renderByPot(mvlId, mvlPot);
};

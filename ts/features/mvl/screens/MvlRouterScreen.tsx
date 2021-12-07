import * as pot from "italia-ts-commons/lib/pot";
import * as React from "react";
import { NavigationInjectedProps } from "react-navigation";
import { useIODispatch, useIOSelector } from "../../../store/hooks";
import { useOnFirstRender } from "../../../utils/hooks/useOnFirstRender";
import { mvlDetailsLoad } from "../store/actions";
import { mvlFromIdSelector } from "../store/reducers/byId";
import { Mvl, MvlId } from "../types/mvlData";
import { MvlGenericErrorScreen } from "./ko/MvlGenericErrorScreen";
import { MvlDetailsScreen } from "./MvlDetailsScreen";
import { MvlLoadingScreen } from "./MvlLoadingScreen";

type NavigationParams = Readonly<{
  // TODO: assumption, we have an unique id that we should use to retrieve the MVL, maybe this could be the messageId? let's see!
  id: MvlId;
}>;

/**
 * Render the view based on pot
 * @param id
 * @param value
 */
const renderByPot = (
  id: MvlId,
  value: pot.Pot<Mvl, Error>
): React.ReactElement =>
  pot.fold(
    value,
    () => <MvlLoadingScreen />,
    () => <MvlLoadingScreen />,
    _ => <MvlLoadingScreen />,
    _ => <MvlGenericErrorScreen id={id} />,
    _ => <MvlDetailsScreen />,
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
  props: NavigationInjectedProps<NavigationParams>
): React.ReactElement => {
  const mvlId = props.navigation.getParam("id");
  const mvlPot = useIOSelector(state => mvlFromIdSelector(state, mvlId));
  const dispatch = useIODispatch();
  useOnFirstRender(() => {
    if (!pot.isSome(mvlPot)) {
      dispatch(mvlDetailsLoad.request(mvlId));
    }
  });
  return renderByPot(mvlId, mvlPot);
};

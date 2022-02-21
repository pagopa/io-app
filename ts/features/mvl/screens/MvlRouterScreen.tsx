import { CompatNavigationProp } from "@react-navigation/compat";
import * as pot from "italia-ts-commons/lib/pot";
import * as React from "react";
import { IOStackNavigationProp } from "../../../navigation/params/AppParamsList";
import { setMessageReadState } from "../../../store/actions/messages";
import { useIODispatch, useIOSelector } from "../../../store/hooks";
import { isMessageRead } from "../../../store/reducers/entities/messages/messagesStatus";
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
export const MvlRouterScreen = (props: {
  navigation: CompatNavigationProp<
    IOStackNavigationProp<MvlParamsList, "MVL_DETAILS">
  >;
}): React.ReactElement => {
  const mvlId = props.navigation.getParam("id");
  const mvlPot = useIOSelector(state => mvlFromIdSelector(state, mvlId));
  const dispatch = useIODispatch();
  const isRead = useIOSelector(state => isMessageRead(state, mvlId));
  useOnFirstRender(() => {
    if (!isRead) {
      dispatch(setMessageReadState(mvlId, true, "unknown"));
    }
    if (!pot.isSome(mvlPot)) {
      dispatch(mvlDetailsLoad.request(mvlId));
    }
  });
  return renderByPot(mvlId, mvlPot);
};

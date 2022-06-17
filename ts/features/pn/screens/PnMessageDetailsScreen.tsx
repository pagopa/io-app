import * as React from "react";
import * as pot from "italia-ts-commons/lib/pot";
import { SafeAreaView } from "react-native";
import { ThirdPartyMessageWithContent } from "../../../../definitions/backend/ThirdPartyMessageWithContent";
import { IOStyles } from "../../../components/core/variables/IOStyles";
import BaseScreenComponent from "../../../components/screens/BaseScreenComponent";

import { IOStackNavigationRouteProps } from "../../../navigation/params/AppParamsList";
import { useIODispatch, useIOSelector } from "../../../store/hooks";
import { UIMessageId } from "../../../store/reducers/entities/messages/types";
import { emptyContextualHelp } from "../../../utils/emptyContextualHelp";
import { useOnFirstRender } from "../../../utils/hooks/useOnFirstRender";
import { MessageLoading } from "../../messages/components/MessageLoading";
import { PnParamsList } from "../navigation/params";
import { loadPnContent } from "../store/actions";
import { pnContentFromIdSelector } from "../store/reducers/contentById";
import { PnMessageDetailsError } from "../components/PnMessageDetailsError";
import I18n from "../../../i18n";

export type PnMessageDetailsScreenNavigationParams = Readonly<{
  id: UIMessageId;
}>;

const renderContent = (
  content: pot.Pot<ThirdPartyMessageWithContent, Error>,
  onRetry: () => void
) =>
  pot.fold(
    content,
    () => <></>,
    () => <MessageLoading />,
    () => <MessageLoading />,
    () => <PnMessageDetailsError onRetry={onRetry} />,
    () => <></>,
    () => <></>,
    () => <></>,
    () => <></>
  );

export const PnMessageDetailsScreen = (
  props: IOStackNavigationRouteProps<PnParamsList, "PN_ROUTES_MESSAGE_DETAILS">
): React.ReactElement => {
  const messageId = props.route.params.id;
  const dispatch = useIODispatch();

  const content = useIOSelector(state =>
    pnContentFromIdSelector(state, messageId)
  );

  const loadContent = React.useCallback(() => {
    dispatch(loadPnContent.request(messageId));
  }, [dispatch, messageId]);

  useOnFirstRender(() => {
    loadContent();
  });

  return (
    <BaseScreenComponent
      goBack={true}
      headerTitle={I18n.t("features.pn.details.title")}
      contextualHelp={emptyContextualHelp}
    >
      <SafeAreaView style={IOStyles.flex}>
        {renderContent(content, loadContent)}
      </SafeAreaView>
    </BaseScreenComponent>
  );
};

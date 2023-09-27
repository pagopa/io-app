import { View } from "react-native";
import * as React from "react";
import { VSpacer } from "@pagopa/io-app-design-system";
import I18n from "../../../../../../../../i18n";
import Markdown from "../../../../../../../../components/ui/Markdown";
import { useLegacyIOBottomSheetModal } from "../../../../../../../../utils/hooks/bottomSheet";

/**
 * Display information about the current period
 * @constructor
 */
const RankingNotReady = (): React.ReactElement => (
  <View>
    <VSpacer size={16} />
    <View style={{ flex: 1 }}>
      <Markdown>
        {I18n.t("bonus.bpd.details.components.ranking.notReady.body")}
      </Markdown>
    </View>
  </View>
);

export const useRankingNotReadyBottomSheet = () =>
  useLegacyIOBottomSheetModal(
    <RankingNotReady />,
    I18n.t("bonus.bpd.details.components.ranking.notReady.title"),
    450
  );

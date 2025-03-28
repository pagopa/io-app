import { constVoid } from "fp-ts/lib/function";
import { BonusAvailableContent } from "../../../../../../definitions/content/BonusAvailableContent";
import IOMarkdown from "../../../../../components/IOMarkdown";
import { IOScrollViewWithLargeHeader } from "../../../../../components/ui/IOScrollViewWithLargeHeader";
import I18n from "../../../../../i18n";
import { useIOSelector } from "../../../../../store/hooks";
import { emptyContextualHelp } from "../../../../../utils/emptyContextualHelp";
import { getRemoteLocale } from "../../../../messages/utils/ctas";
import { availableBonusTypesSelectorFromId } from "../../../common/store/selectors";
import { ID_CDC_TYPE } from "../../../common/utils";

const CdcBonusRequestInformationTos = () => {
  // TODO: Implement useNavigation for FIMS
  // const navigation =
  //   useNavigation<
  //     IOStackNavigationProp<CdcBonusRequestParamsList, "CDC_INFORMATION_TOS">
  //   >();

  const cdcInfo = useIOSelector(availableBonusTypesSelectorFromId(ID_CDC_TYPE));

  if (cdcInfo === undefined) {
    return null;
  }

  const bonusTypeLocalizedContent: BonusAvailableContent =
    cdcInfo[getRemoteLocale()];

  return (
    <IOScrollViewWithLargeHeader
      title={{
        label: bonusTypeLocalizedContent.title
      }}
      includeContentMargins
      headerActionsProp={{
        showHelp: true
      }}
      contextualHelp={emptyContextualHelp}
      canGoback
      actions={{
        type: "SingleButton",
        primary: {
          label: I18n.t("global.buttons.continue"),
          onPress: () => constVoid
        }
      }}
    >
      <IOMarkdown content={bonusTypeLocalizedContent.content} />
    </IOScrollViewWithLargeHeader>
  );
};

export default CdcBonusRequestInformationTos;

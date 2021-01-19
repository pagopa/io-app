import * as React from "react";
import { StyleSheet } from "react-native";
import { TouchableWithoutFeedback } from "@gorhom/bottom-sheet";
import { Link } from "../../../../components/core/typography/Link";
import { openWebUrl } from "../../../../utils/url";
import Markdown from "../../../../components/ui/Markdown";
import { IOColors } from "../../../../components/core/variables/IOColors";
import I18n from "../../../../i18n";

const styles = StyleSheet.create({
  readMore: { marginLeft: 31, marginBottom: 24 }
});

const readMoreLink = "https://io.italia.it/cashback/acquirer/";
const SHOW_CTA_DELAY = 500;

const CSS_STYLE = `
body {
  font-size: 16;
  color: ${IOColors.black}
}
`;

export const BottomSheetBpdTransactionsBody: React.FunctionComponent = () => {
  const [CTAVisibility, setCTAVisibility] = React.useState(false);

  const setCTAVisible = () =>
    setTimeout(() => setCTAVisibility(true), SHOW_CTA_DELAY);

  return (
    <>
      <Markdown
        cssStyle={CSS_STYLE}
        avoidTextSelection={true}
        onLoadEnd={setCTAVisible}
      >
        {I18n.t(
          "bonus.bpd.details.transaction.detail.summary.bottomSheet.body"
        )}
      </Markdown>
      {CTAVisibility && (
        <TouchableWithoutFeedback onPress={() => openWebUrl(readMoreLink)}>
          <Link style={styles.readMore} weight={"SemiBold"}>
            {I18n.t(
              "bonus.bpd.details.transaction.detail.summary.bottomSheet.readMore"
            )}
          </Link>
        </TouchableWithoutFeedback>
      )}
    </>
  );
};

/**
 * An ingress screen to choose the real first screen the user must navigate to.
 */
import * as React from "react";
import I18n from "../../i18n";
import { useOnFirstRender } from "../../utils/hooks/useOnFirstRender";
import { trackIngressScreen } from "../profile/analytics";
import SectionStatusComponent from "../../components/SectionStatus";
import LoadingScreenContent from "../../components/screens/LoadingScreenContent";

export const IngressScreen = () => {
  const contentTitle = I18n.t("startup.title");
  useOnFirstRender(() => {
    trackIngressScreen();
  });

  return (
    <LoadingScreenContent contentTitle={contentTitle}>
      <SectionStatusComponent sectionKey={"ingress"} />
    </LoadingScreenContent>
  );
};

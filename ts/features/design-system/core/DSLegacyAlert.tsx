import { VSpacer } from "@pagopa/io-app-design-system";
import * as React from "react";
import SectionStatusComponent, {
  getStatusTextColor,
  statusColorMap,
  statusIconMap
} from "../../../components/SectionStatus";
import StatusContent from "../../../components/SectionStatus/StatusContent";
import { DSFullWidthComponent } from "../components/DSFullWidthComponent";

/* Types */
import { LevelEnum } from "../../../../definitions/content/SectionStatus";
import { DesignSystemScreen } from "../components/DesignSystemScreen";

export const DSLegacyAlert = () => (
  <DesignSystemScreen title={"Legacy Alert"}>
    <DSFullWidthComponent>
      <StatusContent
        accessibilityLabel={`Accessibility text for the advice component`}
        backgroundColor={statusColorMap.normal}
        foregroundColor={getStatusTextColor(LevelEnum.normal)}
        iconName={statusIconMap.normal}
        testID={"SectionStatusComponentContent"}
      >
        {
          "L’invio dei Certificati Verdi è in corso e potrebbe richiedere diversi giorni."
        }
      </StatusContent>
    </DSFullWidthComponent>
    <VSpacer size={16} />
    <DSFullWidthComponent>
      <SectionStatusComponent sectionKey={"favourite_language"} />
    </DSFullWidthComponent>
    <VSpacer size={16} />
    <DSFullWidthComponent>
      <StatusContent
        accessibilityLabel={`Accessibility text for the advice component`}
        backgroundColor={statusColorMap.warning}
        foregroundColor={getStatusTextColor(LevelEnum.warning)}
        iconName={statusIconMap.warning}
        testID={"SectionStatusComponentContent"}
      >
        {"La sezione Messaggi è in manutenzione, tornerà operativa a breve"}
      </StatusContent>
    </DSFullWidthComponent>
    <VSpacer size={16} />
    <DSFullWidthComponent>
      <StatusContent
        accessibilityLabel={`Accessibility text for the advice component`}
        backgroundColor={statusColorMap.critical}
        foregroundColor={getStatusTextColor(LevelEnum.critical)}
        iconName={statusIconMap.critical}
        testID={"SectionStatusComponentContent"}
      >
        {
          "I nostri sistemi potrebbero rispondere con lentezza, ci scusiamo per il disagio."
        }
      </StatusContent>
    </DSFullWidthComponent>
  </DesignSystemScreen>
);

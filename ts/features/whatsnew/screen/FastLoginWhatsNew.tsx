import * as React from "react";
import I18n from "i18n-js";

import { Body } from "../../../components/core/typography/Body";
import { VSpacer } from "../../../components/core/spacer/Spacer";
import { H3 } from "../../../components/core/typography/H3";
import { Label } from "../../../components/core/typography/Label";
import { Link } from "../../../components/core/typography/Link";
import { openWebUrl } from "../../../utils/url";
import { IOSpacer } from "../../../components/core/variables/IOSpacing";

const STANDARD_SIZE_VSPACER: IOSpacer = 24;
const SIZE_FROM_BOTTOM_VSPACER: IOSpacer = 48;

export const FastLoginWhatsNewBody = (
  <>
    <Body>{I18n.t("fastLogin.whatsNew.subtitle")}</Body>
    <VSpacer size={STANDARD_SIZE_VSPACER} />
    <H3>{I18n.t("whatsNew.title")}</H3>
    <VSpacer size={STANDARD_SIZE_VSPACER} />
    <Body>
      <Label color={"bluegrey"}>
        {`\u2022 ${I18n.t("fastLogin.whatsNew.changes.first.title")}: `}
      </Label>
      <Body>
        {`${I18n.t("fastLogin.whatsNew.changes.first.description")} `}
      </Body>
    </Body>
    <VSpacer />
    <Body>
      <Label color={"bluegrey"}>
        {`\u2022 ${I18n.t("fastLogin.whatsNew.changes.second.title")}: `}
      </Label>
      <Body>
        {`${I18n.t("fastLogin.whatsNew.changes.second.description")} `}
      </Body>
    </Body>
    <VSpacer />
    <Body>
      <Label color={"bluegrey"}>
        {`\u2022 ${I18n.t("fastLogin.whatsNew.changes.third.title")}: `}
      </Label>
      <Body>
        {`${I18n.t("fastLogin.whatsNew.changes.third.description")} `}
      </Body>
    </Body>
    <VSpacer size={STANDARD_SIZE_VSPACER} />
    <H3>{I18n.t("securityTips.title")}</H3>
    <VSpacer />
    <Label color={"bluegrey"}>
      {`\u2022 ${I18n.t("securityTips.biometric.first")} `}
    </Label>
    <VSpacer />
    <Body>
      <Body>{`\u2022 ${I18n.t("securityTips.ioEsco.lostDevice.if")} `}</Body>
      <Label color={"bluegrey"}>
        {`${I18n.t("securityTips.ioEsco.lostDevice.lose")} `}
      </Label>
      <Body>{`${I18n.t("securityTips.ioEsco.lostDevice.sentence")} `}</Body>

      {
        // FIX ME: Update url ticket: IOPID-419
      }
      <Link onPress={() => openWebUrl("")}>
        {I18n.t("securityTips.ioEsco.urlString")}
      </Link>
    </Body>
    <VSpacer />
    <Body>
      <Body>{`\u2022 ${I18n.t(
        "securityTips.ioEsco.compromisedCredentials"
      )} `}</Body>
      {
        // FIX ME: Update url ticket: IOPID-419
      }
      <Link onPress={() => openWebUrl("")}>
        {I18n.t("securityTips.ioEsco.urlString")}
      </Link>
    </Body>
    <VSpacer size={SIZE_FROM_BOTTOM_VSPACER} />
  </>
);

import * as React from "react";
import I18n from "i18n-js";

import { VSpacer } from "@pagopa/io-app-design-system";
import { Body } from "../../../components/core/typography/Body";
import { H3 } from "../../../components/core/typography/H3";
import { Label } from "../../../components/core/typography/Label";
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
    {
      // FIX ME: Update url ticket: IOPID-419
    }
    <VSpacer size={SIZE_FROM_BOTTOM_VSPACER} />
    <VSpacer size={SIZE_FROM_BOTTOM_VSPACER} />
  </>
);

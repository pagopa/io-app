import { useIOBottomSheetAutoresizableModal } from "../../utils/hooks/bottomSheet";
import { useIODispatch } from "../../store/hooks";

import { disableWhatsNew } from "./store/actions";
import { FastLoginWhatsNewBody } from "./screen/FastLoginWhatsNew";

// To add a new 'what's new', increase the "ACTIVE_VERSION" constant by 1
// and push a new element into the whatsNewVersions array

export const ACTIVE_VERSION = 0;

export const WhatsNew = () => {
  const dispatch = useIODispatch();

  const {
    present: presentWhatsNewBottomSheet,
    bottomSheet: autoResizableBottomSheet
  } = useIOBottomSheetAutoresizableModal({
    title: whatsNewVersions[ACTIVE_VERSION].title,
    component: whatsNewVersions[ACTIVE_VERSION].body,
    onDismiss: () =>
      dispatch(
        disableWhatsNew({
          whatsNewVersion: ACTIVE_VERSION
        })
      )
  });

  presentWhatsNewBottomSheet();
  return { autoResizableBottomSheet };
};

type WhatsNew = {
  version: number;
  title: string;
  body: JSX.Element;
};

const whatsNewVersions: Array<WhatsNew> = [];

// eslint-disable-next-line functional/immutable-data
whatsNewVersions.push({
  version: 0,
  title: "Test Prova",
  body: FastLoginWhatsNewBody
});

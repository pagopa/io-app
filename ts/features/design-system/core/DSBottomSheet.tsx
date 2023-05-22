import * as React from "react";

import DESIGN_SYSTEM_ROUTES from "../navigation/routes";

import { DesignSystemScreen } from "../components/DesignSystemScreen";
import { VSpacer } from "../../../components/core/spacer/Spacer";
import { H2 } from "../../../components/core/typography/H2";
import {
  useIOBottomSheetAutoresizableModal,
  useIOBottomSheetModalNew
} from "../../../utils/hooks/bottomSheet";
import ListItemComponent from "../../../components/screens/ListItemComponent";
import { IOThemeContext } from "../../../components/core/variables/IOColors";

export const DSBottomSheet = () => {
  const handlePressDismiss = () => {
    dismissStaticBottomSheet();
    dismissAutoresizableBottomSheet();
  };

  const BottomSheetContentBody = () => (
    <>
      <ListItemComponent
        title="Lorem ipsum dolor"
        hideIcon
        subTitle="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
      />
      <ListItemComponent
        title="Dismiss"
        isLastItem
        subTitle="This is a item that will close the bottom sheet"
        onPress={handlePressDismiss}
      />
    </>
  );

  // Autoresizable bottom sheet hook
  const {
    present: presentAutoresizableBottomSheet,
    bottomSheet: autoResizableBottomSheet,
    dismiss: dismissAutoresizableBottomSheet
  } = useIOBottomSheetAutoresizableModal({
    title: "Autoresizable Bottom Sheet",
    component: <BottomSheetContentBody />
  });

  // Static bottom sheet hook
  const {
    present: presentStaticBottomSheet,
    bottomSheet: staticBottomSheet,
    dismiss: dismissStaticBottomSheet
  } = useIOBottomSheetModalNew({
    title: "Static Bottom Sheet",
    component: <BottomSheetContentBody />,
    snapPoint: [300]
  });

  return (
    <IOThemeContext.Consumer>
      {theme => (
        <DesignSystemScreen
          title={DESIGN_SYSTEM_ROUTES.COMPONENTS.BOTTOM_SHEET.title}
        >
          <H2
            color={theme["textHeading-default"]}
            weight={"SemiBold"}
            style={{ marginBottom: 16, marginTop: 16 }}
          >
            Available bottom sheets
          </H2>
          <ListItemComponent
            title="Autoresizable bottom sheet"
            useExtendedSubTitle
            subTitle="This bottom sheet has a snap point that is calculated based on the content height"
            onPress={presentAutoresizableBottomSheet}
          />
          <ListItemComponent
            title="Static bottom sheet"
            useExtendedSubTitle
            subTitle="This bottom sheet has a static snap point of 300 hard coded in the hook declaration"
            onPress={presentStaticBottomSheet}
          />
          <VSpacer size={24} />
          {staticBottomSheet}
          {autoResizableBottomSheet}
        </DesignSystemScreen>
      )}
    </IOThemeContext.Consumer>
  );
};

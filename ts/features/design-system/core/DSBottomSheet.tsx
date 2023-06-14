import * as React from "react";

import DESIGN_SYSTEM_ROUTES from "../navigation/routes";

import { DesignSystemScreen } from "../components/DesignSystemScreen";
import { VSpacer } from "../../../components/core/spacer/Spacer";
import { H2 } from "../../../components/core/typography/H2";
import {
  useIOBottomSheetAutoresizableModal,
  useIOBottomSheetModal
} from "../../../utils/hooks/bottomSheet";
import { IOThemeContext } from "../../../components/core/variables/IOColors";
import ListItemNav from "../../../components/ui/ListItemNav";
import { Body } from "../../../components/core/typography/Body";
import ButtonSolid from "../../../components/ui/ButtonSolid";
import { ContentWrapper } from "../../../components/core/ContentWrapper";

export const DSBottomSheet = () => {
  const handlePressDismiss = () => {
    dismissStaticBottomSheet();
    dismissAutoresizableBottomSheet();
    dismissAutoresizableBottomSheetWithFooter();
  };

  const DimissBottomSheetItem = () => (
    <ListItemNav
      value="Dismiss"
      description="This is a item that will close the bottom sheet"
      accessibilityLabel="Dismiss"
      onPress={handlePressDismiss}
    />
  );

  const BottomSheetContentBody = () => (
    <>
      <Body>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
        tempor incididunt ut labore et dolore magna aliqua.
      </Body>
      <DimissBottomSheetItem />
    </>
  );

  const BottomSheetLongContentBody = () => (
    <>
      <Body>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
        tempor incididunt ut labore et dolore magna aliqua. Lorem ipsum dolor
        sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt
        ut labore et dolore magna aliqua. Lorem ipsum dolor sit amet,
        consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore
        et dolore magna aliqua. Lorem ipsum dolor sit amet, consectetur
        adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore
        magna aliqua. Lorem ipsum dolor sit amet, consectetur adipiscing elit,
        sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Lorem
        ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
        incididunt ut labore et dolore magna aliqua.
      </Body>
      <DimissBottomSheetItem />
    </>
  );

  // Autoresizable bottom sheet hook
  const {
    present: presentAutoresizableBottomSheet,
    bottomSheet: autoResizableBottomSheet,
    dismiss: dismissAutoresizableBottomSheet
  } = useIOBottomSheetAutoresizableModal({
    title: "Autoresizable Bottom Sheet",
    component: <BottomSheetLongContentBody />
  });

  // Autoresizable bottom sheet hook with footer
  const {
    present: presentAutoresizableBottomSheetWithFooter,
    bottomSheet: autoResizableBottomSheetWithFooter,
    dismiss: dismissAutoresizableBottomSheetWithFooter
  } = useIOBottomSheetAutoresizableModal(
    {
      title: "Autoresizable Bottom Sheet",
      component: <BottomSheetLongContentBody />,
      footer: (
        <ContentWrapper>
          <ButtonSolid
            fullWidth
            accessibilityLabel="Tap to dismiss the bottom sheet"
            label={"Dismiss bottom sheet"}
            onPress={handlePressDismiss}
          />
        </ContentWrapper>
      )
    },
    100
  );

  // Static bottom sheet hook
  const {
    present: presentStaticBottomSheet,
    bottomSheet: staticBottomSheet,
    dismiss: dismissStaticBottomSheet
  } = useIOBottomSheetModal({
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
          <ListItemNav
            value="Autoresizable bottom sheet"
            description="This bottom sheet has a snap point that is calculated based on the content height"
            accessibilityLabel="Autoresizable bottom sheet"
            onPress={presentAutoresizableBottomSheet}
          />
          <ListItemNav
            value="Autoresizable bottom sheet with footer"
            description="This bottom sheet has a snap point that is calculated based on the content height with a footer"
            accessibilityLabel="Autoresizable bottom sheet with footer"
            onPress={presentAutoresizableBottomSheetWithFooter}
          />
          <ListItemNav
            value="Static bottom sheet"
            description="This bottom sheet has a static snap point of 300 hard coded in the hook declaration"
            accessibilityLabel="Static bottom sheet"
            onPress={presentStaticBottomSheet}
          />
          <VSpacer size={24} />
          {staticBottomSheet}
          {autoResizableBottomSheet}
          {autoResizableBottomSheetWithFooter}
        </DesignSystemScreen>
      )}
    </IOThemeContext.Consumer>
  );
};

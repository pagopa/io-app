import { fireEvent, render } from "@testing-library/react-native";
import { View } from "react-native";
import * as React from "react";
import Fingerprint from "../../../../../img/test/fingerprint.svg";
import I18n from "../../../../i18n";
import { Body } from "../../typography/Body";
import { H3 } from "../../typography/H3";
import { IOColors } from "../../variables/IOColors";
import { IOStyles } from "../../variables/IOStyles";
import { RawAccordion } from "../RawAccordion";

const bodyText = "This is a body text";
const headerText = "This is an header text";

describe("RawAccordion", () => {
  jest.useFakeTimers();

  // eslint-disable-next-line sonarjs/cognitive-complexity
  describe("When a RawAccordion is rendered for the first time", () => {
    it("Should be in the closed state", () => {
      const res = renderRawAccordion();
      expect(res.queryByText(headerText)).not.toBeNull();
      expect(res.queryByText(bodyText)).toBeNull();
    });
    describe("And the header is tapped", () => {
      it("Should expand and display the content", () => {
        const res = renderRawAccordion();
        const header = res.queryByText(headerText);
        if (header !== null) {
          fireEvent.press(header);
          expect(res.queryByText(headerText)).not.toBeNull();
          expect(res.queryByText(bodyText)).not.toBeNull();
        } else {
          fail("header not found");
        }
      });
      describe("And the header is tapped again", () => {
        it("Should close and hide the content", () => {
          const res = renderRawAccordion();
          const header = res.queryByText(headerText);
          if (header !== null) {
            fireEvent.press(header);
            fireEvent.press(header);
            expect(res.queryByText(bodyText)).toBeNull();
          } else {
            fail("header not found");
          }
        });
      });
    });
    describe("And no accessibilityLabel is used", () => {
      it("Should use only global.accessibility.collapsed", () => {
        const res = renderRawAccordion();
        expect(
          res.queryByA11yLabel(I18n.t("global.accessibility.collapsed"))
        ).not.toBeNull();
      });
      describe("And the header is tapped", () => {
        it("Should use only global.accessibility.expanded", () => {
          const res = renderRawAccordion();
          const header = res.queryByText(headerText);
          if (header !== null) {
            fireEvent.press(header);
            expect(
              res.queryByA11yLabel(I18n.t("global.accessibility.expanded"))
            ).not.toBeNull();
          } else {
            fail("header not found");
          }
        });
      });
    });
    describe("Accessibility", () => {
      describe("And an accessibilityLabel is used", () => {
        it("Should use accessibilityLabel and global.accessibility.collapsed", () => {
          const res = renderRawAccordion({
            accessibilityLabel: "CustomAccessibilityLabel"
          });
          expect(
            res.queryByA11yLabel(
              `CustomAccessibilityLabel, ${I18n.t(
                "global.accessibility.collapsed"
              )}`
            )
          ).not.toBeNull();
        });
        describe("And the header is tapped", () => {
          it("Should use accessibilityLabel and global.accessibility.expanded", () => {
            const res = renderRawAccordion({
              accessibilityLabel: "CustomAccessibilityLabel"
            });
            const header = res.queryByText(headerText);
            if (header !== null) {
              fireEvent.press(header);
              expect(
                res.queryByA11yLabel(
                  `CustomAccessibilityLabel, ${I18n.t(
                    "global.accessibility.expanded"
                  )}`
                )
              ).not.toBeNull();
            } else {
              fail("header not found");
            }
          });
        });
      });
    });
  });
});

const renderRawAccordion = (
  props?: Pick<React.ComponentProps<typeof RawAccordion>, "accessibilityLabel">
) =>
  render(
    <RawAccordion
      accessibilityLabel={props?.accessibilityLabel}
      headerStyle={{
        paddingVertical: 16,
        backgroundColor: IOColors.greyLight
      }}
      header={
        <View style={IOStyles.row}>
          <Fingerprint width={32} height={32} />
          <H3 style={{ alignSelf: "center" }}>{headerText}</H3>
        </View>
      }
    >
      <Body>{bodyText}</Body>
    </RawAccordion>
  );

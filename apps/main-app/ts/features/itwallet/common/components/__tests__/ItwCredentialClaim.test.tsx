import { ListItemInfo } from "@io-app/design-system";
import {
  fireEvent,
  render,
  userEvent,
  within
} from "@testing-library/react-native";
import I18n from "i18next";
import { useState } from "react";
import { Text, View } from "react-native";

import * as bottomSheet from "../../../../../utils/hooks/bottomSheet";
import { withStore } from "../../../../../utils/jest/withStore";
import { HIDDEN_CLAIM_TEXT } from "../../utils/constants";
import { getSafeText } from "../../utils/itwClaimsUtils";
import { ItwCredentialClaim as ItwCredentialClaimComponent } from "../ItwCredentialClaim";

const ItwCredentialClaim = withStore(ItwCredentialClaimComponent);

const LABEL = "Claim label";
const BOTTOM_SHEET_TEST_ID = "claim-details-bottom-sheet";

const academicClaims = [
  {
    programme_type_name: { name: "Programme", value: "Bachelor" },
    degree_course_name: { name: "Course", value: "Physics" },
    institute_name: { name: "Institute", value: "University A" }
  },
  {
    programme_type_name: { name: "Programme", value: "Master" },
    degree_course_name: { name: "Course", value: "Chemistry" },
    institute_name: { name: "Institute", value: "University B" }
  }
];

const schoolClaims = [
  {
    qualification_type: { name: "Qualification", value: "Diploma" },
    institute_name: { name: "Institute", value: "School A" }
  },
  {
    qualification_type: { name: "Qualification", value: "Certificate" },
    institute_name: { name: "Institute", value: "School B" }
  }
];

const useTestBottomSheet: typeof bottomSheet.useIOBottomSheetModal = ({
  component,
  title
}) => {
  const [isVisible, setIsVisible] = useState(false);

  return {
    bottomSheet: (
      <>
        {isVisible && (
          <View testID={BOTTOM_SHEET_TEST_ID}>
            <Text>{title}</Text>
            {component}
          </View>
        )}
      </>
    ),
    dismiss: () => setIsVisible(false),
    present: () => setIsVisible(true)
  };
};

const longPressableScenarios = [
  { name: "string", value: "Mario", expected: "Mario" },
  {
    name: "url",
    value: "https://example.com",
    expected: "https://example.com"
  },
  { name: "date", value: "1990-01-31", expected: "31/01/1990" },
  {
    name: "fiscal code",
    value: "TINIT-RSSMRA90A31H501X",
    expected: "RSSMRA90A31H501X"
  },
  { name: "list", value: ["IT", "FR"], expected: "IT, FR" }
];

describe("ItwCredentialClaim", () => {
  test.each(longPressableScenarios)(
    "invokes onLongPress with the $name claim label and value",
    ({ value, expected }) => {
      const onLongPress = jest.fn();
      const { getByText } = render(
        <ItwCredentialClaim
          claim={{ id: "claim", label: LABEL, value }}
          onLongPress={onLongPress}
        />
      );

      fireEvent(getByText(expected), "onLongPress");

      expect(onLongPress).toHaveBeenCalledWith(LABEL, expected);
    }
  );

  test.each(longPressableScenarios)(
    "does not enable the long press when the $name claim value is hidden",
    ({ value }) => {
      // `fireEvent` would reach the `onLongPress` prop of `ItwCredentialClaim`
      // itself, so the rendered list item is inspected instead
      const { getByText, UNSAFE_getByType } = render(
        <ItwCredentialClaim
          claim={{ id: "claim", label: LABEL, value }}
          hidden
          onLongPress={jest.fn()}
        />
      );

      expect(getByText(HIDDEN_CLAIM_TEXT)).toBeTruthy();
      expect(UNSAFE_getByType(ListItemInfo).props.onLongPress).toBeUndefined();
    }
  );

  it("invokes onLongPress with the full value when the displayed text is truncated", () => {
    const longValue = "A".repeat(200);
    const onLongPress = jest.fn();
    const { getByText } = render(
      <ItwCredentialClaim
        claim={{ id: "claim", label: LABEL, value: longValue }}
        onLongPress={onLongPress}
      />
    );

    fireEvent(getByText(getSafeText(longValue)), "onLongPress");

    expect(onLongPress).toHaveBeenCalledWith(LABEL, longValue);
  });

  it("forwards onLongPress to nested object claims", () => {
    const onLongPress = jest.fn();
    const { getByText } = render(
      <ItwCredentialClaim
        claim={{
          id: "claim",
          label: LABEL,
          value: { nested: { name: "Nested", value: "Mario" } }
        }}
        onLongPress={onLongPress}
      />
    );

    fireEvent(getByText("Mario"), "onLongPress");

    expect(onLongPress).toHaveBeenCalledWith("Nested", "Mario");
  });

  describe("nested credential details", () => {
    beforeEach(() => {
      jest
        .spyOn(bottomSheet, "useIOBottomSheetModal")
        .mockImplementation(useTestBottomSheet);
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    test.each([
      {
        name: "academic degrees",
        id: "education_degrees",
        claims: academicClaims,
        summary: "Physics",
        details: [
          "Programme",
          "Bachelor",
          "Course",
          "Physics",
          "Institute",
          "University A"
        ],
        otherItem: "University B",
        isPreview: false
      },
      {
        name: "academic enrollments",
        id: "education_enrollments",
        claims: academicClaims,
        summary: "Physics",
        details: [
          "Programme",
          "Bachelor",
          "Course",
          "Physics",
          "Institute",
          "University A"
        ],
        otherItem: "University B",
        isPreview: true
      },
      {
        name: "school qualifications",
        id: "school_qualifications",
        claims: schoolClaims,
        summary: "Diploma",
        details: ["Qualification", "Diploma", "Institute", "School A"],
        otherItem: "School B",
        isPreview: false
      }
    ])(
      "shows all selected $name claims under the detail heading",
      async ({ id, claims, summary, details, otherItem, isPreview }) => {
        const { getAllByLabelText, getByTestId, getByText, queryByTestId } =
          render(
            <ItwCredentialClaim
              claim={{ id, label: "Qualifications", value: claims }}
              isPreview={isPreview}
            />
          );

        expect(getByText(summary)).toBeTruthy();
        expect(queryByTestId(BOTTOM_SHEET_TEST_ID)).toBeNull();

        await userEvent.press(
          getAllByLabelText(I18n.t("global.buttons.show"))[0]
        );

        const sheet = within(getByTestId(BOTTOM_SHEET_TEST_ID));
        expect(sheet.getByText("Dettaglio")).toBeTruthy();
        details.forEach(detail => expect(sheet.getByText(detail)).toBeTruthy());
        expect(sheet.queryByText(otherItem)).toBeNull();
      }
    );

    it("keeps nested values hidden under the detail heading", async () => {
      const { getAllByLabelText, getByTestId } = render(
        <ItwCredentialClaim
          claim={{
            id: "education_degrees",
            label: "Degrees",
            value: academicClaims
          }}
          hidden
        />
      );

      await userEvent.press(
        getAllByLabelText(I18n.t("global.buttons.show"))[0]
      );

      const sheet = within(getByTestId(BOTTOM_SHEET_TEST_ID));
      expect(sheet.getByText("Dettaglio")).toBeTruthy();
      expect(sheet.getAllByText(HIDDEN_CLAIM_TEXT)).toHaveLength(3);
      expect(sheet.queryByText("Physics")).toBeNull();
    });
  });
});

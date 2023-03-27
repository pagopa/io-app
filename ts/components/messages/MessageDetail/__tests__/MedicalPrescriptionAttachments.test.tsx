import React from "react";
import { render } from "@testing-library/react-native";

import MedicalPrescriptionAttachments, {
  svgXml
} from "../MedicalPrescriptionAttachments";

describe("MedicalPrescriptionAttachments component", () => {
  const organizationName = "WHO";

  describe("with default properties", () => {
    it("should render", () => {
      const component = render(
        <MedicalPrescriptionAttachments prescriptionAttachments={[]} />
      );
      expect(component.toJSON()).toMatchSnapshot();
    });
  });

  describe("when the organization name is defined", () => {
    it("should render it", () => {
      expect(
        render(
          <MedicalPrescriptionAttachments
            organizationName={organizationName}
            prescriptionAttachments={[]}
          />
        ).toJSON()
      ).toMatchSnapshot();
    });
  });

  describe("when an attachment is present", () => {
    const attachment = {
      name: "prescription",
      content: "up, down, strange, charm, bottom, top",
      mimeType: "text/plain"
    };

    it("should render it", () => {
      expect(
        render(
          <MedicalPrescriptionAttachments
            organizationName={organizationName}
            prescriptionAttachments={[attachment]}
          />
        ).toJSON()
      ).toMatchSnapshot();
    });

    describe(`and has mimeType=${svgXml}`, () => {
      const svgAttachment = {
        name: "barcodes",
        // Icon made from http://www.onlinewebfonts.com/icon is licensed by CC BY 3.0
        content: `PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4NCjwhLS0gU3ZnIFZlY3RvciBJY29ucyA6IGh0dHA6Ly93d3cub25saW5ld2ViZm9udHMuY29tL2ljb24gLS0+DQo8IURPQ1RZUEUgc3ZnIFBVQkxJQyAiLS8vVzNDLy9EVEQgU1ZHIDEuMS8vRU4iICJodHRwOi8vd3d3LnczLm9yZy9HcmFwaGljcy9TVkcvMS4xL0RURC9zdmcxMS5kdGQiPg0KPHN2ZyB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4IiB2aWV3Qm94PSIwIDAgMTAwMCAxMDAwIiBlbmFibGUtYmFja2dyb3VuZD0ibmV3IDAgMCAxMDAwIDEwMDAiIHhtbDpzcGFjZT0icHJlc2VydmUiPg0KPG1ldGFkYXRhPiBTdmcgVmVjdG9yIEljb25zIDogaHR0cDovL3d3dy5vbmxpbmV3ZWJmb250cy5jb20vaWNvbiA8L21ldGFkYXRhPg0KPGc+PHBhdGggZD0iTTk3My43LDI2My4yQzk0MSwxNjUuMiw4MzQuOCw5MS43LDcyMC41LDkxLjdjLTg5LjgsMC0xNzEuNSw0OS0yMjAuNSwxMjIuNUM0NTEsMTQwLjcsMzY5LjMsOTEuNywyNzkuNSw5MS43Yy0xMTQuMywwLTIxMi4zLDczLjUtMjQ1LDE3MS41QzEwLDMwNCwxMCwzNDQuOCwxMCw0MDJjMTYuMywxNjMuMywxNzEuNSwzNDMsNDY1LjUsNDk4LjJjOC4yLDAsMTYuMyw4LjIsMjQuNSw4LjJzOC4yLDAsMTYuMywwQzUzMi43LDkwMC4yLDk2NS41LDY4Ny44LDk5MCw0MDJDOTkwLDM0NC44LDk5MCwzMDQsOTczLjcsMjYzLjIiLz48L2c+DQo8L3N2Zz4=
  `,
        mimeType: svgXml
      };

      it("should render the SVG", () => {
        expect(
          render(
            <MedicalPrescriptionAttachments
              organizationName={organizationName}
              prescriptionAttachments={[svgAttachment]}
            />
          ).toJSON()
        ).toMatchSnapshot();
      });
    });

    describe("and prescriptionData is present", () => {
      const attachmentWithPrescriptionData = {
        ...attachment,
        name: "nre"
      };

      it("should render it", () => {
        expect(
          render(
            <MedicalPrescriptionAttachments
              organizationName={organizationName}
              prescriptionAttachments={[attachmentWithPrescriptionData]}
              prescriptionData={{
                nre: "what the heck is this btw?"
              }}
            />
          ).toJSON()
        ).toMatchSnapshot();
      });
    });
  });
});

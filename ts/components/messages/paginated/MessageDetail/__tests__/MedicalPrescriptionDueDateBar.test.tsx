import React from "react";
import { render } from "@testing-library/react-native";

import MedicalPrescriptionDueDateBar from "../MedicalPrescriptionDueDateBar";

describe("MedicalPrescriptionDueDateBar component", () => {
  const dueDate = new Date("2021-11-17T12:32:14.497Z");

  describe("when payment info is expired", () => {
    it("should match the snapshot", () => {
      const component = render(
        <MedicalPrescriptionDueDateBar
          dueDate={dueDate}
          paymentExpirationInfo={{
            kind: "EXPIRABLE",
            expireStatus: "EXPIRED",
            dueDate
          }}
        />
      );
      expect(component.toJSON()).toMatchSnapshot();
    });
  });

  describe("when payment info is expiring", () => {
    it("should match the snapshot", () => {
      const component = render(
        <MedicalPrescriptionDueDateBar
          dueDate={dueDate}
          paymentExpirationInfo={{
            kind: "EXPIRABLE",
            expireStatus: "EXPIRING",
            dueDate
          }}
        />
      );
      expect(component.toJSON()).toMatchSnapshot();
    });
  });

  describe("when payment info is valid", () => {
    it("should match the snapshot", () => {
      const component = render(
        <MedicalPrescriptionDueDateBar
          dueDate={dueDate}
          paymentExpirationInfo={{
            kind: "EXPIRABLE",
            expireStatus: "VALID",
            dueDate
          }}
        />
      );
      expect(component.toJSON()).toMatchSnapshot();
    });
  });

  describe("when payment info is not expirable", () => {
    it("should match the snapshot", () => {
      const component = render(
        <MedicalPrescriptionDueDateBar
          dueDate={dueDate}
          paymentExpirationInfo={{
            kind: "UNEXPIRABLE"
          }}
        />
      );
      expect(component.toJSON()).toMatchSnapshot();
    });
  });
});

import * as pot from "@pagopa/ts-commons/lib/pot";
import { FiscalCode } from "@pagopa/ts-commons/lib/strings";
import { render } from "@testing-library/react-native";
import React from "react";
import { mockedMunicipality } from "../../utils/__mocks__/municipality";
import mockedProfile from "../../__mocks__/initializedProfile";
import FiscalCodeComponent from "../FiscalCodeComponent";

const municipality = pot.some(mockedMunicipality);
// 02/03/1990
const fiscalCode = "MRARSS90C02H501E" as FiscalCode;
// 02/01/1990
const dateOfBirth = new Date("1990-01-02T00:00:00.000Z");

describe("FiscalCodeComponent", () => {
  jest.useFakeTimers();
  describe("when the type is 'Full'", () => {
    describe("and profile has date_of_birth defined'", () => {
      it(`should render the profile birth date `, () => {
        const component = render(
          <FiscalCodeComponent
            municipality={municipality}
            getBackSide={false}
            profile={{
              ...mockedProfile,
              fiscal_code: fiscalCode,
              date_of_birth: dateOfBirth
            }}
            type={"Full"}
          />
        );
        expect(component.queryByText("02/01/1990")).not.toBeNull();
      });
    });

    describe("and profile has date_of_birth not defined'", () => {
      it(`should render the birth date extracted from CF`, () => {
        const component = render(
          <FiscalCodeComponent
            municipality={municipality}
            getBackSide={false}
            profile={{
              ...mockedProfile,
              fiscal_code: fiscalCode,
              date_of_birth: undefined
            }}
            type={"Full"}
          />
        );
        expect(component.queryByText("02/03/1990")).not.toBeNull();
      });
    });
  });

  describe("when the type is 'Landscape'", () => {
    describe("and profile has date_of_birth defined'", () => {
      it(`should render the profile birth date `, () => {
        const component = render(
          <FiscalCodeComponent
            municipality={municipality}
            getBackSide={false}
            profile={{
              ...mockedProfile,
              fiscal_code: fiscalCode,
              date_of_birth: dateOfBirth
            }}
            type={"Landscape"}
          />
        );
        expect(component.queryByText("02/01/1990")).not.toBeNull();
      });
    });

    describe("and profile has date_of_birth not defined'", () => {
      it(`should render the birth date extracted from CF`, () => {
        const component = render(
          <FiscalCodeComponent
            municipality={municipality}
            getBackSide={false}
            profile={{
              ...mockedProfile,
              fiscal_code: fiscalCode,
              date_of_birth: undefined
            }}
            type={"Landscape"}
          />
        );
        expect(component.queryByText("02/03/1990")).not.toBeNull();
      });
    });
  });
});

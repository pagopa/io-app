import { fakerIT as faker } from "@faker-js/faker";
import { AutocompleteResultItem } from "@io-app/api-types/generated/definitions/cgn/geo/AutocompleteResultItem";
import { LookupResponse } from "@io-app/api-types/generated/definitions/cgn/geo/LookupResponse";
import { Router } from "express";
import { range } from "fp-ts/lib/NonEmptyArray";

import { addHandler } from "../../../payloads/response";
import { addApiV1Prefix } from "../../../utils/strings";

export const cgnGeoRouter = Router();

const addPrefix = (path: string) => addApiV1Prefix(`/geo${path}`);

const addresses = range(0, 10000).map<AutocompleteResultItem>(_ => ({
  id: faker.string.uuid(),
  title: faker.location.streetAddress(true),
  address: {
    label: faker.location.streetAddress(false),
    city: faker.location.city(),
    countryCode: faker.location.countryCode(),
    countryName: faker.location.country(),
    county: faker.location.county(),
    postalCode: faker.location.zipCode()
  }
}));

addHandler(cgnGeoRouter, "get", addPrefix("/autocomplete"), (req, res) => {
  const address = req.query.queryAddress as string;
  const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 5;

  const resultArray: ReadonlyArray<AutocompleteResultItem> = addresses
    .filter(ari => ari.title.includes(address))
    .slice(0, limit);

  return res.status(200).json({ items: resultArray });
});

addHandler(cgnGeoRouter, "get", addPrefix("/lookup"), (req, res) => {
  const lookupID = req.query.id;
  const foundResult = addresses.find(address => address.id === lookupID);
  if (foundResult) {
    const response: LookupResponse = {
      title: foundResult.title,
      address: foundResult.address,
      position: {
        lat: faker.location.latitude(),
        lng: faker.location.longitude()
      }
    };

    return res.status(200).json(response);
  }

  res.sendStatus(404);
});

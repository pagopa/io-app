import { none, noneError, some } from "italia-ts-commons/lib/pot";
import { ScopeEnum } from "../../../../definitions/content/Service";
import { ServiceMetadataState } from "../../../store/reducers/content";
import { canRenderItems } from "../ServiceDetailsScreen";

const serviceA: ServiceMetadataState = {
  kind: "PotSome",
  value: {
    description: "test",
    tos_url: "http://www.test.it",
    privacy_url: "http://www.test.it",
    phone: "800 450 900",
    email: "info@test.it",
    scope: ScopeEnum.LOCAL
  }
};

const serviceB: ServiceMetadataState = {
  kind: "PotSome",
  value: {
    description: undefined,
    tos_url: "http://www.test.it",
    privacy_url: "http://www.test.it",
    phone: "800 450 900",
    email: "info@test.it",
    scope: ScopeEnum.LOCAL
  }
};

const serviceC: ServiceMetadataState = some(undefined);
const serviceD: ServiceMetadataState = none;
const serviceE: ServiceMetadataState = noneError(new Error("n/a"));

describe("canRenderItems", () => {
  it("should return true because the markdown is loaded", () => {
    expect(canRenderItems(true, serviceA)).toBeTruthy();
  });
  it("should return false because the markdown is not loaded", () => {
    expect(canRenderItems(false, serviceA)).toBeFalsy();
  });
  it("should return true because the services value has content", () => {
    expect(canRenderItems(false, serviceB)).toBeTruthy();
  });
  it("should return false because the services value is undefined and the markdown is not loaded", () => {
    expect(canRenderItems(true, serviceC)).toBeFalsy();
    expect(canRenderItems(false, serviceC)).toBeFalsy();
  });
  it("should return false because the services is not loaded", () => {
    expect(canRenderItems(true, serviceD)).toBeFalsy();
    expect(canRenderItems(false, serviceD)).toBeFalsy();
  });
  it("should return false because the services is not loaded and it has an error", () => {
    expect(canRenderItems(true, serviceE)).toBeFalsy();
    expect(canRenderItems(false, serviceE)).toBeFalsy();
  });
});

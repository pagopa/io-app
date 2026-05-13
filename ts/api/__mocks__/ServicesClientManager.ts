/**
 * Manual Jest mock for ServicesClientManager.
 *
 * Used automatically by Jest when a test calls:
 *   jest.mock("...../api/ServicesClientManager")
 *
 * `mockServicesClient` exposes all methods of the real ServicesClient
 * as `jest.fn()`, so individual tests can configure return values with:
 *   mockServicesClient.getServiceById.mockResolvedValue(...)
 *
 * `servicesClientManager.getClient` is pre-wired to return
 * `mockServicesClient` by default, avoiding boilerplate setup in each test.
 * Tests that need a different client shape can override it with:
 *   (servicesClientManager.getClient as jest.Mock).mockReturnValue({...})
 */

import { ServicesClient } from "../ServicesClientManager";

export const mockServicesClient: jest.Mocked<ServicesClient> = {
  findInstitutions: jest.fn(),
  findInstutionServices: jest.fn(),
  getFeaturedInstitutions: jest.fn(),
  getFeaturedServices: jest.fn(),
  getServiceById: jest.fn()
};

export const servicesClientManager = {
  getClient: jest.fn().mockReturnValue(mockServicesClient)
};

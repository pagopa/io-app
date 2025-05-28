/**
 * Mocked version of the ServicesClient
 */
export const ServicesClient = {
  findInstitutions: jest.fn(),
  findInstutionServices: jest.fn(),
  getFeaturedInstitutions: jest.fn(),
  getFeaturedServices: jest.fn(),
  getServiceById: jest.fn()
};

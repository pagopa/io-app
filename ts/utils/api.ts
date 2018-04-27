/**
 * Implements the APIs to interact with the backend.
 */

/**
 * The user profile
 */
export type ApiUserProfile = {
  family_name: string,
  fiscal_code: string,
  has_profile: boolean,
  is_inbox_enabled?: boolean,
  name: string,
  version: number
}

/**
 * A type used for all the update operations
 */
export type ApiNewUserProfile = {
  family_name?: string,
  fiscal_code?: string,
  is_inbox_enabled?: boolean,
  name?: string,
  version: number
}

export async function getUserProfile(
  apiUrlPrefix: string,
  token: string
): Promise<ApiUserProfile | null> {
  try {
    const response = await fetch(`${apiUrlPrefix}/api/v1/profile`, {
      method: 'get',
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    const responseJson: ApiUserProfile = await response.json()
    return responseJson
  } catch (error) {
    return null
    // TODO handle error
    // console.error(error)
  }
}

export async function setUserProfile(
  apiUrlPrefix: string,
  token: string,
  newProfile: ApiNewUserProfile
): Promise<ApiUserProfile | number | null> {
  try {
    const response = await fetch(`${apiUrlPrefix}/api/v1/profile`, {
      method: 'post',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(newProfile)
    })

    // eslint-disable-next-line no-magic-numbers
    if (response.status === 500) {
      return response.status
    } else {
      const responseJson: ApiUserProfile = await response.json()
      return responseJson
    }
  } catch (error) {
    return null
    // if the proxy is not reacheable
    // TODO handle unsuccessful fetch
    // @see https://www.pivotaltracker.com/story/show/154661120
  }
}

/**
 * Describes a SPID Identity Provider
 */
export type IdentityProvider = {
  id: string,
  logo: any,
  name: string,
  entityID: string,
  profileUrl: string
}

export function isDemoIdp(idp: IdentityProvider): boolean {
  return idp.id === 'demo'
}

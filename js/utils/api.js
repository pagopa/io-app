/**
 * @flow
 */

'use strict'

async function getUserProfile(apiUrlPrefix: string, token: string) {
  try {
    let response = await fetch(`${apiUrlPrefix}/api/headers`, {
      method: 'get',
      headers: {
        'Authorization': `Bearer ${token}`,
      }
    })
    let responseJson = await response.json()
    return responseJson
  } catch(error) {
    console.error(error)
  }
}

module.exports = {
  getUserProfile
}

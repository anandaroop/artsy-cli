import netrc from "netrc-parser"
import fetch from "node-fetch"

export enum GravityEnvironment {
  staging = "staging",
  production = "production",
}

class Gravity {
  static HOSTS = {
    production: "api.artsy.net",
    staging: "stagingapi.artsy.net",
  }

  /** Gravity environment against which to issue requests. */
  environment: GravityEnvironment

  /** Gravity user access token obtained via oauth, and persisted via netrc. */
  token: string

  constructor(environment: GravityEnvironment) {
    netrc.loadSync()
    const credentials = netrc.machines[Gravity.HOSTS[environment]]
    this.environment = environment
    this.token = credentials && credentials.password!
  }

  async getAccessToken(credentials: Credentials) {
    const gravityUrl = this.url("oauth2/access_token")
    const body: AccessTokenRequest = {
      client_id: process.env.CLIENT_ID!,
      client_secret: process.env.CLIENT_SECRET!,
      grant_type: "credentials",
      ...credentials,
    }

    const response = await fetch(gravityUrl, {
      method: "post",
      body: JSON.stringify(body),
      headers: { "Content-Type": "application/json" },
    })

    const json = await response.json()

    return json as AccessTokenResponse
  }

  async get(endpoint: string) {
    const gravityUrl: string = this.url(`api/v1/${endpoint}`)
    const headers = { "X-Access-Token": this.token! }
    const response = await fetch(gravityUrl, { headers })

    return response
  }

  url(endpoint: string): string {
    const host = Gravity.HOSTS[this.environment]
    return `https://${host}/${endpoint}`
  }
}

export default Gravity

export interface Credentials {
  email: string
  password: string
}

interface AccessTokenRequest extends Credentials {
  grant_type: string
  client_id: string
  client_secret: string
}

interface AccessTokenResponse {
  access_token: string
  expires_in: string
}

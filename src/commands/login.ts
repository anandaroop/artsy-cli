import { Command, flags } from "@oclif/command"
import cli from "cli-ux"
import netrc from "netrc-parser"
import Gravity, { GravityEnvironment } from "../lib/gravity"

export default class Login extends Command {
  static description =
    "Log into the Artsy API. This is a prerequisite for many other commands."

  static flags = {
    help: flags.help({ char: "h" }),
    environment: flags.string({
      char: "e",
      description: "Desired Gravity environment",
      options: Object.keys(GravityEnvironment),
      default: GravityEnvironment.staging,
    }),
  }

  async run() {
    require("dotenv").config()

    const {
      flags: { environment },
    } = this.parse(Login) as { flags: { environment: GravityEnvironment } }
    const host = Gravity.HOSTS[environment]

    this.log(`Logging into ${environment} environment...`)
    const email = await cli.prompt("Email", { type: "normal" })
    const password = await cli.prompt("Password", { type: "hide" })

    this.log(`Authenticating against ${host} for ${email}...`)
    const result = await new Gravity(environment).getAccessToken({
      email,
      password,
    })

    netrc.loadSync()
    netrc.machines[host] = {
      login: email,
      password: result.access_token,
    }
    netrc.saveSync()

    this.log("-------------- vvv Your access token vvv --------------")
    this.log(result.access_token)
    this.log("-------------- ^^^ Your access token ^^^ --------------")
  }
}

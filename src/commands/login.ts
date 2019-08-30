import { Command, flags } from "@oclif/command"
import cli from "cli-ux"
import netrc from "netrc-parser"
import Gravity from "../lib/gravity"

export default class Login extends Command {
  static description =
    "Log into the Artsy API. This is a prerequisite for many other commands."

  static flags = {
    help: flags.help({ char: "h" }),
  }

  // static args = [{ name: 'file' }];

  async run() {
    require("dotenv").config()

    // const {args, flags} = this.parse(Auth)
    const email = await cli.prompt("Email", { type: "normal" })
    const password = await cli.prompt("Password", { type: "hide" })

    this.log(`Authenticating against ${Gravity.HOSTS.staging} for ${email}...`)

    const result = await new Gravity().getAccessToken({
      email,
      password,
    })

    // TODO: allow switching env
    netrc.loadSync()
    netrc.machines[Gravity.HOSTS.staging] = {
      login: email,
      password: result.access_token,
    }
    netrc.saveSync()

    this.log("-------------- vvv Your access token vvv --------------")
    this.log(result.access_token)
    this.log("-------------- ^^^ Your access token ^^^ --------------")
  }
}

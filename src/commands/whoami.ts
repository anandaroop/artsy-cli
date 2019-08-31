import { Command, flags } from "@oclif/command"
import Gravity, { GravityEnvironment } from "../lib/gravity"

export default class Whoami extends Command {
  static description = "describe the command here"

  static flags = {
    help: flags.help({ char: "h" }),
    environment: flags.string({
      char: "e",
      description: "Desired Gravity environment",
      options: Object.keys(GravityEnvironment),
      default: GravityEnvironment.staging,
    }),
  }

  static args = []

  async run() {
    const {
      flags: { environment },
    } = this.parse(Whoami) as WhoamiOptions

    const gravity = new Gravity(environment)

    const response = await gravity.get("me")
    const { email } = await response.json()
    this.log(email)
  }
}

interface WhoamiOptions {
  flags: {
    environment: GravityEnvironment
  }
}

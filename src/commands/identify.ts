import { Command, flags } from "@oclif/command"
import Gravity, { GravityEnvironment } from "../lib/gravity"

export default class Identify extends Command {
  static description = "Identify a Gravity resource by its BSON ID"

  static flags = {
    help: flags.help({ char: "h" }),
    environment: flags.string({
      char: "e",
      description: "Desired Gravity environment",
      options: Object.keys(GravityEnvironment),
      default: GravityEnvironment.staging,
    }),
  }

  static args = [{ name: "id" }]

  static collectionsToCheck: CollectionMapping[] = [
    { name: "Artist", endpoint: "artist" },
    { name: "Artwork", endpoint: "artwork" },
    { name: "Partner", endpoint: "partner" },
  ]

  async run() {
    const {
      args: { id },
      flags: { environment },
    } = this.parse(Identify) as IdentifyOptions

    const gravity = new Gravity(environment)

    const gravityPromises = Identify.collectionsToCheck.map(collection => {
      const resource = `${collection.endpoint}/${id}`
      return gravity.get(resource)
    })

    const gravityResponses = await Promise.all(gravityPromises)
    const foundIndex = gravityResponses.findIndex(r => r.status === 200)

    if (foundIndex >= 0) {
      const foundCollection = Identify.collectionsToCheck[foundIndex]
      const foundResource = `${foundCollection.endpoint}/${id}`
      this.log(`${foundCollection.name} ${gravity.url(foundResource)}`)
    } else {
      const collections = Identify.collectionsToCheck.map(c => c.name)
      this.log(`Nothing found in: ${collections.join(", ")}`)
    }
  }
}

interface IdentifyOptions {
  args: {
    id: string
  }
  flags: {
    environment: GravityEnvironment
  }
}

interface CollectionMapping {
  /** Name of the Gravity resource */
  name: string

  /** The name of the collection as it appears in the GET endpoint for the resource, i.e. /api/v1/<endpoint>/:id */
  endpoint: string
}

import { expect, test } from "@oclif/test"

describe("whoami", () => {
  test
    .nock("https://stagingapi.artsy.net", api =>
      api.get("/api/v1/me").reply(200, {
        id: 'USD450300000',
        name: "Salvator Mundi",
        email: "leonardo@artsymail.com",
      })
    )
    .stdout()
    .command(["whoami"])
    .it("displays the login of the currently authenticated user", ctx => {
      expect(ctx.stdout).to.equal("leonardo@artsymail.com\n")
    })
})

import {signups, ScrimSignups} from "../src/models/signups";
import {DbMock} from "./mocks/db.mock";
import {PlayerInsert} from "../src/models/Player";
import {User} from "discord.js";

describe("Integration", () => {

  describe("addTeam()", () => {

    /*
    it("Should add a team", async () => {
      const theheuman = {id: "315310843317321732", displayName: "TheHeuman"} as User
      const zboy = {id: "316280734115430403", displayName: "Zboy"} as User
      const supreme = {id: "244307424838811648", displayName: "Supreme"} as User
      const expectedSignup = {teamName: "Fineapples", scrimId: "ebb385a2-ba18-43b7-b0a3-44f2ff5589b9"}

      signups.activeScrimSignups.set("ebb385a2-ba18-43b7-b0a3-44f2ff5589b9", [])

      const signupId = await signups.addTeam(expectedSignup.scrimId, expectedSignup.teamName, [theheuman, zboy, supreme])
      console.log(signupId)
      expect(signupId).toBeDefined()
    });

    it("Should not add a team because there is no scrim with that id", async () => {
      const causeException = async () => {
        await signups.addTeam("", "", [])
      }

      await expect(causeException).rejects.toThrow("No active scrim with that scrim id")
    })

    it("Should add another team", async () => {

      const theheuman = {id: "123", displayName: "Revy"} as User
      const zboy = {id: "7456", displayName: "Treazy"} as User
      const supreme = {id: "08576", displayName: "Toasty"} as User
      const expectedSignup = {teamName: "Test Team", scrimId: "ebb385a2-ba18-43b7-b0a3-44f2ff5589b9"}

      signups.activeScrimSignups.set("ebb385a2-ba18-43b7-b0a3-44f2ff5589b9", [])
      const signupId = await signups.addTeam(expectedSignup.scrimId, expectedSignup.teamName, [theheuman, zboy, supreme])
      console.log(signupId)
      expect(signupId).toBeDefined()
    })

    it("Should add a scrim", async () => {
      const scrimId = await signups.createScrim("not a valid id", new Date())
      console.log(scrimId)
      expect(scrimId).toBeDefined()
    })

    it("Should replace a team mate", async () => {
      const revy = {id: "123", displayName: "Revy"} as User
      const mikey = {id: "not valid", displayName: "Mikey"} as User
      const scrimSignup = await signups.replaceTeammate("something", "Test Team", revy, mikey)
      console.log(scrimSignup)
      expect(scrimSignup).toBeDefined()
    })
    */
  })

})

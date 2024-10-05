import {Signups} from "../src/models/signups";
import {DbMock} from "./mocks/db.mock";
import {PlayerInsert} from "../src/models/Player";
import {User} from "discord.js";

describe("Signups", () => {
  let dbMock: DbMock;
  let signups: Signups;

  beforeEach(() => {
    dbMock = new DbMock()
    signups = new Signups(dbMock)
  })

  describe("addTeam()", () => {
    it("Should add a team", async () => {
      const theheuman = {id: "123", displayName: "TheHeuman"} as User
      const zboy = {id: "456", displayName: "Zboy"} as User
      const supreme = {id: "789", displayName: "Supreme"} as User
      const expectedSignup = {teamName: "Fineapples", scrimId: "32451", signupId: "4685"}

      signups.activeScrimSignups.set("32451", [])
      jest.spyOn(dbMock, 'insertPlayers').mockImplementation((players) => {
        const expected: PlayerInsert[] = [
          {discordId: "123", displayName: "TheHeuman"},
          {discordId: "456", displayName: "Zboy"},
          {discordId: "789", displayName: "Supreme"},
        ]
        expect(players).toEqual(expected)
        return Promise.resolve(["111", "444", "777"])
      })

      jest.spyOn(dbMock, 'addScrimSignup').mockImplementation((teamName: string, scrimId: string, playerId: string, playerIdTwo: string, playerIdThree: string) => {
        expect(teamName).toEqual(expectedSignup.teamName);
        expect(scrimId).toEqual(expectedSignup.scrimId);
        expect(playerId).toEqual("111");
        expect(playerIdTwo).toEqual("444");
        expect(playerIdThree).toEqual("777");
        return Promise.resolve(expectedSignup.signupId)
      })

      const signupId = await signups.addTeam(expectedSignup.scrimId, expectedSignup.teamName, [theheuman, zboy, supreme])
      expect(signupId).toEqual(expectedSignup.signupId)
      expect.assertions(7)
    });

    it("Should not add a team because there is no scrim with that id", async () => {
      const causeException = async () => {
        await signups.addTeam("", "", [])
      }

      await expect(causeException).rejects.toThrow("No active scrims with that scrim id")
    })

    it("Should not add a team because there aren't three players", async () => {
      signups.activeScrimSignups.set("32451", [])
      const causeException = async () => {
        await signups.addTeam("32451", "", [])
      }

      await expect(causeException).rejects.toThrow("Exactly three players must be provided")
    })
  })

  /*
  describe("getSignups()", () => {
    it("Should get all teams", () => {

    })

    it("Should not add a team because there is no scrim with that id", () => {

    })
  })
   */
})

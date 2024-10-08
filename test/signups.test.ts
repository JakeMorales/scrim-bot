import {ScrimSignups} from "../src/models/signups";
import {DbMock} from "./mocks/db.mock";
import {PlayerInsert} from "../src/models/Player";
import {User} from "discord.js";

describe("Signups", () => {
  let dbMock: DbMock;
  let signups: ScrimSignups;

  beforeEach(() => {
    dbMock = new DbMock()
    signups = new ScrimSignups(dbMock)
  })

  const theheuman = {id: "123", displayName: "TheHeuman"} as User
  const zboy = {id: "456", displayName: "Zboy"} as User
  const supreme = {id: "789", displayName: "Supreme"} as User
  const revy = {id: "4368", displayName: "revy2hands"} as User
  const cTreazy = {id: "452386", displayName: "treazy"} as User
  const mikey = {id: "32576", displayName: "//baev"} as User

  describe("addTeam()", () => {
    it("Should add a team", async () => {
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

      await expect(causeException).rejects.toThrow("No active scrim with that scrim id")
    })

    it("Should not add a team because duplicate team name", async () => {
      signups.activeScrimSignups.set("scrim 1", [])
      const causeException = async () => {
        await signups.addTeam("scrim 1", "Fineapples", [zboy, supreme, mikey])
      }
      await signups.addTeam("scrim 1", "Fineapples", [theheuman, revy, cTreazy])

      await expect(causeException).rejects.toThrow("Duplicate team name")
    })

    it("Should not add a team because duplicate player", async () => {
      signups.activeScrimSignups.set("scrim 1", [])
      const causeException = async () => {
        await signups.addTeam("scrim 1", "Dude Cube", [theheuman, supreme, mikey])
      }
      await signups.addTeam("scrim 1", "Fineapples", [theheuman, revy, cTreazy])

      await expect(causeException).rejects.toThrow("Player already signed up on different team: TheHeuman <@123> on team Fineapples")
    })

    it("Should not add a team because there aren't three players", async () => {
      signups.activeScrimSignups.set("32451", [])
      const causeException = async () => {
        await signups.addTeam("32451", "", [])
      }

      await expect(causeException).rejects.toThrow("Exactly three players must be provided")
    })

    it("Should not add a team because there are 2 of the same player on a team", async () => {
      signups.activeScrimSignups.set("scrim 1", [])
      const causeException = async () => {
        await signups.addTeam("scrim 1", "Fineapples", [supreme, supreme, mikey])
      }

      await expect(causeException).rejects.toThrow("")
    })
  })


  describe("getSignups()", () => {
    it("Should get all teams", async () => {

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
    })
  })

  describe("updateActiveScrims()", () => {
    it("Should get active scrims", async () => {
      signups.activeScrimSignups.clear()
      jest.spyOn(dbMock, 'getActiveScrims').mockImplementation(() => {
        return Promise.resolve({
          "scrims": [
            {
              "id": "ebb385a2-ba18-43b7-b0a3-44f2ff5589b9",
              "discord_channel": "something"
            }
          ]
        })
      })

      await signups.updateActiveScrims()
      expect(signups.scrimChannelMap.size).toEqual(1)
      expect(signups.scrimChannelMap.get("something")).toEqual("ebb385a2-ba18-43b7-b0a3-44f2ff5589b9")
    })
  })

  describe("createScrim()", () => {
    it("Should create scrim", async () => {
      const channelId = "a valid id"
      signups.activeScrimSignups.clear()
      signups.scrimChannelMap.clear()
      jest.spyOn(dbMock, 'createNewScrim').mockImplementation((dateTime: Date, discordChannelID: string, skill: number) => {
        expect(discordChannelID).toEqual(channelId)
        expect(skill).toEqual(1)
        return Promise.resolve("a valid scrim id")
      })

      await signups.createScrim(channelId, new Date())
      expect(signups.activeScrimSignups.size).toEqual(1)
      expect(signups.scrimChannelMap.get(channelId)).toEqual("a valid scrim id")
      expect.assertions(4)
    })
  })

})

import {nhostDb} from "../src/db/nhost.db";
import {ErrorPayload, NhostClient} from "@nhost/nhost-js";
import {JSONValue} from "../src/db/db";
import {GraphQLError} from "graphql/error";
import {PlayerInsert} from "../src/models/Player";

let mockRequest: (query: string) => Promise<any> = jest.fn()

jest.mock("@nhost/nhost-js", () => {
  return {
    NhostClient: jest.fn().mockImplementation(() => {
      return {
        graphql: {
          request: (query: string) => mockRequest(query)
        },
      };
    }),
    ...jest.requireActual
  };
})
describe('DB connection', () => {

  beforeEach(() => {
  })

  /*
  it('Should fetch scrims', async ()=> {
    const scrims = await nhostDb.get('scrims', undefined, ['id', 'overstat_link', 'date_field', 'skill'])
    console.log(scrims)
    expect(scrims).toBeDefined()
  })
  */

  describe('get()', () => {
    it("Should have no search fields", async () => {
      mockRequest = (query) => {
        const expected = `
      query {
        players {
          id
          display_name
          overstat_link
        }
      }
    `
        expect(query).toEqual(expected)
        return Promise.resolve({ data: { scrims: [] }})
      }
      await nhostDb.get('players', undefined, ['id', 'display_name', 'overstat_link'])
      expect.assertions(1)
    })

    it("Should have one search field", async () => {
      mockRequest = (query) => {
        const expected = `
      query {
        players(where: { _and: [{ id: { _eq: "f272a11e-5b30-4aea-b596-af2464de59ba" } }]}) {
          id
          display_name
          overstat_link
        }
      }
    `
        expect(query).toEqual(expected)
        return Promise.resolve({ data: { players: [] }})
      }
      await nhostDb.get('players', {id: "f272a11e-5b30-4aea-b596-af2464de59ba"}, ['id', 'display_name', 'overstat_link'])
      expect.assertions(1)
    })



    it("Should have multiple search field", async () => {
      mockRequest = (query) => {
        const expected = `
      query {
        players(where: { _and: [{ id: { _eq: "f272a11e-5b30-4aea-b596-af2464de59ba" } }, { display_name: { _eq: "TheHeuman" } }]}) {
          id
          display_name
          overstat_link
        }
      }
    `
        expect(query).toEqual(expected)
        return Promise.resolve({ data: { players: [{id: "f272a11e-5b30-4aea-b596-af2464de59ba", display_name: "TheHeuman", overstat_link: "https://overstat.gg/player/357606.TheHeuman/overview"}] }})
      }

      const data = await nhostDb.get('players', {id: "f272a11e-5b30-4aea-b596-af2464de59ba", display_name: "TheHeuman"}, ['id', 'display_name', 'overstat_link'])
      expect(data).toEqual({ players: [{ id: "f272a11e-5b30-4aea-b596-af2464de59ba", display_name: "TheHeuman", overstat_link: "https://overstat.gg/player/357606.TheHeuman/overview"}]})
      expect.assertions(2)
    })
  })

  describe('post()', () => {
    it("Should have correct post query", async () => {
      mockRequest = (query) => {
        const expected = `
      mutation {
        insert_players(objects: [{ display_name: "Supreme",discord_id: "244307424838811648" }]) {
          returning {
            id
          }
        }
      }
    `
        expect(query).toEqual(expected)
        return Promise.resolve({
          data: {
            insert_players: {
              returning: [
                {
                  id: "7605b2bf-1875-4415-a04b-75fe47768565"
                }
              ]
            }
          }
        })
      }
      const newID = await nhostDb.post('players', {'display_name': "Supreme", 'discord_id': "244307424838811648"})
      expect(newID).toEqual("7605b2bf-1875-4415-a04b-75fe47768565")
      expect.assertions(2)
    })
  })

  describe('delete()', () => {
    it("Should have correct delete query", async () => {
      mockRequest = (query) => {
        const expected = `
      mutation {
        delete_players(where: { _and: [{ id: { _eq: "02ac47c9-bde8-4f74-abf6-59b2c534d965" } }]}) {
          returning {
            id
          }
        }
      }
    `
        expect(query).toEqual(expected)
        return Promise.resolve({
          "data": {
            "delete_players": {
              "returning": [
                {
                  "id": "02ac47c9-bde8-4f74-abf6-59b2c534d965",
                }
              ]
            }
          }
        })
      }
      const deletedID = await nhostDb.delete('players', "02ac47c9-bde8-4f74-abf6-59b2c534d965")
      expect(deletedID).toEqual("02ac47c9-bde8-4f74-abf6-59b2c534d965")
      expect.assertions(2)
    })
  })



  const createPlayer = (discordId: string, displayName: string, overstatLink?: string, elo?: number): PlayerInsert => {
    return { discordId, displayName, overstatLink, elo}
  }
  const zboy = createPlayer('316280734115430403', 'zboy', 'https://overstat.gg/player/749174.Zboy5z5/overview')
  const supreme = createPlayer('244307424838811648', 'Supreme', undefined, 1)
  const theheuman = createPlayer('315310843317321732', 'TheHeuman', 'https://overstat.gg/player/357606.TheHeuman/overview')

  describe('insert player()', () => {
    it("Should have correct mutation query with no overstat link", async () => {
      mockRequest = (query) => {
        const expected = `
      mutation upsertPlayer {
        insert_players_one(
          object: {discord_id: "316280734115430403", display_name: "zboy"}
          on_conflict: {
            constraint: players_discord_id_key,  # Unique constraint on discord_id
            update_columns: [
              display_name
            ]
          }
        ) {
          id  # Return the ID of the player, whether newly inserted or found
        }
      }
    `
        expect(query).toEqual(expected)
        return Promise.resolve({
          data: {
            insert_players_one: {
              id: "7605b2bf-1875-4415-a04b-75fe47768565"
            }
          }
        })
      }
      const newID = await nhostDb.insertPlayerIfNotExists('316280734115430403', "zboy")
      expect(newID).toEqual("7605b2bf-1875-4415-a04b-75fe47768565")
      expect.assertions(2)
    })

    it("Should have correct mutation query with overstat link", async () => {
      mockRequest = (query) => {
        const expected = `
      mutation upsertPlayer {
        insert_players_one(
          object: {discord_id: "316280734115430403", display_name: "zboy", overstat_link: "https://overstat.gg/player/749174.Zboy5z5/overview"}
          on_conflict: {
            constraint: players_discord_id_key,  # Unique constraint on discord_id
            update_columns: [
              display_name
              overstat_link
            ]
          }
        ) {
          id  # Return the ID of the player, whether newly inserted or found
        }
      }
    `
        expect(query).toEqual(expected)
        return Promise.resolve({
          data: {
            insert_players_one: {
              id: "7605b2bf-1875-4415-a04b-75fe47768565"
            }
          }
        })
      }
      const newID = await nhostDb.insertPlayerIfNotExists('316280734115430403', "zboy", "https://overstat.gg/player/749174.Zboy5z5/overview")
      expect(newID).toEqual("7605b2bf-1875-4415-a04b-75fe47768565")
      expect.assertions(2)
    })
  })



  describe('insert multiple players()', () => {
    it("Should have correct mutation query", async () => {
      mockRequest = (query) => {
        const expected = `
          mutation upsertPlayer {
            insert_players(objects: [
              {discord_id: "316280734115430403", display_name: "zboy"}
              {discord_id: "244307424838811648", display_name: "Supreme"}
              {discord_id: "315310843317321732", display_name: "TheHeuman"}
            ]
              on_conflict: {
                constraint: players_discord_id_key,   # Unique constraint on discord_id
                update_columns: [
                  display_name  # necessary for graphql to actually return an id
                ]
              }
            ) {
              returning {
                id
              }
           }

            update_player_1: update_players(
              where: {discord_id: {_eq: "316280734115430403"}},
              _set: {
                display_name: "zboy",
                overstat_link: "https://overstat.gg/player/749174.Zboy5z5/overview"
              }
            ) {
              affected_rows
            }

            update_player_2: update_players(
              where: {discord_id: {_eq: "244307424838811648"}},
              _set: {
                display_name: "Supreme",
                elo: 1
              }
            ) {
              affected_rows
            }

            update_player_3: update_players(
              where: {discord_id: {_eq: "315310843317321732"}},
              _set: {
                display_name: "TheHeuman",
                overstat_link: "https://overstat.gg/player/357606.TheHeuman/overview"
              }
            ) {
              affected_rows
            }
          }
        `
        expect(query.replace(/\s+/g, ` `)).toEqual(expected.replace(/\s+/g, ` `))
        return Promise.resolve({
          "data": {
            "insert_players": {
              "returning": [
                {
                  "id": "11583f2c-184f-4ab5-9f6f-ff33f2741117"
                },
                {
                  "id": "7605b2bf-1875-4415-a04b-75fe47768565"
                },
                {
                  "id": "f272a11e-5b30-4aea-b596-af2464de59ba"
                }
              ]
            },
            "update_player_1": {
              "affected_rows": 1
            },
            "update_player_2": {
              "affected_rows": 1
            },
            "update_player_3": {
              "affected_rows": 1
            }
          }
        })
      }
      const newID = await nhostDb.insertPlayers([zboy, supreme, theheuman])
      expect(newID).toEqual(["11583f2c-184f-4ab5-9f6f-ff33f2741117", "7605b2bf-1875-4415-a04b-75fe47768565", "f272a11e-5b30-4aea-b596-af2464de59ba"])
      expect.assertions(2)
    })
  })
})

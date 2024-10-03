import {nhostDb} from "../src/db/nhost.db";
import {ErrorPayload, NhostClient} from "@nhost/nhost-js";
import {JSONValue} from "../src/db/db";
import {GraphQLError} from "graphql/error";

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
})

import {fetchScrims} from "../src/db/test";
import {nhostDb} from "../src/db/nhost.db";

describe('DB connection', () => {

  beforeEach(() => {
  })

  it('Should fetch scrims', async ()=> {
    const scrims = await nhostDb.get('scrims', ['id', 'overstat_link', 'date_field', 'skill'])
    console.log(scrims)
    expect(scrims).toBeDefined()
  })
})

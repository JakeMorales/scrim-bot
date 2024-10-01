import {fetchScrims} from "../src/db/test";

describe('DB connection', () => {

  beforeEach(() => {
  })

  it('Should fetch scrims', async ()=> {
    const scrims = await fetchScrims()
    console.log(scrims)
    expect(scrims).toBeDefined()
  })
})

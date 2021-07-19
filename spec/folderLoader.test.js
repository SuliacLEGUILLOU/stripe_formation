const fl = require('../lib/folderLoader')

const Path = require('path')
const wh_path = Path.join(process.env.STRIPE_FORMATION_PATH, 'example/webhook')

describe('folderLoader', () => {
    it('Should be a function', () => {
        expect(typeof(fl)).toBe('function')
    })

    describe('Loading folder', () => {
        it('should load file', async () => {
            var p = new Promise(resolve => {
                fl(wh_path, (err, data) => {
                    expect(err).toBe(null)
                    expect(data).toEqual({
                        charges: {
                            created: jasmine.any(Function),
                            updated: jasmine.any(Function)
                        },
                        account: {
                            updated: jasmine.any(Function)
                        }
                    })

                    resolve()
                })
            })

            await p
        })
    })
})
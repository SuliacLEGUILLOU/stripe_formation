const fl = require('../lib/folderLoader')

describe('folderLoader', () => {
    it('Should be a function', () => {
        expect(typeof(fl)).toBe('function')
    })

    describe('Loading folder', () => {
        it('should load file', async () => {
            var p = new Promise(resolve => {
                fl('/home/su/Projects/stripe_formation/example/webhook/', (err, data) => {
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
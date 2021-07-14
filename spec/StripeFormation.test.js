const SF = require('../lib/StripeFormation')

describe('StripeFormation', () => {
    it ('should allow multiple', () => {
        var x1 = new SF()
        var x2 = new SF()

        expect(x1).not.toBe(x2)
    })
})
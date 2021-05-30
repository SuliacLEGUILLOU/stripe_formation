const StripeFormation = require('../lib/StripeFormation')

class StripeEngine extends StripeFormation {
    constructor(options = {}){
        super(options)
    }
}

async function main(){
    const engine = new StripeEngine({path: process.env.STRIPE_TEMPLATE})
    await engine.init()

    var stripeFR = engine.getEngine('fr')

    console.log('Simple example: ', await stripeFR.balance.retrieve())
    console.log('Product basic: ', engine.getProduct('fr', 'base'))
    console.log('Tax rate: ', engine.getTaxRate('fr', 'default'))
}

main()
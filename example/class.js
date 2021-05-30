const StripeFormation = require('../lib/StripeFormation')

class StripeEngine extends StripeFormation {
    constructor(options = {}){
        super(options)
    }
}

async function main(){
    const engine = new StripeEngine({path: process.env.STRIPE_TEMPLATE})

    await engine.init()
}

main()
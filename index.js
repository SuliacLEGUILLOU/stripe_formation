const StripeFormation = require('./lib/StripeFormation')

class StripeEngine extends StripeFormation {
    constructor(options = {}){
        super(options)
    }
}

async function main(){
    const engine = new StripeEngine({path: '/home/su/Projects/stripe_formation/simple_input.json'})

    await engine.init()
}

main()
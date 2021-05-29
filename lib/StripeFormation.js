const Stripe = require('stripe')

class StripeFormation {
    constructor(options={}){
        if (!options.path) return 'Bad config, throw here'
        this._engine = options.engine || Stripe
        this._base = options.template || require(options.path)
        
        this._engines = {}
        this._structure = {}
        for (var i in this._base.keys){
            this._engines[i] = this._engine(this._base.keys[i].private)
        }
    }

    publicKeyMW(){
        return (req, res) => {
            const public_key = this._base.keys[req.params.key].public

            if(!key) return res.status(404).send({code: 'NOT_FOUND'})
            res.send({code: 'OK', key: public_key})
        }
    }

    getEngine(code){
        return this._engines[code]
    }

    async _initEngine(code){
        var engine = this._engines[code]
        var structure = {
            product: {
                unassigned: []
            },
            webhook: {
                unassigned: []
            },
            taxRates: {}
        }
        
        var products = await engine.products.list({limit: 100}).catch(err => {
            console.log('Gathering product failed for code ', code)
            throw err
        })
        var webhooks = await engine.webhookEndpoints.list({limit: 100}).catch(err => {
            console.log('Gathering webhook failed for code ', code)
            throw err
        })

        for (var i in products.data){
            if (products.data[i].metadata && products.data[i].metadata.internal_id){
                structure.product[products.data[i].metadata.internal_id] = products.data[i]
            } else {
                structure.product.unassigned.push(products.data[i])
            }
        }
        for (var i in webhooks.data){
            structure.webhook[webhooks.data[i].url] = webhooks.data[i]
        }
        return structure
    }

    async _initTaxRate(code){
        var engine = this._engines[code]
        var taxRate = this._base.keys[code].tax_rate
        var entities = await engine.taxRates.list({limit: 100})

        for(var key in taxRate){
            var exist = false

            for(var i in entities.data){
                if(entities.data[i].metadata && entities.data[i].metadata.internal_id === key){
                    this._structure[code].taxRates[key] = entities.data[i]
                    exist = true
                    break
                }
            }
            if(!exist){
                var data = taxRate[key]
                data.metadata = data.metadata || {}
                data.metadata.internal_id = key

                this._structure[code].taxRates[key] = await engine.taxRates.create(data).catch(err => {
                    console.log('Issue while creating tax rate')
                    throw err
                })
            }
        }
    }

    async init(){
        for (var code in this._engines){
            this._structure[code] = await this._initEngine(code)

            await this._initTaxRate(code)

            for (var key in this._base.formation.products){
                var product = this._base.formation.products[key]
                var entity = this._structure[code].product[key]
                
                if (!entity){
                    product.metadata = product.metadata || {}
                    product.metadata.internal_id = key

                    this._structure[code].product[key] = await this._engines[code].products.create(product)
                }
            }
        }
        console.log(this._structure)
    }

    _completeEngine(engine, structure){}
}

module.exports = StripeFormation
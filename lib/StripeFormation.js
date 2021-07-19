const Stripe = require('stripe')
const folderLoader = require('./folderLoader')
const Path = require('path')

class StripeFormation {
    constructor(options={}){
        if (!options.path) return 'Bad config, throw here'
        this._engine = options.engine || Stripe
        this._base = options.template || require(options.path)
        
        this._engines = {}
        this._structure = {}
        for (var i in this._base.accounts){
            this._engines[i] = this._engine(this._base.accounts[i].private)
        }

        this.webhook_default = options.webhook_default || this.webhook_default
        this.context = options.context || {}
        this.wh_controllers = {}
        if (options.wh_folder){
            folderLoader(options.wh_folder, (err, c) => {
                // TODO log error?
                this.wh_controllers = c
            })
        }
    }

    webhook_default(req, res, next) {
        // TODO: Maybe log?
        next()
    }

    wh_middleware(req, res, next) {
        const sig = req.headers['stripe-signature']
        //? Should the country code access be a param?
        const engine = this.getEngine(req.params.code) || this.getEngine(req.query.country) || this.getEngine(req.headers['country']) 

        // log event?
        var event
        try {
            event = engine.webhooks.constructEvent(req.body, sig)
        } catch (err) {
            // Log?
            next('INVALID_SIGNATURE', err)
        }

        var c = this.wh_controllers
        var event_path = event.type.split('.')
        for(var p of event.path){
            if (!c) {
                c = this.webhook_default
                break
            }
        }
        c.call(this.context, req, res, next)
    }

    getProduct(code, id){
        return this._structure[code].product[id]
    }

    getTaxRate(code, id){
        return this._structure[code].taxRates[id]
    }

    publicKeyMW(){
        return (req, res) => {
            const public_key = this._base.accounts[req.params.key].public

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
        
        var products = await engine.products.list({limit: 100, expand: ['data.prices']}).catch(err => {
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
        var taxRate = this._base.accounts[code].tax_rate
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
                    var price = product.price
                    delete product.price
                    product.metadata = product.metadata || {}
                    product.metadata.internal_id = key

                    this._structure[code].product[key] = await this._engines[code].products.create(product)
                    if (price){
                        price.product = this._structure[code].product[key].id
                        this._structure[code].product[key].price = await this._engines[code].prices.create(price)
                    }
                }
            }
        }
    }
}

module.exports = StripeFormation
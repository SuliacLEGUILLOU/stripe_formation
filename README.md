# StripeFormation

## Project Status: BETA

Road map to V1
- Add webhook management
- Add webhook controller
- Unit test

Other thing to do
- Update/Diff application
- Standalone program
- 100% code coverage

## What is this

Stripe Formation aim to provide an easy to use interface to define simple stripe resource over multiple account (My use case i that my company run it over multiple country)

It let you declare multiple account, associate a bunch of tax rate to them and then have a set of product/price item if you want to run subscription.

You will also be able to configure and manage and help you run webhooks.

## How to use it

This module is designed to extend a stripe class that contain your own logic. The stripe formation interface gives you access to your account resources so you just have to track which account you want to use in your application.

For template, resource are given straight away to stripe api for creation. You can find reference [here](https://stripe.com/docs/api?lang=node)
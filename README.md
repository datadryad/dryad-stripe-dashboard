# Description

The goal of this project is to interface with the Stripe API and provide some minor improvements to the standard features provided by the Stripe portal.

The project includes a user management tool that allows permission control for all added users. The project also has a screen to list out invoices from the Stripe account and to alter the status of the invoices. In this module, the additional feature is the "mark as" feature, which adds a tag to the invoice, and does not modify the actual invoice status.

Both invoicing and reports in this project support custom statuses which are mapped to existing Stripe statuses. For example, the Stripe status of paid may have 3 statuses in the project mapped to it—Paid, Voucher, Waiver—where the last 2 refer to how it was paid. The relevant details can be tracked using custom fields. "Invoiced in Error" in this project refers to "Void" in Stripe.

"Gross Invoiced Value" in this project refers to the Gross amount in Stripe.

The reports feature uses the Stripe objects for reports, but allows the use of custom statuses mapped to Stripe, and custom terminology.

# Running the project

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Prerequisites

This project is packaged with [yarn](https://yarnpkg.com/).

It requires a [Stripe](https://stripe.com/) account with Developer access to API keys and Webhooks.

To serve a production build, use a static server. [Serve](https://yarnpkg.com/package/serve) can be added with yarn: `yarn global add serve`


## Installation

In the project directory, run:

### `yarn install`

To install the project files.

### Add Stripe secrets

Visit the [API keys](https://dashboard.stripe.com/apikeys) page in the Stripe Developers dashboard to acquire an API key for your Stripe live or test data.

Add the API key to your root directory .env file: `SECRET_KEY=sk_testorlive_stripeAPIstring`

Visit the [Webhooks](https://dashboard.stripe.com/webhooks) page in the Stripe Developers dashboard to set up a Webhook endpoint for your live or test data.

Add the endpoint signing secret to your root director .env file: `ENDPOINT_SECRET=whsec_stripeSecretString`


## Development

### `yarn start-frontend`

In the project directory, run: `yarn start-frontend`

To run the app in development mode.<br>
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br>
You will also see any lint errors in the console.

### `yarn test`

Launches the test runner in interactive watch mode.<br>


## Production

### `yarn build`

Builds the app for production to the `build` folder.

To serve this build using [serve](https://yarnpkg.com/package/serve), type `serve -s build`



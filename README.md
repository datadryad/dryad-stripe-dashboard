This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.<br>
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br>
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.<br>
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.<br>
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br>
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject-www`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

This is a thin wrapper around create-react-app's `eject` command. There is currently not an `eject` option for create-node-app.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: https://facebook.github.io/create-react-app/docs/code-splitting

### Analyzing the Bundle Size

This section has moved here: https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size

### Making a Progressive Web App

This section has moved here: https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app

### Advanced Configuration

This section has moved here: https://facebook.github.io/create-react-app/docs/advanced-configuration

### Deployment

This section has moved here: https://facebook.github.io/create-react-app/docs/deployment

### `npm run build` fails to minify

This section has moved here: https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify


Description of the project:
The goal of this project is to interface with the Stripe API and provide some minor improvements to the standard features provided by the Stripe portal.

the project includes a user management tool, that allows permission control for all added users.
The project also has a screen to list out invoices from the Stripe account and to alter the status of the invoices. In this module, the additional feature is the "mark as" feature, which adds a tag to the invoice, and does not modify the actual invoice status.

Both invoicing and reports in this project support custom statuses which are mapped to existing Stripe statuses. 

For example, the Stripe status of paid may have 3 statuses in the project mapped to it. Paid, Voucher, Waiver. Where the last 2 refer to how it was paid. The relevant details can be tracked using custom fields. Invoiced in Error in this project refers to Void in Stripe.

There are terms like Gross Invoiced Value in this project, which refer to the Gross amount in Stripe.

The reports feature basically uses the Stripe objects for reports, but allows the use of custom status which mapped to Stripe, and custom terminology.

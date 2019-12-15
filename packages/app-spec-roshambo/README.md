# App Spec Web Game

This app-spec is an example game built using the Squad-SDK.
To try it out, follow the instructions to [set up a dev environment for Squad](/CONTRIBUTING.md#Dev-Environment-Setup). 

# Background

We are building a big hariy new system on a few big hairy
new platforms. In order to keep things working well
together we are borrowing a method from one of those
platforms, holochain. Thir app spec is a working
application that runs on the platform and acts as a
specification. If a code change breaks the app spec, the
code change is not to spec. otherwise it is

For us this is a game

# Current conditions

We've got an app spec that's not very well suited for
the platform. It's not worth playing, and it's not well
suited for expansion or the web.

# Goals

Build a game that will work well as a specification by:
* Alerting us when we've broken backwards compatability
* Provide good reference implementation patterns to game
  devs building on the platform
* Beg for the development of new platform features

# Strategy

Build a game with the following properties

* Simple
  * to reduce the overhead of understanding it as a 
    reference implmenetation
  * to reduce the barrier to contributing code
  * to highlight opportunities for new platform features
* Fun
  * so that bugs are found and reported by players
* Valuable
  * so we can test the market features of the platform
  * to test the community participation premise
  * so that the platform developers can earn a living
* Flexible
  * so that it can cover a wide range of platform features

# Plan

Build "Automatic Chess" a chess autobattler where players
draft pices from the format and arange them how they want
before the AI plays out the game.

---

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

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (Webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

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

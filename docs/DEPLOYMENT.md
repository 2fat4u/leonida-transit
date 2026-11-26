# Publish the app and install it on your phone

GitHub stores the source code. Publishing turns that code into a website with an HTTPS address. You can then open that address on your phone and install the web app.

You need a Cloudflare account and access to [2fat4u/leonida-transit](https://github.com/2fat4u/leonida-transit). You can use the address Cloudflare provides; a custom domain is optional.

## 1. Create a Cloudflare Pages project

1. Sign in at the [Cloudflare dashboard](https://dash.cloudflare.com/).
2. Open **Workers & Pages**, choose **Create application**, then select **Pages**.
3. Choose **Connect to Git** or **Import an existing Git repository**, depending on the wording shown.
4. Connect GitHub. In GitHub's authorization screen, allow the Cloudflare app to access **`2fat4u/leonida-transit`**. This is a separate connection from ChatGPT's GitHub access.
5. Select **`leonida-transit`** and continue to the build setup.

## 2. Enter the build settings

| Field | Value |
|---|---|
| Project name | `leonida-transit`, if available, or another neutral name |
| Production branch | `main` |
| Root directory | Leave blank; the app is at the repository root |
| Build command | `npm test && npm run build` |
| Build output directory | `dist` |

The repository's `.node-version` file selects **Node.js 22**. If you need to set the version in the dashboard, add the environment variable **`NODE_VERSION`** with value **`22`**.

Choose **Save and Deploy**. Cloudflare installs the dependencies, runs the tests, builds the app and publishes it. Wait for a successful deployment, then **copy the HTTPS website address shown on the result screen**. That is your app link.

## 3. Open and install the app

1. Send the website address to your phone and open it in **Chrome on Android**.
2. In Chrome's menu, choose **Install app** or **Install and create shortcut**, then confirm installation. The wording varies by browser version.
3. Open the installed app once with an internet connection and wait for the offline-ready indicator.
4. Use **Data & offline** for later app updates. Choose any personal background image again on the phone; it stays on that device.

Chrome on Android successfully installed the app in the reported device test. Samsung Internet remains limited for installation and map colours. Other platforms, including iOS hardware, have not been fully verified.

## Updates and common questions

**How do I publish changes?** Changes pushed to `main` trigger a new Cloudflare build. Check the Pages project's deployment result to confirm that the update went live.

**Why does localhost not open the app?** `localhost` means the device you are currently using. It only serves this app while the preview server is running on that device. For your phone, use the published HTTPS address from Cloudflare. Developer setup is in the [README](../README.md#run-locally-for-development).

**GitHub's checks are green. Is the website already online?** The GitHub workflow tests the code and saves a build artifact. The Cloudflare project above supplies the public website address.

**The repository is missing from Cloudflare.** Review the Cloudflare GitHub app's repository selection and include `leonida-transit`.

**The build failed.** Open the deployment's build log and check which step failed. Confirm the build command and `dist` output directory above, along with Node.js 22.

Official references: [Cloudflare Git integration](https://developers.cloudflare.com/pages/get-started/git-integration/), [React deployment](https://developers.cloudflare.com/pages/framework-guides/deploy-a-react-site/) and [Node.js version selection](https://developers.cloudflare.com/pages/configuration/build-image/).

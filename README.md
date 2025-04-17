# Waymo Promo Tool
![Icons](https://skillicons.dev/icons?i=cloudflare,workers,ts)


[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/burritosoftware/waymo-promo-tool)  
<sub>Note: Once deployed, you will need to [configure the Worker](#configuration).</sub>  

---
This Cloudflare Worker simplifies sharing Waymo "Refer and Earn" promo codes by **automatically presenting visitors with the correct code for their local service area**, leveraging the nearest Cloudflare colocation for privacy-friendly geolocation.

Codes can be **dynamically updated** via KV storage without modifying the Worker directly, and a **deactivation notice can be configured** when monthly referral limits are reached.

## Screenshots
TODO: upload screenshots using GitHub WebUI

## Features
- 🌎 Supports **multiple service areas**
- 📋 Displays a **simple code box** for copying
- ❌ Codes can be **deactivated** once they are used up
- 🔎 **Privacy-preserving geolocation** and no tracking
  - 🧩 Optional: add your own tracking (Cloudflare Analytics, Google Analytics, etc.)
- 🌙 Works with **light and dark** themes

## Deployment
There are two ways to set it up: automatically using the [**Deploy to Cloudflare button**](#deploy-to-cloudflare-button-easiest), or manually using [**Wrangler**](#deploy-with-wrangler).

### Deploy to Cloudflare Button (easiest)
Use this button to deploy this Cloudflare Worker. Cloudflare will automatically clone the repository to a GitHub or GitLab account and provision KV for you.   

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/quacksire/waymo-promo-tool)

> [!TIP]
> #### Recommended Settings to Adjust
> - Git account (where to clone)
> - [x] Create private Git repository  

Press `Create and deploy` once you've configured your desired deployment settings.

> [!NOTE]  
> Once deployed, you will need to [configure the Worker](#configuration).

### Deploy with Wrangler
#### Requirements
- [Git](https://git-scm.com)
- [Node.js and npm](https://nodejs.org)

#### Instructions
1. Clone this GitHub repository.
```bash
git clone https://github.com/burritosoftware/waymo-promo-tool.git
cd waymo-promo-tool
```

2. Create a KV namespace with name `PROMO_KV`.
```bash
npx wrangler kv namespace create "PROMO_KV"
```
Example output:
```
🌀 Creating namespace with title "worker-PROMO_KV"
✨ Success!
Add the following to your configuration file in your kv_namespaces array:
kv_namespaces = [
  { binding = "PROMO_KV", id = "e29b263ab50e42ce9b637fa8370175e8" }
]
```
3. Copy the ID from the output and change the existing ID value in the kv_namespaces array in `wrangler.jsonc`.

4. Deploy with Wrangler.
```bash
npx wrangler deploy
```

> [!NOTE]  
> Once deployed, you will need to [configure the Worker](#configuration).

## Configuration
### Initial Setup
[Visit this link to open the settings for your Cloudflare Worker](https://dash.cloudflare.com/?to=/:account/workers/services/view/:worker/production/settings). Under "Domains & Routes", copy the workers.dev domain, or set a custom one using the Add button. Keep the domain handy for configuration. It will be referred to as `<your domain>` in the documentation.

Next, go to `https://<your_domain>/choose`. Choose a service area that you want to share codes for. Then, go back using the "Choose another" link and visit all other service areas you want to share. This will create KV pairs for the service areas in realtime.

Afterwards, [visit this link to go to the KV dashboard](https://dash.cloudflare.com/?to=/:account/workers/kv/namespaces/). Select the KV namespace for your Worker. Go to the KV Pairs tab at the top, and enter in your promo code links for `promo_region`. You can copy the code and replace the `CHANGE_KV` placeholder, or you can copy the link from the Waymo One app using the Share button. **This is how you will update your codes when they change, and set activated/deactivated status.**

Lastly, edit `config.json` as described below to your liking.

### Configurable Options

#### Supported Regions
Waymo service areas are represented by a 2 letter code string, used in both KV and config.json. These are the currently supported regions. More regions will be added as refer-and-earn programs expand.

- Los Angeles: `la`
- San Francisco: `sf`
- Phoenix: `az`

#### config.json

Access `config.json` by going to the cloned GitHub or GitLab repository for your Worker.

> [!TIP]  
> As you likely do not have a code for every service area, it is recommended to set the `hiddenServiceAreas` setting.

- `greeting`: string
  - A greeting that will appear at the top of the page.
    - Default: `Hey! Here's my referral code!`
- `analyticsHeader`: html
  - HTML code to embed in \<head> (for analytics purposes)
    - Default: No analytics are embedded.
- `analyticsFooter`: html
  - HTML code to embed in \<body> (for analytics purposes)
    - Default: No analytics are embedded.
- `hiddenServiceAreas`: string[]
  - Array of service area code strings to hide.  
    - Default: `["sv"]`

#### KV
Access KV settings by [visiting this link](https://dash.cloudflare.com/?to=/:account/workers/kv/namespaces/). Select your Worker's KV namespace, and then go to the KV Pairs tab at the top.

- `promo_region`: URL 
  - Promo code URL for that region. Must have a querystring `?code=` that specifies a promo code.
    - Default: `https://waymo.smart.link/4pcoqniy5?code=CHANGE_KV`

- `promo_region-activated`: boolean
  - Whether the code is active or not.
    - Default: `true`

## Future Roadmap
[x] Support multiple service areas  
[ ] iOS Shortcut to update promo code URLs using Workers KV API and Share Sheet

## Notice
This tool is unofficial, and not developed by Waymo. Waymo is a trademark of Waymo LLC. I am not affiliated with Waymo in any capacity.


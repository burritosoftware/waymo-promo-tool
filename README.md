# Waymo Promo Tool
![Icons](https://skillicons.dev/icons?i=cloudflare,workers,ts)


[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/burritosoftware/waymo-promo-tool)  
<sub>Note: Once deployed, you will need to [configure the Worker](#configuration).</sub>  

---
This Cloudflare Worker simplifies sharing Waymo "Refer and Earn" promo codes by **automatically presenting visitors with the correct code for their local service area**, leveraging the nearest Cloudflare colocation for privacy-friendly geolocation.

Codes can be **dynamically updated** via KV storage without modifying the Worker directly, and a **deactivation notice can be configured** when monthly referral limits are reached.

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

Once deployed, you will need to [configure the Worker](#configuration).

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

Once deployed, you will need to [configure the Worker](#configuration).

## Configuration

## Screenshots
TODO: upload screenshots using GitHub WebUI



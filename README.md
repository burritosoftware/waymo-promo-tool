# Waymo Promo Tool
![Icons](https://skillicons.dev/icons?i=cloudflare,workers,ts)


[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/burritosoftware/waymo-promo-tool)

This Cloudflare Worker simplifies sharing Waymo "Refer and Earn" promo codes by **automatically presenting visitors with the correct code for their local service area**, leveraging the nearest Cloudflare colocation for privacy-friendly geolocation.

Codes can be **dynamically updated** via KV storage without modifying the Worker directly, and a **deactivation notice can be configured** when monthly referral limits are reached.

---

## Features
- 🌎 Supports **multiple service areas**
- 📋 Displays a **simple code box** for copying
- ❌ Codes can be **deactivated** once they are used up
- 🔎 **Privacy-preserving geolocation** and no tracking
  - 🧩 Optional: add your own tracking (Cloudflare Analytics, Google Analytics, etc.)
- 🌙 Works with **light and dark** themes

## Deployment
There are two ways to set it up: automatically using a **Deploy to Cloudflare button**, or manually using **Wrangler**.

### Deploy to Cloudflare Button (easiest)
Use this button to deploy this Cloudflare Worker. Cloudflare will automatically clone the repository and provision necessary resources for you.  

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/quacksire/waymo-promo-tool)

Once it's deployed, you will need to configure KV, greetings, etc [link to kv here]

### Deploy with Wrangler
TODO: manual steps

Once it's deployed, you will need to configure KV, greetings, etc [link to kv here]

## Configuration

## Screenshots
TODO: upload screenshots using GitHub WebUI



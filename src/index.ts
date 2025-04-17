interface Env {
  ASSETS: Fetcher;
  PROMO_KV: KVNamespace;
}

import * as config from "../config.json";

/**
 * Territory Promo Codes
 * path: URL path for the territory
 * promo: KV key for the promo code (used to retrieve the promo code url from KV `promo_sf`, and to check if it's activated `promo_sf-activated`)
 * name: Name of the territory
 * colos: List of Cloudflare data center codes for the territory, used to redirect users based on their location
 * */
const territoryPromo = [
  { path: "la", promo: "promo_la", name: "Los Angeles", colos: ["LAX"] },
  { path: "sf", promo: "promo_sf", name: "San Francisco", colos: ["SFO", "SJC"] },
  { path: "az", promo: "promo_az", name: "Phoenix", colos: ["PHX"] },
  //{ path: "sv", promo: "promo_sv", name: "Silicon Valley" },
]



/**
 * KV Setup
 *
 * 1. Create a KV namespace with the name `PROMO_KV`
 * 2. Add the following key-value pairs:
 *   - promo_la: "https://waymo.com/la?code=LA-XXXX"
 *   - promo_la-activated: "false"
 *
 * Use: promo_la for Los Angeles, promo_sf for San Francisco, etc.
 * activated key is used to disable the promo code when it's used up.
 *
 */


/******
 * User Config + defaults
 ****/
/**
 * Greeting message, displayed at the top of the code page
 * @type {string}
 */
const greeting = config.greeting || "Hey! Here's my referral code!"

/**
 * Analytics
 *
 * footer goes to the end of the <body> tag (ex. Cloudflare Web Analytics)
 * header goes to the <head> tag (ex. Google Analytics)
 *
 **/
const analyticsHeader = config.analyticsHeader || ""
const analyticsFooter =  config.analyticsFooter || ""

// CONSTANT 🎨 Credits

const credit = `
<ul style="margin-bottom: 0; padding: 0;">
  <li style="padding-left: 0;">
    <p style="margin: 0;">Waymo Promo Tool (Unofficial)</p>
  </li>
  <li style="padding: 0;">
    <a href="https://github.com/burritosoftware/waymo-promo-tool" style="vertical-align: middle;"><img src="https://raw.githubusercontent.com/primer/octicons/main/icons/mark-github-16.svg" class="invert-on-dark"></a>
  </li>
</ul>
`

// CONSTANT 🎨 Styles
const styles = `
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/water.css@2/out/water.css">
    <style>
      html, body {
          height: 100%;
          margin: 0;
          display: flex;
          flex-direction: column;
          justify-content: flex-start;
          align-items: center;
        }
        body {
          touch-action: pan-x pan-y;
          touch-action: none;
        }
        .container {
          text-align: center;
          max-width: 600px;
          width: 90%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          flex-grow: 1;
          padding-bottom: 125px; /* Pushes content up to make space for footer */
        }
        h1 { margin-bottom: 0.3rem; white-space: pre-line; }
        h2 { margin-top: 0.1rem; }
        .code-box, .big-button {
          width: 100%; max-width: 400px;
          display: flex; justify-content: space-between; align-items: center;
          padding: 1rem; border-radius: 10px; font-size: 1.5rem;
        }
        h3 {
          white-space: pre-line;
          margin-bottom: 0;
        }
        .code-box {
          border: 2px solid gray; background-color: rgba(255, 255, 255, 0.1);
          transition: background-color 0.3s ease-in-out, border-color 0.3s ease-in-out;
        }
        .error { background-color: rgba(255, 50, 50, 0.2); border: 2px solid darkred; }
        .copied { background-color: rgba(50, 205, 50, 0.2); border: 2px solid darkgreen !important; }
        .copy-btn {
          background: none; border: none; font-size: 1.2rem; cursor: pointer; padding: 0.5rem;
          outline: none; user-select: none;
        }
        .copy-btn:hover, .copy-btn:focus { background: none; }
        .big-button {
          justify-content: center; text-align: center; background: #007aff; color: white;
          text-decoration: none; border-radius: 10px; margin-top: 1rem;
          transition: background 0.2s ease-in-out;
        }
        .big-button:hover, .big-button:active {
          text-decoration: none;
        }
        #copiedText {
          color: #3cb371; font-weight: bold; opacity: 0;
          transition: opacity 0.3s ease-in-out;
          height: 1.5rem;
          margin-top: 0.1rem;
          pointer-events: none; /* Ensures it doesn't interfere with interactions */
        }
        .error-text {
          color: #ff6666; font-weight: bold;
          white-space: pre-line;
          margin-top: 0.1rem;
        }
        .redeem-text { font-size: 0.9rem; color: gray; margin-top: 0.5rem; }
        .footer-img {
        /* 5% may be small, but on mobile its *just* enough */
        /* we want the photo to be responsive and take about the center forths of the scfeen width on the bottom */
        /* pinned on the bottom */
            position: absolute;
            bottom: 0;
            left: 50%;
            transform: translateX(-50%);
            width: 90%;
            max-width: 600px;
            height: auto;
        }
        @media (prefers-color-scheme: dark) {
          .invert-on-dark {
            filter: invert(100%);
          }
        }
        li {
          float: left;
          display: block;
          padding: 0 1em;
        }
    </style>
`

//! #endregion CONSTANTS



export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    console.log(request)

    // 🚦 Redirect users based on location
    const colo = request.cf.colo || request.headers.get("cf-colo") || "UNKNOWN";


    console .log(`Request from ${colo}`)

    if (url.pathname === "/choose") {
      return new Response(generateChooseHTML(), {
        headers: { "Content-Type": "text/html" },
      });
    }

    // 🚦 Redirect users based on location
    if (url.pathname === "/") {
      // check if the user is in a territory, and redirect them to the territory page
      const territory = territoryPromo.find((t) => t.colos.includes(colo));
      if (territory) {
        return Response.redirect(new URL(`/${territory.path}`, request.url).toString(), 302);
      }
      return Response.redirect(new URL("/choose", request.url).toString(), 302);
    }

    // 🖼 Serve images
    if (url.pathname.startsWith("/img/")) {
      return env.ASSETS.fetch(request);
    }

    // 📍 Determine promo code and page content
    let promoKey = "";
    let pageTitle = "";



    // 🎯 Determine territory and promo code
    const territory = territoryPromo.find((t) => url.pathname.startsWith(`/${t.path}`));
    if (territory) {
      // 🎯 Territory page
      promoKey = territory.promo;
      pageTitle = `${territory.name} service area only`;
    } else {
      return new Response(generateChooseHTML(), {
        headers: { "Content-Type": "text/html" },
      });
    }

    /**
     * 2. Add the following key-value pairs:
     *   - promo_la: "https://waymo.com/la?code=LA-XXXX"
     *   - promo_la-activated: "false"
     */

    // 🔑 Check if promo code exists in KV
    const promoCodeExists = await env.PROMO_KV.get(promoKey) !== null;
    const promoCodeActivated = await env.PROMO_KV.get(`${promoKey}-activated`) !== null;

    // If the promo code doesn't exist, create it with a default value
    if (!promoCodeExists) {
      await env.PROMO_KV.put(promoKey, `https://waymo.smart.link/4pcoqniy5?code=CHANGE_KV`);
    }
    // If the activated key doesn't exist, create it with a default value
    if (!promoCodeActivated) {
      await env.PROMO_KV.put(`${promoKey}-activated`, "true");
    }


    // 🔑 Retrieve promo code from KV
    const fullLink = (await env.PROMO_KV.get(promoKey)) || "";
    const activated = (await env.PROMO_KV.get(`${promoKey}-activated`)) === "true";

    console.log(fullLink)



    // Extract the promo code from the URL
    // Example: https://waymo.com/sf?code=SF-XXXX => SF-XXXX
    const promoCode = new URL(fullLink).searchParams.get("code") || "XXXX-XXXX";


    return new Response(generatePromoHTML(pageTitle, promoCode, activated, fullLink), {
      headers: { "Content-Type": "text/html" },
    });
  },
};

// 🎨 Generates the promo page HTML
function generatePromoHTML(title: string, promoCode: string, activated: boolean, url: string): string {
  return `<!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    ${styles}
    ${analyticsHeader}
  </head>
  <body>
  ${credit}
    <div class="container">
        <h3>${greeting}</h3>
        <h1>$10 off your first<br/>Waymo One ride</h1>
        <h3 style="margin-top: 10px">${title}</h3>
        <p style="margin-top: 0">Wrong service area? <a class="back-link" href="/choose" style="text-decoration: none;">Choose another →</a></p>
        ${!activated ? 
          `<p class="error-text">Code has been used up this month.\nTry again next month.</p>` 
        : 
          "<p id=\"copiedText\">Code copied!</p>"
        }
        <div id="codeBox" class="code-box ${!activated ? "error" : ""}">
          <input type="text" id="promoCode" value="${promoCode}" readonly
            style="border: none; background: none; width: 100%; font-size: 1.5rem;">
          <button class="copy-btn" onclick="copyCode()" ${!activated ? "disabled" : ""}>📋</button>
        </div>
        <a href="${url}" target="_blank" class="big-button">Download App</a>
        <p class="redeem-text">Account → Offers & promotions → Redeem code</p>
      
    </div>
    <img src="/img/waymo-half-shot.png" alt="Waymo Car" class="footer-img"  >
    <script>
      function copyCode() {
        navigator.clipboard.writeText(document.getElementById("promoCode").textContent).then(() => {
          
          document.getElementById("codeBox").classList.add("copied");
          
          document.getElementById("copiedText").style.opacity = 1;
            setTimeout(() => {
                document.getElementById("copiedText").style.opacity = 0;
                document.getElementById("codeBox").classList.remove("copied");
            }, 2000);
        });
      }
    </script>
    ${analyticsFooter}
    </body>
  </html>`;
}

// 📍 Generates the choose location page
function generateChooseHTML()  {

    const territoryPromoString = territoryPromo.map((t) => {
        return `<a href="/${t.path}" class="big-button">${t.name}</a>`;
    }
    ).join("");

  return `<!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Choose Your Service Area</title>
    ${styles}
    ${analyticsHeader}
  </head>
  <body>
    ${credit}
    <div class="container">
      <h1>Choose Your<br>Service Area</h1>
      ${territoryPromoString}
    </div>
    <img src="/img/waymo-half-shot.png" alt="Waymo Car" class="footer-img">
        ${analyticsFooter}
  </body>
  </html>`;
}

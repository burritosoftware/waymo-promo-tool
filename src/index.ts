interface Env {
  ASSETS: Fetcher;
  PROMO_KV: KVNamespace;
}

/**
 * Greeting message, displayed at the top of the code page
 * @type {string}
 */
const greeting = `Thanks for watching, here's my code!`

/**
 * Territory Promo Codes
 * path: URL path for the territory
 * promo: KV key for the promo code (used to retrieve the promo code from KV `promo_sf`, and to check if it's activated `promo_sf-activated`)
 * name: Name of the territory
 * colos: List of Cloudflare data center codes for the territory, used to redirect users based on their location
 * */
const territoryPromo = [
  { path: "la", promo: "promo_la", name: "Los Angeles", colos: ["LAX"] },
  { path: "sf", promo: "promo_sf", name: "San Francisco", colos: ["SFO", "SJC"] },
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




// CONSTANT 🎨 Credits
const credit = `
<ul style="margin-bottom: 0; padding: 0;">
        <li>
          <p style="margin: 0;">Waymo Promo Tool (Unofficial)</p>
        </li>
        <li>
          <a href="https://github.com/burritosoftware/waymo-promo-tool">GitHub</a>
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
      .container {
        text-align: center;
        max-width: 600px;
        width: 90%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        flex-grow: 1;
        padding-bottom: 125px;
      }
      .big-button {
        display: block; width: 100%; max-width: 400px;
        padding: 1rem; text-align: center; background: #007aff; color: white;
        text-decoration: none; border-radius: 10px; margin-top: 1rem;
        transition: background 0.2s ease-in-out;
      }
      .big-button:hover { background: #005bb5; }
      .back-link {
        margin-top: 20px; font-size: 0.9rem; color: gray; text-decoration: underline; cursor: pointer;
      }
      .footer-img {
        width: 95%; max-width: 600px; padding: 0 20px;
        position: absolute; bottom: 0;
        left: 50%; transform: translateX(-50%);
      }
      li {
          float: left;
          display: block;
          padding: 0 1em;
        }
    </style>
`



export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const colo = request.headers.get("cf-colo") || "UNKNOWN";

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

    if (url.pathname === "/choose") {
      return new Response(generateChooseHTML(), {
        headers: { "Content-Type": "text/html" },
      });
    }

    // 🎯 Determine territory and promo code
    const territory = territoryPromo.find((t) => url.pathname.startsWith(`/${t.path}`));
    if (territory) {
      // 🎯 Territory page
      promoKey = territory.promo;
      pageTitle = `For the ${territory.name} territory only`;
    } else {
      return new Response(generateChooseHTML(), {
        headers: { "Content-Type": "text/html" },
      });
    }

    // 🔑 Retrieve promo code from KV
    const fullLink = (await env.PROMO_KV.get(promoKey)) || "#";
    const activated = (await env.PROMO_KV.get(`${promoKey}-activated`)) === "true";
    const promoCodeMatch = fullLink.match(/[?&]code=([^&]+)/);
    const promoCode = promoCodeMatch ? promoCodeMatch[1] : "XXXX-XXXX";

    return new Response(generatePromoHTML(pageTitle, promoCode, activated, fullLink), {
      headers: { "Content-Type": "text/html" },
    });
  },
};

// 🎨 Generates the promo page HTML
function generatePromoHTML(title: string, promoCode: string, activated: boolean, url): string {
  return `<!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    ${styles}
  </head>
  <body>
  ${credit}
    <div class="container">
        <h3>${greeting}</h3>
        <h1>$10 off your first\nWaymo One ride</h1>
        <sub style="margin: 15px">${title}</sub>
        ${activated ? `<p class="error-text">Code has been used up this month.<br />Try again next month.</p>` : ""}
        
        <div>
          <div style="display: flex; justify-content: center; align-items: center; flex-direction: row;">
            <input type="text" id="promoCode" value="${promoCode}" readonly
              style="width: 100%; font-size: 1.5rem; justify-content: center" class="">
            <button class="copy-btn" onclick="copyCode()" ${activated ? "disabled" : ""}>📋</button>
          </div>
        </div>
        
         <p class="redeem-text">Copy the code above and redeem it in the Waymo app</p>
         

        <a href="${url}" class="big-button">Download App</a>
        <p class="redeem-text">Account → Offers & promotions → Redeem code</p>
      <p class="back-link" onclick="history.back()">Wrong location? Go back</p>
    </div>
    <img src="/img/waymo-half-shot.png" alt="Waymo Car" class="footer-img">
    <script>
      function copyCode() {
        navigator.clipboard.writeText(document.getElementById("promoCode").textContent).then(() => {
          alert("Promo code copied!");
        });
      }
    </script>
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
    <title>Choose Your Location</title>
    ${styles}
  </head>
  <body>
    ${credit}
    <div class="container">
      <h1>Choose Your Location</h1>
      ${territoryPromoString}
    </div>
    <img src="/img/waymo-half-shot.png" alt="Waymo Car" class="footer-img">
  </body>
  </html>`;
}

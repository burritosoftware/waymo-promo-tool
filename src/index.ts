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
 * promo: KV key for the promo code (used to retrieve the promo code url from KV `promo_sf`, and to check if it's activated `promo_sf-activated`)
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


/**
 * Beacon Token
 *
 * 1. Create a Cloudflare Web Analytics beacon
 * 2. Add the token here
 **/
const beaconToken =  "22add13d0b89447bbe442099c24dc61c"




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
          margin-top: 0.5rem;
          display: "block";
          pointer-events: none; /* Ensures it doesn't interfere with interactions */
        }
        .error-text {
          color: #ff6666; font-weight: bold;
          white-space: pre-line;
          margin-top: 0.5rem;
        }
        .redeem-text { font-size: 0.9rem; color: gray; margin-top: 0.5rem; }
        .footer-img {
        /* 5% may be small, but on mobile its *just* enough */
          height: 5%; width: auto; object-fit: contain;
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

//! #endregion CONSTANTS



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
function generatePromoHTML(title: string, promoCode: string, activated: boolean, url: string): string {
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
        <h2>${greeting}</h2>
        <h1>$10 off your first<br/>Waymo One ride</h1>
        <sub style="margin: 15px">${title}</sub>
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
        
        
        
         <p class="redeem-text">Copy the code above and redeem it in the Waymo app</p>
         

        <a href="${url}" target="_blank" class="big-button">Download App</a>
        <p class="redeem-text">Account → Offers & promotions → Redeem code</p>
      <a class="back-link" href="/" style="text-decoration: none;">Wrong location? Go back</a>
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
    <!-- Cloudflare Web Analytics --><script defer src='https://static.cloudflareinsights.com/beacon.min.js' data-cf-beacon='{"token": "${beaconToken}"}'></script><!-- End Cloudflare Web Analytics -->
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
        <!-- Cloudflare Web Analytics --><script defer src='https://static.cloudflareinsights.com/beacon.min.js' data-cf-beacon='{"token": "${beaconToken}"}'></script><!-- End Cloudflare Web Analytics -->
  </body>
  </html>`;
}

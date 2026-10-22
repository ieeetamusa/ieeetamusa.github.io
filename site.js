// Shared header and footer. Edit the nav or social links here once instead of on every page.
// Pages include <header id="site-header"></header> and <footer id="site-footer"></footer>.

const NAV = [
  ["/", "Home"],
  ["/Membership", "Membership"],
  ["/Events", "Events"],
  // ["/Officers", "Officers"], // TODO: enable once Officers/index.html has the current roster
  ["/About", "About"],
  ["/Sponsorship", "Sponsorship"],
  ["/Contact", "Contact"]
];

const SOCIALS = [
  ["https://discord.gg/X2ucbghawh", "/discord.png", "Discord"],
  ["https://www.instagram.com/ieee.tamusa", "/instagram.png", "Instagram"],
  ["https://jagsync.tamusa.edu/organization/ieee", "/link.png", "Jagsync"]
];

const here = location.pathname.replace(/\/(index\.html)?$/, "") || "/";

document.getElementById("site-header").innerHTML = `
  <a class="skip-link" href="#main">Skip to content</a>
  <a href="/"><img class="logo" src="/001_TAMUSA-Logo_Updated_Horizontal-Black.png" alt="Texas A&amp;M University-San Antonio home"></a>
  <nav class="links" aria-label="Main">
    ${NAV.map(([href, label]) =>
      `<a class="banner-link" href="${href}"${href === here ? ' aria-current="page"' : ""}>${label}</a>`).join("")}
  </nav>`;

document.getElementById("site-footer").innerHTML = `
  <b>IEEE TAMUSA Student Branch</b><br>
  <a href="https://www.ieee.org" target="_blank" rel="noopener">IEEE Global</a><br>
  <a href="mailto:ieeetamusa@gmail.com">ieeetamusa@gmail.com</a><br>
  <a href="/Newsletter">Get the newsletter</a>
  <div class="socials">
    ${SOCIALS.map(([href, icon, label]) =>
      `<a href="${href}" target="_blank" rel="noopener"><img width="40" height="40" src="${icon}" alt="${label}"></a>`).join("")}
  </div>`;

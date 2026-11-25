const navigation = [
  ["home", "Home", "index.html", "⌂"],
  ["servers", "Servers", "servers.html", "▤"],
  ["downloads", "Download", "download.html", "↓"],
  ["admin", "Admin Panel", "admin.html", "⚙"],
  ["profile", "Profile", "profile.html", "◉"],
  ["friends", "Friends", "friends.html", "♧"],
  ["inventory", "Inventory", "inventory.html", "▦"],
  ["shop", "Shop", "shop.html", "◇"],
  ["badges", "Badges", "badges.html", "✦"],
  ["credits", "Credits", "credits.html", "ⓘ"],
  ["settings", "Settings", "settings.html", "⚙"],
  ["login", "Log In", "login.html", "→"],
  ["signup", "Sign Up", "signup.html", "+"]
];

const SUPABASE_URL = "https://wobrjedahfhleazgvpkp.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_jHUW9hEpKyQcz6BSt6hj-Q_O7hhsbBd";
let supabaseClientPromise;

const badges = [
  ["Friendship", "Get 1 friend!", "friendship.png", "Social"],
  ["First Game", "Your first step into making and sharing games.", "first-game.png", "Creator"],
  ["Owner", "The red crown marks the Surelin owner.", "owner.png", "Special"],
  ["Used to Be Rich", "You once had a lot of Sura...", "used-to-be-rich.png", "Sura"],
  ["Richest Player", "Have the most Sura!", "richest-player.png", "Sura"]
];

const pages = {
  home: {
    title: "Home",
    eyebrow: "Your Surelin hub",
    heading: "Play. Create. Connect.",
    lead: "Welcome to Surelin. Jump into the game, check your profile, or explore achievements from the sidebar.",
    render: () => `
      <section class="feature-card">
        <span class="eyebrow">Welcome to Surelin</span>
        <h2>Make your next move.</h2>
        <p class="lead">Your game platform hub is taking shape. Use the sidebar to move directly between pages.</p>
        <div class="quick-links">
          <a class="quick-link" href="profile.html"><strong>Your profile</strong><span>View your player card</span></a>
          <a class="quick-link" href="friends.html"><strong>Friends</strong><span>Friend features are being connected</span></a>
          <a class="quick-link" href="inventory.html"><strong>Inventory</strong><span>View your item collection</span></a>
          <a class="quick-link" href="badges.html"><strong>Achievements</strong><span>See the badge collection</span></a>
        </div>
      </section>
      <div class="section-heading"><h2>Achievement badges</h2><a href="badges.html">View all badges</a></div>
      ${badgeCards(badges.slice(0, 3))}
      <div class="notice">Supabase sign-in is connected. Friends and inventory still need integration with the game account data.</div>`
  },
  servers: {
    title: "Servers",
    eyebrow: "Play",
    heading: "Surelin servers",
    lead: "Browse the servers registered with Surelin.",
    render: () => `<section id="servers-list" class="server-list"><p>Connecting to Surelin...</p></section>
      <div class="notice">This directory reads server IDs from Supabase. It does not host game servers or provide a join connection by itself.</div>`
  },
  profile: {
    title: "Profile",
    eyebrow: "Player",
    heading: "Profile",
    lead: "Your public player card and achievement showcase.",
    render: () => `
      <section class="feature-card">
        <div class="profile-row"><div class="avatar" aria-hidden="true">S</div><div><h2>Surelin Player</h2><p class="lead">Profile details are not connected yet.</p></div></div>
        <div class="stat-row"><div class="stat"><strong>—</strong><span>Level</span></div><div class="stat"><strong>—</strong><span>Sura</span></div><div class="stat"><strong>—</strong><span>Friends</span></div></div>
      </section>
      <div class="section-heading"><h2>Badge showcase</h2><a href="badges.html">Browse badges</a></div>
      ${badgeCards(badges.slice(0, 3))}
      <div class="notice">Authentication is connected, but live profile values are not yet loaded from the game account data.</div>`
  },
  friends: {
    title: "Friends",
    eyebrow: "Social",
    heading: "Friends",
    lead: "Keep up with the people you play and create with.",
    render: () => `<div class="empty-state"><h2>No friends to show yet</h2><p>Friend lists and requests need to be connected to Surelin accounts before live friends can appear here.</p><a href="profile.html">Go to your profile</a></div>`
  },
  inventory: {
    title: "Inventory",
    eyebrow: "Collection",
    heading: "Inventory",
    lead: "Characters, cosmetics, badges, and passes you own.",
    render: () => `<div class="empty-state"><h2>Your collection will appear here</h2><p>This website does not yet load saved ownership from the game account. No items are being presented as owned.</p><a href="badges.html">Browse achievement badges</a></div>`
  },
  shop: {
    title: "Shop",
    eyebrow: "Store",
    heading: "Shop",
    lead: "Explore cosmetics and creator items for Surelin.",
    render: () => `<div class="empty-state"><h2>Shop connection pending</h2><p>Purchases and Sura balances must be connected to the secured game backend before buying can be enabled.</p></div>`
  },
  badges: {
    title: "Badges",
    eyebrow: "Achievements",
    heading: "Earn your mark.",
    lead: "A first look at the achievement badges for friendship, creating, ownership, and Sura milestones.",
    render: () => badgeCards(badges)
  },
  credits: {
    title: "Credits",
    eyebrow: "People",
    heading: "Credits",
    lead: "The people and characters behind Surelin.",
    render: () => `<section class="credit-list">
      <article class="credit-entry"><h2>Game creator</h2><p><a href="https://www.youtube.com/@isaacgoatedofficial" target="_blank" rel="noopener noreferrer">isaacgoated</a></p><p>Created Surelin.</p></article>
      <article class="credit-entry"><h2>Rawbt</h2><p><a href="https://www.youtube.com/@lizzyisrizzygoated" target="_blank" rel="noopener noreferrer">Rawbt's channel</a></p><p class="notice">DOES NOT EXIST ANYMORE</p></article>
    </section>`
  },
  settings: {
    title: "Settings",
    eyebrow: "Preferences",
    heading: "Settings",
    lead: "Local website preferences.",
    render: () => `<div class="empty-state"><h2>Nothing to change yet</h2><p>Supabase manages account sign-in. Game and privacy preferences are not connected yet.</p></div>`
  },
  login: {
    title: "Log In",
    eyebrow: "Account",
    heading: "Log In",
    lead: "Enter your Surelin account details.",
    render: () => accountForm(false)
  },
  signup: {
    title: "Sign Up",
    eyebrow: "Account",
    heading: "Create an Account",
    lead: "Create your Surelin player account.",
    render: () => accountForm(true)
  }
};

function accountForm(isSignup) {
  return `<section class="feature-card account-card">
    <form id="account-form" data-action="${isSignup ? "signup" : "login"}">
      ${isSignup ? `<label for="username">Username</label><input id="username" name="username" type="text" minlength="3" maxlength="24" autocomplete="username" required>` : ""}
      <label for="email">Email</label>
      <input id="email" name="email" type="email" autocomplete="email" required>
      <label for="password">Password</label>
      <input id="password" name="password" type="password" minlength="8" autocomplete="${isSignup ? "new-password" : "current-password"}" required>
      <button type="submit">${isSignup ? "Create Account" : "Log In"}</button>
      <p id="account-message" role="status" aria-live="polite"></p>
    </form>
    <p class="form-switch">${isSignup ? `Already have an account? <a href="login.html">Log in</a>.` : `New to Surelin? <a href="signup.html">Create an account</a>.`}</p>
    <div class="notice">Authentication is handled by Supabase over HTTPS. Passwords are never stored by this website.</div>
  </section>`;
}

function badgeCards(items) {
  return `<section class="card-grid" aria-label="Achievement badges">${items.map(([name, description, image, category]) => `
    <article class="card">
      <div class="badge-art"><img src="../Assets/Badges/${image}" alt="${escapeHtml(name)} achievement badge"></div>
      <div class="card-body"><h2>${escapeHtml(name)}</h2><p>${escapeHtml(description)}</p><span class="tag">${escapeHtml(category)}</span></div>
    </article>`).join("")}</section>`;
}

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, character => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[character]);
}

const pageName = document.body.dataset.page || "home";
const page = pages[pageName] || pages.home;
document.title = `Surelin - ${page.title}`;

document.querySelector("#app").innerHTML = `
  <div class="layout">
    <aside class="sidebar">
      <a class="brand" href="index.html">SURE<span>LIN</span></a>
      <div class="nav-caption">PLATFORM</div>
      <nav class="nav" aria-label="Main navigation">
        ${navigation.map(([id, label, href, icon]) => `<a class="nav-link" ${id === "admin" ? 'id="admin-nav" style="display:none" ' : ""}href="${href}"${id === pageName ? ' aria-current="page"' : ""}><span class="nav-icon" aria-hidden="true">${icon}</span>${label}</a>`).join("")}
      </nav>
      <div class="sidebar-bottom">Local preview<br><a href="https://www.youtube.com/@isaacgoatedofficial">isaacgoated</a></div>
    </aside>
    <div class="main">
      <header class="topbar"><span class="breadcrumb">Surelin <span aria-hidden="true">/</span> ${page.title}</span><span id="auth-indicator" aria-live="polite">Checking account...</span><a id="account-action" href="login.html">Log In</a></header>
      <main class="content">
        <span class="eyebrow">${page.eyebrow}</span>
        <h1>${page.heading}</h1>
        <p class="lead">${page.lead}</p>
        ${page.render()}
      </main>
    </div>
  </div>`;

document.querySelector("#account-form")?.addEventListener("submit", async event => {
  event.preventDefault();
  const form = event.currentTarget;
  const message = document.querySelector("#account-message");
  const submitButton = form.querySelector("button[type=submit]");
  submitButton.disabled = true;
  message.textContent = "Connecting to Supabase...";
  try {
    const client = await getSupabaseClient();
    const formData = new FormData(form);
    const email = String(formData.get("email") || "").trim();
    const password = String(formData.get("password") || "");
    let result;
    if (form.dataset.action === "signup") {
      const username = String(formData.get("username") || "").trim();
      result = await client.auth.signUp({
        email,
        password,
        options: { data: { username, display_name: username } }
      });
    } else {
      result = await client.auth.signInWithPassword({ email, password });
    }

    if (result.error) throw result.error;
    if (form.dataset.action === "signup" && !result.data.session) {
      message.textContent = "Account created. Check your email to confirm it, then log in.";
      return;
    }
    window.location.href = "index.html";
  } catch (error) {
    message.textContent = error.message || "Supabase authentication failed.";
  } finally {
    submitButton.disabled = false;
  }
});

async function getSupabaseClient() {
  if (!supabaseClientPromise) {
    supabaseClientPromise = import("https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm")
      .then(({ createClient }) => createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY));
  }
  return supabaseClientPromise;
}

async function loadServers(client) {
  const container = document.querySelector("#servers-list");
  if (!container) return;

  const { data: sessionData, error: sessionError } = await client.auth.getSession();
  if (sessionError) {
    container.textContent = sessionError.message;
    return;
  }
  if (!sessionData.session) {
    container.innerHTML = `<div class="empty-state"><h2>Log in to browse</h2><p>Server records are available to signed-in Surelin accounts.</p><a href="login.html">Log in</a></div>`;
    return;
  }

  container.textContent = "Loading servers...";
  const { data, error } = await client.from("servers").select("id").limit(100);
  if (error) {
    container.textContent = `Could not load servers: ${error.message}`;
    return;
  }
  if (!data || data.length === 0) {
    container.innerHTML = `<div class="empty-state"><h2>No servers listed</h2><p>There are currently no server records available to your account.</p></div>`;
    return;
  }

  const list = document.createElement("div");
  list.className = "server-cards";
  for (const server of data) {
    const card = document.createElement("article");
    card.className = "server-card";
    const label = document.createElement("strong");
    label.textContent = `Server ${server.id}`;
    card.appendChild(label);
    list.appendChild(card);
  }
  container.replaceChildren(list);
}

async function loadDownloadLinks(client, adminMode = false) {
  const container = document.querySelector(adminMode ? "#admin-download-table" : "#download-list");
  if (!container) return;
  const query = client.from("download_links").select("id, platform, label, url, active, created_at").order("created_at", { ascending: false });
  const { data, error } = await (adminMode ? query : query.eq("active", true));
  if (error) {
    container.textContent = "Could not load download links. Run the Surelin SQL setup file in Supabase first.";
    return;
  }
  if (!data || data.length === 0) {
    container.innerHTML = adminMode ? "<p>No download links yet. Add one above.</p>" : '<div class="empty-state"><h2>No downloads published yet</h2><p>Check back later for official Surelin downloads.</p></div>';
    return;
  }
  if (adminMode) {
    container.innerHTML = data.map(item => `<div class="admin-download-row"><div><strong>${escapeHtml(item.label)}</strong><span>${escapeHtml(item.platform)} · ${item.active ? "Published" : "Hidden"}</span><a href="${escapeHtml(item.url)}" target="_blank" rel="noopener noreferrer">Open link</a></div><button type="button" class="danger-button" data-delete-download="${escapeHtml(item.id)}">Delete</button></div>`).join("");
  } else {
    container.innerHTML = data.map(item => `<article class="download-card"><div><span class="tag">${escapeHtml(item.platform)}</span><h2>${escapeHtml(item.label)}</h2></div><a class="download-button" href="${escapeHtml(item.url)}" target="_blank" rel="noopener noreferrer">Download</a></article>`).join("");
  }
}

async function initializeAdminPanel(client, session) {
  const panel = document.querySelector("#admin-panel");
  if (!panel) return;
  if (!session) {
    panel.innerHTML = '<div class="empty-state"><h2>Log in required</h2><p>Sign in with your Surelin staff account to continue.</p><a href="login.html">Log in</a></div>';
    return;
  }
  const { data: allowed, error: permissionError } = await client.rpc("is_surelin_staff");
  if (permissionError || allowed !== true) {
    panel.innerHTML = '<div class="empty-state"><h2>Access denied</h2><p>This account is not listed as an owner or admin in staff_accounts.</p></div>';
    return;
  }
  panel.innerHTML = `<div class="admin-section"><h2>Download links</h2><p>Add or remove official download destinations.</p><form id="create-download-form" class="admin-form"><label for="download-platform">Platform</label><select id="download-platform" name="platform" required><option value="Windows">Windows</option><option value="macOS">macOS</option><option value="Android APK">Android APK</option><option value="iOS IPA">iOS IPA</option><option value="Other">Other</option></select><label for="download-label">Display name</label><input id="download-label" name="label" maxlength="80" placeholder="Surelin for Windows" required><label for="download-url">Download or redirect URL</label><input id="download-url" name="url" type="url" placeholder="https://..." required><button type="submit">Add download link</button><p id="admin-message" role="status"></p></form><div id="admin-download-table" class="admin-download-table">Loading links...</div></div>`;
  const form = document.querySelector("#create-download-form");
  form.addEventListener("submit", async event => {
    event.preventDefault();
    const message = document.querySelector("#admin-message");
    const values = new FormData(form);
    const url = String(values.get("url") || "").trim();
    if (!url.startsWith("https://")) {
      message.textContent = "Use a secure https:// link.";
      return;
    }
    const { error } = await client.from("download_links").insert({ platform: values.get("platform"), label: String(values.get("label") || "").trim(), url, active: true });
    if (error) {
      message.textContent = error.message;
      return;
    }
    form.reset();
    message.textContent = "Download link added.";
    await loadDownloadLinks(client, true);
  });
  document.querySelector("#admin-download-table").addEventListener("click", async event => {
    const button = event.target.closest("[data-delete-download]");
    if (!button) return;
    button.disabled = true;
    const { error } = await client.from("download_links").delete().eq("id", button.dataset.deleteDownload);
    if (error) {
      document.querySelector("#admin-message").textContent = error.message;
      button.disabled = false;
      return;
    }
    await loadDownloadLinks(client, true);
  });
  await loadDownloadLinks(client, true);
}

async function initializeSupabase() {
  try {
    const client = await getSupabaseClient();
    const { data, error } = await client.auth.getSession();
    if (error) throw error;
    const indicator = document.querySelector("#auth-indicator");
    const action = document.querySelector("#account-action");
    if (data.session) {
      const { data: isStaff } = await client.rpc("is_surelin_staff");
      if (isStaff === true) document.querySelector("#admin-nav").style.display = "";
      indicator.textContent = `Signed in: ${data.session.user.email || "Surelin player"}`;
      action.textContent = "Sign Out";
      action.href = "login.html";
      action.addEventListener("click", async event => {
        event.preventDefault();
        const { error: signOutError } = await client.auth.signOut();
        if (signOutError) {
          indicator.textContent = `Could not sign out: ${signOutError.message}`;
          return;
        }
        window.location.href = "login.html";
      });
    } else {
      indicator.textContent = "Not signed in";
    }
    if (pageName === "servers") await loadServers(client);
    if (pageName === "downloads") await loadDownloadLinks(client);
    if (pageName === "admin") await initializeAdminPanel(client, data.session);
  } catch (error) {
    const container = document.querySelector("#servers-list");
    if (container) container.textContent = `Could not connect to Supabase: ${error.message}`;
    const message = document.querySelector("#account-message");
    if (message) message.textContent = `Could not connect to Supabase: ${error.message}`;
    const indicator = document.querySelector("#auth-indicator");
    if (indicator) indicator.textContent = "Account status unavailable";
  }
}

initializeSupabase();

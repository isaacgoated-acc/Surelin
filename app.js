const navigation = [
  ["home", "Home", "index.html", "⌂"],
  ["servers", "Servers", "servers.html", "▤"],
  ["downloads", "Download", "download.html", "↓"],
  ["search", "Search", "search.html", "⌕"],
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
  ["Friendship", "Get 1 friend!", "Friendship Achievement Badge(1).png", "Social"],
  ["First Game", "Your first step into making and sharing games.", "First Game Achievement Badge(2).png", "Creator"],
  ["Owner", "The red crown marks the Surelin owner.", "Red Crown Owner Badge(1).png", "Special"],
  ["Used to Be Rich", "You once had a lot of Sura...", "Used to Be Rich Achievement Badge(1).png", "Sura"],
  ["Richest Player", "Have the most Sura!", "Richest Player Achievement Badge(1).png", "Sura"]
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
      <div class="section-heading"><h2>Announcements</h2></div>
      <section id="announcements-list" class="feature-card"><p>Loading announcements...</p></section>
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
    render: () => `<section id="profile-card" class="feature-card"><p>Loading your profile...</p></section><section id="character-preview" class="feature-card character-preview"><h2>Selected character</h2><div id="character-renderer">Loading character preview...</div></section><section id="profile-edit" class="feature-card profile-edit"><h2>Edit profile</h2><form id="profile-form" class="admin-form"><label for="profile-username">Username</label><input id="profile-username" name="username" maxlength="24" required><label for="profile-bio">Bio</label><textarea id="profile-bio" name="bio" maxlength="180"></textarea><label for="profile-avatar">Avatar image URL</label><input id="profile-avatar" name="avatar_url" type="url" placeholder="https://..."><button type="submit">Save profile</button><p id="profile-message" role="status"></p></form></section><div class="section-heading"><h2>Badge showcase</h2><a href="badges.html">Browse badges</a></div>${badgeCards(badges.slice(0, 3))}`
  },
  downloads: {
    title: "Download",
    eyebrow: "Get Surelin",
    heading: "Download Surelin",
    lead: "Windows and Android downloads. Other platforms are coming soon.",
    render: () => `<section id="download-list" class="download-list"><p>Loading downloads...</p></section>`
  },
  search: {
    title: "Search",
    eyebrow: "Discover",
    heading: "Search Surelin",
    lead: "Find players by username.",
    render: () => `<section class="feature-card"><form id="search-form" class="admin-form"><label for="search-query">Player username</label><input id="search-query" name="query" minlength="2" maxlength="24" placeholder="Search usernames..." required><button type="submit">Search</button></form><div id="search-results" aria-live="polite"></div></section>`
  },
  admin: {
    title: "Admin Panel",
    eyebrow: "Staff only",
    heading: "Admin Panel",
    lead: "Manage Sura, characters, items, cosmetics, and downloads.",
    render: () => `<section id="admin-panel" class="feature-card"><p>Checking staff permissions...</p></section>`
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
    render: () => `<section id="inventory-list" class="feature-card"><p>Loading your collection...</p></section><section id="character-preview" class="feature-card character-preview"><h2>Character preview</h2><div id="character-renderer">Loading character preview...</div></section>`
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
      <label for="username">Username</label>
      <input id="username" name="username" type="text" minlength="3" maxlength="24" pattern="[A-Za-z0-9_]+" autocomplete="username" required>
      <label for="password">Password</label>
      <input id="password" name="password" type="password" minlength="8" autocomplete="${isSignup ? "new-password" : "current-password"}" required>
      <button type="submit">${isSignup ? "Create Account" : "Log In"}</button>
      <p id="account-message" role="status" aria-live="polite"></p>
    </form>
    <p class="form-switch">${isSignup ? `Already have an account? <a href="login.html">Log in</a>.` : `New to Surelin? <a href="signup.html">Create an account</a>.`}</p>
    <div class="notice">Sign in with your username and password. Supabase securely hashes and stores passwords.</div>
  </section>`;
}
function badgeCards(items) {
  return `<section class="card-grid" aria-label="Achievement badges">${items.map(([name, description, image, category]) => `
    <article class="card">
      <div class="badge-art"><img src="assets/badges/${encodeURIComponent(image)}" alt="${escapeHtml(name)} achievement badge"></div>
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
      <header class="topbar"><span class="breadcrumb">Surelin <span aria-hidden="true">/</span> ${page.title}</span><span id="auth-indicator" aria-live="polite">Checking account...</span><span id="sura-count" class="sura-count" hidden>0 Sura</span><a id="account-action" href="login.html">Log In</a></header>
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
    const username = String(formData.get("username") || "").trim();
    const password = String(formData.get("password") || "");
    if (!/^[A-Za-z0-9_]{3,24}$/.test(username)) throw new Error("Use 3–24 letters, numbers, or underscores for your username.");
    const email = `${username.toLowerCase()}@users.surelin.local`;
    let result;
    if (form.dataset.action === "signup") {
      const { data: existing, error: lookupError } = await client.from("profiles").select("id").ilike("username", username).limit(1);
      if (lookupError) throw new Error("Could not check username availability: " + lookupError.message);
      if (existing?.length) throw new Error("That username is already taken. Choose another one.");
      result = await client.auth.signUp({ email, password, options: { data: { username, display_name: username } } });
    } else {
      result = await client.auth.signInWithPassword({ email, password });
    }
    if (result.error) {
      const authMessage = String(result.error.message || "");
      if (/signups? not allowed|email signups are disabled|provider is disabled/i.test(authMessage)) throw new Error("Supabase has the Email provider turned off. Keep Email enabled under Authentication → Sign In / Providers. Players still only enter a username and password on Surelin.");
      if (/invalid login credentials/i.test(authMessage)) throw new Error("Username or password is incorrect. Use the exact username used when the account was created.");
      throw result.error;
    }
    if (form.dataset.action === "signup" && !result.data.session) {
      message.textContent = "Account created, but Supabase still requires email confirmation. Turn OFF Confirm email under Authentication → Sign In / Providers → Email. Do not turn OFF the Email provider itself.";
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
  if (!adminMode) {
    const releaseUrl = "https://github.com/isaacgoated-acc/Surelin/releases/tag/surelinfirstver";
    const platforms = [
      ["Windows EXE", "Download from GitHub Releases", true],
      ["Android APK", "Download from GitHub Releases", true],
      ["macOS", "Coming Soon", false],
      ["iOS IPA", "Coming Soon", false]
    ];
    container.innerHTML = platforms.map(([platform, label, available]) => `<article class="download-card"><div><span class="tag">${escapeHtml(platform)}</span><h2>${label}</h2></div>${available ? `<a class="download-button" href="${releaseUrl}" target="_blank" rel="noopener noreferrer">Download</a>` : '<span class="coming-soon">Coming Soon</span>'}</article>`).join("");
    return;
  }
  const { data, error } = await client.from("download_links").select("id, platform, label, url, active, created_at").order("created_at", { ascending: false });
  if (error) {
    container.textContent = "Could not load admin download links.";
    return;
  }
  container.innerHTML = !data || data.length === 0 ? "<p>No download links yet. Add one above.</p>" : data.map(item => `<div class="admin-download-row"><div><strong>${escapeHtml(item.label)}</strong><span>${escapeHtml(item.platform)} · ${item.active ? "Published" : "Hidden"}</span><a href="${escapeHtml(item.url)}" target="_blank" rel="noopener noreferrer">Open link</a></div><button type="button" class="danger-button" data-delete-download="${escapeHtml(item.id)}">Delete</button></div>`).join("");
}

async function initializeAdminPanel(client, session) {
  const panel = document.querySelector("#admin-panel");
  if (!panel) return;
  if (!session) {
    panel.innerHTML = '<div class="empty-state"><h2>Log in required</h2><p>Sign in with your Surelin staff account to continue.</p><a href="login.html">Log in</a></div>';
    return;
  }
  const { data: allowed, error: permissionError } = await client.rpc("is_surelin_staff");
  const { data: currentProfile } = await client.from("profiles").select("username").eq("id", session.user.id).maybeSingle();
  const canAnnounce = ["isaacgoated", "rawbt"].includes(String(currentProfile?.username || "").toLowerCase());
  if ((permissionError || allowed !== true) && !canAnnounce) {
    panel.innerHTML = '<div class="empty-state"><h2>Access denied</h2><p>This account is not listed as an owner or admin in staff_accounts.</p></div>';
    return;
  }
  panel.innerHTML = `<div class="admin-section"><h2>Manage player Sura</h2><form id="sura-admin-form" class="admin-form"><label>Player username</label><input name="username" required><label>Amount</label><input name="amount" type="number" min="0" step="1" required><label>Action</label><select name="adjustment"><option value="give">Give Sura</option><option value="set">Set Sura</option></select><button type="submit">Apply Sura change</button><p id="sura-admin-message" role="status"></p></form><h2>Give characters, items, and cosmetics</h2><form id="asset-admin-form" class="admin-form"><label>Player username</label><input name="username" required><label>Asset type</label><select name="asset_type"><option value="character">Character</option><option value="item">Item</option><option value="cosmetic">Cosmetic</option></select><label>Asset ID</label><input name="asset_id" required><button type="submit">Grant asset</button><p id="asset-admin-message" role="status"></p><p class="notice">Character ID 1 (Rawbt) can only be granted by the isaacgoated or rawbt accounts.</p></form><div class="admin-section"><h2>Publish announcement</h2><p>Only isaacgoated and rawbt can publish or remove announcements.</p><form id="announcement-form" class="admin-form"><label for="announcement-title">Title</label><input id="announcement-title" name="title" maxlength="100" required><label for="announcement-body">Message</label><textarea id="announcement-body" name="body" maxlength="3000" required></textarea><button type="submit">Publish announcement</button><p id="announcement-message" role="status"></p></form><div id="admin-announcements-list"></div></div><div class="admin-section"><h2>Download links</h2><p>Add or remove official download destinations.</p><form id="create-download-form" class="admin-form"><label for="download-platform">Platform</label><select id="download-platform" name="platform" required><option value="Windows">Windows</option><option value="macOS">macOS</option><option value="Android APK">Android APK</option><option value="iOS IPA">iOS IPA</option><option value="Other">Other</option></select><label for="download-label">Display name</label><input id="download-label" name="label" maxlength="80" placeholder="Surelin for Windows" required><label for="download-url">Download or redirect URL</label><input id="download-url" name="url" type="url" placeholder="https://..." required><button type="submit">Add download link</button><p id="admin-message" role="status"></p></form><div id="admin-download-table" class="admin-download-table">Loading links...</div></div>`;
  document.querySelector("#sura-admin-form").addEventListener("submit", async event => {
    event.preventDefault();
    const form = event.currentTarget;
    const values = new FormData(form);
    const { data, error } = await client.rpc("admin_adjust_sura", { target_username: String(values.get("username")).trim(), amount: Number(values.get("amount")), adjustment: values.get("adjustment") });
    document.querySelector("#sura-admin-message").textContent = error ? error.message : `Sura balance updated to ${Number(data).toLocaleString()}.`;
  });
  document.querySelector("#asset-admin-form").addEventListener("submit", async event => {
    event.preventDefault();
    const values = new FormData(event.currentTarget);
    const { error } = await client.rpc("admin_grant_asset", { target_username: String(values.get("username")).trim(), p_asset_type: values.get("asset_type"), p_asset_id: String(values.get("asset_id")).trim() });
    document.querySelector("#asset-admin-message").textContent = error ? error.message : "Asset granted!";
  });
  const announcementForm = document.querySelector("#announcement-form");
  announcementForm.addEventListener("submit", async event => {
    event.preventDefault();
    const values = new FormData(announcementForm);
    const { error } = await client.rpc("surelin_publish_announcement", {
      p_title: String(values.get("title")).trim(),
      p_body: String(values.get("body")).trim()
    });
    document.querySelector("#announcement-message").textContent = error ? error.message : "Announcement published!";
    if (!error) {
      announcementForm.reset();
      await loadAnnouncements(client, "#admin-announcements-list", true);
    }
  });
  document.querySelector("#admin-announcements-list").addEventListener("click", async event => {
    const button = event.target.closest("[data-delete-announcement]");
    if (!button) return;
    const { error } = await client.rpc("surelin_delete_announcement", { p_id: Number(button.dataset.deleteAnnouncement) });
    document.querySelector("#announcement-message").textContent = error ? error.message : "Announcement removed.";
    if (!error) await loadAnnouncements(client, "#admin-announcements-list", true);
  });
  await loadAnnouncements(client, "#admin-announcements-list", true);
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


async function loadProfile(client, session) {
  const card = document.querySelector("#profile-card");
  if (!card) return;
  const requestedId = new URLSearchParams(location.search).get("user");
  const userId = requestedId || session?.user?.id;
  if (!userId) {
    card.innerHTML = '<div class="empty-state"><h2>Log in to view your profile</h2><a href="login.html">Log in</a></div>';
    document.querySelector("#profile-edit").hidden = true;
    return;
  }
  const { data: profile, error } = await client.from("profiles").select("id, username, display_name, bio, avatar_url, sura, level, selected_character_id").eq("id", userId).maybeSingle();
  if (error) {
    card.textContent = `Could not load profile: ${error.message}. Run supabase/sura_inventory.sql in Supabase SQL Editor.`;
    document.querySelector("#profile-edit").hidden = true;
    return;
  }
  if (!profile) {
    card.innerHTML = '<div class="empty-state">This player profile does not exist.</div>';
    document.querySelector("#profile-edit").hidden = true;
    return;
  }
  const isOwn = !!session && session.user.id === userId;
  document.querySelector("#profile-edit").hidden = !isOwn;
  const name = profile.display_name || profile.username || "Surelin Player";
  await renderCharacter(client, userId, profile.selected_character_id);
  card.innerHTML = `<div class="profile-row"><img class="profile-avatar" src="${escapeHtml(profile.avatar_url || "")}" alt="" onerror="this.style.display='none'"><div><h2>${escapeHtml(name)}</h2><p class="lead">@${escapeHtml(profile.username)}</p><p>${escapeHtml(profile.bio || "No bio yet.")}</p></div></div><div class="stat-row"><div class="stat"><strong>${Number(profile.level || 1)}</strong><span>Level</span></div><div class="stat"><strong>${Number(profile.sura || 0).toLocaleString()}</strong><span>Sura</span></div></div>`;
  if (!isOwn) return;
  const form = document.querySelector("#profile-form");
  form.elements.username.value = profile.username || "";
  form.elements.bio.value = profile.bio || "";
  form.elements.avatar_url.value = profile.avatar_url || "";
  form.addEventListener("submit", async event => {
    event.preventDefault();
    const message = document.querySelector("#profile-message");
    const values = new FormData(form);
    const username = String(values.get("username") || "").trim();
    const avatar_url = String(values.get("avatar_url") || "").trim();
    if (!/^[A-Za-z0-9_]{3,24}$/.test(username)) { message.textContent = "Username must be 3–24 letters, numbers, or underscores."; return; }
    if (avatar_url && !avatar_url.startsWith("https://")) { message.textContent = "Avatar URL must start with https://."; return; }
    const { error: saveError } = await client.from("profiles").update({ username, display_name: username, bio: String(values.get("bio") || "").trim(), avatar_url: avatar_url || null }).eq("id", userId);
    message.textContent = saveError ? saveError.message : "Profile saved!";
    if (!saveError) await loadProfile(client, session);
  });
}

async function renderCharacter(client, userId, selectedId) {
  const target = document.querySelector("#character-renderer");
  if (!target) return;
  const { data: character } = await client.from("characters").select("id, name, color").eq("id", selectedId || 0).maybeSingle();
  const label = character?.name || "Default Character";
  target.innerHTML = `<div class="character-stage"><canvas id="character-canvas"></canvas><span>${escapeHtml(label)}</span></div>`;
  try {
    const THREE = await import("https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js");
    const canvas = document.querySelector("#character-canvas");
    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#17232e");
    const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
    camera.position.set(3, 2.2, 4);
    camera.lookAt(0, 1, 0);
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    const resize = () => { const w = canvas.clientWidth || 320; const h = 230; renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); };
    resize();
    scene.add(new THREE.HemisphereLight(0xffffff, 0x526070, 2));
    const light = new THREE.DirectionalLight(0xffffff, 2);
    light.position.set(3, 5, 4);
    scene.add(light);
    const material = new THREE.MeshStandardMaterial({ color: character?.color || "#8db4d8", roughness: 0.65 });
    const skin = new THREE.MeshStandardMaterial({ color: "#e5c2a2" });
    const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.42, 0.65, 4, 8), material);
    body.position.y = 0.9;
    scene.add(body);
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.34, 24, 18), skin);
    head.position.y = 1.85;
    scene.add(head);
    const floor = new THREE.Mesh(new THREE.CylinderGeometry(1.25, 1.25, 0.08, 40), new THREE.MeshStandardMaterial({ color: "#34495a" }));
    floor.position.y = 0.05;
    scene.add(floor);
    renderer.render(scene, camera);
    window.addEventListener("resize", resize);
  } catch (error) {
    target.insertAdjacentHTML("beforeend", '<p class="notice">3D preview needs WebGL support.</p>');
  }
}

async function loadInventory(client, session) {
  const panel = document.querySelector("#inventory-list");
  if (!panel) return;
  if (!session) { panel.innerHTML = '<div class="empty-state">Log in to view your inventory.</div>'; return; }
  const { data, error } = await client.from("player_inventory").select("asset_type, asset_id, created_at").eq("player_id", session.user.id).order("created_at", { ascending: false });
  if (error) { panel.textContent = `Could not load inventory: ${error.message}`; return; }
  const ids = [...new Set((data || []).filter(x => x.asset_type === "character").map(x => Number(x.asset_id)))];
  let characters = [];
  if (ids.length) {
    const result = await client.from("characters").select("id, name, description").in("id", ids);
    characters = result.data || [];
  }
  const { data: ownProfile } = await client.from("profiles").select("selected_character_id").eq("id", session.user.id).maybeSingle();
  panel.innerHTML = `<h2>Your items</h2><div class="inventory-grid">${(data || []).map(item => {
    const c = characters.find(x => String(x.id) === String(item.asset_id));
    return `<article class="inventory-item"><strong>${escapeHtml(c?.name || (item.asset_type + " #" + item.asset_id))}</strong><span>${escapeHtml(item.asset_type)}</span>${item.asset_type === "character" ? `<button type="button" data-select-character="${escapeHtml(item.asset_id)}">Select character</button>` : ""}</article>`;
  }).join("") || "<p>Your inventory is empty.</p>"}</div>`;
  panel.addEventListener("click", async event => {
    const button = event.target.closest("[data-select-character]");
    if (!button) return;
    const { error: updateError } = await client.from("profiles").update({ selected_character_id: Number(button.dataset.selectCharacter) }).eq("id", session.user.id);
    if (updateError) { panel.insertAdjacentHTML("beforeend", `<p class="notice">${escapeHtml(updateError.message)}</p>`); return; }
    await renderCharacter(client, session.user.id, Number(button.dataset.selectCharacter));
  });
}


async function loadAnnouncements(client, selector = "#announcements-list", adminMode = false) {
  const target = document.querySelector(selector);
  if (!target) return;
  const { data, error } = await client.from("announcements").select("id,title,body,created_at").eq("published", true).order("created_at", { ascending: false }).limit(20);
  if (error) {
    target.textContent = "Announcements are not available yet. Run supabase/announcements.sql.";
    return;
  }
  if (!data?.length) {
    target.innerHTML = "<p>No announcements yet.</p>";
    return;
  }
  target.innerHTML = data.map(item => `<article class="announcement-card"><div class="section-heading"><h3>${escapeHtml(item.title)}</h3><time>${new Date(item.created_at).toLocaleString()}</time></div><p>${escapeHtml(item.body).replace(/\\n/g, "<br>")}</p>${adminMode ? `<button type="button" data-delete-announcement="${item.id}">Delete</button>` : ""}</article>`).join("");
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
      const { data: currentProfile } = await client.from("profiles").select("username").eq("id", data.session.user.id).maybeSingle();
      if (isStaff === true || ["isaacgoated", "rawbt"].includes(String(currentProfile?.username || "").toLowerCase())) document.querySelector("#admin-nav").style.display = "";
      indicator.textContent = `Signed in: ${data.session.user.user_metadata?.username || "Surelin player"}`;
      document.querySelector("#sura-count").hidden = false;
      const { data: balance } = await client.from("profiles").select("sura").eq("id", data.session.user.id).maybeSingle();
      document.querySelector("#sura-count").textContent = `${Number(balance?.sura || 0).toLocaleString()} Sura`;
      document.querySelectorAll(".nav-link[href=\"login.html\"], .nav-link[href=\"signup.html\"]").forEach(link => link.hidden = true);
      if (pageName === "login" || pageName === "signup") window.location.replace("index.html");
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
    if (pageName === "home") await loadAnnouncements(client);
    if (pageName === "downloads") await loadDownloadLinks(client);
    if (pageName === "profile") await loadProfile(client, data.session);
    if (pageName === "inventory") { await loadInventory(client, data.session); if (data.session) { const { data: ownProfile } = await client.from("profiles").select("selected_character_id").eq("id", data.session.user.id).maybeSingle(); await renderCharacter(client, data.session.user.id, ownProfile?.selected_character_id); } }
    if (pageName === "search") await searchPlayers(client);
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

initializeSupabase();async function searchPlayers(client) {
  const form = document.querySelector("#search-form");
  if (!form) return;
  form.addEventListener("submit", async event => {
    event.preventDefault();
    const output = document.querySelector("#search-results");
    const query = String(new FormData(form).get("query") || "").trim();
    if (query.length < 2) return;
    output.textContent = "Searching...";
    const { data, error } = await client.from("profiles").select("id, username, display_name, bio, avatar_url").ilike("username", `%${query}%`).limit(25);
    if (error) { output.textContent = `Could not search players: ${error.message}`; return; }
    if (!data?.length) { output.innerHTML = '<div class="empty-state">No players found.</div>'; return; }
    output.innerHTML = data.map(p => `<a class="search-result" href="profile.html?user=${encodeURIComponent(p.id)}"><img class="profile-avatar" src="${escapeHtml(p.avatar_url || "")}" alt="" onerror="this.style.display='none'"><div><strong>${escapeHtml(p.display_name || p.username)}</strong><p>@${escapeHtml(p.username)}</p><span>${escapeHtml(p.bio || "")}</span></div></a>`).join("");
  });
}



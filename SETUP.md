# Setup — get adeelsedits.com live on Vercel

**Time needed:** ~30 minutes. No terminal, no Node.js, no local installs.
**End state:** Your site running on a public URL like `adeelsedits.vercel.app`. Domain cutover to `adeelsedits.com` happens in Step 6 — later, when you're ready.

You will:
1. Create a GitHub account (5 min)
2. Create a Vercel account (2 min)
3. Upload the `website` folder to GitHub via web browser (10 min)
4. Import the repo into Vercel (5 min)
5. Wait for the build (~2 min) → live URL
6. Point `adeelsedits.com` to Vercel (later — optional today)

---

## Step 1 — Create a GitHub account

1. Go to https://github.com/signup
2. Use your **personal email** (`adeelhafiz9@gmail.com`), not the DM one.
3. Pick a username. Suggested: `adeelsedits` or `adeel-abbas`. This appears in the repo URL, so keep it clean.
4. Verify email. That's it.

---

## Step 2 — Create a Vercel account

1. Go to https://vercel.com/signup
2. Click **Continue with GitHub**. Sign in with the account you just made.
3. Vercel asks about your team — pick **Hobby (free)**. Add your name for the display.
4. Done. You are on the Vercel dashboard.

---

## Step 3 — Upload the `website` folder to GitHub

You will create an empty repo on GitHub, then drag-drop the `website` folder contents into it via the browser. No terminal.

### 3a. Create an empty repo

1. On GitHub, click the **+** icon top right → **New repository**.
2. Repository name: `adeelsedits` (this is the internal name — the public URL will be different).
3. **Public** is fine (Vercel free tier works with either, and public is simpler).
4. Leave everything else unchecked. Do not add a README, `.gitignore`, or license — you already have those.
5. Click **Create repository**.

### 3b. Upload the files

1. On the new empty repo page, click **uploading an existing file** (small blue link in the middle of the page, under "Quick setup").
2. In your Finder, open `Career-Cowork/website/` on your Mac.
3. Select **everything inside** the `website` folder (⌘+A). This includes `app/`, `package.json`, `next.config.js`, `jsconfig.json`, `.gitignore`, `README.md`, `SETUP.md`. **Do not** select the `website` folder itself — you want the *contents*, not the wrapping folder.
4. Drag them all into the GitHub upload box in your browser.
5. Wait for the upload to finish (green checks).
6. Scroll down. Commit message: `initial upload`. Click **Commit changes**.

You should now see all the files in your GitHub repo.

**Troubleshooting:**
- If `.gitignore` doesn't upload — it's hidden. On Mac, press ⌘+Shift+. (period) in Finder to show hidden files, then re-drag.
- If you don't see `app/` — make sure you selected files *inside* `website/`, not the folder itself.

---

## Step 4 — Import the repo into Vercel

1. Go to https://vercel.com/new
2. You'll see a list of your GitHub repos. Find `adeelsedits` and click **Import**.
   - If it's not there, click **Adjust GitHub App Permissions** and give Vercel access to the repo.
3. On the "Configure Project" screen, leave everything as default. Vercel auto-detects Next.js.
4. Click **Deploy**.

---

## Step 5 — Wait for the build

Vercel installs dependencies, builds the site, deploys. Takes ~90 seconds on first build.

When it finishes you'll see a preview screen with confetti and a live URL like `adeelsedits.vercel.app` or `adeelsedits-xyz.vercel.app`.

**Click the URL. The site is live.**

If the build fails, copy the error and paste it back here in Cowork — I'll fix it.

---

## Step 6 — Point adeelsedits.com to Vercel (do this later)

Do this only when you're happy with the site and ready to switch. The WordPress site stays live until you switch DNS.

1. On the Vercel project dashboard, go to **Settings → Domains**.
2. Add `adeelsedits.com`. Vercel gives you DNS records to add.
3. Go to your domain registrar (where you bought `adeelsedits.com` — probably Namecheap, GoDaddy, or similar).
4. Update the A record and/or CNAME to match what Vercel gave you.
5. Wait 5–60 min for DNS to propagate.
6. Site now serves at `adeelsedits.com`. Cancel WordPress hosting 30 days later if all is stable.

Bring the DNS records into Cowork when you get to Step 6 and I'll walk you through the exact registrar clicks.

---

## Making changes after launch

Two paths:

**Path A — I edit files here in Cowork, you re-upload to GitHub.**
- Tell me what to change in chat.
- I edit the files in `Career-Cowork/website/`.
- You go to the GitHub repo, click **Add file → Upload files**, drag-drop the changed file(s), commit.
- Vercel auto-rebuilds. ~90 seconds later the change is live.

**Path B — you install Claude Code and take the wheel.**
- Best for ongoing iteration once you're comfortable.
- Requires: install Node.js, Claude Code CLI, `git`.
- ~1–2 hour ramp. Worth it if you want daily iteration.
- We'll do this after the site is live.

---

## Reference

- Repo: `github.com/<your-username>/adeelsedits`
- Deployment: Vercel dashboard → project `adeelsedits`
- Preview URL: `adeelsedits.vercel.app` (or the auto-generated one)
- Production URL: `adeelsedits.com` (after Step 6)

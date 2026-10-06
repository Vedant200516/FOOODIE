# FoodApp (web UI)

Web version of the Java FoodApp console project. Plain HTML/CSS/JS, no build step.

Features: login (admin / 123, 3 attempts), animated landing, categories, search, sort by price, slide-out cart, 10% discount above ₹500 + flat ₹5 tax, live order tracking with confetti, order history (browser localStorage).

## Run locally
Open `index.html`, or run `npx serve .`

## Deploy on Vercel
1. Push this folder to a GitHub repo (`index.html` at the repo root).
2. On vercel.com choose Add New → Project, import the repo.
3. Framework Preset: Other. Leave build and output settings empty. Click Deploy.

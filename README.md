
  # Create Mario-like game

  This is a code bundle for Create Mario-like game. The original project is available at https://www.figma.com/design/P5nbMU0oQZegcuEPzhYjxC/Create-Mario-like-game.

  ## Running the code

  Run `npm i` to install the dependencies.

  Run `npm run dev` to start the development server.

  ## Can't install? Try this

  1. **Install Node.js** (required). Use Node 18 or 20.
     - Download from [nodejs.org](https://nodejs.org) (LTS), or
     - With Homebrew: `brew install node`
     - With nvm: `nvm install 18` then `nvm use 18`

  2. **Open a new terminal** after installing Node, then:
     ```bash
     cd "/Users/shivangra/Downloads/Create Mario-like game"
     npm install
     npm run dev
     ```

  3. **If `npm install` fails:**
     - Delete the `node_modules` folder and the lockfile (`package-lock.json` or `pnpm-lock.yaml`), then run `npm install` again.
     - If you see permission errors, avoid `sudo`. Fix npm’s cache folder permissions or install Node for your user (e.g. via nvm or the official installer).
     - If you see network/timeout errors, try: `npm install --prefer-offline --no-audit` or check your internet/proxy.
  
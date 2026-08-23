<h1 align="center"><img src="https://cdn.website-files.com/687553db41022d5ffd35c8b9/6a8adec5fded3f55089376b7_thanos.png" alt="" width="20" /> &nbsp;Project Thanos</h1>
<p align="center">(Discord bot) <b>Tools</b> for <b>Handling Administration, Needs & Operations</b> of a (Discord) <b>Server</b>.<br/>&nbsp;</p>

# What is this?
Lorem impsum do si amet adispicing azizam ....

# Run on your own

### ‼️Prerequisite
Before you start, you need to setup these for Discord bot (and website) to work properly:
1. **Postgres** database **with pgvector support**
2. A **hosting**, obviously. You need a server to make this bot online.
3. Made a Discord bot on [Discord Developer Portal](https://discord.com/developers/applications)
4. Install [bun](https://bun.com) package manager. (no you dont use `npm` here)

### 1️⃣ Setup Discord bot
1. Clone this project
```bash
git clone https://github.com/then77/Thanos.git
cd Thanos
```
2. Copy `.env.example` to `.env` and fill prerequisite.
```
cd .env.example
nano .env
```
3. Then, run `migrate` command to check and seed your database with required tables.
```
bun run migrate
```
4. Start the bot!
```
bun start
```

# Credits
- [Bun](https://bun.com) - Javascript engine powering this project
- [discord.js](https://discord.js.org) - Core library for Discord Bot
- [pino](https://www.npmjs.com/package/pino) - Small but powerful logging library

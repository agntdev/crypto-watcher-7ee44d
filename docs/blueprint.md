# Crypto Watcher — Bot specification

**Archetype:** custom

**Voice:** warm and concise — write every user-facing message, button label, error, and empty state in this voice.

A Telegram bot that watches crypto prices and pings you when something moves. Each person keeps their own private watchlist and adds or removes coins with inline buttons or slash commands. Alerts fire when a coin hits a price or percentage threshold, with cooldowns and quiet hours to reduce noise.

> This is the complete contract for the bot. Implement EVERY entry point, flow, feature, integration, and edge case below. The completeness review checks the bot against this document after each build pass.

## Primary audience

- crypto traders
- crypto investors
- crypto enthusiasts

## Success criteria

- user can add a coin to their watchlist with /watch BTC
- user can remove a coin from their watchlist with /unwatch BTC
- user can set a price threshold with /watch BTC 50000
- user can set a percentage threshold with /watch BTC 5%
- user receives a Telegram alert when a coin hits a threshold
- user can view their watchlist with /watchlist
- user can check a coin price on-demand with /price BTC
- user can check their whole watchlist with /price
- user can view and edit settings with /settings
- user can view their settings with /settings view
- user can set quiet hours with /settings quiet 22:00 07:00
- user can set morning summary time with /settings summary 09:00
- user can set cooldown duration with /settings cooldown 3600
- owner can view user count and top alerting coins with /owner
- unknown ticker handling works as specified
- price feed failure handling works as specified
- owner view is accessible only from the bot owner's Telegram account

## Entry points

Every feature must be reachable from the bot's command/button surface (button-first; only /start and /help are slash commands).

- **/start** (command, actor: user, command: /start) — Open the main menu
- **/watch** (command, actor: user, command: /watch) — Add a coin to your watchlist
  - inputs: ticker, optional price threshold, optional percentage threshold
  - outputs: confirmation message, watchlist entry
- **/unwatch** (command, actor: user, command: /unwatch) — Remove a coin from your watchlist
  - inputs: ticker
  - outputs: confirmation message
- **/price** (command, actor: user, command: /price) — On-demand check of one coin or your whole watchlist
  - inputs: optional ticker
  - outputs: price message
- **/watchlist** (command, actor: user, command: /watchlist) — View your watchlist
  - outputs: watchlist message
- **/settings** (command, actor: user, command: /settings) — View and edit settings
  - inputs: optional action, optional value
  - outputs: settings message
- **/owner** (command, actor: owner, command: /owner) — Owner-only: user count and top alerting coins
  - outputs: owner view message
- **Remove coin** (button, actor: user, callback: remove_coin) — Remove a coin from your watchlist
  - inputs: ticker
  - outputs: confirmation message
- **Add coin** (button, actor: user, callback: add_coin) — Add a coin to your watchlist
  - inputs: ticker
  - outputs: confirmation message
- **Set price threshold** (button, actor: user, callback: set_price_threshold) — Set a price threshold for a coin
  - inputs: ticker, price
  - outputs: confirmation message
- **Set percentage threshold** (button, actor: user, callback: set_pct_threshold) — Set a percentage threshold for a coin
  - inputs: ticker, percentage
  - outputs: confirmation message
- **View settings** (button, actor: user, callback: view_settings) — View your settings
  - outputs: settings message
- **Edit quiet hours** (button, actor: user, callback: edit_quiet_hours) — Edit quiet hours
  - inputs: start time, end time
  - outputs: confirmation message
- **Edit morning summary time** (button, actor: user, callback: edit_summary_time) — Edit morning summary time
  - inputs: time
  - outputs: confirmation message
- **Edit cooldown duration** (button, actor: user, callback: edit_cooldown_duration) — Edit cooldown duration
  - inputs: duration
  - outputs: confirmation message

## Flows

### Add coin to watchlist
_Trigger:_ /watch <ticker> [price] [pct]%

1. Parse ticker, price, and percentage threshold
2. Check if coin already exists in watchlist
3. Add coin to watchlist with thresholds
4. Reply with confirmation message

_Data touched:_ watchlist entry

### Remove coin from watchlist
_Trigger:_ /unwatch <ticker>

1. Parse ticker
2. Check if coin exists in watchlist
3. Remove coin from watchlist
4. Reply with confirmation message

_Data touched:_ watchlist entry

### On-demand price check
_Trigger:_ /price [ticker]

1. Parse ticker
2. Fetch current price from price feed
3. Reply with price message

_Data touched:_ price feed

### View watchlist
_Trigger:_ /watchlist

1. Fetch user's watchlist
2. Reply with watchlist message

_Data touched:_ watchlist entry

### View and edit settings
_Trigger:_ /settings [action] [value]

1. Parse action and value
2. Fetch user's settings
3. Reply with settings message or confirmation message

_Data touched:_ user settings

### Owner view
_Trigger:_ /owner

1. Fetch user count and top alerting coins
2. Reply with owner view message

_Data touched:_ owner view data

### Alert firing
_Trigger:_ Price feed update

1. Fetch current prices from price feed
2. Check each user's watchlist for threshold hits
3. Check cooldown records
4. Fire alerts for threshold hits
5. Update cooldown records

_Data touched:_ watchlist entry, alert, cooldown record

### Morning summary
_Trigger:_ Morning summary time reached

1. Fetch user's watchlist
2. Fetch current prices from price feed
3. Check for threshold hits since last summary
4. Reply with summary message

_Data touched:_ watchlist entry, alert

## Data entities

Durable data (must survive a restart) uses the toolkit's persistent store, never in-memory maps.

- **watchlist entry** _(retention: persistent)_ — A coin in a user's watchlist
  - fields: user_id, ticker, price_threshold, pct_threshold, last_alert_time
- **alert** _(retention: none)_ — An alert fired when a coin hits a threshold
  - fields: user_id, ticker, old_price, new_price, pct_change, timestamp
- **cooldown record** _(retention: persistent)_ — A cooldown record for a user, coin, and threshold type
  - fields: user_id, ticker, threshold_type, last_alert_time
- **user settings** _(retention: persistent)_ — A user's settings
  - fields: user_id, quiet_hours_start, quiet_hours_end, summary_time, cooldown_duration
- **owner view data** _(retention: none)_ — Data for the owner view
  - fields: user_count, top_alerting_coins

## Integrations

- **Telegram** (required) — Bot API messaging
- **CoinGecko API** (required) — Price feed
Call external APIs against their real contract (correct endpoints, ids, params); credentials from env. Do not fake responses.

## Owner controls

- View user count and top alerting coins with /owner

## Notifications

- Alert when a coin hits a threshold
- Morning summary message

## Permissions & privacy

- User watchlist is private to each user
- User settings are private to each user
- Cooldown records are private to each user
- Alerts are sent to the user who owns the watchlist
- Owner view is accessible only from the bot owner's Telegram account

## Edge cases

- Unknown ticker handling
- Price feed failure handling
- Owner view access control
- Cooldown record expiration
- Morning summary time zone handling
- Quiet hours handling
- Alert rate limiting

## Required tests

- Add coin to watchlist with /watch BTC
- Remove coin from watchlist with /unwatch BTC
- Set price threshold with /watch BTC 50000
- Set percentage threshold with /watch BTC 5%
- View watchlist with /watchlist
- Check coin price on-demand with /price BTC
- Check whole watchlist on-demand with /price
- View and edit settings with /settings
- Owner view with /owner

## Assumptions

- Price feed: CoinGecko API (free, no API key required)
- Cooldown duration: 1 hour after an alert fires
- Morning summary time: 9:00 local time
- Quiet hours: 22:00–07:00 (10 PM to 7 AM)
- Unknown ticker handling: reply with 'Unknown ticker. Try a common one like BTC, ETH, TON, or type any ticker to watch it.'
- Price feed failure handling: retry up to 3 times with exponential backoff, then log and skip the coin for this cycle
- Owner view: accessible only via /owner command from the bot owner's Telegram account

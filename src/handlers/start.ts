import { Composer } from "grammy";
import type { Ctx } from "../bot.js";
import { registerMainMenuItem, inlineButton, inlineKeyboard } from "../toolkit/index.js";
import { addUserInfo } from "../storage.js";

registerMainMenuItem({ label: "➕ Add coin", data: "watchlist:add", order: 20 });
registerMainMenuItem({ label: "👁 Watchlist", data: "watchlist:show", order: 10 });
registerMainMenuItem({ label: "💰 Price", data: "price:show", order: 30 });
registerMainMenuItem({ label: "⚙️ Settings", data: "settings:show", order: 40 });

const WELCOME = "👋 Welcome! Tap a button below to get started.";

const composer = new Composer<Ctx>();

composer.command("start", async (ctx) => {
  if (ctx.from) {
    await addUserInfo({
      userId: ctx.from.id,
      username: ctx.from.username,
      firstSeen: Date.now(),
    });
  }
  await ctx.reply(WELCOME, { reply_markup: mainMenuKeyboard() });
});

composer.callbackQuery("menu:main", async (ctx) => {
  await ctx.answerCallbackQuery();
  await ctx.editMessageText(WELCOME, { reply_markup: mainMenuKeyboard() });
});

function mainMenuKeyboard() {
  return inlineKeyboard([
    [inlineButton("➕ Add coin", "watchlist:add"), inlineButton("👁 Watchlist", "watchlist:show")],
    [inlineButton("💰 Price", "price:show"), inlineButton("⚙️ Settings", "settings:show")],
    [inlineButton("❓ Help", "menu:help")],
  ]);
}

export default composer;

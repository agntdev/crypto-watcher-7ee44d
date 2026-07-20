import { Composer } from "grammy";
import type { Ctx } from "../bot.js";
import { removeWatchlistEntry } from "../storage.js";
import { inlineButton, inlineKeyboard } from "../toolkit/index.js";

const composer = new Composer<Ctx>();

composer.command("unwatch", async (ctx) => {
  const text = ctx.message?.text?.trim() ?? "";
  const args = text.replace(/^\/unwatch\s*/i, "").trim();

  if (!args) {
    await ctx.reply("Which coin do you want to remove? Try /unwatch BTC.", {
      reply_markup: inlineKeyboard([[inlineButton("⬅️ Back to menu", "menu:main")]]),
    });
    return;
  }

  const ticker = args.split(/\s+/)[0]!.toUpperCase();
  const userId = ctx.from?.id;
  if (!userId) return;

  const removed = await removeWatchlistEntry(userId, ticker);

  if (removed) {
    await ctx.reply(`🗑 Removed ${ticker} from your watchlist.`, {
      reply_markup: inlineKeyboard([[inlineButton("⬅️ Back to menu", "menu:main")]]),
    });
  } else {
    await ctx.reply(`${ticker} isn't in your watchlist.`, {
      reply_markup: inlineKeyboard([[inlineButton("⬅️ Back to menu", "menu:main")]]),
    });
  }
});

export default composer;

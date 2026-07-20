import { Composer } from "grammy";
import type { Ctx } from "../bot.js";
import { isUnknownTicker } from "../coingecko.js";
import { addWatchlistEntry, getWatchlist } from "../storage.js";
import { inlineButton, inlineKeyboard } from "../toolkit/index.js";

const composer = new Composer<Ctx>();

composer.callbackQuery("watchlist:add", async (ctx) => {
  await ctx.answerCallbackQuery();
  ctx.session.step = "awaiting_ticker";
  await ctx.editMessageText(
    "Which coin do you want to watch? Type the ticker (e.g. BTC, ETH, TON).",
    { reply_markup: inlineKeyboard([[inlineButton("Cancel", "menu:main")]]) },
  );
});

composer.on("message:text", async (ctx, next) => {
  if (ctx.session.step !== "awaiting_ticker") return next();

  const ticker = ctx.message.text.trim().toUpperCase().split(/\s+/)[0]!;
  const userId = ctx.from?.id;
  if (!userId) return;

  if (isUnknownTicker(ticker)) {
    await ctx.reply(
      "Unknown ticker. Try a common one like BTC, ETH, TON, or type any ticker to watch it.",
      { reply_markup: inlineKeyboard([[inlineButton("⬅️ Back to menu", "menu:main")]]) },
    );
    ctx.session.step = "idle";
    return;
  }

  const existing = await getWatchlist(userId);
  if (existing.find((e) => e.ticker === ticker)) {
    ctx.session.step = "idle";
    await ctx.reply(`${ticker} is already in your watchlist.`, {
      reply_markup: inlineKeyboard([
        [inlineButton("👁 View watchlist", "watchlist:show")],
        [inlineButton("⬅️ Back to menu", "menu:main")],
      ]),
    });
    return;
  }

  await addWatchlistEntry(userId, { ticker });
  ctx.session.step = "idle";
  await ctx.reply(`✅ Added ${ticker} to your watchlist.`, {
    reply_markup: inlineKeyboard([
      [inlineButton("👁 View watchlist", "watchlist:show")],
      [inlineButton("⬅️ Back to menu", "menu:main")],
    ]),
  });
});

export default composer;

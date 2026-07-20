import { Composer } from "grammy";
import type { Ctx } from "../bot.js";
import { addWatchlistEntry, getWatchlist } from "../storage.js";
import { inlineButton, inlineKeyboard } from "../toolkit/index.js";

const composer = new Composer<Ctx>();

composer.callbackQuery(/^set_price:(.+)$/, async (ctx) => {
  await ctx.answerCallbackQuery();
  const ticker = ctx.match![1]!.toUpperCase();
  ctx.session.step = "awaiting_price_threshold";
  ctx.session.pendingTicker = ticker;
  await ctx.editMessageText(
    `What price should I alert you at for ${ticker}? Type a number (e.g. 50000).`,
    { reply_markup: inlineKeyboard([[inlineButton("Cancel", "settings:show")]]) },
  );
});

composer.on("message:text", async (ctx, next) => {
  if (ctx.session.step !== "awaiting_price_threshold") return next();

  const ticker = ctx.session.pendingTicker;
  if (!ticker) {
    ctx.session.step = "idle";
    return next();
  }

  const val = parseFloat(ctx.message.text.trim());
  if (isNaN(val) || val <= 0) {
    await ctx.reply("Please enter a valid number (e.g. 50000).");
    return;
  }

  const userId = ctx.from?.id;
  if (!userId) return;

  const existing = await getWatchlist(userId);
  const entry = existing.find((e) => e.ticker === ticker);

  await addWatchlistEntry(userId, {
    ticker,
    priceThreshold: val,
    pctThreshold: entry?.pctThreshold,
  });

  ctx.session.step = "idle";
  ctx.session.pendingTicker = undefined;
  await ctx.reply(`✅ Price alert for ${ticker} set to above $${val.toLocaleString()}.`, {
    reply_markup: inlineKeyboard([
      [inlineButton("👁 View watchlist", "watchlist:show")],
      [inlineButton("⬅️ Back to menu", "menu:main")],
    ]),
  });
});

export default composer;

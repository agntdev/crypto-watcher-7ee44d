import { Composer } from "grammy";
import type { Ctx } from "../bot.js";
import { addWatchlistEntry, getWatchlist } from "../storage.js";
import { isUnknownTicker } from "../coingecko.js";
import { inlineButton, inlineKeyboard } from "../toolkit/index.js";

const composer = new Composer<Ctx>();

composer.command("watch", async (ctx) => {
  const text = ctx.message?.text?.trim() ?? "";
  const args = text.replace(/^\/watch\s*/i, "").trim();

  if (!args) {
    await ctx.reply("Which coin do you want to watch? Try /watch BTC or /watch BTC 50000.", {
      reply_markup: inlineKeyboard([[inlineButton("⬅️ Back to menu", "menu:main")]]),
    });
    return;
  }

  const parts = args.split(/\s+/);
  const ticker = parts[0]!.toUpperCase();

  if (isUnknownTicker(ticker)) {
    await ctx.reply(
      "Unknown ticker. Try a common one like BTC, ETH, TON, or type any ticker to watch it.",
      { reply_markup: inlineKeyboard([[inlineButton("⬅️ Back to menu", "menu:main")]]) },
    );
    return;
  }

  let priceThreshold: number | undefined;
  let pctThreshold: number | undefined;

  for (const part of parts.slice(1)) {
    if (part.endsWith("%")) {
      const val = parseFloat(part.slice(0, -1));
      if (!isNaN(val) && val > 0) pctThreshold = val;
    } else {
      const val = parseFloat(part);
      if (!isNaN(val) && val > 0) priceThreshold = val;
    }
  }

  const userId = ctx.from?.id;
  if (!userId) return;

  const existing = await getWatchlist(userId);
  const already = existing.find((e) => e.ticker === ticker);

  await addWatchlistEntry(userId, {
    ticker,
    priceThreshold: priceThreshold ?? already?.priceThreshold,
    pctThreshold: pctThreshold ?? already?.pctThreshold,
  });

  const lines: string[] = [`✅ Added ${ticker} to your watchlist.`];
  if (priceThreshold) lines.push(`Price alert: above $${priceThreshold.toLocaleString()}`);
  if (pctThreshold) lines.push(`Move alert: ${pctThreshold}% change`);

  await ctx.reply(lines.join("\n"), {
    reply_markup: inlineKeyboard([
      [inlineButton("👁 View watchlist", "watchlist:show")],
      [inlineButton("⬅️ Back to menu", "menu:main")],
    ]),
  });
});

export default composer;

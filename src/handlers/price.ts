import { Composer } from "grammy";
import type { Ctx } from "../bot.js";
import { getWatchlist } from "../storage.js";
import { getPrice, getPrices, formatPrice, formatChange } from "../coingecko.js";
import { inlineButton, inlineKeyboard } from "../toolkit/index.js";

const composer = new Composer<Ctx>();

composer.command("price", async (ctx) => {
  const text = ctx.message?.text?.trim() ?? "";
  const args = text.replace(/^\/price\s*/i, "").trim();
  const userId = ctx.from?.id;
  if (!userId) return;

  if (args) {
    const ticker = args.split(/\s+/)[0]!.toUpperCase();
    const result = await getPrice(ticker);
    if (result) {
      const change = formatChange(result.usd24hChange);
      const changeStr = change ? ` (${change} 24h)` : "";
      await ctx.reply(`${result.ticker}: ${formatPrice(result.usd)}${changeStr}`, {
        reply_markup: inlineKeyboard([[inlineButton("⬅️ Back to menu", "menu:main")]]),
      });
    } else {
      await ctx.reply(
        "Couldn't fetch the price right now. Try again in a moment.",
        { reply_markup: inlineKeyboard([[inlineButton("⬅️ Back to menu", "menu:main")]]) },
      );
    }
    return;
  }

  const watchlist = await getWatchlist(userId);
  if (watchlist.length === 0) {
    await ctx.reply(
      "Your watchlist is empty — tap ➕ Add coin to get started.",
      { reply_markup: inlineKeyboard([[inlineButton("⬅️ Back to menu", "menu:main")]]) },
    );
    return;
  }

  const tickers = watchlist.map((e) => e.ticker);
  const prices = await getPrices(tickers);

  if (prices.size === 0) {
    await ctx.reply(
      "Couldn't fetch prices right now. Try again in a moment.",
      { reply_markup: inlineKeyboard([[inlineButton("⬅️ Back to menu", "menu:main")]]) },
    );
    return;
  }

  const lines: string[] = ["💰 Watchlist prices:\n"];
  for (const entry of watchlist) {
    const p = prices.get(entry.ticker);
    if (p) {
      const change = formatChange(p.usd24hChange);
      const changeStr = change ? ` (${change})` : "";
      lines.push(`${p.ticker}: ${formatPrice(p.usd)}${changeStr}`);
    } else {
      lines.push(`${entry.ticker}: unavailable`);
    }
  }

  await ctx.reply(lines.join("\n"), {
    reply_markup: inlineKeyboard([[inlineButton("⬅️ Back to menu", "menu:main")]]),
  });
});

composer.callbackQuery("price:show", async (ctx) => {
  await ctx.answerCallbackQuery();
  const userId = ctx.from?.id;
  if (!userId) return;

  const watchlist = await getWatchlist(userId);
  if (watchlist.length === 0) {
    await ctx.editMessageText(
      "Your watchlist is empty — tap ➕ Add coin to get started.",
      { reply_markup: inlineKeyboard([[inlineButton("⬅️ Back to menu", "menu:main")]]) },
    );
    return;
  }

  const tickers = watchlist.map((e) => e.ticker);
  const prices = await getPrices(tickers);

  if (prices.size === 0) {
    await ctx.editMessageText(
      "Couldn't fetch prices right now. Try again in a moment.",
      { reply_markup: inlineKeyboard([[inlineButton("⬅️ Back to menu", "menu:main")]]) },
    );
    return;
  }

  const lines: string[] = ["💰 Watchlist prices:\n"];
  for (const entry of watchlist) {
    const p = prices.get(entry.ticker);
    if (p) {
      const change = formatChange(p.usd24hChange);
      const changeStr = change ? ` (${change})` : "";
      lines.push(`${p.ticker}: ${formatPrice(p.usd)}${changeStr}`);
    } else {
      lines.push(`${entry.ticker}: unavailable`);
    }
  }

  await ctx.editMessageText(lines.join("\n"), {
    reply_markup: inlineKeyboard([[inlineButton("⬅️ Back to menu", "menu:main")]]),
  });
});

export default composer;

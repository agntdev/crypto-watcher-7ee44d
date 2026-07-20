import { Composer } from "grammy";
import type { Ctx } from "../bot.js";
import { getWatchlist } from "../storage.js";
import { inlineButton, inlineKeyboard } from "../toolkit/index.js";

const composer = new Composer<Ctx>();

composer.command("watchlist", async (ctx) => {
  const userId = ctx.from?.id;
  if (!userId) return;
  await showWatchlist(ctx, userId);
});

composer.callbackQuery("watchlist:show", async (ctx) => {
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

  const lines: string[] = ["👁 Your watchlist:\n"];
  for (const entry of watchlist) {
    const parts: string[] = [entry.ticker];
    if (entry.priceThreshold) parts.push(`>$${entry.priceThreshold.toLocaleString()}`);
    if (entry.pctThreshold) parts.push(`${entry.pctThreshold}% move`);
    lines.push(parts.join(" "));
  }

  const buttons = watchlist.map((e) => [
    inlineButton(`🗑 ${e.ticker}`, `watchlist:remove:${e.ticker}`),
  ]);
  buttons.push([inlineButton("⬅️ Back to menu", "menu:main")]);

  await ctx.editMessageText(lines.join("\n"), {
    reply_markup: inlineKeyboard(buttons),
  });
});

composer.callbackQuery(/^watchlist:remove:(.+)$/, async (ctx) => {
  await ctx.answerCallbackQuery();
  const ticker = ctx.match![1]!.toUpperCase();
  const userId = ctx.from?.id;
  if (!userId) return;

  const { removeWatchlistEntry } = await import("../storage.js");
  const removed = await removeWatchlistEntry(userId, ticker);

  if (removed) {
    await ctx.editMessageText(`🗑 Removed ${ticker} from your watchlist.`, {
      reply_markup: inlineKeyboard([[inlineButton("⬅️ Back to menu", "menu:main")]]),
    });
  } else {
    await ctx.editMessageText(`${ticker} isn't in your watchlist.`, {
      reply_markup: inlineKeyboard([[inlineButton("⬅️ Back to menu", "menu:main")]]),
    });
  }
});

async function showWatchlist(ctx: Ctx, userId: number) {
  const watchlist = await getWatchlist(userId);
  if (watchlist.length === 0) {
    await ctx.reply(
      "Your watchlist is empty — tap ➕ Add coin to get started.",
      { reply_markup: inlineKeyboard([[inlineButton("⬅️ Back to menu", "menu:main")]]) },
    );
    return;
  }

  const lines: string[] = ["👁 Your watchlist:\n"];
  for (const entry of watchlist) {
    const parts: string[] = [entry.ticker];
    if (entry.priceThreshold) parts.push(`>$${entry.priceThreshold.toLocaleString()}`);
    if (entry.pctThreshold) parts.push(`${entry.pctThreshold}% move`);
    lines.push(parts.join(" "));
  }

  const buttons = watchlist.map((e) => [
    inlineButton(`🗑 ${e.ticker}`, `watchlist:remove:${e.ticker}`),
  ]);
  buttons.push([inlineButton("⬅️ Back to menu", "menu:main")]);

  await ctx.reply(lines.join("\n"), {
    reply_markup: inlineKeyboard(buttons),
  });
}

export default composer;

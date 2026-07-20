import { Composer } from "grammy";
import type { Ctx } from "../bot.js";
import { getWatchlist } from "../storage.js";
import { inlineButton, inlineKeyboard } from "../toolkit/index.js";

const composer = new Composer<Ctx>();

composer.callbackQuery("watchlist:remove_list", async (ctx) => {
  await ctx.answerCallbackQuery();
  const userId = ctx.from?.id;
  if (!userId) return;

  const watchlist = await getWatchlist(userId);
  if (watchlist.length === 0) {
    await ctx.editMessageText(
      "Your watchlist is empty.",
      { reply_markup: inlineKeyboard([[inlineButton("⬅️ Back to menu", "menu:main")]]) },
    );
    return;
  }

  const buttons = watchlist.map((e) => [
    inlineButton(`🗑 ${e.ticker}`, `watchlist:remove:${e.ticker}`),
  ]);
  buttons.push([inlineButton("⬅️ Back to menu", "menu:main")]);

  await ctx.editMessageText("Tap a coin to remove it:", {
    reply_markup: inlineKeyboard(buttons),
  });
});

export default composer;

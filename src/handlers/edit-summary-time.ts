import { Composer } from "grammy";
import type { Ctx } from "../bot.js";
import { getUserSettings, setUserSettings } from "../storage.js";
import { inlineButton, inlineKeyboard } from "../toolkit/index.js";

const composer = new Composer<Ctx>();

composer.callbackQuery("settings:summary", async (ctx) => {
  await ctx.answerCallbackQuery();
  ctx.session.step = "awaiting_summary_time";
  await ctx.editMessageText(
    "Enter your morning summary time (e.g. 09:00):",
    { reply_markup: inlineKeyboard([[inlineButton("Cancel", "settings:show")]]) },
  );
});

composer.on("message:text", async (ctx, next) => {
  if (ctx.session.step !== "awaiting_summary_time") return next();

  const text = ctx.message.text.trim();
  const match = text.match(/^(\d{1,2}:\d{2})$/);
  if (!match) {
    await ctx.reply("Please enter a time like 09:00.");
    return;
  }

  const userId = ctx.from?.id;
  if (!userId) return;

  const settings = await getUserSettings(userId);
  settings.summaryTime = match[1];
  await setUserSettings(userId, settings);

  ctx.session.step = "idle";
  await ctx.reply(`✅ Morning summary set for ${match[1]}.`, {
    reply_markup: inlineKeyboard([[inlineButton("⬅️ Back to menu", "menu:main")]]),
  });
});

export default composer;

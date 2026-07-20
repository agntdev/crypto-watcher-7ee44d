import { Composer } from "grammy";
import type { Ctx } from "../bot.js";
import { getUserSettings, setUserSettings } from "../storage.js";
import { inlineButton, inlineKeyboard } from "../toolkit/index.js";

const composer = new Composer<Ctx>();

composer.callbackQuery("settings:cooldown", async (ctx) => {
  await ctx.answerCallbackQuery();
  ctx.session.step = "awaiting_cooldown_duration";
  await ctx.editMessageText(
    "How many seconds between alerts for the same coin? (e.g. 3600 for 1 hour)",
    { reply_markup: inlineKeyboard([[inlineButton("Cancel", "settings:show")]]) },
  );
});

composer.on("message:text", async (ctx, next) => {
  if (ctx.session.step !== "awaiting_cooldown_duration") return next();

  const text = ctx.message.text.trim();
  const val = parseInt(text, 10);
  if (isNaN(val) || val < 0) {
    await ctx.reply("Please enter a number of seconds (e.g. 3600 for 1 hour).");
    return;
  }

  const userId = ctx.from?.id;
  if (!userId) return;

  const settings = await getUserSettings(userId);
  settings.cooldownDuration = val;
  await setUserSettings(userId, settings);

  ctx.session.step = "idle";
  const mins = Math.round(val / 60);
  await ctx.reply(`✅ Cooldown set to ${mins} minute${mins === 1 ? "" : "s"}.`, {
    reply_markup: inlineKeyboard([[inlineButton("⬅️ Back to menu", "menu:main")]]),
  });
});

export default composer;

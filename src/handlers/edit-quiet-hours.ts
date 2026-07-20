import { Composer } from "grammy";
import type { Ctx } from "../bot.js";
import { getUserSettings, setUserSettings } from "../storage.js";
import { inlineButton, inlineKeyboard } from "../toolkit/index.js";

const composer = new Composer<Ctx>();

composer.callbackQuery("settings:quiet", async (ctx) => {
  await ctx.answerCallbackQuery();
  ctx.session.step = "awaiting_quiet_hours";
  await ctx.editMessageText(
    "Enter quiet hours as start and end times (e.g. 22:00 07:00):",
    { reply_markup: inlineKeyboard([[inlineButton("Cancel", "settings:show")]]) },
  );
});

composer.on("message:text", async (ctx, next) => {
  if (ctx.session.step !== "awaiting_quiet_hours") return next();

  const text = ctx.message.text.trim();
  const match = text.match(/^(\d{1,2}:\d{2})\s+(\d{1,2}:\d{2})$/);
  if (!match) {
    await ctx.reply("Please enter times like 22:00 07:00 (start end).");
    return;
  }

  const userId = ctx.from?.id;
  if (!userId) return;

  const settings = await getUserSettings(userId);
  settings.quietHoursStart = match[1];
  settings.quietHoursEnd = match[2];
  await setUserSettings(userId, settings);

  ctx.session.step = "idle";
  await ctx.reply(`✅ Quiet hours set to ${match[1]}–${match[2]}.`, {
    reply_markup: inlineKeyboard([[inlineButton("⬅️ Back to menu", "menu:main")]]),
  });
});

export default composer;

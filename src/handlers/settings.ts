import { Composer } from "grammy";
import type { Ctx } from "../bot.js";
import { getUserSettings } from "../storage.js";
import { inlineButton, inlineKeyboard } from "../toolkit/index.js";

const composer = new Composer<Ctx>();

composer.command("settings", async (ctx) => {
  const userId = ctx.from?.id;
  if (!userId) return;
  const settings = await getUserSettings(userId);
  const cd = settings.cooldownDuration;
  const lines: string[] = ["⚙️ Your settings:\n"];
  lines.push(`Quiet hours: ${settings.quietHoursStart && settings.quietHoursEnd ? `${settings.quietHoursStart}–${settings.quietHoursEnd}` : "not set"}`);
  lines.push(`Morning summary: ${settings.summaryTime ?? "not set"}`);
  lines.push(`Cooldown: ${Math.round(cd / 60)} min`);
  await ctx.reply(lines.join("\n"), {
    reply_markup: inlineKeyboard([
      [inlineButton("🌙 Quiet hours", "settings:quiet")],
      [inlineButton("☀️ Summary time", "settings:summary")],
      [inlineButton("⏱ Cooldown", "settings:cooldown")],
      [inlineButton("⬅️ Back to menu", "menu:main")],
    ]),
  });
});

composer.callbackQuery("settings:show", async (ctx) => {
  await ctx.answerCallbackQuery();
  const userId = ctx.from?.id;
  if (!userId) return;
  const settings = await getUserSettings(userId);
  const cd = settings.cooldownDuration;
  const lines: string[] = ["⚙️ Your settings:\n"];
  lines.push(`Quiet hours: ${settings.quietHoursStart && settings.quietHoursEnd ? `${settings.quietHoursStart}–${settings.quietHoursEnd}` : "not set"}`);
  lines.push(`Morning summary: ${settings.summaryTime ?? "not set"}`);
  lines.push(`Cooldown: ${Math.round(cd / 60)} min`);
  await ctx.editMessageText(lines.join("\n"), {
    reply_markup: inlineKeyboard([
      [inlineButton("🌙 Quiet hours", "settings:quiet")],
      [inlineButton("☀️ Summary time", "settings:summary")],
      [inlineButton("⏱ Cooldown", "settings:cooldown")],
      [inlineButton("⬅️ Back to menu", "menu:main")],
    ]),
  });
});

export default composer;

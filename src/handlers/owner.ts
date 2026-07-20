import { Composer } from "grammy";
import type { Ctx } from "../bot.js";
import { getUserCount, getAlertCounts } from "../storage.js";
import { inlineButton, inlineKeyboard } from "../toolkit/index.js";

const OWNER_IDS = process.env.OWNER_ID ? process.env.OWNER_ID.split(",").map(Number) : [];

const composer = new Composer<Ctx>();

composer.command("owner", async (ctx) => {
  const userId = ctx.from?.id;
  if (!userId) return;

  if (OWNER_IDS.length > 0 && !OWNER_IDS.includes(userId)) {
    await ctx.reply("This command is for the bot owner only.");
    return;
  }

  const userCount = await getUserCount();
  const alertCounts = await getAlertCounts();

  const lines: string[] = ["📊 Owner dashboard:\n"];
  lines.push(`Total users: ${userCount}`);

  const sorted = Object.entries(alertCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10);

  if (sorted.length > 0) {
    lines.push("\nTop alerting coins:");
    for (const [ticker, count] of sorted) {
      lines.push(`  ${ticker}: ${count} alerts`);
    }
  } else {
    lines.push("\nNo alerts fired yet.");
  }

  await ctx.reply(lines.join("\n"), {
    reply_markup: inlineKeyboard([[inlineButton("⬅️ Back to menu", "menu:main")]]),
  });
});

export default composer;

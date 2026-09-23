// 引入用户设置的数据类型。
import type { UserSettings } from "./types";

// 定义尚未保存个人设置时使用的默认值。
export const DEFAULT_SETTINGS: UserSettings = {
  // 收藏超过 180 天后进入待整理清单。
  archaeologyAgeDays: 180,
};

// 读取用户保存的设置；没有有效设置时使用默认值。
export async function loadSettings(): Promise<UserSettings> {
  // 从扩展的本地存储中读取 userSettings。
  const stored = await chrome.storage.local.get("userSettings");

  // 取出用户保存的整理天数。
  const days = stored.userSettings?.archaeologyAgeDays;

  // 只有正整数才作为有效的整理天数。
  if (typeof days === "number" && Number.isSafeInteger(days) && days > 0) {
    // 返回用户保存的有效设置。
    return { archaeologyAgeDays: days };
  }

  // 没有有效设置时，返回默认的 180 天。
  return DEFAULT_SETTINGS;
}
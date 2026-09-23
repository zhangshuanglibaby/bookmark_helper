/**
 * 整理时间阈值设置功能
 */

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

// 将用户选择的整理天数保存到扩展本地。
export async function saveSettings(settings: UserSettings): Promise<void> {
  // 检查整理天数是否为大于零的整数。
  if (!Number.isSafeInteger(settings.archaeologyAgeDays) || settings.archaeologyAgeDays <= 0) {
    // 无效的天数不写入本地存储。
    throw new Error("整理天数必须是大于 0 的整数");
  }

  // 使用与读取函数相同的 userSettings 名称保存设置。
  await chrome.storage.local.set({ userSettings: settings });
}
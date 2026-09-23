// 引入副作用和状态工具，分别用于首次读取设置和更新输入框。
import { useEffect, useState } from "react";

// 引入默认设置和本地设置读取函数。
import { DEFAULT_SETTINGS, loadSettings, saveSettings } from "../shared/settings";

// 定义设置组件接收的通知函数。
interface SettingsProps {
  // 保存成功后，通知主页面重新读取收藏清单。
  onSaved?: () => void;
}


// 定义整理天数设置组件。
// 接收保存成功后的通知函数。
function Settings({ onSaved }: SettingsProps) {
  // 输入框先显示默认的 180 天。
  const [ageDays, setAgeDays] = useState(String(DEFAULT_SETTINGS.archaeologyAgeDays));

  // 组件首次显示时，读取用户之前保存的整理天数。
  useEffect(() => {
    // 请求读取扩展本地的设置
    loadSettings()
      .then((settings) => {
        // 把数字转换成输入框需要的文字。
        setAgeDays(String(settings.archaeologyAgeDays));
      })
      // 读取失败时保留默认值，并记录错误以便排查。
      .catch((error) => {
        // 在控制台记录读取失败的原因。
        console.error("读取整理设置失败：", error);
      });
  }, []);

  // 保存操作进行时，用它禁用按钮，避免重复提交。
  const [isSaving, setIsSaving] = useState(false);

  // 保存成功或失败后，向用户显示结果。
  const [saveMessage, setSaveMessage] = useState("");

  // 用户点击保存按钮时执行。
  async function handleSaveSettings(): Promise<void> {
    // 标记为正在保存，并清除上一次的提示。
    setIsSaving(true);
    setSaveMessage("");

    // 尝试把输入框中的天数保存到本地。
    try {

      // 将输入文字转换为数字；无效数字会被保存函数拒绝。
      await saveSettings({ archaeologyAgeDays: Number(ageDays) });

      // 本地保存成功后，通知主页面更新清单。
      onSaved?.();

      // 保存成功后显示提示。
      setSaveMessage("设置已保存");
    } catch (error) {
      // 保存失败时显示具体原因。
      setSaveMessage(error instanceof Error ? error.message : "保存设置失败");
    } finally {
      // 保存结束后，重新启用按钮。
      setIsSaving(false);
    }
  }

  // 返回设置界面。
  return (
    <section aria-label="整理范围设置">
      {/* 告诉用户这个数字的含义。 */}
      <label htmlFor="age-days">收藏超过多少天后进入清单</label>

      {/* 用户输入时，更新输入框中的文字。 */}
      <input
        id="age-days"
        type="number"
        min="1"
        step="1"
        value={ageDays}
        onChange={(event) => setAgeDays(event.target.value)}
      />
      {/* 点击后保存输入的整理天数；保存期间不能重复点击。 */}
      <button type="button" onClick={handleSaveSettings} disabled={isSaving}>
        {/* 根据保存状态显示按钮文字。 */}
        {isSaving ? "保存中..." : "保存"}
      </button>

      {/* 显示保存成功或失败的结果。 */}
      {saveMessage && <p role="status">{saveMessage}</p>}
    </section>
  );
}

// 导出组件，供侧边栏主页面使用。
export default Settings;
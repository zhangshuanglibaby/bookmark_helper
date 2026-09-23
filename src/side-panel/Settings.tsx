// 引入副作用和状态工具，分别用于首次读取设置和更新输入框。
import { useEffect, useState } from "react";

// 引入默认设置和本地设置读取函数。
import { DEFAULT_SETTINGS, loadSettings } from "../shared/settings";


// 定义整理天数设置组件。
function Settings() {
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
    </section>
  );
}

// 导出组件，供侧边栏主页面使用。
export default Settings;
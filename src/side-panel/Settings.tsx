// 引入 React 状态工具，保存输入框当前的文字。
import { useState } from "react";

// 引入默认整理天数。
import { DEFAULT_SETTINGS } from "../shared/settings";


// 定义整理天数设置组件。
function Settings() {
  // 输入框先显示默认的 180 天。
  const [ageDays, setAgeDays] = useState(String(DEFAULT_SETTINGS.archaeologyAgeDays));

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
// 引入已经定义好的网页内容类型，不会额外生成运行时代码。
import type { PageContent } from "../shared/types";

// 导出请求后端生成摘要的函数，供后续流程调用。
export async function requestSummary(content: PageContent): Promise<string> {
  // 正文为空时提前提示，避免发送不符合后端要求的请求。
  if (!content.text.trim()) {
    throw new Error("网页正文为空，暂时无法生成摘要");
  }

  // 将网页内容发送给本机后端；这里不包含 DeepSeek API Key。
  const response = await fetch("http://localhost:3000/api/summaries", {
    method: "POST", // 与后端摘要接口的方法一致。
    headers: {
      "Content-Type": "application/json", // 告诉后端发送的是 JSON。
    },
    body: JSON.stringify({
      title: content.title.slice(0, 500), // 符合后端对标题的长度限制。
      description: content.description.slice(0, 2000), // 符合描述的长度限制。
      keywords: content.keywords.slice(0, 2000), // 符合关键词的长度限制。
      text: content.text.slice(0, 15000), // 符合正文的长度限制。
      url: content.url, // 保留完整网址，交给后端校验。
    }),
  });

  // 后端返回错误状态时停止，并给出可辨认的状态码。
  if (!response.ok) {
    throw new Error(`摘要请求失败，HTTP 状态码：${response.status}`);
  }

  // 读取后端返回的 JSON，暂时将其视为未知格式。
  const result: unknown = await response.json();

  // 确认响应中确实有非空的摘要字符串。
  if (typeof result !== "object" || result === null || !("summary" in result) || typeof result.summary !== "string" || !result.summary.trim()) {
    throw new Error("后端返回的摘要格式不正确");
  }

  // 将整理过空白字符的摘要交给后续调用者。
  return result.summary.trim();
}
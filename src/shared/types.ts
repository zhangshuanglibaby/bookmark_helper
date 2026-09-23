// 定义收藏在程序中的处理状态。
export type BookmarkStatus = "pending" | "kept" | "deleted";

// 定义一条收藏记录应包含的信息。
export interface BookmarkRecord {
  // Chrome 为这条收藏分配的唯一 ID。
  bookmarkId: string;
  // 这条收藏所在文件夹的 ID。
  parentId: string;
  // 收藏所在文件夹的完整路径，例如“收藏栏 / 前端学习”。
  folderPath: string;
  // 收藏网页的标题。
  title: string;
  // 收藏网页的网址。
  url: string;
  // 收藏被添加到浏览器中的时间。
  // null 表示浏览器没有提供这个时间。
  dateAdded: number | null;
  // 最近一次访问该网页的时间。
  // null 表示没有访问记录或浏览器没有提供该信息。
  dateLastUsed: number | null;
  // 用户对这条收藏的当前处理状态。
  status: BookmarkStatus;
  // 用户处理这条收藏的时间。
  // 尚未处理时为 null。
  processedAt: number | null;
  // 这条本地记录最后一次更新的时间。
  updatedAt: number;
}

// 定义从一个网页中提取出来的内容。
export interface PageContent {
  // 网页在浏览器标签页中显示的标题。
  title: string;
  // 网页 meta description 中的描述文字。
  // 网页没有提供时为空字符串。
  description: string;
  // 网页 meta keywords 中的关键词。
  // 网页没有提供时为空字符串。
  keywords: string;
  // 从 article、main 或 body 中提取并清理后的正文文字。
  text: string;
  // 实际读取的网页网址。
  url: string;
}

// 定义一条已经生成完成的 AI 摘要记录。
export interface SummaryRecord {
  // 对应的 Chrome 收藏 ID。
  bookmarkId: string;

  // AI 为这条收藏生成的一句话中文摘要。
  summary: string;

  // 网页内容生成的标识。
  // 后续网页内容变化时，用它判断旧摘要是否还能继续使用。
  sourceTextHash: string;

  // 这条摘要生成完成的时间。
  generatedAt: number;
}

// 定义用户填写的 AI 服务配置。
export interface UserSettings {
  // AI 服务接口的基础地址。
  // 例如：https://api.openai.com/v1
  aiBaseUrl: string;

  // 调用 AI 服务所需的 API 密钥。
  aiApiKey: string;

  // 要使用的 AI 模型名称。
  // 例如：gpt-5-mini
  aiModel: string;

  // 一条收藏被视为“旧收藏”所需经过的天数。
  archaeologyAgeDays: number;
}

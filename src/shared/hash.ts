/**
 * 用来判断缓存的摘要是否仍对应当前网页内容
 * 浏览器内置的 crypto.subtle.digest("SHA-256", ...) 生成内容指纹。它把任意长度的文字转换成固定长度结果；相同输入会得到相同结果，内容变化时结果通常也会变化。
 */

// 引入网页内容的数据类型。
import type { PageContent } from "./types";


// 为一段文字生成 SHA-256 内容指纹。
/**
 * 
 * @param text 需要生成指纹的原始文字。
 * @returns 生成的内容指纹。
 */
export async function createTextHash(
  text: string,
): Promise<string> {
  // 将 JavaScript 字符串编码成浏览器可计算的 UTF-8 字节数据。
  const textBytes = new TextEncoder().encode(text);

  // 使用 SHA-256 算法计算字节数据的哈希结果。
  const hashBuffer = await crypto.subtle.digest("SHA-256", textBytes);

  // 将二进制哈希结果转换为普通字节数组。
  const hashBytes = new Uint8Array(hashBuffer);

  // 将每个字节转换为两位十六进制文字，再拼接为一个字符串。
  const hashText = Array.from(hashBytes)
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");

  // 返回最终的内容指纹字符串。
  return hashText;
}

// 根据网页的关键信息生成摘要缓存使用的内容指纹。
/**
 * 
 * @param content 需要生成指纹的网页内容。
 * @returns 生成的内容指纹。
 */
export async function createPageContentHash(
  content: PageContent,
): Promise<string> {

  // 按固定顺序组合网页信息。
  // 固定顺序很重要：同一份内容每次组合后都必须完全一致。
  const sourceText = [
    // 网页标题。
    `标题：${content.title}`,

    // 网页描述。
    `描述：${content.description}`,

    // 网页关键词。
    `关键词：${content.keywords}`,

    // 网页正文。
    `正文：${content.text}`,

    // 网页网址。
    `网址：${content.url}`,
  ].join("\n");

  // 调用前面定义的 SHA-256 工具，返回这份网页内容的指纹。
  return createTextHash(sourceText);

}
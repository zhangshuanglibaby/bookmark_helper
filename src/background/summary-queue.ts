// 同一时间最多处理两条收藏的摘要任务。
const MAX_CONCURRENT_SUMMARIES = 2;

// 记录当前占用中的任务位置数量。
let activeSummaries = 0;

// 保存正在等待位置的任务唤醒函数。
const waitingSummaries: Array<() => void> = [];

// 让一项摘要任务在取得位置后运行。
export async function runSummaryWithLimit<T>(task: () => Promise<T>): Promise<T> {
  // 还有空位时，立即占用一个位置。
  if (activeSummaries < MAX_CONCURRENT_SUMMARIES) {
    activeSummaries += 1;
  } else {
    // 没有空位时，等待正在运行的任务完成。
    await new Promise<void>((resolve) => {
      // 将唤醒当前任务的函数放入等待队列。
      waitingSummaries.push(resolve);
    });
  }

  // 无论任务成功还是失败，都要归还位置。
  try {
    // 执行任务，并把结果交还给调用方。
    return await task();
  } finally {
    // 取出下一项等待中的任务。
    const next = waitingSummaries.shift();

    // 有任务在等待时，将当前位置交给它。
    if (next) {
      next();
    } else {
      // 没有任务等待时，减少占用数量。
      activeSummaries -= 1;
    }
  }
}
import { useState } from "react";

export interface Notice {
  tone: "good" | "bad";
  text: string;
}

/** Local notice/feedback state with a pre-rendered bar element. */
export function useNotice() {
  const [notice, setNotice] = useState<Notice | null>(null);
  const noticeBar = notice ? (
    <p className={`loop-notice loop-notice-${notice.tone}`}>{notice.text}</p>
  ) : null;
  return { notice, setNotice, noticeBar };
}

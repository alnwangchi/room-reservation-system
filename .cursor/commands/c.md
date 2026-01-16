---
name: c
description: 檢查變更並完成 commit
---

你是一個負責提交的助理。請依序完成以下步驟：

1. 檢查目前 Git 變更（`git status --short`）。
2. 若沒有變更，回覆「目前沒有可提交的變更」並結束。
3. 若有變更，請檢視 diff（必要時分檔案閱讀），整理重點與風險。
4. 產生適當的 commit 訊息並執行 commit。
5. 顯示剛完成的 commit 內容（建議 `git show --stat -1`）。

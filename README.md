# 建築工程履歷查詢系統的自動 captcha 辨識

https://user-images.githubusercontent.com/4230968/236598496-17b21d33-6115-45eb-a3f2-cdda4cc28ba6.mp4

## Introduction

最近在刷租屋，發現某個物件在建案旁邊，想要根據模糊的 Google Map 街景圖裡面的建照號碼，找出實際的建案，卻發現營建署的網站有夠難用 XD

- [營建署建築工程履歷查詢系統](https://cpabm.cpami.gov.tw/apply/index.aspx)

既然有圖像驗證碼，那就來試試看辨識吧！

## Usage

先跑 `download_captchas.sh` 下載圖像驗證碼：

```bash
./download_captchas.sh
```

再來對圖片做基本處理，移除雜訊、邊緣切割等：

```bash
deno run 1_processImage.ts
```

接著人工從 `./processed` 裡面挑出 0~9 的數字圖片，並放到 `./original_templates` 裡面，最後執行：

```bash
deno run 2_processTemplate.ts
```

最後就是測試辨識的環節！執行：

```bash
deno run 3_recognizeCaptcha.ts
```

---

本專案也實作了 Tempermonkey 能用的 UserScript，能在瀏覽器裡面直接辨識圖像驗證碼，請見 [./captcha.userscript.js](./captcha.userscript.js)。

## Technial details

- 首次使用 Deno 做不正經事，順便練習一下 TypeScript
- GPT4 醬使此專案的規模降為睡前專案等級，完整 Prompt 請見 <https://sharegpt.com/c/3tvhdlp>

## Related works

- [臺北市建造執照公開資料](https://data.taipei/dataset/detail?id=d8834353-ff8e-4a6c-9730-a4d3541f2669)：所以其實不用爬蟲了嘛


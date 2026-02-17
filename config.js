/**
 * 農作業記録簿v2 - 設定ファイル
 * 
 * 「ウェブに公開」で取得した公開IDを設定してください。
 * 公開URLが:
 *   https://docs.google.com/spreadsheets/d/e/XXXXXXXXXX/pubhtml
 * の場合、XXXXXXXXXX の部分が公開IDです。
 *
 * ※ 編集URLのID（/d/XXXXX/edit のXXXXX）も SHEET_ID に設定可能です。
 *   その場合はスプレッドシートの共有設定で「リンクを知っている全員」に変更してください。
 */
const CONFIG = {
    // スプレッドシートの公開ID（「ウェブに公開」のURLから取得）
    PUBLISHED_ID: "2PACX-1vRjW7dRnB3Mtsoxt7Xhqjumdx99bsb98F3lCPS0xozXtsKUmqhM8ajbOD9lAZdwEH3N96l2M1JSBd8L",

    // 編集用スプレッドシートID（リンク共有を有効にした場合のみ使用）
    SHEET_ID: "1ixByn7FYv_ZTwqfHcBr0tiMpL8RggKPEV7oxJezF9Ik",

    // シート名（Googleスプレッドシートのタブ名と一致させてください）
    CROP_CYCLES_SHEET: "作付け",
    WORK_LOGS_SHEET: "作業記録",

    // キャッシュ時間（ミリ秒）- デフォルト: 5分
    CACHE_DURATION_MS: 5 * 60 * 1000,

    // ページタイトル
    TITLE: "農作業記録簿",
};

/* ============================================================
   農作業記録簿 v2 — GAS 管理画面  Code.gs
   ============================================================ */

/** シート名 */
var SHEET_CYCLES = "作付け";
var SHEET_LOGS   = "作業記録";

/** 管理パスワード */
var ADMIN_PASSWORD = "farm2026";

/* ============================================================
   Web App エントリーポイント
   ============================================================ */
function doGet(e) {
  return HtmlService.createTemplateFromFile("Index")
    .evaluate()
    .setTitle("農作業記録簿 — 管理画面")
    .addMetaTag("viewport", "width=device-width, initial-scale=1")
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

/* ============================================================
   認証
   ============================================================ */
function verifyPassword(pw) {
  return pw === ADMIN_PASSWORD;
}

/* ============================================================
   ヘルパー関数
   ============================================================ */
function getSheet_(name) {
  return SpreadsheetApp.getActiveSpreadsheet().getSheetByName(name);
}

/**
 * シート全行をオブジェクト配列で返す（ヘッダー行をキーに使う）
 */
function getSheetData_(name) {
  var sheet = getSheet_(name);
  var data  = sheet.getDataRange().getValues();
  if (data.length < 2) return [];

  var headers = data[0];
  var rows = [];
  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    if (!row[0] && !row[1]) continue; // 空行スキップ
    var obj = {};
    for (var j = 0; j < headers.length; j++) {
      obj[headers[j]] = row[j] != null ? String(row[j]) : "";
    }
    rows.push(obj);
  }
  return rows;
}

/**
 * 指定シートで次のID（例: C004, W015）を生成
 */
function generateNextId_(sheetName, prefix) {
  var sheet = getSheet_(sheetName);
  var data  = sheet.getDataRange().getValues();
  var maxNum = 0;
  for (var i = 1; i < data.length; i++) {
    var id = String(data[i][0]);
    if (id.indexOf(prefix) === 0) {
      var num = parseInt(id.substring(prefix.length), 10);
      if (!isNaN(num) && num > maxNum) maxNum = num;
    }
  }
  var next = maxNum + 1;
  var padded = ("000" + next).slice(-3);
  return prefix + padded;
}

/**
 * シート内で指定IDの行番号（1-indexed）を返す。見つからなければ -1
 */
function findRowById_(sheetName, id) {
  var sheet = getSheet_(sheetName);
  var data  = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]).trim() === String(id).trim()) {
      return i + 1; // Sheets は 1-indexed
    }
  }
  return -1;
}

/**
 * 日付値を YYYY-MM-DD 文字列に変換
 */
function formatDate_(val) {
  if (!val) return "";
  if (val instanceof Date) {
    var y = val.getFullYear();
    var m = ("0" + (val.getMonth() + 1)).slice(-2);
    var d = ("0" + val.getDate()).slice(-2);
    return y + "-" + m + "-" + d;
  }
  return String(val);
}

/* ============================================================
   作付け（Crop Cycles）CRUD
   ============================================================ */

/** 全作付けを取得 */
function getCropCycles() {
  return getSheetData_(SHEET_CYCLES);
}

/** 作付けを1件追加 */
function addCropCycle(data) {
  var sheet = getSheet_(SHEET_CYCLES);
  var id = generateNextId_(SHEET_CYCLES, "C");
  sheet.appendRow([
    id,
    data.crop_name   || "",
    data.variety      || "",
    data.field_id     || "",
    data.row_id       || "",
    data.start_date   || "",
    data.end_date     || "",
    data.status       || "育苗中",
    "",  // 収量
    data.yield_unit   || "kg",
    "",  // 品質評価
    "",  // 品質メモ
    data.comment      || ""
  ]);
  return { success: true, id: id };
}

/** 作付けを更新 */
function updateCropCycle(id, data) {
  var rowNum = findRowById_(SHEET_CYCLES, id);
  if (rowNum === -1) return { success: false, error: "作付けID " + id + " が見つかりません" };

  var sheet = getSheet_(SHEET_CYCLES);
  var range = sheet.getRange(rowNum, 1, 1, 13);
  range.setValues([[
    id,
    data.crop_name      || "",
    data.variety         || "",
    data.field_id        || "",
    data.row_id          || "",
    data.start_date      || "",
    data.end_date        || "",
    data.status          || "",
    data.yield_amount    || "",
    data.yield_unit      || "kg",
    data.quality_rating  || "",
    data.quality_note    || "",
    data.comment         || ""
  ]]);
  return { success: true };
}

/** 作付けを削除 */
function deleteCropCycle(id) {
  var rowNum = findRowById_(SHEET_CYCLES, id);
  if (rowNum === -1) return { success: false, error: "作付けID " + id + " が見つかりません" };

  getSheet_(SHEET_CYCLES).deleteRow(rowNum);
  return { success: true };
}

/* ============================================================
   作業記録（Work Logs）CRUD
   ============================================================ */

/** 直近の作業記録を取得（limit件、新しい順） */
function getRecentWorkLogs(limit) {
  var all = getSheetData_(SHEET_LOGS);
  all.sort(function(a, b) {
    return (b["作業日"] || "").localeCompare(a["作業日"] || "");
  });
  return all.slice(0, limit || 20);
}

/** 作業記録を1件追加 */
function addWorkLog(data) {
  var sheet = getSheet_(SHEET_LOGS);
  var id = generateNextId_(SHEET_LOGS, "W");
  sheet.appendRow([
    id,
    data.cycle_id   || "",
    data.work_date  || "",
    data.work_type  || "",
    data.cell_pot   || "",
    data.quantity    || "",
    data.field_id   || "",
    data.row_id     || "",
    data.content    || "",
    data.note       || ""
  ]);
  return { success: true, id: id };
}

/** 作業記録を削除 */
function deleteWorkLog(id) {
  var rowNum = findRowById_(SHEET_LOGS, id);
  if (rowNum === -1) return { success: false, error: "記録ID " + id + " が見つかりません" };

  getSheet_(SHEET_LOGS).deleteRow(rowNum);
  return { success: true };
}

/** 未紐づけ作業記録を取得 */
function getUnlinkedWorkLogs(limit) {
  var all = getSheetData_(SHEET_LOGS);
  var unlinked = [];
  for (var i = 0; i < all.length; i++) {
    if (!all[i]["作付けID"] || all[i]["作付けID"].trim() === "") {
      unlinked.push(all[i]);
    }
  }
  unlinked.sort(function(a, b) {
    return (b["作業日"] || "").localeCompare(a["作業日"] || "");
  });
  return unlinked.slice(0, limit || 50);
}

/** 作業記録を作付けに紐づけ */
function linkWorkLog(logId, cycleId) {
  var rowNum = findRowById_(SHEET_LOGS, logId);
  if (rowNum === -1) return { success: false, error: "記録ID " + logId + " が見つかりません" };

  // B列（2列目）が作付けID
  getSheet_(SHEET_LOGS).getRange(rowNum, 2).setValue(cycleId);
  return { success: true };
}

/* ============================================================
   CSVインポート
   ============================================================ */

/** レコード配列を一括挿入 */
function importCsvRecords(records) {
  var sheet = getSheet_(SHEET_LOGS);
  var startId = generateNextId_(SHEET_LOGS, "W");
  var startNum = parseInt(startId.substring(1), 10);
  var count = 0;

  for (var i = 0; i < records.length; i++) {
    var r = records[i];
    var id = "W" + ("000" + (startNum + i)).slice(-3);
    sheet.appendRow([
      id,
      r.cycle_id  || "",
      r.work_date || "",
      r.work_type || "その他",
      r.cell_pot  || "",
      r.quantity  || "",
      r.field_id  || "",
      r.row_id    || "",
      r.content   || "",
      r.note      || ""
    ]);
    count++;
  }
  return { success: true, count: count };
}

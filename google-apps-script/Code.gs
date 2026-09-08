const SHEET_NAME = "Weeks";

function doGet(event) {
  const params = event && event.parameter ? event.parameter : {};
  const expectedKey = PropertiesService.getScriptProperties().getProperty("CAREER_APP_KEY");
  if (!expectedKey || params.key !== expectedKey) return respond({ ok: false, error: "Unauthorized" }, params.callback);

  try {
    const sheet = getSheet();
    if (params.action === "load") return respond({ ok: true, weeks: readWeeks(sheet) }, params.callback);
    if (params.action === "save") {
      if (!params.weekStart || !params.data) return respond({ ok: false, error: "Missing week data" }, params.callback);
      saveWeek(sheet, params.weekStart, params.data);
      return respond({ ok: true }, params.callback);
    }
    return respond({ ok: false, error: "Unknown action" }, params.callback);
  } catch (error) {
    return respond({ ok: false, error: error.message }, params.callback);
  }
}

// Run this once from the Apps Script editor to authorize spreadsheet access.
function authorizeSpreadsheetAccess() {
  getSheet();
}

function getSheet() {
  const spreadsheetId = PropertiesService.getScriptProperties().getProperty("SPREADSHEET_ID");
  if (!spreadsheetId) throw new Error("SPREADSHEET_ID is not configured.");
  const spreadsheet = SpreadsheetApp.openById(spreadsheetId);
  let sheet = spreadsheet.getSheetByName(SHEET_NAME);
  if (!sheet) sheet = spreadsheet.insertSheet(SHEET_NAME);
  if (sheet.getLastRow() === 0) sheet.appendRow(["week_start", "data_json", "updated_at"]);
  return sheet;
}

function readWeeks(sheet) {
  const rows = sheet.getDataRange().getValues().slice(1);
  return rows.reduce((weeks, row) => {
    if (row[0] && row[1]) weeks[normalizeWeekStart(row[0])] = JSON.parse(String(row[1]));
    return weeks;
  }, {});
}

function normalizeWeekStart(value) {
  if (value instanceof Date) return Utilities.formatDate(value, "UTC", "yyyy-MM-dd");
  return String(value).slice(0, 10);
}

function saveWeek(sheet, weekStart, data) {
  const rows = sheet.getDataRange().getValues();
  const existingRow = rows.findIndex((row, index) => index > 0 && String(row[0]) === weekStart);
  const values = [weekStart, data, new Date().toISOString()];
  if (existingRow === -1) sheet.appendRow(values);
  else sheet.getRange(existingRow + 1, 1, 1, values.length).setValues([values]);
}

function respond(payload, callback) {
  const json = JSON.stringify(payload).replace(/</g, "\\u003c");
  if (callback && /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(callback)) {
    return ContentService.createTextOutput(`${callback}(${json})`).setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return ContentService.createTextOutput(json).setMimeType(ContentService.MimeType.JSON);
}

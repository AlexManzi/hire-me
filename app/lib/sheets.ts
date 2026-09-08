type SheetResponse<T> = { ok: boolean; weeks?: Record<string, T>; error?: string };

const endpoint = process.env.NEXT_PUBLIC_GOOGLE_SHEETS_ENDPOINT;
const accessKey = process.env.NEXT_PUBLIC_GOOGLE_SHEETS_KEY;

export const isSheetsConfigured = Boolean(endpoint && accessKey);

function request<T>(params: Record<string, string>) {
  return new Promise<SheetResponse<T>>((resolve, reject) => {
    if (!endpoint || !accessKey) { reject(new Error("Google Sheets is not configured.")); return; }
    const callback = `careerSheet_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    const script = document.createElement("script");
    const callbacks = window as unknown as Window & Record<string, (response: SheetResponse<T>) => void>;
    const timeout = window.setTimeout(() => { cleanup(); reject(new Error("Google Sheets did not respond. Check that the Apps Script is deployed as a Web App with access set to anyone with the link.")); }, 10000);
    const cleanup = () => { window.clearTimeout(timeout); delete callbacks[callback]; script.remove(); };
    callbacks[callback] = (response: SheetResponse<T>) => { cleanup(); resolve(response); };
    script.onerror = () => { cleanup(); reject(new Error("Could not reach Google Sheets.")); };
    script.src = `${endpoint}?${new URLSearchParams({ ...params, key: accessKey, callback }).toString()}`;
    document.body.appendChild(script);
  });
}

export async function loadWeeks<T>() {
  const response = await request<T>({ action: "load" });
  if (!response.ok) throw new Error(response.error ?? "Could not load career data.");
  return response.weeks ?? {};
}

export async function saveWeek<T>(weekStart: string, data: T) {
  const response = await request<T>({ action: "save", weekStart, data: JSON.stringify(data) });
  if (!response.ok) throw new Error(response.error ?? "Could not save career data.");
}

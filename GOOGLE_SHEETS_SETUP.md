# Google Sheets persistence setup

This app uses a small Google Apps Script web app as its data endpoint. The Sheet stays private; the deployed page only knows the web-app URL and a routing key.

1. Create a private Google Sheet.
2. Open **Extensions → Apps Script**.
3. Replace the starter code with [`google-apps-script/Code.gs`](./google-apps-script/Code.gs).
4. In Apps Script, open **Project Settings → Script properties** and add:
   - `SPREADSHEET_ID`: the ID between `/d/` and `/edit` in the Sheet URL.
   - `CAREER_APP_KEY`: a long random string.
5. Deploy → **New deployment** → **Web app**.
6. Set **Execute as** to yourself and **Who has access** to anyone with the link.
7. Copy the `/exec` URL into `.env.local` as `NEXT_PUBLIC_GOOGLE_SHEETS_ENDPOINT` and the same key as `NEXT_PUBLIC_GOOGLE_SHEETS_KEY`.
8. Add those two variables to the GitHub Pages build environment.

The key is visible to visitors because GitHub Pages is a client-side app. This is suitable for a personal, low-risk tracker, but it is not a true secret. Do not store passwords, financial information, or other sensitive data in this Sheet. If the endpoint is abused, rotate `CAREER_APP_KEY` in Apps Script and redeploy.

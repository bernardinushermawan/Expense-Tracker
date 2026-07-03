import { JWT } from 'google-auth-library';

const SHEET_ID = '12okkQa5gDIS2R05bvM1yLUIMLUJMDwyXtIlb4diPjk8';
const SHEETS_API = 'https://sheets.googleapis.com/v4/spreadsheets';

function getAuthClient() {
  return new JWT({
    email: process.env.GOOGLE_CLIENT_EMAIL,
    key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
}

async function getAccessToken(): Promise<string> {
  const { token } = await getAuthClient().getAccessToken();
  if (!token) throw new Error('Failed to obtain Google access token');
  return token;
}

let sheetMetaCache: { title: string; sheetId: number } | null = null;

async function getSheetMeta(accessToken: string) {
  if (sheetMetaCache) return sheetMetaCache;
  const res = await fetch(`${SHEETS_API}/${SHEET_ID}?fields=sheets.properties`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error(`Failed to load sheet metadata: ${res.status}`);
  const data = await res.json();
  const props = data.sheets[0].properties;
  sheetMetaCache = { title: props.title, sheetId: props.sheetId };
  return sheetMetaCache;
}

export async function getRows():Promise<Record<string, string>[]> {
  const accessToken = await getAccessToken();
  const { title } = await getSheetMeta(accessToken);

  const res = await fetch(`${SHEETS_API}/${SHEET_ID}/values/${encodeURIComponent(title)}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error(`Failed to read rows: ${res.status}`);
  const data = await res.json();
  const [header, ...rows] = data.values || [];
  if (!header) return [];

  return rows.map((row: string[], i: number) => {
    const record: Record<string, string> = { _rowNumber: String(i + 2) };
    header.forEach((key: string, idx: number) => {
      record[key] = row[idx] ?? '';
    });
    return record;
  });
}

export async function addRow(values: Record<string, string | number>) {
  const accessToken = await getAccessToken();
  const { title } = await getSheetMeta(accessToken);
  const rowValues = [values.ID, values.DATE, values.NAME, values.CATEGORY, values.PRICE];

  const res = await fetch(
    `${SHEETS_API}/${SHEET_ID}/values/${encodeURIComponent(title)}:append?valueInputOption=USER_ENTERED`,
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ values: [rowValues] }),
    }
  );
  if (!res.ok) throw new Error(`Failed to add row: ${res.status}`);
}

export async function updateRow(rowNumber: number, values: Record<string, string | number>) {
  const accessToken = await getAccessToken();
  const { title } = await getSheetMeta(accessToken);
  const rowValues = [values.ID, values.DATE, values.NAME, values.CATEGORY, values.PRICE];
  const range = `${title}!A${rowNumber}:E${rowNumber}`;

  const res = await fetch(
    `${SHEETS_API}/${SHEET_ID}/values/${encodeURIComponent(range)}?valueInputOption=USER_ENTERED`,
    {
      method: 'PUT',
      headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ values: [rowValues] }),
    }
  );
  if (!res.ok) throw new Error(`Failed to update row: ${res.status}`);
}

export async function deleteRow(rowNumber: number) {
  const accessToken = await getAccessToken();
  const { sheetId } = await getSheetMeta(accessToken);

  const res = await fetch(`${SHEETS_API}/${SHEET_ID}:batchUpdate`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      requests: [{
        deleteDimension: {
          range: { sheetId, dimension: 'ROWS', startIndex: rowNumber - 1, endIndex: rowNumber },
        },
      }],
    }),
  });
  if (!res.ok) throw new Error(`Failed to delete row: ${res.status}`);
}

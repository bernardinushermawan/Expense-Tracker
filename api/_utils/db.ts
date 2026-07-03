import { GoogleSpreadsheet} from 'google-spreadsheet';
import { JWT } from 'google-auth-library';

const serviceAccountAuth = new JWT({
    email: process.env.GOOGLE_CLIENT_EMAIL,
    key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const SHEET_ID = '12okkQa5gDIS2R05bvM1yLUIMLUJMDwyXtIlb4diPjk8';

export async function getSheet() {
  const doc = new GoogleSpreadsheet(SHEET_ID, serviceAccountAuth);
  await doc.loadInfo(); 
  return doc.sheetsByIndex[0]; // Returns sheet1
}
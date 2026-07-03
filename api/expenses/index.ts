import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getRows, addRow } from '../_utils/db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method === 'GET') {
      const rows = await getRows();
      return res.status(200).json(rows);
    }

    if (req.method === 'POST') {
      const { date, name, category, price } = req.body;
      const rows = await getRows();

      let new_id = 1;
      if (rows.length > 0) {
        const last_id = Math.max(...rows.map((row: Record<string, string>) => Number(row.ID)));
        new_id = last_id + 1;
      }

      await addRow({ ID: new_id, DATE: date, NAME: name, CATEGORY: category, PRICE: price });
      return res.status(201).json({ message: 'Expenses added successfully' });
    }

    return res.status(405).json({ error: 'Method Not Allowed' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}

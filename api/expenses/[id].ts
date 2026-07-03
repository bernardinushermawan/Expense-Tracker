import { VercelRequest, VercelResponse } from '@vercel/node';
import { getRows, updateRow, deleteRow } from '../_utils/db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { id } = req.query;

  try {
    const rows = await getRows();
    const targetRow = rows.find((row: Record<string, string>) => String(row.ID) === String(id));

    if (!targetRow) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    const rowNumber = Number(targetRow._rowNumber);

    if (req.method === 'PUT') {
      const { date, name, category, price } = req.body;
      await updateRow(rowNumber, {
        ID: targetRow.ID, DATE: date, NAME: name, CATEGORY: category, PRICE: price,
      });
      return res.status(200).json({ message: 'Expenses updated successfully' });
    }

    if (req.method === 'DELETE') {
      await deleteRow(rowNumber);
      return res.status(200).json({ message: 'Expenses deleted successfully' });
    }

    return res.status(405).json({ error: 'Method Not Allowed' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}

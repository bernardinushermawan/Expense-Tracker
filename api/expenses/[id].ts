import { VercelRequest, VercelResponse } from '@vercel/node';
import { getSheet } from '../_utils/db';

export default async function handler(req: VercelRequest, res: VercelResponse) 
{
    const {id} = req.query;

    try{
        const sheet = await getSheet();
        const rows = await sheet.getRows();

        // FIND SPECIFIC ROW BY ID
        const targetRow = rows.find(row => String(row.get('ID')) === String(id));

        if(!targetRow) {
            return res.status(404).json({error: 'Expense not found'});
        }

        // 3. UPDATE EXPENSES
        if(req.method === 'PUT'){
            const {date, name, category, price} = req.body;

            targetRow.set('DATE', date);
            targetRow.set('NAME', name);
            targetRow.set('CATEGORY', category);
            targetRow.set('PRICE', price);

            await targetRow.save();

            return res.status(200).json({message: 'Expenses updated successfully'});
        }

        // 4. DELETE EXPENSES
        if(req.method === 'DELETE'){
            await targetRow.delete();

            return res.status(200).json({message: 'Expenses deleted successfully'});
        }

        return res.status(405).json({error: 'Method Not Allowed'});
    }
    catch(error){
        console.error(error);
        return res.status(500).json({error: error instanceof Error ? error.message : 'Internal Server Error'});
    }
}
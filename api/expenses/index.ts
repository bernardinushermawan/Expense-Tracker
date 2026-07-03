import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSheet } from '../_utils/db.js';

export default async function handler(req: VercelRequest, res: VercelResponse)
{
    try{
        const sheet = await getSheet();

        // 1. GET ALL EXPENSES
        if(req.method === 'GET'){
            const rows = await sheet.getRows();
            const records = rows.map(row => row.toObject());
            return res.status(200).json(records);
        }

        // 2. ADD EXPENSES
        if(req.method === 'POST'){
            const { date, name, category, price } = req.body;
            const rows = await sheet.getRows();

            // GENERATE NEW ID
            let new_id = 1;
            if(rows.length > 0){
                const last_id = Math.max(...rows.map(row => Number(row.get('ID'))));
                new_id = last_id+1;
            }

            await sheet.addRow({
                ID: new_id,
                DATE: date,
                NAME: name,
                CATEGORY: category,
                PRICE: price
            });

            return res.status(201).json({message : 'Expenses added successfully'});
        }
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({error: error instanceof Error ? error.message : 'Internal Server Error'});
    }
    
}

import { useState } from "react";

const Expenses = ({expenses = [], onUpdate, onDelete}) => {

    const [editingID, setEditingID] = useState(null);
    const [editName, setEditName] = useState("");
    const [editCategory, setEditCategory] = useState("");
    const [editPrice, setEditPrice] = useState("");
    const [editDate, setEditDate] = useState("");

    const [isOpen, setIsOpen] = useState(false);
    const categories = ["Food" , "Groceries" , "Transportation" , "Others"];

    const handleSelect = (category) => {
        setIsOpen(false)
        setEditCategory(category)
    }

    const startEditing = (item) => {
        setEditingID(item.ID);
        setEditName(item.NAME);
        setEditCategory(item.CATEGORY);
        setEditPrice(item.PRICE);
        setEditDate(item.DATE);
    };

    const cancelEditing = () => {
        setEditingID(null);
    }

    const saveEditing = (item) => {
        const updateItem = {
            ...item,
            id : item.ID,
            name : editName,
            category : editCategory,
            price : parseFloat(editPrice),
            date : editDate
        }
        onUpdate(updateItem);
        setEditingID(null);
    }

    // grouped your flat spreadsheet data by date
    const groupedExpenses = expenses.reduce((acc,expense)=>{
        const date = expense.DATE;
        const amount = parseFloat(expense.PRICE||0);

        if (!acc[date]) {
            acc[date] = { items:[], dailyTotal:0 }
        }
        acc[date].items.push(expense);
        acc[date].dailyTotal += amount;
        return acc;
    }, {});

    const sortedDates = Object.keys(groupedExpenses).sort((a, b) => new Date(b) - new Date(a));

    return ( 
        <div>
            <div className="expenses-display-list">
                {sortedDates.map((date) => {
                    const group = groupedExpenses[date];

                    return(
                        /* this creates one main box per date */
                        <div className="expense-box" key={date}>
                        <div className="expense-box-header">
                            <p>{date}</p>
                            <p>${group.dailyTotal.toFixed(2)}</p>
                        </div>
                        <hr />
                        
                        {/* loop over each individual item on this specific day*/}

                        {group.items.map((item, index) => {
                            const itemId = item.ID;
                            const isEditing = editingID === itemId;

                            const currentCategory = item.CATEGORY;
                            const currentName = item.NAME;
                            const currentPrice = item.PRICE;

                            if(isEditing){
                                //MODE A: INLINE EDITING INPUTS STRUCTURE
                                return (
                                    <div className="expense-list-row edit-mode-active" key={itemId}>
                                        <div className="expense-list">
                                            <div className="name-category-wraper">

                                                <div className="sorter-container2">
                                                    <div className="header2" onClick={()=>setIsOpen(!isOpen)}>
                                                        {editCategory}
                                                        <span className={`arrow ${isOpen ? 'open' : ''}`}>▼</span>
                                                    </div>

                                                    {isOpen && (
                                                        <div className="dropdown-list">
                                                            {categories.map((e)=>(
                                                                <div className="dropdown-item2" key={e} onClick={()=>handleSelect(e)}>
                                                                    {e}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>

                                                <input 
                                                    type="text"
                                                    className="edit-input"
                                                    id="edit-name"
                                                    placeholder="Name"
                                                    value={editName}
                                                    onChange={(e) => setEditName(e.target.value)} 
                                                />
                                            </div>
                                            

                                            <input 
                                                type="number"
                                                className="edit-input"
                                                value={editPrice}
                                                onChange={(e) => setEditPrice(e.target.value)} 
                                            />
                                        </div>
                                        
                                        <div className="edit-action-wraper">
                                            <button className="btn-save" onClick={()=>saveEditing(item)}>SAVE</button>
                                            <button className="btn-cancel" onClick={cancelEditing}>CANCEL</button>
                                            <button className="btn-delete" onClick={()=>onDelete(itemId)}>DELETE</button>
                                        </div>
                                    </div>
                                );
                            }

                            //MODE B: REGULAR TEXT DISPLAY
                            return(
                                <div className="expense-list" key={itemId}>
                                    <div className="name-category-wraper">
                                        <div className="expense-category">
                                            <p>{currentCategory}</p>                                    
                                        </div>
                                        <div className="expense-name" onClick={()=> startEditing(item)}>
                                            <p>{currentName}</p>
                                        </div>
                                    </div>
                                    
                                    <div className="expense-amount">
                                        <p>${parseFloat(currentPrice).toFixed(2)}</p>
                                    </div>
                                </div>
                            ); 
                        })}
                    </div>
                    )
                })}
                
            </div>
        </div>     
     );
}
 
export default Expenses;
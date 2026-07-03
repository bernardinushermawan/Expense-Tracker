import React, { useState } from 'react';

const InputForm = ({onFetch}) => {
    const[isOpen, setIsOpen] = useState(false);
    const[selectedCategory, setSelectedCategory] = useState("Select Category");

    const[name, setName] = useState('');
    const[date,setDate] = useState('');
    const[price,setPrice] = useState('');

    const categories = ["Food" , "Groceries" , "Transportation" , "Others"];

    const handleSelect = (category) => {
        setSelectedCategory(category);
        setIsOpen(false);
    };

    const handleAddExpenses = async () => {

        if (!name|| !price || !date || selectedCategory==="Selected Category"){
            alert("Please fill in all fields!");
            return;
        }

        // prepare data object exactly as Flask API expects it  
        const newExpense = {
            name : name,
            category : selectedCategory,
            price: parseFloat(price), // ensure amount is a number
            date: date
        };

        // send the POST request to Flask
        try {
            const response = await fetch('/api/expenses',{
                method:'POST',
                headers: {
                    'content-Type' : 'application/json',
                },
                body: JSON.stringify(newExpense),
            });

            if(response.ok){
                const result = await response.json();
                alert(result.message); // "Expenses added successfully"

                // Clear the form after successful submission
                setName('');
                setPrice('');
                setDate('');
                setSelectedCategory('Selected Category');
                onFetch();
            }
            else{
                alert("Failed to add expense");
            }
        }
        catch(error){
            console.error("Error connecting to backend: ", error);
            alert("Error connecting to the server, Is flask running?");
        }
    };

    return ( 
        <div className="parent">
            <div className="input-container">
                <h1>EXPENSES</h1>
                <hr />
                <div className="wraper">
                    <p>Name:     </p>
                    <input 
                        type="text" 
                        placeholder="Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                </div>

                <div className="wraper">
                    <p>Category: </p>
                    <div className="custom-dropdown-container">
                        <div
                            className="dropdown-header"
                            onClick={() => setIsOpen(!isOpen)}
                        >
                            {selectedCategory}
                            <span className={`arrow ${isOpen ? 'open' : ''}`}>▼</span>
                        </div>

                        {isOpen && (
                            <div className="dropdown-list">
                                { categories.map((cat) => (
                                    <div
                                        key = {cat}
                                        className = "dropdown-item"
                                        onClick={()=> handleSelect(cat)}
                                    >
                                       {cat} 
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="wraper">
                    <p>Price: </p>
                    <input 
                        type="number" 
                        placeholder="0.00"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                    />
                </div>

                <div className="wraper">
                    <p>Date: </p>
                    <input 
                        type="date"
                        placeholder="dd/mm/yyyy"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                    />
                </div>

                <button className='addBtn' onClick={handleAddExpenses}>
                    A D D
                </button>
            </div>
        </div>
     );
}
 
export default InputForm;

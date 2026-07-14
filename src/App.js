import InputForm from './InputForm';
import Sorter from './Sorter';
import Expenses from './Expenses';
import { useEffect, useState } from 'react';


function App() {
  const[expenses,setExpenses] = useState([]);
  const[selectedMonth, setSelectedMonth] = useState("All Months");
  const[selectedCategory, setSelectedCategory] = useState("All Categories");
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

const filteredExpenses = expenses.filter(expense => {
    // Check Month Match
    let matchesMonth = true;
    if (selectedMonth !== "All Months" && selectedMonth !== "Select Month") {
      const dateString = expense.DATE;
      if (!dateString) return false;
      const monthNumber = parseInt(dateString.split('-')[1], 10);
      const expenseMonthName = monthNames[monthNumber - 1];
      matchesMonth = (expenseMonthName === selectedMonth);
    }

    // Check Category Match
    let matchesCategory = true;
    if (selectedCategory !== "All Categories" && selectedCategory !== "Select Category") {
      matchesCategory = (expense.CATEGORY === selectedCategory);
    }

    // Item must match both filters
    return matchesMonth && matchesCategory;
  });

  const totalExpenseAmount = filteredExpenses.reduce((sum, expense) => {
    const price = parseFloat(expense.PRICE || 0);
    return sum+price;
  }, 0);

  const fetchExpenses = async() => {
    try {
      const response = await fetch('/api/expenses');
      if(response.ok){
        const data = await response.json();
        setExpenses(data)
      }
    }
    catch(error) {
      console.error("Error connecting to backend: ", error)
    }
  }

  useEffect(() => {
    fetchExpenses();
  }, []);

  // UPDATE FUNCION
  const handleUpdate = async(updatedItem) => {
    try{
      const response = await fetch(`/api/expenses/${updatedItem.id}`,{
        method: 'PUT',
        headers: {'Content-Type' : 'application/json'},
        body: JSON.stringify(updatedItem)
      });

      if(response.ok){
        fetchExpenses();
      }
    }
    catch(error){
      console.error("Failed to update: ", error);
    }
  }

  // DELETE FUNCTION
  const handleDelete = async(itemId) => {
    try{
      const response = await fetch(`/api/expenses/${itemId}`,{
        method: 'DELETE'
      });
      if(response.ok){
        fetchExpenses();
      }
    }
    catch(error){
      console.error("Failed to delete: ", error)
    }
  }

  return (
    <div className="App">
      <InputForm onFetch={fetchExpenses}/>
      <Sorter 
        selectedMonth = {selectedMonth}
        setSelectedMonth = {setSelectedMonth}
        selectedCategory = {selectedCategory}
        setSelectedCategory = {setSelectedCategory}
      />

      <div className="monthly-total-container">
        <h3>
          Total {selectedMonth} ({selectedCategory}): 
          <span> ${totalExpenseAmount.toFixed(2)}</span>
        </h3>
      </div>

      <Expenses 
        expenses={filteredExpenses}
        onUpdate={handleUpdate}
        onDelete={handleDelete}
      />

    </div>
  );
}

export default App;

import { useState } from "react";

//type SFC for new template
const Sorter = ({selectedMonth, setSelectedMonth, selectedCategory, setSelectedCategory}) => {
    const [isOpen1,setIsOpen1] = useState(false);
    const [isOpen2,setIsOpen2] = useState(false);
 
    const months = ["Janury", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const categories2 = ["Food", "Groceries", "Transportation", "Others"];

    const handleSelect1 = (month) => {
        setIsOpen1(false);
        setSelectedMonth(month);
    };

    const handleSelect2 = (category) => {
        setIsOpen2(false);
        setSelectedCategory(category);
    }

    return ( 
        <div>
            <div className="sorter-container">
                <div className="sorter-container2">
                    <div className="header" onClick={()=>setIsOpen1(!isOpen1)}>
                        {selectedMonth}
                        <span className={`arrow ${isOpen1 ? 'open' : ''}`}>▼</span>
                    </div>

                    {isOpen1 &&(
                        <div className="dropdown-list">
                            {months.map((e)=>(
                                <div className="dropdown-item"
                                    key={e}
                                    onClick={()=>handleSelect1(e)}
                                >
                                    {e}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                <div className="sorter-container2">
                    <div className="header" onClick={()=>setIsOpen2(!isOpen2)}>
                        {selectedCategory}
                        <span className={`arrow ${isOpen2 ? 'open' : ''}`}>▼</span>
                    </div>

                    { isOpen2 && (
                        <div className="dropdown-list">
                            {categories2.map((e)=>(
                                <div className="dropdown-item"
                                    key={e}
                                    onClick={()=>handleSelect2(e)}
                                >
                                    {e}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
     );
}
 
export default Sorter;

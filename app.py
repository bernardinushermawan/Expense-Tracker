import gspread
from google.oauth2.service_account import Credentials
from flask import Flask, request, jsonify
from flask_cors import CORS
import time

#-----------------------
# google sheet setup

scopes = [
    "https://www.googleapis.com/auth/spreadsheets"
]
creds = Credentials.from_service_account_file("credentials.JSON", scopes = scopes)
client = gspread.authorize(creds)

sheet_id = "12okkQa5gDIS2R05bvM1yLUIMLUJMDwyXtIlb4diPjk8"
workbook = client.open_by_key(sheet_id)

sheet = workbook.sheet1

#-----------------------
# flask setup

app = Flask(__name__)
CORS(app)       #allow react frontend access

#Helper function to find row by id
def find_row_byId(expense_id):
    records = sheet.get_all_records()

    for index, record in enumerate(records, start=2): # enumerate = loop thorugh a list but keeping the index and value
        if str(record["ID"]) == str(expense_id):
            return index
        
    return None

# 1. get all expenses
@app.route("/expenses", methods=["GET"])
def get_expenses():
    records = sheet.get_all_records()
    return jsonify(records)

# 2. add expenses
@app.route("/expenses", methods=["POST"])
def add_expenses():
    data = request.json

    date = data.get("date")
    name = data.get("name")
    category = data.get("category")
    price = data.get("price")

    records = sheet.get_all_records()

    #generate new id
    if len(records) == 0:
        new_id=1
    else:
        last_id = max(int(record["ID"]) for record in records) 
        new_id = last_id+1
    
    sheet.append_row([new_id,date,name,category,price])

    return jsonify({"message" : "Expenses added successfully"})

# 3. update expenses
# row_number = google sheet row
@app.route("/expenses/<int:id>", methods=["PUT"])
def update_expenses(id):
    row = find_row_byId(id)
    if not row:
        return jsonify({"error" : "Expense not found"}), 404

    data = request.json
    date = data.get("date")
    name = data.get("name")
    category = data.get("category")
    price = data.get("price")

    sheet.update(
        f"B{row}:E{row}",
        [[date,name,category,price]]
    )

    return jsonify({
        "message" : "Expenses updated successfully"
    })

# 4. delete expenses
@app.route("/expenses/<int:expense_id>", methods=["DELETE"])
def delete_expenses(expense_id):
    row = find_row_byId(expense_id)
    if not row:
        return jsonify({"error" : "Expense not found"}), 404
    
    sheet.delete_rows(row)

    return jsonify({
        "message" : "Expenses deleted successfully"
    })

# 5. get available categories
@app.route("/categories", methods=["GET"])
def get_categories():
    categories = [
        "Food",
        "Groceries",
        "Transportation",
        "Shopping",
        "Others"
    ]

    return jsonify(categories)

if __name__ == "__main__":
    app.run(debug=True)
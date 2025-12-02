from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_jwt_extended import (
    JWTManager, create_access_token, jwt_required, get_jwt_identity
)
from pymongo import MongoClient
from bson import ObjectId, errors as bson_errors
import bcrypt
import os
from dotenv import load_dotenv
from datetime import datetime

load_dotenv()

app = Flask(__name__)

# FIXED CORS (allow frontend only, required for JWT requests)
CORS(
    app,
    resources={r"/*": {"origins": "http://localhost:5173"}},
    supports_credentials=True
)

# Required to let OPTIONS preflight succeed
@app.after_request
def add_cors_headers(response):
    response.headers.add("Access-Control-Allow-Headers", "Content-Type,Authorization")
    response.headers.add("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS")
    return response

app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY", "super-secret-key")
jwt = JWTManager(app)

MONGO_URI = os.getenv("MONGO_URI")
DB_NAME = os.getenv("DB_NAME", "expense_db")

client = MongoClient(MONGO_URI)
db = client[DB_NAME]
users_collection = db["users"]
expenses_collection = db["expenses"]
incomes_collection = db["incomes"]


@app.route("/")
def home():
    return jsonify({"message": "Flask backend is running!"}), 200

@app.route("/api/register", methods=["POST"])
def register_user():
    data = request.get_json() or {}
    username = data.get("username")
    password = data.get("password")

    if not username or not password:
        return jsonify({"error": "Missing username or password"}), 400

    if users_collection.find_one({"username": username}):
        return jsonify({"error": "Username already exists"}), 400

    hashed_pw = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt())
    users_collection.insert_one({"username": username, "password": hashed_pw})

    return jsonify({"message": "User registered successfully"}), 201

@app.route("/api/login", methods=["POST"])
def login():
    data = request.get_json() or {}
    username = data.get("username")
    password = data.get("password")

    if not username or not password:
        return jsonify({"error": "Missing username or password"}), 400

    user = users_collection.find_one({"username": username})
    if not user or not bcrypt.checkpw(password.encode("utf-8"), user["password"]):
        return jsonify({"error": "Invalid username or password"}), 401

    token = create_access_token(identity=str(user["_id"]))
    return jsonify({"token": token}), 200

@app.route("/api/profile", methods=["GET"])
@jwt_required()
def profile():
    user_id = get_jwt_identity()
    try:
        user = users_collection.find_one({"_id": ObjectId(user_id)}, {"password": 0})
    except (bson_errors.InvalidId, TypeError):
        return jsonify({"error": "Invalid user id"}), 400

    if not user:
        return jsonify({"error": "User not found"}), 404

    user["_id"] = str(user["_id"])
    return jsonify(user), 200

@app.route("/api/expenses", methods=["POST"])
@jwt_required()
def add_expense():
    data = request.get_json() or {}
    user_id = get_jwt_identity()

    if "amount" not in data or "category" not in data:
        return jsonify({"error": "Missing amount or category"}), 400

    date_value = None
    if "date" in data and data["date"]:
        try:
            date_value = datetime.strptime(data["date"], "%Y-%m-%d")
        except ValueError:
            return jsonify({"error": "Invalid date format. Use YYYY-MM-DD"}), 400

    expense = {
        "amount": float(data["amount"]),
        "category": data["category"],
        "note": data.get("note", ""),
        "date": date_value,
        "user_id": user_id
    }
    result = expenses_collection.insert_one(expense)
    expense["_id"] = str(result.inserted_id)
    return jsonify(expense), 201

@app.route("/api/expenses/<expense_id>", methods=["PUT"])
@jwt_required()
def edit_expense(expense_id):
    user_id = get_jwt_identity()
    data = request.get_json() or {}

    try:
        oid = ObjectId(expense_id)
    except (bson_errors.InvalidId, TypeError):
        return jsonify({"error": "Invalid expense id"}), 400

    expense = expenses_collection.find_one({"_id": oid, "user_id": user_id})
    if not expense:
        return jsonify({"error": "Expense not found"}), 404

    update_fields = {}
    if "amount" in data:
        update_fields["amount"] = float(data["amount"])
    if "category" in data:
        update_fields["category"] = data["category"]
    if "note" in data:
        update_fields["note"] = data["note"]
    if "date" in data:
        if data["date"]:
            try:
                update_fields["date"] = datetime.strptime(data["date"], "%Y-%m-%d")
            except ValueError:
                return jsonify({"error": "Invalid date format. Use YYYY-MM-DD"}), 400
        else:
            update_fields["date"] = None

    if update_fields:
        expenses_collection.update_one({"_id": oid}, {"$set": update_fields})

    updated = expenses_collection.find_one({"_id": oid})
    updated["_id"] = str(updated["_id"])
    return jsonify(updated), 200

@app.route("/api/expenses/<expense_id>", methods=["DELETE"])
@jwt_required()
def delete_expense(expense_id):
    user_id = get_jwt_identity()
    try:
        oid = ObjectId(expense_id)
    except (bson_errors.InvalidId, TypeError):
        return jsonify({"error": "Invalid expense id"}), 400

    result = expenses_collection.delete_one({"_id": oid, "user_id": user_id})
    if result.deleted_count == 0:
        return jsonify({"error": "Expense not found"}), 404
    return jsonify({"message": "Expense deleted"}), 200

@app.route("/api/expenses", methods=["GET"])
@jwt_required()
def get_expenses():
    user_id = get_jwt_identity()
    expenses = list(expenses_collection.find({"user_id": user_id}))
    for e in expenses:
        e["_id"] = str(e["_id"])
    return jsonify(expenses), 200

@app.route("/api/expenses/filter", methods=["GET"])
@jwt_required()
def filter_expenses():
    user_id = get_jwt_identity()
    category = request.args.get("category", "All")
    amount_range = request.args.get("amount", "All")
    start_date = request.args.get("start_date")
    end_date = request.args.get("end_date")
    sort_option = request.args.get("sort", "newest")

    query = {"user_id": user_id}

    if category != "All":
        query["category"] = category

    if amount_range != "All":
        if amount_range == "0-100":
            query["amount"] = {"$gte": 0, "$lte": 100}
        elif amount_range == "100-500":
            query["amount"] = {"$gte": 100, "$lte": 500}
        elif amount_range == "500-1000":
            query["amount"] = {"$gte": 500, "$lte": 1000}
        elif amount_range == "1000+":
            query["amount"] = {"$gte": 1000}

    date_filter = {}
    if start_date:
        try:
            date_filter["$gte"] = datetime.strptime(start_date, "%Y-%m-%d")
        except ValueError:
            return jsonify({"error": "Invalid start_date format"}), 400
    if end_date:
        try:
            date_filter["$lte"] = datetime.strptime(end_date, "%Y-%m-%d")
        except ValueError:
            return jsonify({"error": "Invalid end_date format"}), 400
    if date_filter:
        query["date"] = date_filter

    sort_by = None
    if sort_option == "newest":
        sort_by = [("date", -1)]
    elif sort_option == "oldest":
        sort_by = [("date", 1)]
    elif sort_option == "amount-high":
        sort_by = [("amount", -1)]
    elif sort_option == "amount-low":
        sort_by = [("amount", 1)]

    expenses = list(expenses_collection.find(query).sort(sort_by) if sort_by else expenses_collection.find(query))
    for e in expenses:
        e["_id"] = str(e["_id"])
    return jsonify(expenses), 200

@app.route("/api/incomes", methods=["POST"])
@jwt_required()
def add_income():
    data = request.get_json() or {}
    user_id = get_jwt_identity()

    if "amount" not in data or "category" not in data:
        return jsonify({"error": "Missing amount or category"}), 400

    date_value = None
    if "date" in data and data["date"]:
        try:
            date_value = datetime.strptime(data["date"], "%Y-%m-%d")
        except ValueError:
            return jsonify({"error": "Invalid date format"}), 400

    income = {
        "amount": float(data["amount"]),
        "category": data["category"],
        "note": data.get("note", ""),
        "date": date_value,
        "user_id": user_id
    }
    result = incomes_collection.insert_one(income)
    income["_id"] = str(result.inserted_id)
    return jsonify(income), 201

@app.route("/api/incomes/<income_id>", methods=["PUT"])
@jwt_required()
def edit_income(income_id):
    user_id = get_jwt_identity()
    data = request.get_json() or {}

    try:
        oid = ObjectId(income_id)
    except (bson_errors.InvalidId, TypeError):
        return jsonify({"error": "Invalid income id"}), 400

    income = incomes_collection.find_one({"_id": oid, "user_id": user_id})
    if not income:
        return jsonify({"error": "Income not found"}), 404

    update_fields = {}
    if "amount" in data:
        update_fields["amount"] = float(data["amount"])
    if "category" in data:
        update_fields["category"] = data["category"]
    if "note" in data:
        update_fields["note"] = data["note"]
    if "date" in data:
        if data["date"]:
            try:
                update_fields["date"] = datetime.strptime(data["date"], "%Y-%m-%d")
            except ValueError:
                return jsonify({"error": "Invalid date format"}), 400
        else:
            update_fields["date"] = None

    if update_fields:
        incomes_collection.update_one({"_id": oid}, {"$set": update_fields})

    updated = incomes_collection.find_one({"_id": oid})
    updated["_id"] = str(updated["_id"])
    return jsonify(updated), 200

@app.route("/api/incomes/<income_id>", methods=["DELETE"])
@jwt_required()
def delete_income(income_id):
    user_id = get_jwt_identity()
    try:
        oid = ObjectId(income_id)
    except (bson_errors.InvalidId, TypeError):
        return jsonify({"error": "Invalid income id"}), 400

    result = incomes_collection.delete_one({"_id": oid, "user_id": user_id})
    if result.deleted_count == 0:
        return jsonify({"error": "Income not found"}), 404
    return jsonify({"message": "Income deleted"}), 200

@app.route("/api/incomes", methods=["GET"])
@jwt_required()
def get_incomes():
    user_id = get_jwt_identity()
    incomes = list(incomes_collection.find({"user_id": user_id}))
    for i in incomes:
        i["_id"] = str(i["_id"])
    return jsonify(incomes), 200

@app.route("/api/incomes/filter", methods=["GET"])
@jwt_required()
def filter_incomes():
    user_id = get_jwt_identity()
    category = request.args.get("category", "All")
    amount_range = request.args.get("amount", "All")
    start_date = request.args.get("start_date")
    end_date = request.args.get("end_date")
    sort_option = request.args.get("sort", "newest")

    query = {"user_id": user_id}

    if category != "All":
        query["category"] = category

    if amount_range != "All":
        if amount_range == "0-100":
            query["amount"] = {"$gte": 0, "$lte": 100}
        elif amount_range == "100-500":
            query["amount"] = {"$gte": 100, "$lte": 500}
        elif amount_range == "500-1000":
            query["amount"] = {"$gte": 500, "$lte": 1000}
        elif amount_range == "1000+":
            query["amount"] = {"$gte": 1000}

    date_filter = {}
    if start_date:
        try:
            date_filter["$gte"] = datetime.strptime(start_date, "%Y-%m-%d")
        except ValueError:
            return jsonify({"error": "Invalid start_date format"}), 400
    if end_date:
        try:
            date_filter["$lte"] = datetime.strptime(end_date, "%Y-%m-%d")
        except ValueError:
            return jsonify({"error": "Invalid end_date format"}), 400
    if date_filter:
        query["date"] = date_filter

    sort_by = None
    if sort_option == "newest":
        sort_by = [("date", -1)]
    elif sort_option == "oldest":
        sort_by = [("date", 1)]
    elif sort_option == "amount-high":
        sort_by = [("amount", -1)]
    elif sort_option == "amount-low":
        sort_by = [("amount", 1)]

    incomes = list(incomes_collection.find(query).sort(sort_by) if sort_by else incomes_collection.find(query))
    for i in incomes:
        i["_id"] = str(i["_id"])
    return jsonify(incomes), 200


import pytesseract
from PIL import Image
import tempfile
import subprocess
import json
import os
import re
from datetime import datetime

pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"

FRONTEND_CATEGORIES = ["Food", "Travel", "Bills", "Others"]

def extract_final_total(text: str):
    """
    Extract the final total amount from receipt text.
    Ignore 'subtotal', prefer 'total', 'amount', 'balance'.
    """
    normalized = re.sub(r"[\s,]+", " ", text.lower())

    matches = re.findall(r"(?<!sub)\btotal\b[:\s]*([0-9]+\.[0-9]{2})", normalized)
    if matches:
        return float(matches[-1])  

    matches = re.findall(r"\b(?:amount|balance)\b[:\s]*([0-9]+\.[0-9]{2})", normalized)
    if matches:
        return float(matches[-1])  

    numbers = re.findall(r"[0-9]+\.[0-9]{2}", normalized)
    if numbers:
        return float(max(numbers, key=float))

    return None




def map_category(ai_category: str):
    if not ai_category:
        return "Others"
    ai_category_lower = ai_category.lower()
    if "food" in ai_category_lower or "grocery" in ai_category_lower:
        return "Food"
    if "travel" in ai_category_lower or "taxi" in ai_category_lower or "uber" in ai_category_lower:
        return "Travel"
    if "bill" in ai_category_lower or "electric" in ai_category_lower or "internet" in ai_category_lower:
        return "Bills"
    return "Others"

def parse_date(date_str: str):
    """Convert human-readable date to YYYY-MM-DD"""
    if not date_str:
        return None
    for fmt in ("%Y-%m-%d", "%B %d, %Y", "%m/%d/%Y", "%m/%d/%y"):
        try:
            dt = datetime.strptime(date_str, fmt)
            return dt.strftime("%Y-%m-%d")
        except:
            continue
    return None

def extract_amount(text: str):
    """
    Extract the total amount from receipt text.
    Prefer numbers that come after keywords like 'total', 'amount', 'balance'.
    Fallback to the largest number if none found.
    """
    total_patterns = [
        r"(?:total|amount|balance)[^\d]*(\d+\.\d{2})",
        r"(\d+\.\d{2})\s*(?:total|amount|balance)"
    ]
    for pattern in total_patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            try:
                return float(match.group(1))
            except:
                continue

    matches = re.findall(r"\d+\.\d{2}", text)
    if matches:
        return float(max(matches, key=lambda x: float(x)))

    return None


@app.route("/api/extract", methods=["POST"])
@jwt_required()
def extract_bill():
    if 'file' not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "Empty filename"}), 400

    with tempfile.NamedTemporaryFile(delete=False, suffix=".png") as temp_file:
        file.save(temp_file.name)
        temp_path = temp_file.name

    try:
        text = pytesseract.image_to_string(Image.open(temp_path))
        text = re.sub(r"\s+", " ", text).strip()

        extracted_json = None
        try:
            prompt = f"""
You are an AI that extracts structured info from bills.
Return JSON ONLY with keys: amount, date, category, note.
- amount: total number only (like 6.50)
- date: in YYYY-MM-DD format (convert month names)
- category: one of Food, Travel, Bills, Others
- note: store name or short description only
If unknown, use null for amount/date/note, Others for category.
Bill text:
{text}
"""
            OLLAMA_PATH = r"C:\Users\Admin\AppData\Local\Programs\Ollama\ollama.exe"

            result = subprocess.run(
                [OLLAMA_PATH, "run", "llama3", prompt],
                capture_output=True, text=True, timeout=15
            )
            ai_output = result.stdout.strip()
            extracted_json = json.loads(ai_output)
        except:
            extracted_json = None

        if not extracted_json:
            extracted_json = {
                "amount": extract_amount(text),
                "date": None,
                "category": "Others",
                "note": text[:50]
            }
            date_match = re.search(r"(\d{1,2}/\d{1,2}/\d{2,4})", text)
            if not date_match:
                date_match = re.search(r"([A-Za-z]+ \d{1,2}, \d{4})", text)
            if date_match:
                extracted_json["date"] = parse_date(date_match.group())


        extracted_json["amount"] = extract_final_total(text)
        


        if "date" in extracted_json:
            extracted_json["date"] = parse_date(extracted_json["date"])
        else:
            extracted_json["date"] = None

        if "category" in extracted_json:
            extracted_json["category"] = map_category(extracted_json["category"])
        else:
            extracted_json["category"] = "Others"

        if "note" not in extracted_json or not extracted_json["note"]:
            extracted_json["note"] = text[:50]

    except subprocess.TimeoutExpired:
        extracted_json = {"error": "AI extraction timed out", "raw_text": text}
    except FileNotFoundError:
        extracted_json = {"error": "Ollama CLI not found", "raw_text": text}
    except Exception as e:
        extracted_json = {"error": str(e), "raw_text": text}
    finally:
        try:
            os.remove(temp_path)
        except:
            pass

    return jsonify(extracted_json), 200
@app.route("/api/summary/period", methods=["GET"])
@jwt_required()
def summary_period():
    user_id = get_jwt_identity()
    start_date = request.args.get("start_date")
    end_date = request.args.get("end_date")

    # Validate date inputs
    date_query = {}
    if start_date:
        try:
            date_query["$gte"] = datetime.strptime(start_date, "%Y-%m-%d")
        except ValueError:
            return jsonify({"error": "Invalid start_date format. Use YYYY-MM-DD"}), 400

    if end_date:
        try:
            date_query["$lte"] = datetime.strptime(end_date, "%Y-%m-%d")
        except ValueError:
            return jsonify({"error": "Invalid end_date format. Use YYYY-MM-DD"}), 400

    # Base query for both expenses and incomes
    query = {"user_id": user_id}
    if date_query:
        query["date"] = date_query

    # Fetch all expenses
    expenses = list(expenses_collection.find(query))
    for e in expenses:
        e["_id"] = str(e["_id"])

    # Fetch all incomes
    incomes = list(incomes_collection.find(query))
    for i in incomes:
        i["_id"] = str(i["_id"])

    # Compute totals for each category
    category_totals = {
        "Food": 0.0,
        "Travel": 0.0,
        "Bills": 0.0,
        "Others": 0.0
    }

    for e in expenses:
        cat = e.get("category", "Others")
        amount = float(e.get("amount", 0))
        if cat not in category_totals:
            cat = "Others"
        category_totals[cat] += amount

    return jsonify({
        "expenses": expenses,
        "incomes": incomes,
        "expense_category_totals": category_totals
    }), 200




if __name__ == "__main__":
    app.run(debug=True)

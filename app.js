const incomeCategories = ["PENSION", "Salary", "RENT", "FD Interest", "Other"];
const expenseCategories = {
    "KSFE Chitty": [],
    "BOI CAR LOAN": [],
    "Credit Bill Payment": ["SBI 494", "ICICI 002", "ICICI 007"],
    "Petrol": [],
    "Grocery/Vegetables": [],
    "Bakery": [],
    "Eating out": [],
    "Mobile Recharge": ["Sanal", "Maya", "Chaachi"],
    "FTTH": [],
    "Electricity Bill": [],
    "Hospital & Medicine": [],
    "Subscriptions": ["Amazon Prime", "Youtube", "AppleMusic"],
    "Newspaper": [],
    "Culture": [],
    "Travel": [],
    "Other": []
};
const paymentModes = ["Cash", "Gpay SBI", "GPay Rupay", "ICICI 002", "ICICI 007", "SBI 474"];

const typeSelect = document.getElementById("type");
const categorySelect = document.getElementById("category");
const subcategorySelect = document.getElementById("subcategory");
const subcategoryLabel = document.getElementById("subcategoryLabel");
const paymentModeSelect = document.getElementById("paymentMode");

function populateDropdown(select, options) {
    select.innerHTML = "";
    options.forEach(opt => {
        const option = document.createElement("option");
        option.value = opt;
        option.textContent = opt;
        select.appendChild(option);
    });
}

function handleTypeChange() {
    const type = typeSelect.value;
    if (type === "Income") {
        populateDropdown(categorySelect, incomeCategories);
        subcategoryLabel.style.display = "none";
    } else {
        populateDropdown(categorySelect, Object.keys(expenseCategories));
        handleCategoryChange();
    }
}

function handleCategoryChange() {
    const selectedCategory = categorySelect.value;
    const subcategories = expenseCategories[selectedCategory];
    if (subcategories && subcategories.length > 0) {
        populateDropdown(subcategorySelect, subcategories);
        subcategoryLabel.style.display = "block";
    } else {
        subcategoryLabel.style.display = "none";
    }
}

function init() {
    populateDropdown(paymentModeSelect, paymentModes);
    handleTypeChange();
    typeSelect.addEventListener("change", handleTypeChange);
    categorySelect.addEventListener("change", handleCategoryChange);

    document.getElementById("entryForm").addEventListener("submit", function(e) {
        e.preventDefault();
        const payload = {
            date: document.getElementById("date").value,
            type: typeSelect.value,
            category: categorySelect.value,
            subcategory: subcategoryLabel.style.display === "block" ? subcategorySelect.value : "",
            amount: document.getElementById("amount").value,
            mode: paymentModeSelect.value
        };

        fetch("https://script.google.com/macros/s/AKfycbzSqC9QAyXhbhBVU6c07EcnTIJsy51Q1BL1Ss1WzfLvR0jf33omqAUHszrBvdwottlyEg/exec", {
            method: "POST",
            body: JSON.stringify(payload),
            headers: {
                "Content-Type": "application/json"
            }
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                alert("Entry saved to Google Sheet ✅");
            } else {
                alert("Failed to save entry.");
            }
        })
        .catch(err => {
            alert("Error occurred: " + err);
        });
    });

    fetch("https://script.google.com/macros/s/AKfycbzSqC9QAyXhbhBVU6c07EcnTIJsy51Q1BL1Ss1WzfLvR0jf33omqAUHszrBvdwottlyEg/exec")
        .then(res => res.json())
        .then(data => drawChart(data))
        .catch(err => console.error("Error loading chart data:", err));
}

function drawChart(data) {
    const ctx = document.getElementById("expenseChart").getContext("2d");
    const labels = [];
    const values = [];

    const totals = {};

    data.forEach(row => {
        if (row.type === "Expense") {
            const cat = row.category;
            totals[cat] = (totals[cat] || 0) + parseFloat(row.amount);
        }
    });

    for (const [key, val] of Object.entries(totals)) {
        labels.push(key);
        values.push(val);
    }

    new Chart(ctx, {
        type: "bar",
        data: {
            labels: labels,
            datasets: [{
                label: "Expenses by Category (₹)",
                data: values,
                backgroundColor: "rgba(75, 192, 192, 0.6)",
                borderColor: "rgba(75, 192, 192, 1)",
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: { beginAtZero: true }
            }
        }
    });
}

async function generatePDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    doc.text("Money Manager Monthly Report", 20, 20);
    doc.text("Charts not embedded in this sample", 20, 30);
    doc.save("MoneyManagerReport.pdf");
}

document.addEventListener("DOMContentLoaded", init);

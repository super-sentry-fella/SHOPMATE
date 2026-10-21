/* ==========================================
   SMART TILL SELF CHECKOUT SYSTEM
   DEMO VERSION
========================================== */

const CONFIG = {
    currency: "AED",
    taxRate: 0.05,
    staffPin: "1234"
};

let basket = JSON.parse(localStorage.getItem("basket")) || [];
let transactions =
    JSON.parse(localStorage.getItem("transactions")) || [];

let selectedPaymentMethod = "";
let currentReceipt = null;

/* ==========================================
   PRODUCT CATALOGUE
========================================== */

const products = [
{
id:1,
barcode:"629100100001",
name:"Fresh Milk 1L",
category:"Groceries",
price:850,
stock:50,
image:"🥛"
},
{
id:2,
barcode:"629100100002",
name:"Brown Bread",
category:"Groceries",
price:650,
stock:70,
image:"🍞"
},
{
id:3,
barcode:"629100100003",
name:"Orange Juice",
category:"Drinks",
price:1200,
stock:40,
image:"🧃"
},
{
id:4,
barcode:"629100100004",
name:"Mineral Water",
category:"Drinks",
price:150,
stock:200,
image:"💧"
},
{
id:5,
barcode:"629100100005",
name:"Potato Chips",
category:"Snacks",
price:500,
stock:90,
image:"🥔"
},
{
id:6,
barcode:"629100100006",
name:"Chocolate Bar",
category:"Snacks",
price:400,
stock:100,
image:"🍫"
},
{
id:7,
barcode:"629100100007",
name:"Bananas",
category:"Fresh Produce",
price:700,
stock:80,
image:"🍌"
},
{
id:8,
barcode:"629100100008",
name:"Apples",
category:"Fresh Produce",
price:950,
stock:80,
image:"🍎"
},
{
id:9,
barcode:"629100100009",
name:"Tomatoes",
category:"Fresh Produce",
price:650,
stock:60,
image:"🍅"
},
{
id:10,
barcode:"629100100010",
name:"Dish Soap",
category:"Household",
price:1450,
stock:60,
image:"🧴"
},
{
id:11,
barcode:"629100100011",
name:"Laundry Detergent",
category:"Household",
price:3299,
stock:30,
image:"🫧"
},
{
id:12,
barcode:"629100100012",
name:"Paper Towels",
category:"Household",
price:1199,
stock:45,
image:"🧻"
},
{
id:13,
barcode:"629100100013",
name:"Shampoo",
category:"Personal Care",
price:1899,
stock:55,
image:"🧴"
},
{
id:14,
barcode:"629100100014",
name:"Toothpaste",
category:"Personal Care",
price:999,
stock:75,
image:"🪥"
},
{
id:15,
barcode:"629100100015",
name:"Hand Wash",
category:"Personal Care",
price:899,
stock:80,
image:"🧼"
}
];

/* ==========================================
   HELPERS
========================================== */

function saveBasket() {
    localStorage.setItem(
        "basket",
        JSON.stringify(basket)
    );
}

function saveTransactions() {
    localStorage.setItem(
        "transactions",
        JSON.stringify(transactions)
    );
}

function money(fils) {
    return `${CONFIG.currency} ${(fils/100).toFixed(2)}`;
}

function showToast(message) {

    const toast = document.getElementById("toast");

    toast.textContent = message;

    toast.classList.add("show");

    setTimeout(()=>{
        toast.classList.remove("show");
    },3000);
}

function transactionId() {
    return "TXN-" +
        Date.now().toString().slice(-8);
}

/* ==========================================
   SCREEN MANAGEMENT
========================================== */

function showScreen(screenId){

    document
        .querySelectorAll(".screen")
        .forEach(screen=>{
            screen.classList.remove("active-screen");
        });

    document
        .getElementById(screenId)
        .classList.add("active-screen");
}

function setStep(step){

    document
        .querySelectorAll(".progress-step")
        .forEach(item=>{
            item.classList.remove("active");
        });

    const target =
        document.querySelector(
            `[data-step="${step}"]`
        );

    if(target) target.classList.add("active");
}

/* ==========================================
   PRODUCT GRID
========================================== */

function renderProducts(){

    const search =
    document.getElementById("searchInput")
        .value.toLowerCase();

    const category =
    document.getElementById("categoryFilter")
        .value;

    const grid =
    document.getElementById("productGrid");

    grid.innerHTML = "";

    const filtered =
    products.filter(product=>{

        const matchesSearch =
        product.name.toLowerCase()
            .includes(search);

        const matchesCategory =
        category==="all" ||
        product.category===category;

        return matchesSearch &&
               matchesCategory;
    });

    filtered.forEach(product=>{

        const card =
        document.createElement("div");

        card.className = "product-card";

        card.innerHTML = `
        <div class="product-image">
            ${product.image}
        </div>

        <div class="product-content">

            <h4>${product.name}</h4>

            <div class="product-code">
                ${product.barcode}
            </div>

            <div>${product.category}</div>

            <div class="product-price">
                ${money(product.price)}
            </div>

            <button
            class="primary-btn add-product"
            data-id="${product.id}">
                Add To Basket
            </button>

        </div>
        `;

        grid.appendChild(card);
    });

    document
    .querySelectorAll(".add-product")
    .forEach(btn=>{
        btn.onclick = ()=>{
            addToBasket(
                Number(btn.dataset.id)
            );
        };
    });
}

/* ==========================================
   BASKET
========================================== */

function addToBasket(productId){

    const product =
    products.find(p=>p.id===productId);

    if(!product){
        showToast("Product not found");
        return;
    }

    const existing =
    basket.find(i=>i.id===productId);

    if(existing){
        existing.qty++;
    } else {

        basket.push({
            ...product,
            qty:1
        });
    }

    saveBasket();

    renderBasket();

    showToast(`${product.name} added`);
}

function scanProduct(){

    const code =
    document
    .getElementById("barcodeInput")
    .value.trim();

    if(!code){
        showToast("Enter barcode");
        return;
    }

    const product =
    products.find(
        p=>p.barcode===code
    );

    if(!product){

        showToast(
            "Unknown barcode"
        );

        return;
    }

    addToBasket(product.id);

    document
        .getElementById("barcodeInput")
        .value = "";
}

function removeItem(id){

    basket =
    basket.filter(i=>i.id!==id);

    saveBasket();

    renderBasket();
}

function increaseQty(id){

    const item =
    basket.find(i=>i.id===id);

    item.qty++;

    saveBasket();

    renderBasket();
}

function decreaseQty(id){

    const item =
    basket.find(i=>i.id===id);

    item.qty--;

    if(item.qty<=0){
        removeItem(id);
        return;
    }

    saveBasket();

    renderBasket();
}

/* ==========================================
   PROMOTIONS
========================================== */

function calculateDiscount(){

    let discount = 0;

    basket.forEach(item=>{

        if(item.category==="Snacks"){
            discount +=
            Math.round(
            item.price *
            item.qty *
            0.10
            );
        }

        if(
            item.name==="Mineral Water" &&
            item.qty>=3
        ){

            discount += item.price;
        }

    });

    return discount;
}

/* ==========================================
   TOTALS
========================================== */

function calculateTotals(){

    const subtotal =
    basket.reduce(
        (sum,item)=>
        sum+(item.price*item.qty),0
    );

    const discount =
    calculateDiscount();

    const taxable =
    subtotal-discount;

    const tax =
    Math.round(
    taxable*CONFIG.taxRate
    );

    const total =
    taxable+tax;

    return {
        subtotal,
        discount,
        tax,
        total
    };
}

/* ==========================================
   BASKET UI
========================================== */

function renderBasket(){

    const container =
    document.getElementById(
        "basketItems"
    );

    container.innerHTML = "";

    basket.forEach(item=>{

        const div =
        document.createElement("div");

        div.className =
        "basket-item";

        div.innerHTML = `
        <strong>${item.name}</strong>

        <div>
        ${money(item.price)}
        </div>

        <div>
        Qty: ${item.qty}
        </div>

        <div>
        ${money(
            item.price*item.qty
        )}
        </div>

        <div class="qty-controls">

        <button
        onclick="decreaseQty(${item.id})">
        -
        </button>

        <button
        onclick="increaseQty(${item.id})">
        +
        </button>

        <button
        onclick="removeItem(${item.id})">
        Remove
        </button>

        </div>
        `;

        container.appendChild(div);
    });

    const totals =
    calculateTotals();

    const qty =
    basket.reduce(
       (s,i)=>s+i.qty,0
    );

    document
    .getElementById("distinctItems")
    .textContent =
    basket.length;

    document
    .getElementById("totalQty")
    .textContent =
    qty;

    document
    .getElementById("subtotal")
    .textContent =
    money(totals.subtotal);

    document
    .getElementById("discount")
    .textContent =
    money(totals.discount);

    document
    .getElementById("tax")
    .textContent =
    money(totals.tax);

    document
    .getElementById("grandTotal")
    .textContent =
    money(totals.total);
}

/* ==========================================
   CHECKOUT
========================================== */

function startCheckout(){

    if(basket.length===0){

        showToast(
        "Basket is empty"
        );

        return;
    }

    showScreen("paymentScreen");

    setStep(4);
}

function renderPaymentArea(method){

    selectedPaymentMethod =
    method;

    const area =
    document.getElementById(
        "paymentArea"
    );

    const total =
    calculateTotals().total;

    if(method==="Cash"){

        area.innerHTML = `
        <h3>Cash Payment</h3>

        <input
        type="number"
        id="cashTendered"
        placeholder="Tendered Amount">

        <button
        id="cashPayBtn"
        class="success-btn">
        Complete Payment
        </button>
        `;

        document
        .getElementById(
        "cashPayBtn"
        )
        .onclick = ()=>{

            const amount =
            parseFloat(
                document
                .getElementById(
                "cashTendered"
                ).value
            );

            const fils =
            Math.round(
            amount*100
            );

            if(fils<total){

                showToast(
                "Insufficient cash"
                );

                return;
            }

            completePayment(
                method,
                fils-total
            );
        };

    } else {

        area.innerHTML = `
        <h3>${method}</h3>

        <p>
        Demo Payment Gateway
        </p>

        <button
        id="paymentSuccess"
        class="success-btn">
        Approve Payment
        </button>

        <button
        id="paymentFail"
        class="danger-btn">
        Decline Payment
        </button>
        `;

        document
        .getElementById(
        "paymentSuccess")
        .onclick=()=>{

            completePayment(
            method,
            0
            );
        };

        document
        .getElementById(
        "paymentFail")
        .onclick=()=>{

            showToast(
            "Payment Declined"
            );
        };
    }
}

/* ==========================================
   COMPLETE PAYMENT
========================================== */

function completePayment(
method,
change
){

    const totals =
    calculateTotals();

    const receipt = {

        id:transactionId(),

        date:
        new Date()
        .toLocaleString(),

        paymentMethod:method,

        items:[...basket],

        subtotal:
        totals.subtotal,

        discount:
        totals.discount,

        tax:
        totals.tax,

        total:
        totals.total,

        change
    };

    transactions.push(receipt);

    saveTransactions();

    currentReceipt = receipt;

    renderReceipt(receipt);

    basket=[];

    saveBasket();

    renderBasket();

    showScreen(
    "receiptScreen"
    );

    setStep(5);

    loadDashboard();
}

/* ==========================================
   RECEIPT
========================================== */

function renderReceipt(r){

    const receipt =
    document.getElementById(
        "receiptContent"
    );

    receipt.innerHTML = `
    <h2>SMART TILL</h2>

    <p>Demo Store Address</p>

    <hr>

    <p>
    Transaction:
    ${r.id}
    </p>

    <p>
    ${r.date}
    </p>

    <hr>

    ${r.items.map(item=>`
       <div>
       ${item.name}
       x${item.qty}
       =
       ${money(item.price*item.qty)}
       </div>
    `).join("")}

    <hr>

    <div>
    Subtotal:
    ${money(r.subtotal)}
    </div>

    <div>
    Discount:
    ${money(r.discount)}
    </div>

    <div>
    Tax:
    ${money(r.tax)}
    </div>

    <h3>
    Total:
    ${money(r.total)}
    </h3>

    <div>
    Payment:
    ${r.paymentMethod}
    </div>

    <div>
    Change:
    ${money(r.change)}
    </div>

    <hr>

    <strong>
    Thank you for shopping
    </strong>
    `;
}

/* ==========================================
   STAFF DASHBOARD
========================================== */

function loadDashboard(){

    const sales =
    transactions.reduce(
        (sum,t)=>
        sum+t.total,0
    );

    document
    .getElementById(
    "transactionCount"
    )
    .textContent =
    transactions.length;

    document
    .getElementById(
    "salesTotal")
    .textContent =
    money(sales);

    const recent =
    document
    .getElementById(
    "recentTransactions"
    );

    recent.innerHTML =
    transactions
    .slice()
    .reverse()
    .map(t=>`
    <div>
        ${t.id}
        -
        ${money(t.total)}
        -
        ${t.paymentMethod}
    </div>
    `)
    .join("");
}

/* ==========================================
   HELP PANEL
========================================== */

function assistance(msg){

    showToast(msg);
}

/* ==========================================
   EVENTS
========================================== */

document
.getElementById(
"startShoppingBtn"
)
.addEventListener("click",()=>{

    showScreen(
    "shoppingScreen"
    );

    setStep(2);
});

document
.getElementById("scanBtn")
.addEventListener(
"click",
scanProduct
);

document
.getElementById(
"checkoutBtn"
)
.addEventListener(
"click",
startCheckout
);

document
.getElementById(
"searchInput"
)
.addEventListener(
"input",
renderProducts
);

document
.getElementById(
"categoryFilter"
)
.addEventListener(
"change",
renderProducts
);

document
.getElementById(
"clearBasketBtn"
)
.onclick = ()=>{

    if(
    confirm(
    "Clear basket?"
    )
    ){

        basket=[];

        saveBasket();

        renderBasket();
    }
};

document
.querySelectorAll(".key")
.forEach(key=>{

    key.addEventListener(
    "click",
    ()=>{

        document
        .getElementById(
        "barcodeInput"
        )
        .value +=
        key.textContent;

    });

});

document
.getElementById(
"clearKey"
)
.onclick=()=>{

document
.getElementById(
"barcodeInput"
).value="";
};

document
.getElementById(
"backKey"
)
.onclick=()=>{

const input=
document
.getElementById(
"barcodeInput"
);

input.value=
input.value.slice(0,-1);

};

document
.querySelectorAll(
".payment-method"
)
.forEach(btn=>{

btn.onclick=()=>{

renderPaymentArea(
btn.dataset.method
);

};

});

document
.getElementById(
"backToBasket"
)
.onclick=()=>{

showScreen(
"shoppingScreen"
);

setStep(2);

};

document
.getElementById(
"printReceiptBtn"
)
.onclick=()=>window.print();

document
.getElementById(
"newTransactionBtn"
)
.onclick=()=>{

showScreen(
"welcomeScreen"
);

setStep(1);

};

document
.getElementById(
"helpButton"
)
.onclick=()=>{

document
.getElementById(
"helpModal"
)
.style.display="flex";

};

document
.getElementById(
"closeHelpModal"
)
.onclick=()=>{

document
.getElementById(
"helpModal"
)
.style.display="none";

};

document
.getElementById(
"requestHelpBtn"
)
.onclick=()=>assistance(
"Staff assistance requested (demo)"
);

document
.getElementById(
"scanIssueBtn"
)
.onclick=()=>assistance(
"Scanning issue reported"
);

document
.getElementById(
"paymentIssueBtn"
)
.onclick=()=>assistance(
"Payment issue reported"
);

document
.getElementById(
"cancelHelpBtn"
)
.onclick=()=>assistance(
"Help request cancelled"
);

document
.getElementById(
"openStaffDashboard"
)
.onclick=()=>{

document
.getElementById(
"staffModal"
)
.style.display="flex";

};

document
.getElementById(
"closeStaffPanel"
)
.onclick=()=>{

document
.getElementById(
"staffModal"
)
.style.display="none";

};

document
.getElementById(
"staffLoginBtn"
)
.onclick=()=>{

const pin =
document
.getElementById(
"staffPin"
)
.value;

if(pin===CONFIG.staffPin){

document
.getElementById(
"staffLogin"
)
.classList.add(
"hidden"
);

document
.getElementById(
"staffDashboard"
)
.classList.remove(
"hidden"
);

loadDashboard();

} else {

showToast(
"Incorrect PIN"
);

}

};

document
.getElementById(
"resetDataBtn"
)
.onclick=()=>{

if(confirm(
"Delete demo transactions?"
)){

transactions=[];

basket=[];

localStorage.removeItem(
"transactions"
);

localStorage.removeItem(
"basket"
);

renderBasket();

loadDashboard();

showToast(
"Demo data reset"
);

}

};

/* ==========================================
   INIT
========================================== */

renderProducts();

renderBasket();

loadDashboard();
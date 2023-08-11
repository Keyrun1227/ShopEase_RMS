let products = [];
let cartProducts = [];
let promocode = 0;
let totalPrice = 0;
let subTotal = 0;
let gstTotal = 0;
let grandTotal = 0;

class ProductInfo {
  constructor(product) {
    this.id = product.id;
    this.productId = product.productId;
    this.name = product.name;
    this.brand = product.brand;
    this.available_quantity = product.available_quantity;
    this.normal_price = product.normal_price;
    this.discount_price = parseFloat(product.discount_price);
    this.quantity = 1;
    this.total = this.discount_price * this.quantity;
  }

  toMap() {
    return {
      id: this.id,
      productId: this.productId,
      name: this.name,
      brand: this.brand,
      available_quantity: this.available_quantity,
      normal_price: this.normal_price,
      discount_price: this.discount_price.toFixed(2),
      quantity: this.quantity,
      total: this.total.toFixed(2),
    };
  }
}

const productsRef = db.collection("products");
const purchaseRef = db.collection("purchases");

productsRef.get().then((snapshot) => {
  snapshot.forEach((doc) => {
    var id = doc.id;
    var product = doc.data();

    products.push({ id: id, ...product });
  });
});

document.addEventListener("DOMContentLoaded", function () {
  const searchButton = document.getElementById("search-button");
  const productSearchBar = document.getElementById("product-search-bar");
  searchButton.addEventListener("click", searchAndAddProduct);
  productSearchBar.addEventListener("keyup", function(event) {
    if (event.key === "Enter") {
      searchAndAddProduct();
      productSearchBar.value = ""; // Clear the text field
    }
  });
  
});



function searchAndAddProduct() {
  const productId = document.getElementById("product-search-bar").value.trim();
  if (productId !== "") {
    const existProduct = cartProducts.find((item) => item.productId === productId);
    const foundProduct = products.find((item) => item.productId === productId);
    if (existProduct) {
      if (existProduct.available_quantity > existProduct.quantity) {
        existProduct.quantity += 1;
      } else {
        alert("Product out of stock.");
      }
    } else if (foundProduct) {
      if (foundProduct.available_quantity > 0) {
        cartProducts.push(new ProductInfo(foundProduct));
      } else {
        alert("Product out of stock.");
      }
    } else {
      alert("No product found!");
    }

  }


  updateCartUI();
  document.getElementById("product-search-bar").value="";
}

async function checkout() {
  if (cartProducts.length === 0) {
    alert("Your cart is empty.");
    return;
  }

  customerName = document.querySelector("#customer-name").value;
  customerPhoneNumber = document.querySelector("#customer-phone-number").value;
  if (!customerName || !customerPhoneNumber) {
    alert("Please enter customer name and phone number.");
    return;
  }

  cartProducts.forEach((product) => {
    productsRef.doc(product.id).update({ available_quantity: firebase.firestore.FieldValue.increment(-product.quantity) });
  });

  const docRef = await purchaseRef.add({
    customerName: customerName,
    customerPhoneNumber: customerPhoneNumber,
    cartProducts: cartProducts.map((item) => item.toMap()),
    totalPrice: totalPrice,
    promocode: promocode,
    subTotal: subTotal,
    gstTotal: gstTotal,
    grandTotal: grandTotal,
  });


  // window.location.href = `billing.html?id=${docRef.id}`;
  const modal = document.getElementById("billingModal");
  modal.style.display = "block";
  retrieveBillingInfo(docRef.id);
}

let totalqty = 0;
async function retrieveBillingInfo(id) {
  const $tableBody = document.getElementById("table-body"); // Define $tableBody here
  

  $tableBody.innerHTML = ''; 
  const docRef = db.collection("purchases").doc(id);
  const doc = await docRef.get();
  if (doc.exists) {
    const purchaseData = doc.data();
    const items = purchaseData.cartProducts;

    items.forEach((item) => {
      console.log(item); // Check each item in the loop
      const $row = document.createElement("tr");
      const totalAsNumber = parseFloat(item.total);
      totalqty +=item.quantity;
      $row.innerHTML = `
        <td class="quantity">${item.quantity}</td>
        <td class="description">${item.name}</td>
        <td class="price">Rs ${item.total}</td>
      `;
      $tableBody.appendChild($row);
    });

    const $totalRow = document.createElement("tr");
    $totalRow.innerHTML = `
      <td class="quantity">Qty: ${totalqty}</td>
      <td class="description">items: ${purchaseData.cartProducts.length}</td>
      <td class="price">Amt:Rs ${purchaseData.subTotal}</td>
    `;
    $tableBody.appendChild($totalRow);

    const $totalRow2 = document.createElement("tr");
    $totalRow2.innerHTML = `
      <td class="quantity"></td>
      <td class="description"></td>
      <td class="price">Gst: ${purchaseData.gstTotal.toFixed(2)}</td>
    `;
    $tableBody.appendChild($totalRow2);

    const $totalRow3 = document.createElement("tr");
    $totalRow3.innerHTML = `
      <td class="quantity"></td>
      <td class="description"></td>
      <td class="price">Total:Rs ${purchaseData.grandTotal}</td>
    `;
    $tableBody.appendChild($totalRow3);

    const $customerName = document.createElement("span");

    $customerName.textContent = `Name: ${purchaseData.customerName}`;
    const $phone = document.createElement("span");
    $phone.textContent = ` Phone: ${purchaseData.customerPhoneNumber}`;

    const $centeredParagraph = document.querySelector(".centered");
    $centeredParagraph.appendChild($customerName);
    $centeredParagraph.appendChild($phone);
    const modal = document.getElementById("billingModal");
    modal.style.display = "block";
  } else {
    console.log("No such document!");
  }
}

function closeModal() {
  const modal = document.getElementById("billingModal");
  modal.style.display = "none";
  
  // Reset cartProducts and update UI
  cartProducts = [];
  updateCartUI();

  // Clear input fields
  document.querySelector('#customer-name').value = "";
  document.querySelector('#customer-phone-number').value = "";
  document.getElementById('promocode').value = "";

  // Reset summary section values
  document.getElementById("totalB").textContent = "₹0.00";
  document.getElementById("totalP").textContent = "₹0.00";
  document.getElementById("totalG").textContent = "₹0.00";
  document.getElementById("totalC").textContent = "₹0.00";
}



function printReceipt() {
  window.print();
}


function updateQuantity(index, newQuantity) {
  const selectedProduct = cartProducts[index];
  const availableQuantity = parseInt(selectedProduct.available_quantity);
  const requestedQuantity = parseInt(newQuantity);

  if (requestedQuantity <= availableQuantity) {
    selectedProduct.quantity = requestedQuantity;
  } else {
    alert("Quantity selected exceeds available quantity.");
    selectedProduct.quantity = availableQuantity;
  }
  updateCartUI();
}

function delElement(index) {
  cartProducts.splice(index, 1);
  updateCartUI();
}

function promo() {
  let code = document.getElementById("promocode").value;
  if (code == 1234) {
    promocode = 50;
  } else {
    promocode = 0;
    alert("Enter correct promo code");
  }

  updateCartUI();
}

function updateCartUI() {
  totalPrice = 0;
  subTotal = 0;
  gstTotal = 0;
  grandTotal = 0;

  if (cartProducts.length == 0) {
    document.getElementById("root").innerHTML = "No products found.";
  } else {
    let tableData = cartProducts
      .map((item, index) => {
        item.total = item.discount_price * item.quantity;
        totalPrice += item.total;

        return (
          `<tr  style="text-align: justify;">
              <td width="300"><p style='font-size:13px;'>${item.name}</p></td>
              <td width="150"><p style='font-size:13px;'>${item.brand}</p></td>
              <td width="150">${item.available_quantity}</td>
              <td width="150"><h2 style='font-size:13px; color:red; '>${getRupeeValue(item.normal_price)}</h2></td>
              <td width="150"><h2 style='font-size:13px; color:red; '>${getRupeeValue(item.discount_price)}</h2></td>
              <td width="150">
                <input type="number" min="1" max="${item.available_quantity}" value="${item.quantity}" onchange="updateQuantity(${index}, this.value)">
              </td>
              <td width="150"><h2 style='font-size:13px; color:red; '>${getRupeeValue(item.total)}</h2></td> 
              <td width="70"><i class='fa-solid fa-trash' onclick='delElement(${index})'></i></td>` + `</tr>`
        );
      })
      .join("");

    document.getElementById("root").innerHTML = tableData;
  }

  subTotal = totalPrice - promocode;
  gstTotal = 0.18 * subTotal;
  grandTotal = subTotal + gstTotal;

  document.getElementById("itemA").innerHTML = cartProducts.length + " Items";
  document.getElementById("itemB").innerHTML = cartProducts.length + " Items";

  document.getElementById("totalA").innerHTML = getRupeeValue(totalPrice);
  document.getElementById("totalB").innerHTML = getRupeeValue(subTotal);
  document.getElementById("totalP").innerHTML = getRupeeValue(promocode);
  document.getElementById("totalG").innerHTML = getRupeeValue(gstTotal);
  document.getElementById("totalC").innerHTML = getRupeeValue(grandTotal);
}

updateCartUI();

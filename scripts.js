const menuItems = document.querySelectorAll(".menu-item");
const totalDisplay = document.getElementById("total");

menuItems.forEach(item => {
  const plusBtn = item.querySelector(".plus");
  const minusBtn = item.querySelector(".minus");
  const qtyDisplay = item.querySelector(".qty");

  plusBtn.addEventListener("click", () => {
    let qty = parseInt(qtyDisplay.textContent);
    qty++;
    qtyDisplay.textContent = qty;
    updateTotal();
  });

  minusBtn.addEventListener("click", () => {
    let qty = parseInt(qtyDisplay.textContent);
    if (qty > 0) qty--;
    qtyDisplay.textContent = qty;
    updateTotal();
  });
});

function updateTotal() {
  let total = 0;
  menuItems.forEach(item => {
    const price = parseInt(item.dataset.price);
    const qty = parseInt(item.querySelector(".qty").textContent);
    total += price * qty;
  });
  totalDisplay.textContent = `總金額：NT$${total}`;
}

function submitOrder() {
  const name = document.getElementById("name").value;
  const phone = document.getElementById("phone").value;
  const pickupDate = document.getElementById("pickupDate").value;
  const note = document.getElementById("note").value;
  const timestamp = new Date().toLocaleString("zh-TW");
  const total = calculateTotal();

  const data = {
    timestamp,
    name,
    phone,
    duck: getQty("鴨肉油飯"),
    pork: getQty("豬肉米糕"),
    veggie: getQty("素食油飯"),
    riceBean: getQty("米糕豆"),
    eightTreasure: getQty("八寶羹"),
    lamb: getQty("羊肉爐"),
    scallop: getQty("干貝豬肚湯"),
    broth: getQty("高湯"),
    pickupDate,
    note,
    total
  };

  fetch("https://script.google.com/macros/s/AKfycbyxildm6xOZlqBJiUgX0YoXFxyp6ikVSBAbssBhDLvDI205kTcLxXBEfS5gJf1XxdVpBQ/exec", {
    method: "POST",
    mode: "no-cors",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  });

  alert("訂單已送出！");
  resetForm();
}

function getQty(name) {
  for (let item of menuItems) {
    if (item.dataset.name === name) {
      return parseInt(item.querySelector(".qty").textContent);
    }
  }
  return 0;
}

function calculateTotal() {
  let total = 0;
  menuItems.forEach(item => {
    const price = parseInt(item.dataset.price);
    const qty = parseInt(item.querySelector(".qty").textContent);
    total += price * qty;
  });
  return total;
}

function resetForm() {
  document.getElementById("name").value = "";
  document.getElementById("phone").value = "";
  document.getElementById("pickupDate").value = "";
  document.getElementById("note").value = "";
  menuItems.forEach(item => item.querySelector(".qty").textContent = "0");
  updateTotal();
}

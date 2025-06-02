const prices = {
  "鴨肉油飯": 130,
  "豬肉米糕": 120,
  "素食油飯": 120,
  "米糕豆": 30,
  "八寶羹": 550,
  "羊肉爐": 550,
  "干貝豬肚湯": 450,
  "高湯": 300
};

document.querySelectorAll(".plus").forEach(btn => {
  btn.addEventListener("click", () => {
    const item = btn.closest(".menu-item");
    const badge = item.querySelector(".quantity-badge");
    let qty = parseInt(badge.textContent) || 0;
    qty++;
    updateBadge(item, qty);
    updateTotal();
  });
});

document.querySelectorAll(".minus").forEach(btn => {
  btn.addEventListener("click", () => {
    const item = btn.closest(".menu-item");
    const badge = item.querySelector(".quantity-badge");
    let qty = parseInt(badge.textContent) || 0;
    qty = Math.max(0, qty - 1);
    updateBadge(item, qty);
    updateTotal();
  });
});

function updateBadge(item, qty) {
  const badge = item.querySelector(".quantity-badge");
  if (qty > 0) {
    badge.className = "quantity-badge active";
    badge.textContent = qty;
  } else {
    badge.className = "quantity-badge inactive";
    badge.innerHTML = '<span class="badge-icon">＋</span>';
  }
}

function getQty(name) {
  const item = [...document.querySelectorAll(".menu-item")].find(el => el.dataset.name === name);
  if (!item) return 0;
  return parseInt(item.querySelector(".quantity-badge").textContent) || 0;
}

function calculateTotal() {
  let total = 0;
  document.querySelectorAll(".menu-item").forEach(item => {
    const name = item.dataset.name;
    const qty = getQty(name);
    total += (prices[name] || 0) * qty;
  });
  return total;
}

function updateTotal() {
  const total = calculateTotal();
  document.getElementById("total").textContent = total;
}

function showLoading(message = "訂單處理中，請稍候...") {
  document.getElementById("loadingModal").style.display = "block";
  document.getElementById("loadingImage").src = "loading.gif";
  document.getElementById("loadingText").textContent = message;
}

function updateLoadingComplete(message = "訂單已送出！") {
  document.getElementById("loadingImage").src = "green_correct.png";
  document.getElementById("loadingText").textContent = message;
}

function hideLoading() {
  document.getElementById("loadingModal").style.display = "none";
}

function submitOrder() {
  const nameInput = document.getElementById("name");
  const phoneInput = document.getElementById("phone");
  const pickupDateInput = document.getElementById("pickupDate");

  let valid = true;
  [nameInput, phoneInput, pickupDateInput].forEach(input => {
    const group = input.parentElement;
    if (!input.value.trim()) {
      group.classList.add("invalid");
      valid = false;
    } else {
      group.classList.remove("invalid");
    }
  });

  if (!valid) return;

  const data = {
    timestamp: new Date().toLocaleString("zh-TW"),
    name: nameInput.value,
    phone: phoneInput.value,
    qty1: getQty("鴨肉油飯"),
    qty2: getQty("豬肉米糕"),
    qty3: getQty("素食油飯"),
    qty4: getQty("米糕豆"),
    qty5: getQty("八寶羹"),
    qty6: getQty("羊肉爐"),
    qty7: getQty("干貝豬肚湯"),
    qty8: getQty("高湯"),
    pickupDate: pickupDateInput.value,
    note: document.getElementById("note").value,
    total: calculateTotal()
  };
  console.log("要送出的 data：", data);
  saveToHistory(data);
  showLoading();

  fetch("https://script.google.com/macros/s/AKfycbyxildm6xOZlqBJiUgX0YoXFxyp6ikVSBAbssBhDLvDI205kTcLxXBEfS5gJf1XxdVpBQ/exec", {
    method: "POST",
    mode: "no-cors",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  }).then(() => {
    // 模擬延遲 + 自動關閉 loading
    setTimeout(() => {
      updateLoadingComplete("訂單已送出！");
      resetForm();
      
      // 再延遲 2 秒後關閉視窗
      setTimeout(() => {
        hideLoading();
      }, 2000);

    }, 800); // 模擬延遲 0.8 秒，可依實際調整
  }).catch(() => {
    updateLoadingComplete("訂單送出失敗，請稍後再試！");
    // 錯誤也可自動關閉
    setTimeout(() => {
      hideLoading();
    }, 3000);
  });
}


function resetForm() {
  document.querySelectorAll(".menu-item").forEach(item => updateBadge(item, 0));
  document.getElementById("name").value = "";
  document.getElementById("phone").value = "";
  document.getElementById("pickupDate").value = "";
  document.getElementById("note").value = "";
  updateTotal();
}



// 儲存歷史紀錄
function saveToHistory(order) {
  const history = JSON.parse(localStorage.getItem("orderHistory") || "[]");
  history.push(order);
  localStorage.setItem("orderHistory", JSON.stringify(history));
}

// 顯示歷史視窗
document.getElementById("historyButton").addEventListener("click", () => {
  const history = JSON.parse(localStorage.getItem("orderHistory") || "[]");
  const list = document.getElementById("historyList");
  list.innerHTML = "";

  if (history.length === 0) {
    list.innerHTML = "<p>尚無歷史紀錄。</p>";
    return document.getElementById("historyModal").style.display = "block";
  }

  history.slice().reverse().forEach(order => {
    const items = [];
    Object.keys(order).forEach(key => {
      if (key.startsWith("qty") && order[key] > 0) {
        const index = parseInt(key.replace("qty", "")) - 1;
        const name = Object.keys(prices)[index];
        const unitPrice = prices[name];
        const qty = order[key];
        items.push(`${name} × ${qty} (${unitPrice} * ${qty})`);
      }
    });
    const div = document.createElement("div");
    div.innerHTML = `
      <ul>
        <li><strong>${order.timestamp}</strong></li>
        <li>${items.join("<br>")}</li>
        <li>總價：${order.total} 元</li>
      </ul>
      <hr>
    `;
    list.appendChild(div);
  });

  document.getElementById("historyModal").style.display = "block";
});

// 關閉歷史視窗
function closeHistory() {
  document.getElementById("historyModal").style.display = "none";
}

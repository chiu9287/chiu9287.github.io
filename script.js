// 菜單資料陣列，每個物件包含菜名、價格、key、圖片路徑
const menuList = [
  { name: '鴨肉米糕', price: 130, key: 'qty1', img: 'img/鴨肉米糕.jpg' },
  { name: '豬肉油飯', price: 120, key: 'qty2', img: 'img/豬肉油飯.jpg' },
  { name: '素食油飯', price: 120, key: 'qty3', img: 'img/素食油飯.jpg' },
  { name: '八寶羹', price: 550, key: 'qty4', img: 'img/八寶羹.jpg' },
  { name: '白菜滷', price: 550, key: 'qty5', img: 'img/白菜滷.jpg' },
  { name: '金針排骨湯', price: 45, key: 'qty6', img: 'img/金針排骨湯.jpg' },
  { name: '蘿蔔排骨湯', price: 45, key: 'qty7', img: 'img/蘿蔔排骨湯.jpg' },
  { name: '干貝豬肚湯', price: 450, key: 'qty8', img: 'img/干貝豬肚湯.jpg' }
];

let qtyStatus = {};
menuList.forEach(item => { qtyStatus[item.key] = 0; });

let currentStep = 1;

let formSection, menuSection, confirmSection, backBtn, nextBtn;

window.onload = () => {
  formSection = document.querySelector('.form');
  menuSection = document.querySelector('.menu');
  confirmSection = document.getElementById('confirmationSection');
  backBtn = document.getElementById('backBtn');
  nextBtn = document.getElementById('nextBtn');

  renderMenu();
  formSection.style.display = 'none';
  confirmSection.style.display = 'none';
  renderStepIndicator();
  updateStepUI();

  document.getElementById('historyButton').onclick = () => {
    showHistory();
  };

  backBtn.onclick = () => {
    if (currentStep === 2) {
      currentStep = 1;
    } else if (currentStep === 3) {
      currentStep = 2;
    } else if (currentStep === 4) {
      currentStep = 1;
    }
    updateStepUI();
  };

  nextBtn.onclick = () => {
    if (currentStep === 1) {
      const hasOrder = menuList.some(item => getQtyByKey(item.key) > 0);
      if (!hasOrder) {
        alert('請選擇至少一樣餐點');
        return;
      }
      currentStep = 2;
    } else if (currentStep === 2) {
      if (!validateForm()) return;
      currentStep = 3;
      renderConfirmation();
    } else if (currentStep === 3) {
      submitOrder();
      // currentStep = 4; // 移至 submitOrder 完成時設定
    }
    updateStepUI();
  };
};

function renderStepIndicator() {
  const steps = [
    { number: '①', text: '點餐' },
    { number: '②', text: '填寫資訊' },
    { number: '③', text: '確認訂單' },
    { number: '④', text: '送出' },
  ];
  const container = document.getElementById('stepIndicator');
  container.innerHTML = '';
  steps.forEach((step, idx) => {
    const stepDiv = document.createElement('div');
    stepDiv.className = 'step';
    if (currentStep === idx + 1) {
      stepDiv.classList.add('current');
    }
    stepDiv.innerHTML = `<span class="number">${step.number}</span>${step.text}`;
    container.appendChild(stepDiv);
    if (idx < steps.length - 1) {
      const arrow = document.createElement('span');
      arrow.className = 'arrow';
      arrow.textContent = '→';
      container.appendChild(arrow);
    }
  });
}

function renderMenu() {
  const menuContainer = document.querySelector('.menu');
  menuContainer.innerHTML = '';
  menuList.forEach(item => {
    const div = document.createElement('div');
    div.className = 'menu-item';
    div.dataset.name = item.name;
    div.dataset.key = item.key;
    const qty = getQtyByKey(item.key);
    div.innerHTML = `
      <img src="${item.img}" alt="${item.name}">
      <h3>${item.name}</h3>
      <p>NT$${item.price}</p>
      <div class="controls">
        <button class="minus" aria-label="減少">－</button>
        <span class="quantity-display">${qty}</span>
        <button class="plus" aria-label="增加">＋</button>
      </div>
    `;
    menuContainer.appendChild(div);
  });
  bindControlButtons();
  updateTotal();
}

function bindControlButtons() {
  document.querySelectorAll('.plus').forEach(btn => {
    btn.replaceWith(btn.cloneNode(true));
  });
  document.querySelectorAll('.minus').forEach(btn => {
    btn.replaceWith(btn.cloneNode(true));
  });
  document.querySelectorAll('.plus').forEach(btn => {
    btn.addEventListener('click', () => {
      const itemDiv = btn.closest('.menu-item');
      const key = itemDiv.dataset.key;
      setQtyByKey(key, getQtyByKey(key) + 1);
      updateQuantityDisplay(itemDiv, getQtyByKey(key));
      updateTotal();
    });
  });
  document.querySelectorAll('.minus').forEach(btn => {
    btn.addEventListener('click', () => {
      const itemDiv = btn.closest('.menu-item');
      const key = itemDiv.dataset.key;
      setQtyByKey(key, getQtyByKey(key) - 1);
      updateQuantityDisplay(itemDiv, getQtyByKey(key));
      updateTotal();
    });
  });
}

function updateQuantityDisplay(item, qty) {
  const display = item.querySelector('.quantity-display');
  display.textContent = qty;
}
function getQtyByKey(key) {
  return qtyStatus[key] || 0;
}
function setQtyByKey(key, value) {
  qtyStatus[key] = Math.max(0, value);
}
function getQtyByName(name) {
  const found = menuList.find(item => item.name === name);
  return found ? getQtyByKey(found.key) : 0;
}

function calculateTotal() {
  let total = 0;
  menuList.forEach(item => {
    total += item.price * getQtyByKey(item.key);
  });
  return total;
}
function updateTotal() {
  const total = calculateTotal();
  const totalEl = document.getElementById('total');
  if (totalEl) totalEl.textContent = total;
}

function validateForm() {
  let valid = true;
  const inputs = ['name', 'phone', 'pickupDate'].map(id => document.getElementById(id));
  inputs.forEach(input => {
    const group = input.parentElement;
    if (!input.value.trim()) {
      group.classList.add('invalid');
      valid = false;
    } else {
      group.classList.remove('invalid');
    }
  });
  if (!valid) alert('請填寫所有必填欄位');
  return valid;
}

const GAS_URL = "https://script.google.com/macros/s/AKfycbyxildm6xOZlqBJiUgX0YoXFxyp6ikVSBAbssBhDLvDI205kTcLxXBEfS5gJf1XxdVpBQ/exec";

async function submitOrder() {
  if (!validateForm()) return;
  const hasOrder = menuList.some(item => getQtyByKey(item.key) > 0);
  if (!hasOrder) {
    alert('請選擇至少一樣餐點');
    return;
  }
  const data = {
    timestamp: new Date().toLocaleString('zh-TW'),
    name: document.getElementById('name').value.trim(),
    phone: document.getElementById('phone').value.trim(),
    pickupDate: document.getElementById('pickupDate').value,
    note: document.getElementById('note').value.trim(),
    total: calculateTotal()
  };
  menuList.forEach(item => {
    data[item.key] = getQtyByKey(item.key);
  });
  showLoading();
  try {
    await fetch(GAS_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    setTimeout(() => {
      updateLoadingComplete('訂單已送出，感謝您的訂購！');
      saveOrderToHistory(data);
      resetForm();
      currentStep = 4;
      updateStepUI();
      setTimeout(() => {
        hideLoading();
      }, 2000);
    }, 800);
  } catch (err) {
    console.error(err);
    alert('送出訂單時發生錯誤，請稍後再試');
    hideLoading();
  }
}
function showLoading(message = '訂單處理中，請稍候...') {
  const modal = document.getElementById('loadingModal');
  modal.style.display = 'block';
  const img = document.getElementById('loadingImage');
  const text = document.getElementById('loadingText');
  img.src = 'loading.gif';
  text.textContent = message;
}
function updateLoadingComplete(message = '訂單已送出！') {
  const img = document.getElementById('loadingImage');
  const text = document.getElementById('loadingText');
  img.src = 'green_correct.png';
  text.textContent = message;
}
function hideLoading() {
  const modal = document.getElementById('loadingModal');
  modal.style.display = 'none';
}
function resetForm() {
  Object.keys(qtyStatus).forEach(key => { qtyStatus[key] = 0; });
  ['name', 'phone', 'pickupDate', 'note'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  renderMenu();
  updateTotal();
}
function showHistory() {
  const modal = document.getElementById('historyModal');
  modal.style.display = 'block';
  const historyList = document.getElementById('historyList');
  const history = JSON.parse(localStorage.getItem('orderHistory')) || [];
  if (history.length === 0) {
    historyList.innerHTML = '<p>尚無歷史訂單</p>';
  } else {
    historyList.innerHTML = history.map(order => `
      <div>
        <p><strong>訂購者：</strong>${order.name}</p>
        <p><strong>電話：</strong>${order.phone}</p>
        <p><strong>取餐日：</strong>${order.pickupDate}</p>
        <p><strong>訂單總價：</strong>${order.total} 元</p>
        <hr>
      </div>
    `).join('');
  }
}
function closeHistory() {
  document.getElementById('historyModal').style.display = 'none';
}
function saveOrderToHistory(order) {
  const history = JSON.parse(localStorage.getItem('orderHistory')) || [];
  history.push(order);
  localStorage.setItem('orderHistory', JSON.stringify(history));
}

function updateStepUI() {
  menuSection.style.display = currentStep === 1 ? 'flex' : 'none';
  formSection.style.display = currentStep === 2 ? 'block' : 'none';
  confirmSection.style.display = (currentStep === 3 || currentStep === 4) ? 'block' : 'none';
  if (currentStep === 1) {
    backBtn.style.display = 'none';
    nextBtn.style.display = 'inline-block';
    nextBtn.textContent = '下一步';
    document.getElementById('socialLinks').style.display = 'none';
  } else if (currentStep === 2) {
    backBtn.style.display = 'inline-block';
    backBtn.textContent = '返回修改點餐';
    nextBtn.style.display = 'inline-block';
    nextBtn.textContent = '下一步';
    document.getElementById('socialLinks').style.display = 'none';
  } else if (currentStep === 3) {
    backBtn.style.display = 'inline-block';
    backBtn.textContent = '返回修改客人資訊';
    nextBtn.style.display = 'inline-block';
    nextBtn.textContent = '送出訂單';
    document.getElementById('socialLinks').style.display = 'none';
  } else if (currentStep === 4) {
    backBtn.style.display = 'inline-block';
    backBtn.textContent = '再次點餐';
    nextBtn.style.display = 'none';
    document.getElementById('socialLinks').style.display = 'flex';
  }
  renderStepIndicator();
}

function renderConfirmation() {
  const detailDiv = document.getElementById('confirmDetails');
  const name = document.getElementById('name').value;
  const phone = document.getElementById('phone').value;
  const pickup = document.getElementById('pickupDate').value;
  const note = document.getElementById('note').value;
  const total = calculateTotal();
  let itemHTML = '';
  menuList.forEach(item => {
    const qty = getQtyByKey(item.key);
    if (qty > 0) {
      itemHTML += `<li>${item.name} × ${qty}（NT$${item.price * qty}）</li>`;
    }
  });
  detailDiv.innerHTML = `
    <p><strong>姓名：</strong>${name}</p>
    <p><strong>手機：</strong>${phone}</p>
    <p><strong>取餐日期：</strong>${pickup}</p>
    ${note ? `<p><strong>備註：</strong>${note}</p>` : ''}
    <p><strong>訂購項目：</strong></p>
    <ul style="text-align:center;">${itemHTML}</ul>
    <p><strong>總金額：</strong>NT$${total}</p>
  `;
}
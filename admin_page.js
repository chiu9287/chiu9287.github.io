document.getElementById('loginBtn').onclick = function() {
  const u = document.getElementById('username').value;
  const p = document.getElementById('password').value;
  if (u === 'admin' && p === 'admin') {
    document.getElementById('loginSection').classList.add('hidden');
    document.getElementById('adminSection').classList.remove('hidden');
    loadMenu();
  } else {
    document.getElementById('loginMsg').textContent = '帳號或密碼錯誤';
  }
};

async function loadMenu() {
  // 檢查是否有 menu (1).json、menu (2).json... 這類暫存檔案
  const warningDiv = document.getElementById('adminWarning') || (() => {
    const d = document.createElement('div');
    d.id = 'adminWarning';
    d.style.color = 'red';
    d.style.margin = '10px 0';
    document.getElementById('adminSection').insertBefore(d, document.getElementById('addForm'));
    return d;
  })();
  warningDiv.innerHTML = '';

  // 1. 檢查目錄下是否有 menu (1).json 這類檔案
  try {
    // 只能用 fetch 檢查靜態檔案是否存在
    for (let i = 1; i <= 5; i++) {
      const fname = `menu (${i}).json`;
      try {
        const res = await fetch(fname, {method: 'HEAD'});
        if (res.ok) {
          warningDiv.innerHTML += `⚠️ 偵測到 <b>${fname}</b>，請將其覆蓋為menu.json以更新最新菜單哦！<br>`;
        }
      } catch {}
    }
  } catch {}

  // 2. 載入 menu.json 並檢查圖片是否存在
  let menu = [];
  try {
    const res = await fetch('menu.json');
    menu = await res.json();
  } catch {
    renderMenuList([]);
    return;
  }

  // 檢查每道菜的圖片是否存在
  for (const item of menu) {
    if (item.img) {
      try {
        const res = await fetch(item.img, {method: 'HEAD'});
        if (!res.ok) {
          warningDiv.innerHTML += `⚠️ 圖片不存在：<b>${item.img}</b>（${item.name}）<br>`;
        }
      } catch {
        warningDiv.innerHTML += `⚠️ 圖片不存在：<b>${item.img}</b>（${item.name}）<br>`;
      }
    }
  }

  renderMenuList(menu);
}

function renderMenuList(menu) {
  const list = document.getElementById('menuList');
  list.innerHTML = '';
  menu.forEach((item, idx) => {
    const row = document.createElement('div');
    row.className = 'menu-row';
    row.innerHTML = `
      <img src="${item.img}" class="menu-img">
      <span>${item.name}</span>
      <span>NT$${item.price}</span>
      <span>${item.type}</span>
      <span>${item.unit}</span>
      <span>${item.special === '冷凍' ? '冷凍包裝' : ''}</span>
      <button class="delete-btn" onclick="deleteMenu(${idx})">刪除</button>
    `;
    list.appendChild(row);
  });
}

// 新增菜單（用 click 事件）
document.getElementById('addBtn').onclick = async function() {
  const name = document.getElementById('name').value.trim();
  const price = +document.getElementById('price').value;
  const type = document.getElementById('type').value;
  let unit = document.getElementById('unit').value.trim();
  const special = document.getElementById('special').value === '是' ? '冷凍' : '';
  if (!name || !price || !type || !unit) {
    alert('請填寫所有必填欄位');
    return;
  }
  // 單位自動加括號
  if (!unit.startsWith('(') && !unit.endsWith(')')) {
    unit = `(${unit})`;
  }

  // 取得現有最大 key
  let menu = [];
  try {
    const res = await fetch('menu.json');
    menu = await res.json();
  } catch {}
  let maxKeyNum = 0;
  menu.forEach(item => {
    const match = (item.key || '').match(/^qty(\d+)$/);
    if (match) {
      const num = parseInt(match[1]);
      if (num > maxKeyNum) maxKeyNum = num;
    }
  });
  const key = 'qty' + (maxKeyNum + 1);

  const imgName = `img/${name}.jpg`;
  menu.push({ name, price, type, unit, key, img: imgName, special });
  const blob = new Blob([JSON.stringify(menu, null, 2)], {type: 'application/json'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'menu.json';
  setTimeout(() => {
    a.click();
    alert('menu.json 已下載，請覆蓋原檔並 push 上 GitHub');
    document.getElementById('loginSection').classList.add('hidden');
    document.getElementById('adminSection').classList.remove('hidden');
    renderMenuList(menu);
    // 清空欄位
    document.getElementById('name').value = '';
    document.getElementById('price').value = '';
    document.getElementById('type').value = '菜';
    document.getElementById('unit').value = '';
    document.getElementById('special').value = '否';
  }, 100);
};

// 刪除菜單
window.deleteMenu = async function(idx) {
  if (!confirm('確定要刪除這個菜單項目嗎？')) return;
  let menu = [];
  try {
    const res = await fetch('menu.json');
    menu = await res.json();
  } catch {}
  menu.splice(idx, 1);
  const blob = new Blob([JSON.stringify(menu, null, 2)], {type: 'application/json'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'menu.json';
  setTimeout(() => {
    a.click();
    alert('menu.json 已下載，請覆蓋原檔並 push 上 GitHub');
    document.getElementById('loginSection').classList.add('hidden');
    document.getElementById('adminSection').classList.remove('hidden');
    renderMenuList(menu);
  }, 100);
};
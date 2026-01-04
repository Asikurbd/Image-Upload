/* ====== قوائم وتبديل الواجهة ====== */
function toggle() {
  menu.classList.toggle("active");
  ham.classList.toggle("ham");
  hama.classList.toggle("none");
  hamb.classList.toggle("none");
  shadow.classList.toggle("active");
  sidecontent.classList.toggle("none");
}

function showDropdown() {
  var e = document.getElementById("dropdown-content");
  e.style.display = (e.style.display === "block" ? "none" : "block");
}

function closeSet() {
  var setPop = document.getElementById("set-pop");
  if (setPop) setPop.style.display = "none";
}

/* ====== إظهار نافذة السيت ====== */
function showSet(setId, gameId) {
  var setPop = document.getElementById("set-pop");
  let xhr = new XMLHttpRequest();

  xhr.onreadystatechange = function () {
    if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
      setPop.style.display = "block";
      setPop.innerHTML = this.responseText;
    }
  };

  xhr.open("POST", "include/set-fetch.inc.php", true);
  xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
  xhr.send("set_id=" + encodeURIComponent(setId) + "&game=" + encodeURIComponent(gameId));
}

/* ====== شراء السيت ====== */
/* ملاحظة: نتجاهل userId القادم من الاستدعاء ونستخدم المستخدم من الجلسة في الملف المعالج */
function buySet(setId, gameId /*, userId */) {
  if (!confirm("هل تريد بالتأكيد شراء السيت؟")) return;

  // لو لم يُمرّر gameId من النداء، خذه من window.GAME_ID
  var gid = (typeof gameId !== "undefined" && gameId !== null) ? gameId : (window.GAME_ID || 0);

  let xhr = new XMLHttpRequest();

  xhr.onreadystatechange = function () {
    if (xhr.readyState === XMLHttpRequest.DONE) {
      if (xhr.status === 200) {
        try {
          var response = JSON.parse(xhr.responseText);
          if (response.success) {
            alert(response.message);
            closeSet();
            setTimeout(() => location.reload(), 1000);
          } else {
            alert("❌ خطأ: " + response.message);
          }
        } catch (e) {
          alert("❌ خطأ في تحليل JSON!");
        }
      } else {
        alert("❌ لم يتم الاتصال بالخادم.");
      }
    }
  };

  xhr.open("POST", "include/buy-set.inc.php", true);
  xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");

  // نرسل confirm_buy و csrf — ولا نرسل user_id إطلاقًا
  const body =
    "set_id="   + encodeURIComponent(setId) +
    "&game_id=" + encodeURIComponent(gid) +
    "&confirm_buy=1" +
    "&csrf="    + encodeURIComponent(window.CSRF || "");

  xhr.send(body);
}

/* ====== تحديث قائمة المعاملات بعد الشراء (إن كانت موجودة) ====== */
function updateTransactions(transactions) {
  var transactionsContainer = document.getElementById("transactions");
  if (!transactionsContainer) return;

  transactionsContainer.innerHTML = ""; // مسح القائمة القديمة

  transactions.forEach(function (tran) {
    var tranDiv = document.createElement("div");
    tranDiv.className = "set-body";
    tranDiv.innerHTML = `
      <div class="td-h">
        <a href="#" class="btn-set"><span>#${tran.tran_id}</span></a>
      </div>
      <div class="td-h">
        <p style="color: ${tran.amount > 0 ? 'green' : 'red'};">${tran.amount} د.ع</p>
      </div>
      <div class="td-h">
        <p>${tran.source_table}</p>
      </div>
      <div class="td-h">
        <p>${tran.timestamp}</p>
      </div>
    `;
    transactionsContainer.appendChild(tranDiv);
  });
}

/* ====== ربط عناصر القائمة ====== */
var menu        = document.getElementById("tog");
var ham         = document.getElementById("ham");
var hama        = document.getElementById("togout");
var hamb        = document.getElementById("togin");
var shadow      = document.getElementById("shadow");
var sidecontent = document.getElementsByClassName("side-content")[0];

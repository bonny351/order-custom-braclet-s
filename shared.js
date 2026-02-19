const session = JSON.parse(localStorage.getItem("session") || "{}");

if(!session.biz){
  location.href = "login.html";
}

function requireRole(allowed){
  if(!allowed.includes(session.role)){
    alert("Unauthorized");
    location.href="login.html";
  }
}

function logout(){
  localStorage.removeItem("session");
  location.href="login.html";
}

function buildLayout(){
  document.body.innerHTML = `
    <div class="layout">
      <div class="sidebar">
        <h3>${session.username}</h3>
        <p>${session.role}</p>
        <hr>
        <button onclick="go('owner.html')">Owner</button>
        <button onclick="go('production.html')">Production</button>
        <button onclick="go('qc.html')">QC</button>
        <button onclick="go('shipping.html')">Shipping</button>
        <button onclick="go('finance.html')">Finance</button>
        <button onclick="go('support.html')">Support</button>
        <hr>
        <button onclick="logout()">Logout</button>
      </div>
      <div class="content" id="mainContent"></div>
    </div>
  `;
}

function go(page){ location.href = page; }

function logAction(action, meta={}){
  return db.collection("tt_businesses")
    .doc(session.biz)
    .collection("logs")
    .add({
      action,
      meta,
      by: session.username,
      role: session.role,
      at: firebase.firestore.FieldValue.serverTimestamp()
    });
}

function updatePerformance(metric){
  return db.collection("tt_businesses")
    .doc(session.biz)
    .collection("performance")
    .doc(session.username)
    .set({
      [metric]: firebase.firestore.FieldValue.increment(1)
    }, {merge:true});
}

let orderCache=[];

function startOrderListener(){
  db.collection("tt_businesses")
    .doc(session.biz)
    .collection("orders")
    .onSnapshot(snap=>{
      orderCache=snap.docs.map(d=>({id:d.id,...d.data()}));
      renderPage();
    });
}

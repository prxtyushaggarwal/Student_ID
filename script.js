let studentRecord = {
  regNo: '',
  fullName: '',
  branch: '',
  bloodGroup: '',
  email: '',
  phone: '',
  reason: 'Lost',
  totalFee: 300,
  stage: 3
};

const checklistRequirements = {
  Lost: [
    { text: 'Police Lost Article Report (LAR) or Online NCR Acknowledgment', req: true },
    { text: 'Student Undertaking Declaration for Missing ID', req: true },
    { text: 'Secondary ID Proof (Aadhaar or UMS Profile Screenshot)', req: false }
  ],
  Damaged: [
    { text: 'Undertaking to surrender old damaged physical card at Block 32', req: true },
    { text: 'Clear photo of damaged / cracked card', req: true }
  ],
  Defaced: [
    { text: 'Photo of defaced card showing faded text or damaged RFID chip', req: true },
    { text: 'Fresh passport-size photo for re-printing', req: true }
  ]
};

const lpuCampusStages = [
  { name: 'Application Submitted', place: 'UMS Online Server' },
  { name: 'Security Verification Cleared', place: 'Block 29 (Proctor Office)' },
  { name: 'Card Printing & RFID Encoding', place: 'Block 30 (Central ID Cell)' },
  { name: 'Intra-Campus Courier Transit', place: 'Enroute to Block 32' },
  { name: 'Ready for Collection', place: 'Block 32, Counter 4' }
];

function resetForm() {
  document.getElementById('studentForm').reset();
  const errors = document.querySelectorAll('.err-text');
  errors.forEach(err => err.classList.remove('show'));
  const inputs = document.querySelectorAll('.input-error');
  inputs.forEach(inp => inp.classList.remove('input-error'));
}

function validateField(inputEl, regex, errId) {
  const val = inputEl.value.trim();
  const isValid = regex.test(val);
  const errEl = document.getElementById(errId);
  if (!isValid) {
    inputEl.classList.add('input-error');
    errEl.classList.add('show');
    return false;
  } else {
    inputEl.classList.remove('input-error');
    errEl.classList.remove('show');
    return true;
  }
}

function goToStep2() {
  const regInput = document.getElementById('regNo');
  const nameInput = document.getElementById('fullName');
  const branchInput = document.getElementById('branch');
  const bloodInput = document.getElementById('bloodGroup');
  const emailInput = document.getElementById('email');
  const phoneInput = document.getElementById('phone');
  const declarationInput = document.getElementById('declaration');

  const vReg = validateField(regInput, /^[0-9]{8}$/, 'regNoErr');
  const vName = validateField(nameInput, /^[a-zA-Z\s.]{3,40}$/, 'nameErr');
  const vEmail = validateField(emailInput, /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, 'emailErr');
  const vPhone = validateField(phoneInput, /^[6-9][0-9]{9}$/, 'phoneErr');

  let vBranch = true;
  if (!branchInput.value) {
    branchInput.classList.add('input-error');
    document.getElementById('branchErr').classList.add('show');
    vBranch = false;
  } else {
    branchInput.classList.remove('input-error');
    document.getElementById('branchErr').classList.remove('show');
  }

  let vBlood = true;
  if (!bloodInput.value) {
    bloodInput.classList.add('input-error');
    document.getElementById('bloodErr').classList.add('show');
    vBlood = false;
  } else {
    bloodInput.classList.remove('input-error');
    document.getElementById('bloodErr').classList.remove('show');
  }

  let vDec = true;
  if (!declarationInput.checked) {
    document.getElementById('declarationErr').classList.add('show');
    vDec = false;
  } else {
    document.getElementById('declarationErr').classList.remove('show');
  }

  if (vReg && vName && vBranch && vBlood && vEmail && vPhone && vDec) {
    const reasonPicked = document.querySelector('input[name="reissueReason"]:checked').value;
    studentRecord.regNo = regInput.value.trim();
    studentRecord.fullName = nameInput.value.trim();
    studentRecord.branch = branchInput.value;
    studentRecord.bloodGroup = bloodInput.value;
    studentRecord.email = emailInput.value.trim();
    studentRecord.phone = phoneInput.value.trim();
    studentRecord.reason = reasonPicked;

    setupStep2();
    switchPage(1, 2);
  }
}

function goToStep1() {
  switchPage(2, 1);
}

function setupStep2() {
  const reason = studentRecord.reason;
  document.getElementById('reasonTag').textContent = reason;

  const noteBox = document.getElementById('instructionBox');
  if (reason === 'Lost') {
    noteBox.innerHTML = '<i class="fa-solid fa-circle-exclamation"></i><span>Upload police report or online missing DDR acknowledgment for lost card verification.</span>';
  } else if (reason === 'Damaged') {
    noteBox.innerHTML = '<i class="fa-solid fa-circle-exclamation"></i><span>Upload photo of damaged card. Surrender physical card at Block 32 counter.</span>';
  } else {
    noteBox.innerHTML = '<i class="fa-solid fa-circle-exclamation"></i><span>Upload photo of defaced card or a fresh formal passport photo.</span>';
  }

  const listDiv = document.getElementById('checklistItems');
  listDiv.innerHTML = '';
  const items = checklistRequirements[reason] || checklistRequirements['Lost'];

  items.forEach((item, index) => {
    const row = document.createElement('div');
    row.className = 'chk-item';
    row.innerHTML = `
      <div class="chk-left">
        <input type="checkbox" id="chk_${index}" onchange="checkStep2Readiness()">
        <label for="chk_${index}">${item.text} ${item.req ? '<strong style="color:red;">*</strong>' : ''}</label>
      </div>
      <span class="chk-status pending" id="chkStat_${index}">Pending</span>
    `;
    listDiv.appendChild(row);
  });

  document.getElementById('fileStatusBox').style.display = 'none';
  document.getElementById('docFile').value = '';
  document.getElementById('btnStep2Next').disabled = true;
}

const fileInput = document.getElementById('docFile');
fileInput.addEventListener('change', function() {
  if (this.files && this.files[0]) {
    const f = this.files[0];
    if (f.size > 2 * 1024 * 1024) {
      alert('File size exceeds 2MB limit.');
      this.value = '';
      return;
    }

    document.getElementById('uploadedName').textContent = f.name;
    document.getElementById('uploadedSize').textContent = (f.size / (1024 * 1024)).toFixed(2) + ' MB';
    document.getElementById('fileStatusBox').style.display = 'flex';

    const firstChk = document.getElementById('chk_0');
    if (firstChk) {
      firstChk.checked = true;
      const stat = document.getElementById('chkStat_0');
      if (stat) {
        stat.className = 'chk-status ok';
        stat.textContent = 'Uploaded';
      }
    }
    checkStep2Readiness();
  }
});

function checkStep2Readiness() {
  const chks = document.querySelectorAll('.checklist-box input[type="checkbox"]');
  chks.forEach((c, idx) => {
    const stat = document.getElementById(`chkStat_${idx}`);
    if (stat) {
      if (c.checked) {
        stat.className = 'chk-status ok';
        stat.textContent = 'Verified';
      } else {
        stat.className = 'chk-status pending';
        stat.textContent = 'Pending';
      }
    }
  });

  const hasFile = fileInput.files && fileInput.files.length > 0;
  const isFirstChecked = document.getElementById('chk_0') && document.getElementById('chk_0').checked;

  const nextBtn = document.getElementById('btnStep2Next');
  if (hasFile && isFirstChecked) {
    nextBtn.disabled = false;
  } else {
    nextBtn.disabled = true;
  }
}

function goToStep3() {
  document.getElementById('summaryStudent').textContent = studentRecord.fullName;
  document.getElementById('summaryReg').textContent = studentRecord.regNo;
  document.getElementById('summaryReason').textContent = studentRecord.reason;

  calculateFee();
  switchPage(2, 3);
}

function calculateFee() {
  const isUrgent = document.querySelector('input[name="speedOption"]:checked').value === 'urgent';
  let base = isUrgent ? 600 : 300;

  document.getElementById('labelSpeed').textContent = isUrgent ? 'Urgent 24-Hour Processing' : 'Standard Reissue';
  document.getElementById('costSpeed').textContent = 'Rs. ' + base;

  const hasLanyard = document.getElementById('addLanyard').checked;
  const hasSlip = document.getElementById('addSlip').checked;

  document.getElementById('rowLanyard').style.display = hasLanyard ? 'flex' : 'none';
  document.getElementById('rowSlip').style.display = hasSlip ? 'flex' : 'none';

  let total = base;
  if (hasLanyard) total += 50;
  if (hasSlip) total += 40;

  studentRecord.totalFee = total;
  document.getElementById('totalCost').textContent = 'Rs. ' + total;
  document.getElementById('btnPayAmount').textContent = total;
}

function selectPayMethod(method) {
  const tabs = document.querySelectorAll('.pay-tab');
  tabs.forEach(t => t.classList.remove('active'));

  document.getElementById('upiDetails').style.display = (method === 'UPI') ? 'block' : 'none';
  document.getElementById('cardDetails').style.display = (method === 'Card') ? 'block' : 'none';
  document.getElementById('umsDetails').style.display = (method === 'UMS') ? 'block' : 'none';

  const selectedInput = document.querySelector(`input[name="paymentMethod"][value="${method}"]`);
  if (selectedInput) {
    selectedInput.checked = true;
    selectedInput.parentElement.classList.add('active');
  }
}

function simulatePayment() {
  alert('Payment of Rs. ' + studentRecord.totalFee + ' simulated successfully!\nTransaction ID: TXN' + Math.floor(100000 + Math.random() * 900000));
  setupStep4();
  switchPage(3, 4);
}

function setupStep4() {
  document.getElementById('trackAppId').textContent = 'LPU-ID-2026-' + studentRecord.regNo.slice(-4);
  document.getElementById('previewName').textContent = studentRecord.fullName.toUpperCase();
  document.getElementById('previewReg').textContent = studentRecord.regNo;
  document.getElementById('previewBranch').textContent = studentRecord.branch;
  document.getElementById('previewBlood').textContent = studentRecord.bloodGroup;

  studentRecord.stage = 3;
  renderStages();
}

function advanceStage() {
  if (studentRecord.stage < 5) {
    studentRecord.stage++;
    renderStages();
  } else {
    alert('Your ID Card is ready for collection at Block 32 Counter 4!');
  }
}

function renderStages() {
  const current = studentRecord.stage;
  const stageData = lpuCampusStages[current - 1];
  document.getElementById('trackBuilding').textContent = stageData.place;

  for (let i = 1; i <= 5; i++) {
    const el = document.getElementById(`stage${i}`);
    if (el) {
      el.className = 'timeline-step';
      const dot = el.querySelector('.dot');
      if (i < current) {
        el.classList.add('completed');
        dot.innerHTML = '<i class="fa-solid fa-check"></i>';
      } else if (i === current) {
        el.classList.add('active');
        dot.innerHTML = '<i class="fa-solid fa-circle"></i>';
      } else {
        dot.innerHTML = '';
      }
    }
  }
}

function switchPage(fromStep, toStep) {
  document.getElementById(`step${fromStep}`).style.display = 'none';
  document.getElementById(`step${toStep}`).style.display = 'block';

  for (let i = 1; i <= 4; i++) {
    const indicator = document.getElementById(`stepIndicator${i}`);
    if (indicator) {
      indicator.className = 'step-box';
      if (i < toStep) indicator.classList.add('completed');
      else if (i === toStep) indicator.classList.add('active');
    }
  }

  for (let j = 1; j <= 3; j++) {
    const line = document.getElementById(`line${j}`);
    if (line) {
      if (j < toStep) line.classList.add('done');
      else line.classList.remove('done');
    }
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function newApplication() {
  if (confirm('Start a new application? Current data will be cleared.')) {
    resetForm();
    switchPage(4, 1);
  }
}

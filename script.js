const appState = {
  currentStep: 1,
  studentData: {
    regNo: '',
    fullName: '',
    branch: '',
    bloodGroup: '',
    email: '',
    phone: '',
    reason: 'Lost'
  },
  checklistVerified: false,
  uploadedFile: null,
  feeBreakdown: {
    processingType: 'standard',
    baseFee: 300,
    hasHolder: false,
    hasTempSlip: false,
    total: 300
  },
  paymentDetails: {
    method: 'UPI',
    status: 'pending',
    transactionId: '',
    paymentTime: ''
  },
  trackingStage: 3
};

const REGEX_PATTERNS = {
  regNo: /^\d{8}$/,
  fullName: /^[a-zA-Z\s.]{3,50}$/,
  email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  phone: /^[6-9]\d{9}$/
};

const CHECKLIST_DATA = {
  Lost: [
    {
      id: 'doc_fir',
      title: 'Police Missing / Lost Article Report (LAR) Acknowledgment',
      desc: 'Valid police stamp/online DDR acknowledging missing card.',
      mandatory: true
    },
    {
      id: 'doc_affidavit',
      title: 'Student Undertaking Affidavit for Misplaced ID',
      desc: 'Signed statement acknowledging surrender if previous card is found.',
      mandatory: true
    },
    {
      id: 'doc_idproof',
      title: 'Secondary Identity Proof (Aadhaar / Passport / UMS Screenshot)',
      desc: 'Required to cross-verify student identity against university records.',
      mandatory: false
    }
  ],
  Damaged: [
    {
      id: 'doc_oldcard',
      title: 'Physical Surrender Declaration of Damaged Card',
      desc: 'Physical card must be submitted at Block 32 DSW counter upon collection.',
      mandatory: true
    },
    {
      id: 'doc_photo_damaged',
      title: 'High-Resolution Photo of Damaged Card (Front & Back)',
      desc: 'Showing broken plastic or damaged microchip antenna.',
      mandatory: true
    },
    {
      id: 'doc_approval',
      title: 'HOD / Mentor Recommendation Slip',
      desc: 'Optional mentor approval for expedited reissue.',
      mandatory: false
    }
  ],
  Defaced: [
    {
      id: 'doc_defaced_card',
      title: 'Defaced / Illegible Card Verification Slip',
      desc: 'Card with faded photo or scratched barcode to be presented at Counter 4.',
      mandatory: true
    },
    {
      id: 'doc_recent_photo',
      title: 'Updated Passport Size Digital Photograph',
      desc: 'White background, formal attire for high-resolution thermal re-printing.',
      mandatory: true
    }
  ]
};

const CAMPUS_STAGES = [
  {
    stage: 1,
    title: 'Application & Reason Submitted',
    dept: 'Online UMS Portal (Server)',
    desc: 'Application received through LPU UMS Portal. Reason logged under student file.'
  },
  {
    stage: 2,
    title: 'Police Report & Checklist Cleared',
    dept: 'Security & Proctor Office (Block 29)',
    desc: 'Document checklist verified by LPU Security Wing. Reissue authorization granted.'
  },
  {
    stage: 3,
    title: 'Smart Card Encoding & Thermal Printing',
    dept: 'Central Card Section (Block 30, Room 102)',
    desc: 'RFID chip UID programmed with student roll number, high-resolution photo laminated.'
  },
  {
    stage: 4,
    title: 'Dispatched via Intra-Campus Courier',
    dept: 'Transit to Uni-Mall / Block 32',
    desc: 'Transferred from printing facility to student service center counter.'
  },
  {
    stage: 5,
    title: 'Ready for Student Collection',
    dept: 'Division of Student Welfare (Block 32, Counter 4)',
    desc: 'Ready for pickup! Please carry fee receipt or UMS app confirmation.'
  }
];

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  loadStateFromLocalStorage();
  setupNavigation();
  setupValidation();
  setupDocumentVerification();
  setupFeeCalculator();
  setupPaymentGateway();
  setupTrackingEngine();
  setupModals();
  setupAutoFillDemo();
});

function initTheme() {
  const themeToggleBtn = document.getElementById('themeToggleBtn');
  const savedTheme = localStorage.getItem('lpu_theme') || 'light';
  
  if (savedTheme === 'dark') {
    document.body.setAttribute('data-theme', 'dark');
    themeToggleBtn.innerHTML = '<i class="fa-solid fa-sun"></i>';
  }

  themeToggleBtn.addEventListener('click', () => {
    const isDark = document.body.getAttribute('data-theme') === 'dark';
    if (isDark) {
      document.body.removeAttribute('data-theme');
      themeToggleBtn.innerHTML = '<i class="fa-solid fa-moon"></i>';
      localStorage.setItem('lpu_theme', 'light');
    } else {
      document.body.setAttribute('data-theme', 'dark');
      themeToggleBtn.innerHTML = '<i class="fa-solid fa-sun"></i>';
      localStorage.setItem('lpu_theme', 'dark');
    }
  });
}

function setupNavigation() {
  const stepItems = document.querySelectorAll('.step-item');
  stepItems.forEach(item => {
    item.addEventListener('click', () => {
      const targetStep = parseInt(item.getAttribute('data-step'), 10);
      if (targetStep < appState.currentStep || canNavigateToStep(targetStep)) {
        goToStep(targetStep);
      }
    });
  });

  document.getElementById('toStep2Btn').addEventListener('click', () => {
    if (validateStep1()) {
      saveStudentFormData();
      renderChecklist();
      goToStep(2);
    }
  });

  document.getElementById('backToStep1Btn').addEventListener('click', () => goToStep(1));
  document.getElementById('backToStep2Btn').addEventListener('click', () => goToStep(2));

  document.getElementById('toStep3Btn').addEventListener('click', () => {
    updateFeeSummary();
    goToStep(3);
  });

  document.getElementById('startNewAppBtn').addEventListener('click', () => {
    if (confirm('Start a new ID reissue application? Current inputs will be cleared.')) {
      localStorage.removeItem('lpu_reissue_state');
      location.reload();
    }
  });
}

function canNavigateToStep(targetStep) {
  if (targetStep === 2) return appState.studentData.regNo !== '';
  if (targetStep === 3) return appState.checklistVerified;
  if (targetStep === 4) return appState.paymentDetails.status === 'completed';
  return true;
}

function goToStep(stepNumber) {
  appState.currentStep = stepNumber;

  for (let i = 1; i <= 4; i++) {
    const card = document.getElementById(`step${i}-card`);
    if (card) {
      if (i === stepNumber) {
        card.classList.add('active');
      } else {
        card.classList.remove('active');
      }
    }
  }

  const stepItems = document.querySelectorAll('.step-item');
  stepItems.forEach(item => {
    const s = parseInt(item.getAttribute('data-step'), 10);
    item.classList.remove('active', 'completed');
    if (s === stepNumber) {
      item.classList.add('active');
    } else if (s < stepNumber) {
      item.classList.add('completed');
    }
  });

  const dividers = document.querySelectorAll('.step-divider');
  dividers.forEach((divider, idx) => {
    if (idx + 1 < stepNumber) {
      divider.classList.add('filled');
    } else {
      divider.classList.remove('filled');
    }
  });

  window.scrollTo({ top: 120, behavior: 'smooth' });
  saveStateToLocalStorage();
}

function setupValidation() {
  const regNoInput = document.getElementById('regNo');
  const nameInput = document.getElementById('fullName');
  const emailInput = document.getElementById('studentEmail');
  const phoneInput = document.getElementById('phone');
  const branchSelect = document.getElementById('branch');
  const bloodSelect = document.getElementById('bloodGroup');

  regNoInput.addEventListener('input', (e) => {
    e.target.value = e.target.value.replace(/\D/g, '').slice(0, 8);
    validateField(regNoInput, REGEX_PATTERNS.regNo, 'regNoError');
  });

  nameInput.addEventListener('input', () => {
    validateField(nameInput, REGEX_PATTERNS.fullName, 'nameError');
  });

  emailInput.addEventListener('input', () => {
    validateField(emailInput, REGEX_PATTERNS.email, 'emailError');
  });

  phoneInput.addEventListener('input', (e) => {
    e.target.value = e.target.value.replace(/\D/g, '').slice(0, 10);
    validateField(phoneInput, REGEX_PATTERNS.phone, 'phoneError');
  });

  branchSelect.addEventListener('change', () => {
    toggleError('branchError', !branchSelect.value);
    branchSelect.classList.toggle('is-invalid', !branchSelect.value);
  });

  bloodSelect.addEventListener('change', () => {
    toggleError('bloodError', !bloodSelect.value);
    bloodSelect.classList.toggle('is-invalid', !bloodSelect.value);
  });

  const reasonRadios = document.querySelectorAll('input[name="reissueReason"]');
  reasonRadios.forEach(radio => {
    radio.addEventListener('change', () => {
      appState.studentData.reason = radio.value;
      appState.checklistVerified = false;
      appState.uploadedFile = null;
    });
  });
}

function validateField(inputElement, regex, errorElementId) {
  const value = inputElement.value.trim();
  const isValid = regex.test(value);
  inputElement.classList.toggle('is-invalid', !isValid);
  toggleError(errorElementId, !isValid);
  return isValid;
}

function toggleError(elementId, show) {
  const el = document.getElementById(elementId);
  if (el) {
    if (show) {
      el.classList.add('visible');
    } else {
      el.classList.remove('visible');
    }
  }
}

function validateStep1() {
  const regNoInput = document.getElementById('regNo');
  const nameInput = document.getElementById('fullName');
  const branchSelect = document.getElementById('branch');
  const bloodSelect = document.getElementById('bloodGroup');
  const emailInput = document.getElementById('studentEmail');
  const phoneInput = document.getElementById('phone');
  const undertaking = document.getElementById('undertaking');

  const isRegValid = validateField(regNoInput, REGEX_PATTERNS.regNo, 'regNoError');
  const isNameValid = validateField(nameInput, REGEX_PATTERNS.fullName, 'nameError');
  const isBranchValid = !!branchSelect.value;
  toggleError('branchError', !isBranchValid);
  branchSelect.classList.toggle('is-invalid', !isBranchValid);

  const isBloodValid = !!bloodSelect.value;
  toggleError('bloodError', !isBloodValid);
  bloodSelect.classList.toggle('is-invalid', !isBloodValid);

  const isEmailValid = validateField(emailInput, REGEX_PATTERNS.email, 'emailError');
  const isPhoneValid = validateField(phoneInput, REGEX_PATTERNS.phone, 'phoneError');

  const isUndertakingChecked = undertaking.checked;
  toggleError('undertakingError', !isUndertakingChecked);

  return isRegValid && isNameValid && isBranchValid && isBloodValid && isEmailValid && isPhoneValid && isUndertakingChecked;
}

function saveStudentFormData() {
  const selectedReason = document.querySelector('input[name="reissueReason"]:checked').value;
  
  appState.studentData = {
    regNo: document.getElementById('regNo').value.trim(),
    fullName: document.getElementById('fullName').value.trim(),
    branch: document.getElementById('branch').value,
    bloodGroup: document.getElementById('bloodGroup').value,
    email: document.getElementById('studentEmail').value.trim(),
    phone: document.getElementById('phone').value.trim(),
    reason: selectedReason
  };
}

function setupDocumentVerification() {
  const dropZone = document.getElementById('dropZone');
  const fileInput = document.getElementById('fileInput');
  const removeFileBtn = document.getElementById('removeFileBtn');

  ['dragenter', 'dragover'].forEach(eventName => {
    dropZone.addEventListener(eventName, (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropZone.classList.add('dragover');
    });
  });

  ['dragleave', 'drop'].forEach(eventName => {
    dropZone.addEventListener(eventName, (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropZone.classList.remove('dragover');
    });
  });

  dropZone.addEventListener('drop', (e) => {
    const dt = e.dataTransfer;
    const files = dt.files;
    if (files.length) handleFileUpload(files[0]);
  });

  fileInput.addEventListener('change', () => {
    if (fileInput.files.length) {
      handleFileUpload(fileInput.files[0]);
    }
  });

  removeFileBtn.addEventListener('click', () => {
    resetUploadedFile();
  });
}

function renderChecklist() {
  const reason = appState.studentData.reason || 'Lost';
  const badge = document.getElementById('selectedReasonBadge');
  const noticeTitle = document.getElementById('noticeTitle');
  const noticeDesc = document.getElementById('noticeDesc');
  const container = document.getElementById('checklistContainer');

  badge.textContent = reason;

  if (reason === 'Lost') {
    badge.className = 'badge-accent tag-danger';
    noticeTitle.textContent = 'Mandatory Police Missing / Lost Article Report Required';
    noticeDesc.innerHTML = 'As per LPU Security protocols, you must simulate uploading a valid <strong>Police NCR / Lost Article Report slip</strong>. This prevents unauthorized duplicate card fraud.';
  } else if (reason === 'Damaged') {
    badge.className = 'badge-accent tag-warning';
    noticeTitle.textContent = 'Damaged Physical Card Surrender Required';
    noticeDesc.innerHTML = 'Students must upload a photo of the cracked/damaged card. The physical card <strong>must be surrendered</strong> at Block 32 counter during collection.';
  } else {
    badge.className = 'badge-accent tag-info';
    noticeTitle.textContent = 'Defaced Card & Updated Photograph Verification';
    noticeDesc.innerHTML = 'For faded photos or broken turnstile RFID chips, please upload an image of the defaced card or a fresh photograph for thermal printing.';
  }

  container.innerHTML = '';
  const items = CHECKLIST_DATA[reason] || CHECKLIST_DATA['Lost'];

  items.forEach((item) => {
    const itemDiv = document.createElement('div');
    itemDiv.className = 'checklist-item';
    itemDiv.id = `item_${item.id}`;
    itemDiv.innerHTML = `
      <div class="check-left">
        <input type="checkbox" id="${item.id}" class="doc-chk" data-mandatory="${item.mandatory}">
        <div class="check-text">
          <strong>${item.title} ${item.mandatory ? '<span class="required">*</span>' : ''}</strong>
          <span>${item.desc}</span>
        </div>
      </div>
      <span class="check-status-badge badge-pending" id="badge_${item.id}">Pending</span>
    `;
    container.appendChild(itemDiv);

    const chk = itemDiv.querySelector('input[type="checkbox"]');
    chk.addEventListener('change', () => {
      const badgeSpan = document.getElementById(`badge_${item.id}`);
      if (chk.checked) {
        itemDiv.classList.add('verified');
        badgeSpan.className = 'check-status-badge badge-ok';
        badgeSpan.textContent = 'Verified ✔';
      } else {
        itemDiv.classList.remove('verified');
        badgeSpan.className = 'check-status-badge badge-pending';
        badgeSpan.textContent = 'Pending';
      }
      evaluateStep2Readiness();
    });
  });

  evaluateStep2Readiness();
}

function handleFileUpload(file) {
  const allowedExtensions = ['pdf', 'jpg', 'jpeg', 'png'];
  const ext = file.name.split('.').pop().toLowerCase();
  
  if (!allowedExtensions.includes(ext)) {
    alert('Please upload a valid document: PDF, JPG, or PNG format only.');
    return;
  }

  if (file.size > 2 * 1024 * 1024) {
    alert('File size exceeds 2 MB limit. Please upload a smaller document.');
    return;
  }

  appState.uploadedFile = file;

  const previewCard = document.getElementById('docPreviewCard');
  const previewName = document.getElementById('previewFileName');
  const previewSize = document.getElementById('previewFileSize');
  const previewIcon = document.getElementById('previewFileIcon');
  const scanProgress = document.getElementById('scanProgress');
  const scanLabel = document.getElementById('scanLabel');

  previewName.textContent = file.name;
  previewSize.textContent = `${(file.size / (1024 * 1024)).toFixed(2)} MB`;

  if (ext === 'pdf') {
    previewIcon.className = 'fa-solid fa-file-pdf file-icon';
  } else {
    previewIcon.className = 'fa-solid fa-file-image file-icon';
  }

  previewCard.style.display = 'block';
  scanProgress.style.width = '0%';
  scanLabel.innerHTML = '<i class="fa-solid fa-arrows-rotate fa-spin"></i> Authenticating with LPU Security records...';

  let progress = 0;
  const interval = setInterval(() => {
    progress += 20;
    scanProgress.style.width = `${progress}%`;
    if (progress >= 100) {
      clearInterval(interval);
      scanLabel.innerHTML = '<span style="color:#10B981; font-weight:600;"><i class="fa-solid fa-circle-check"></i> Document Authenticity Verified (Security Clearance Code: LPU-SEC-992)</span>';
      
      const firstMandatory = document.querySelector('.doc-chk[data-mandatory="true"]');
      if (firstMandatory && !firstMandatory.checked) {
        firstMandatory.checked = true;
        firstMandatory.dispatchEvent(new Event('change'));
      }
      evaluateStep2Readiness();
    }
  }, 200);
}

function resetUploadedFile() {
  appState.uploadedFile = null;
  document.getElementById('fileInput').value = '';
  document.getElementById('docPreviewCard').style.display = 'none';
  evaluateStep2Readiness();
}

function evaluateStep2Readiness() {
  const mandatoryCheckboxes = document.querySelectorAll('.doc-chk[data-mandatory="true"]');
  let allMandatoryChecked = mandatoryCheckboxes.length > 0;

  mandatoryCheckboxes.forEach(chk => {
    if (!chk.checked) allMandatoryChecked = false;
  });

  const hasFile = appState.uploadedFile !== null;
  const isReady = allMandatoryChecked && hasFile;

  appState.checklistVerified = isReady;

  const toStep3Btn = document.getElementById('toStep3Btn');
  const resultCard = document.getElementById('verificationResultCard');
  const statusIndicator = document.getElementById('statusIndicator');
  const statusTextValue = document.getElementById('statusTextValue');
  const statusDescValue = document.getElementById('statusDescValue');

  if (isReady) {
    toStep3Btn.removeAttribute('disabled');
    resultCard.classList.add('verified-ready');
    statusIndicator.innerHTML = '<i class="fa-solid fa-check"></i>';
    statusTextValue.textContent = 'Cleared for Reissue Authorization';
    statusTextValue.style.color = '#10B981';
    statusDescValue.textContent = 'All mandatory documents verified. You may now proceed to calculate the reissue fee and pay.';
  } else {
    toStep3Btn.setAttribute('disabled', 'true');
    resultCard.classList.remove('verified-ready');
    statusIndicator.innerHTML = '<i class="fa-solid fa-clock-rotate-left"></i>';
    statusTextValue.textContent = 'Pending Document Upload & Checklist';
    statusTextValue.style.color = '#0F172A';
    statusDescValue.textContent = 'Please upload your supporting document and check the mandatory requirements above.';
  }
}

function setupFeeCalculator() {
  const procRadios = document.querySelectorAll('input[name="processingType"]');
  const addonHolder = document.getElementById('addonHolder');
  const addonTempSlip = document.getElementById('addonTempSlip');

  procRadios.forEach(radio => {
    radio.addEventListener('change', () => {
      appState.feeBreakdown.processingType = radio.value;
      appState.feeBreakdown.baseFee = (radio.value === 'urgent') ? 600 : 300;
      updateFeeSummary();
    });
  });

  addonHolder.addEventListener('change', () => {
    appState.feeBreakdown.hasHolder = addonHolder.checked;
    updateFeeSummary();
  });

  addonTempSlip.addEventListener('change', () => {
    appState.feeBreakdown.hasTempSlip = addonTempSlip.checked;
    updateFeeSummary();
  });

  const payMethodCards = document.querySelectorAll('.pay-method-card');
  payMethodCards.forEach(card => {
    card.addEventListener('click', () => {
      payMethodCards.forEach(c => c.classList.remove('active'));
      card.classList.add('active');

      const radio = card.querySelector('input[name="payMethod"]');
      radio.checked = true;
      appState.paymentDetails.method = radio.value;

      document.getElementById('upiBox').style.display = (radio.value === 'UPI') ? 'block' : 'none';
      document.getElementById('cardBox').style.display = (radio.value === 'Card') ? 'block' : 'none';
      document.getElementById('umsBox').style.display = (radio.value === 'UMS_Gateway') ? 'block' : 'none';
    });
  });
}

function updateFeeSummary() {
  const student = appState.studentData;
  document.getElementById('billRegNo').textContent = student.regNo || '12204589';
  document.getElementById('billStudentName').textContent = student.fullName || 'Rahul Sharma';
  document.getElementById('billReason').textContent = student.reason || 'Lost';

  const isUrgent = appState.feeBreakdown.processingType === 'urgent';
  const procTitle = document.getElementById('billProcTitle');
  const procAmount = document.getElementById('billProcAmount');

  if (isUrgent) {
    procTitle.textContent = 'Urgent 24-Hour Express Processing';
    procAmount.textContent = '₹600.00';
  } else {
    procTitle.textContent = 'Standard Batch Processing (3-5 Days)';
    procAmount.textContent = '₹300.00';
  }

  const rowHolder = document.getElementById('rowAddonHolder');
  const rowSlip = document.getElementById('rowAddonSlip');

  rowHolder.style.display = appState.feeBreakdown.hasHolder ? 'flex' : 'none';
  rowSlip.style.display = appState.feeBreakdown.hasTempSlip ? 'flex' : 'none';

  let total = appState.feeBreakdown.baseFee;
  if (appState.feeBreakdown.hasHolder) total += 50;
  if (appState.feeBreakdown.hasTempSlip) total += 40;

  appState.feeBreakdown.total = total;
  document.getElementById('billTotalAmount').textContent = `₹${total}.00`;
  document.getElementById('btnPayAmount').textContent = total;
}

function setupPaymentGateway() {
  const payNowBtn = document.getElementById('payNowBtn');
  const paymentModal = document.getElementById('paymentSuccessModal');
  const viewTrackingBtn = document.getElementById('viewTrackingBtn');

  payNowBtn.addEventListener('click', () => {
    payNowBtn.disabled = true;
    payNowBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Processing Secure University Payment...';

    setTimeout(() => {
      payNowBtn.disabled = false;
      payNowBtn.innerHTML = `<i class="fa-solid fa-lock"></i> Pay & Authorize Reissue (₹${appState.feeBreakdown.total})`;

      const randomTxn = 'TXN-LPU-' + Math.floor(100000 + Math.random() * 900000);
      appState.paymentDetails.status = 'completed';
      appState.paymentDetails.transactionId = randomTxn;
      appState.paymentDetails.paymentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      document.getElementById('modalTxnId').textContent = randomTxn;
      paymentModal.classList.add('active');
    }, 1500);
  });

  viewTrackingBtn.addEventListener('click', () => {
    paymentModal.classList.remove('active');
    populateTrackingAndDigitalCard();
    goToStep(4);
  });
}

function setupTrackingEngine() {
  const advanceBtn = document.getElementById('advanceTrackBtn');
  const printReceiptBtn = document.getElementById('printReceiptBtn');

  advanceBtn.addEventListener('click', () => {
    if (appState.trackingStage < 5) {
      appState.trackingStage++;
      updateTrackingUI();
    } else {
      alert('Card is already at the final stage: Ready for collection at Block 32 Counter 4!');
    }
  });

  printReceiptBtn.addEventListener('click', () => {
    window.print();
  });
}

function populateTrackingAndDigitalCard() {
  const student = appState.studentData;
  const isUrgent = appState.feeBreakdown.processingType === 'urgent';

  const refId = `LPU-ID-2026-${student.regNo ? student.regNo.slice(-5) : '89241'}`;
  document.getElementById('trackRefId').textContent = refId;

  const estDateSpan = document.getElementById('trackEstimatedDate');
  if (isUrgent) {
    estDateSpan.textContent = 'Within 24 Hours (Express Print)';
    estDateSpan.style.color = '#D9480F';
  } else {
    estDateSpan.textContent = '3 to 5 Working Days (Standard)';
    estDateSpan.style.color = '#0F172A';
  }

  document.getElementById('cardStudentName').textContent = (student.fullName || 'RAHUL SHARMA').toUpperCase();
  document.getElementById('cardRegNo').textContent = student.regNo || '12204589';
  document.getElementById('cardBranch').textContent = student.branch || 'B.Tech Computer Science & Engg';
  document.getElementById('cardBloodGroup').textContent = student.bloodGroup || 'B+';

  updateTrackingUI();
}

function updateTrackingUI() {
  const currentStage = appState.trackingStage;
  const nodes = document.querySelectorAll('.timeline-node');
  const currentStatusBadge = document.getElementById('trackCurrentStatus');
  const trackLocation = document.getElementById('trackLocation');

  nodes.forEach(node => {
    const stageNum = parseInt(node.getAttribute('data-stage'), 10);
    const timeSpan = document.getElementById(`timeStage${stageNum}`);

    node.classList.remove('completed', 'in-progress', 'pending');

    if (stageNum < currentStage) {
      node.classList.add('completed');
      if (timeSpan && timeSpan.textContent === 'Pending' || timeSpan.textContent === 'In Progress') {
        timeSpan.textContent = 'Done ✔';
      }
    } else if (stageNum === currentStage) {
      node.classList.add('in-progress');
      if (timeSpan) timeSpan.textContent = 'Active Now';
    } else {
      node.classList.add('pending');
      if (timeSpan) timeSpan.textContent = 'Pending';
    }
  });

  const stageInfo = CAMPUS_STAGES[currentStage - 1];
  if (stageInfo) {
    currentStatusBadge.textContent = stageInfo.title;
    trackLocation.textContent = stageInfo.dept;
  }
}

function setupModals() {
  const syllabusModal = document.getElementById('syllabusModal');
  const openSyllabusBtn = document.getElementById('syllabusModalBtn');
  const closeSyllabusModal = document.getElementById('closeSyllabusModal');
  const closeSyllabusBtn = document.getElementById('closeSyllabusBtn');

  openSyllabusBtn.addEventListener('click', () => syllabusModal.classList.add('active'));
  closeSyllabusModal.addEventListener('click', () => syllabusModal.classList.remove('active'));
  closeSyllabusBtn.addEventListener('click', () => syllabusModal.classList.remove('active'));

  window.addEventListener('click', (e) => {
    if (e.target === syllabusModal) syllabusModal.classList.remove('active');
  });
}

function setupAutoFillDemo() {
  const demoBtn = document.getElementById('demoFillBtn');
  demoBtn.addEventListener('click', () => {
    document.getElementById('regNo').value = '12204589';
    document.getElementById('fullName').value = 'Rahul Sharma';
    document.getElementById('branch').value = 'School of Computer Science & Engineering (B.Tech CSE)';
    document.getElementById('bloodGroup').value = 'B+';
    document.getElementById('studentEmail').value = 'rahul.12204589@lpu.in';
    document.getElementById('phone').value = '9876543210';
    document.getElementById('reasonLost').checked = true;
    document.getElementById('undertaking').checked = true;

    ['regNo', 'fullName', 'studentEmail', 'phone'].forEach(id => {
      document.getElementById(id).classList.remove('is-invalid');
    });
    document.querySelectorAll('.error-msg').forEach(el => el.classList.remove('visible'));

    saveStudentFormData();
    renderChecklist();
    goToStep(2);

    setTimeout(() => {
      const dummyFile = new File(['Dummy police report content'], 'LPU_Police_NCR_Report.pdf', { type: 'application/pdf' });
      handleFileUpload(dummyFile);
    }, 400);
  });
}

function saveStateToLocalStorage() {
  try {
    const serialized = JSON.stringify({
      currentStep: appState.currentStep,
      studentData: appState.studentData,
      feeBreakdown: appState.feeBreakdown,
      paymentDetails: appState.paymentDetails,
      trackingStage: appState.trackingStage
    });
    localStorage.setItem('lpu_reissue_state', serialized);
  } catch (err) {
    console.error('LocalStorage write failed:', err);
  }
}

function loadStateFromLocalStorage() {
  try {
    const saved = localStorage.getItem('lpu_reissue_state');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && parsed.studentData && parsed.studentData.regNo) {
        appState.studentData = parsed.studentData;
        appState.feeBreakdown = parsed.feeBreakdown || appState.feeBreakdown;
        appState.paymentDetails = parsed.paymentDetails || appState.paymentDetails;
        appState.trackingStage = parsed.trackingStage || 3;

        document.getElementById('regNo').value = parsed.studentData.regNo || '';
        document.getElementById('fullName').value = parsed.studentData.fullName || '';
        document.getElementById('branch').value = parsed.studentData.branch || '';
        document.getElementById('bloodGroup').value = parsed.studentData.bloodGroup || '';
        document.getElementById('studentEmail').value = parsed.studentData.email || '';
        document.getElementById('phone').value = parsed.studentData.phone || '';

        const reasonRadio = document.querySelector(`input[name="reissueReason"][value="${parsed.studentData.reason}"]`);
        if (reasonRadio) reasonRadio.checked = true;
      }
    }
  } catch (err) {
    console.warn('LocalStorage read error:', err);
  }
}

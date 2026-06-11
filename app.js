// ==========================================================================
// 7th CPC Pay Matrix Mapping (Minimum Basic Pay for entry of each level)
// ==========================================================================
const PAY_LEVEL_MINIMUMS = {
  "1": 18000,
  "2": 19900,
  "3": 21700,
  "4": 25500,
  "5": 29200,
  "6": 35400,
  "7": 44900,
  "8": 47600,
  "9": 53100,
  "10": 56100,
  "11": 67700,
  "12": 78800,
  "13": 123100,
  "13A": 131100,
  "14": 144200,
  "15": 182200,
  "16": 205400,
  "17": 225000,
  "18": 250000
};

// ==========================================================================
// Application State
// ==========================================================================
const state = {
  // Salary Inputs
  payLevel: "10",
  basicPay: 56100,
  daPercentP1: 50, // Apr - Jun (3 months)
  daPercentP2: 53, // Jul - Mar (9 months)
  cityTier: "X", // X, Y, or Z
  isHigherTpta: true,
  isQuarters: false, // Staying in Official Quarters

  // Tax Inputs & Deductions
  rentPaid: 15000, // Monthly rent paid
  ceaChildren: 2, // 0, 1, or 2 children
  exemptionLtc: 0, // LTC / Leave Encashment Exemption (Sec 10(5))
  deduct80C: 150000,
  deduct80D: 25000,
  deductNps: 50000,

  // Calculated Outputs
  monthlyGrossP1: 0,
  monthlyGrossP2: 0,
  annualGross: 0,
  breakdownP1: { basic: 0, da: 0, hra: 0, ta: 0 },
  breakdownP2: { basic: 0, da: 0, hra: 0, ta: 0 },
  
  taxOld: {
    taxableIncome: 0,
    deductionsTotal: 0,
    exemptHra: 0,
    exemptCea: 0,
    exemptLtc: 0,
    baseTax: 0,
    rebate: 0,
    cess: 0,
    totalTax: 0
  },
  taxNew: {
    taxableIncome: 0,
    deductionsTotal: 75000,
    baseTax: 0,
    rebate: 0,
    cess: 0,
    totalTax: 0
  }
};

// ==========================================================================
// Core Calculation Logic
// ==========================================================================

/**
 * Calculates HRA based on city tier, DA percentage, and Official Quarters status.
 * Revise rates when DA crosses 50%:
 * - X: 27% -> 30% (Floor: 5,400)
 * - Y: 18% -> 20% (Floor: 3,600)
 * - Z: 9% -> 10% (Floor: 1,800)
 * 
 * Overridden to 0 if living in official quarters.
 */
function calculateHra(basic, daPercent, tier, isQuarters) {
  if (isQuarters) {
    return 0;
  }

  const isDaAbove50 = daPercent > 50;
  let rate = 0;
  let floor = 0;

  switch (tier) {
    case "X":
      rate = isDaAbove50 ? 30 : 27;
      floor = 5400;
      break;
    case "Y":
      rate = isDaAbove50 ? 20 : 18;
      floor = 3600;
      break;
    case "Z":
    default:
      rate = isDaAbove50 ? 10 : 9;
      floor = 1800;
      break;
  }

  const calculatedHra = basic * (rate / 100);
  return Math.max(calculatedHra, floor);
}

/**
 * Calculates Transport Allowance (TA) based on Pay Level, Basic Pay, and Higher TPTA City status.
 * TA = Base TA + DA on TA.
 */
function calculateTa(payLevel, basic, daPercent, isHigherTpta) {
  let baseTa = 0;

  // Normalize level representation (e.g. Level "13A" is treated as level 13 for TA scales)
  const levelNum = payLevel === "13A" ? 13 : parseInt(payLevel, 10);

  if (levelNum >= 9) {
    baseTa = isHigherTpta ? 7200 : 3600;
  } else if (levelNum >= 3) {
    baseTa = isHigherTpta ? 3600 : 1800;
  } else {
    // Levels 1 and 2
    if (basic >= 24200) {
      baseTa = isHigherTpta ? 3600 : 1800;
    } else {
      baseTa = isHigherTpta ? 1350 : 900;
    }
  }

  const daOnTa = baseTa * (daPercent / 100);
  return baseTa + daOnTa;
}

/**
 * Calculates HRA Tax Exemption (Sec 10(13A)) under Old Regime.
 * Exemption is the minimum of 3 values:
 * 1. Actual HRA received (3 months for Period 1, 9 months for Period 2).
 * 2. Rent paid minus 10% of (Basic + DA).
 * 3. 50% (Class X) or 40% (Class Y/Z) of (Basic + DA).
 */
function calculateHraExemption(basicPay, daP1, daP2, hraP1, hraP2, rentPaid, cityTier, isQuarters) {
  if (isQuarters || rentPaid <= 0) {
    return 0;
  }

  // Correct 3-month / 9-month annual HRA received
  const annualHraReceived = (hraP1 * 3) + (hraP2 * 9);
  const annualRentPaid = rentPaid * 12;

  // Correct 3-month / 9-month annual Basic + DA
  const annualBasic = basicPay * 12;
  const annualDa = (basicPay * (daP1 / 100) * 3) + (basicPay * (daP2 / 100) * 9);
  const annualBasicPlusDa = annualBasic + annualDa;

  // Rule 2: Rent paid in excess of 10% of Basic + DA
  const rentExcess = Math.max(0, annualRentPaid - (0.10 * annualBasicPlusDa));

  // Rule 3: 50% of Basic + DA for Delhi/Mumbai/Kolkata/Chennai (Class X), otherwise 40%
  const cityPercentage = cityTier === "X" ? 0.50 : 0.40;
  const limitByCity = annualBasicPlusDa * cityPercentage;

  return Math.min(annualHraReceived, rentExcess, limitByCity);
}

/**
 * Calculates Old Tax Regime liability (FY 2025-26 & FY 2026-27).
 */
function calculateOldRegimeTax(annualGross, exemptHra, exemptCea, exemptLtc, sec80C, sec80D, sec80Nps) {
  const capped80C = Math.min(sec80C, 150000);
  const capped80D = Math.min(sec80D, 100000);
  const cappedNps = Math.min(sec80Nps, 50000);
  const standardDeduction = 50000;

  // Total deductions = standard deduction + capped 80 series + Section 10 exemptions
  const totalDeductions = standardDeduction + capped80C + capped80D + cappedNps + exemptHra + exemptCea + exemptLtc;
  const taxableIncome = Math.max(0, annualGross - totalDeductions);

  let baseTax = 0;
  if (taxableIncome > 1000000) {
    baseTax += (taxableIncome - 1000000) * 0.30;
    baseTax += 500000 * 0.20; // 5L to 10L
    baseTax += 250000 * 0.05; // 2.5L to 5L
  } else if (taxableIncome > 500000) {
    baseTax += (taxableIncome - 500000) * 0.20;
    baseTax += 250000 * 0.05; // 2.5L to 5L
  } else if (taxableIncome > 250000) {
    baseTax += (taxableIncome - 250000) * 0.05;
  }

  // Section 87A Rebate: 100% of tax if taxable income <= 5,00,000 (Max ₹12,500)
  let rebate = 0;
  if (taxableIncome <= 500000) {
    rebate = baseTax;
  }

  const taxAfterRebate = Math.max(0, baseTax - rebate);
  const cess = taxAfterRebate * 0.04;
  const totalTax = taxAfterRebate + cess;

  return {
    taxableIncome,
    deductionsTotal: totalDeductions,
    exemptHra,
    exemptCea,
    exemptLtc,
    baseTax,
    rebate,
    cess,
    totalTax
  };
}

/**
 * Calculates New Tax Regime liability (FY 2025-26 & FY 2026-27).
 */
function calculateNewRegimeTax(annualGross) {
  const standardDeduction = 75000;
  const taxableIncome = Math.max(0, annualGross - standardDeduction);

  let baseTax = 0;

  // Slabs:
  // Up to 4L: Nil | 4L-8L: 5% | 8L-12L: 10% | 12L-16L: 15% | 16L-20L: 20% | 20L-24L: 25% | Above 24L: 30%
  if (taxableIncome > 2400000) {
    baseTax += (taxableIncome - 2400000) * 0.30;
    baseTax += 400000 * 0.25; // 20L to 24L
    baseTax += 400000 * 0.20; // 16L to 20L
    baseTax += 400000 * 0.15; // 12L to 16L
    baseTax += 400000 * 0.10; // 8L to 12L
    baseTax += 400000 * 0.05; // 4L to 8L
  } else if (taxableIncome > 2000000) {
    baseTax += (taxableIncome - 2000000) * 0.25;
    baseTax += 400000 * 0.20; // 16L to 20L
    baseTax += 400000 * 0.15; // 12L to 16L
    baseTax += 400000 * 0.10; // 8L to 12L
    baseTax += 400000 * 0.05; // 4L to 8L
  } else if (taxableIncome > 1600000) {
    baseTax += (taxableIncome - 1600000) * 0.20;
    baseTax += 400000 * 0.15; // 12L to 16L
    baseTax += 400000 * 0.10; // 8L to 12L
    baseTax += 400000 * 0.05; // 4L to 8L
  } else if (taxableIncome > 1200000) {
    baseTax += (taxableIncome - 1200000) * 0.15;
    baseTax += 400000 * 0.10; // 8L to 12L
    baseTax += 400000 * 0.05; // 4L to 8L
  } else if (taxableIncome > 800000) {
    baseTax += (taxableIncome - 800000) * 0.10;
    baseTax += 400000 * 0.05; // 4L to 8L
  } else if (taxableIncome > 400000) {
    baseTax += (taxableIncome - 400000) * 0.05;
  }

  let finalBaseTax = baseTax;
  let rebate = 0;

  // Rebate & Marginal Relief
  if (taxableIncome <= 1200000) {
    rebate = baseTax;
    finalBaseTax = 0;
  } else {
    // Marginal Relief check
    const excessIncome = taxableIncome - 1200000;
    if (baseTax > excessIncome) {
      finalBaseTax = excessIncome;
      rebate = baseTax - finalBaseTax;
    }
  }

  const cess = finalBaseTax * 0.04;
  const totalTax = finalBaseTax + cess;

  return {
    taxableIncome,
    deductionsTotal: standardDeduction,
    baseTax,
    rebate,
    cess,
    totalTax
  };
}

/**
 * Main calculation orchestration. Syncs the UI and state variables.
 */
function updateCalculations() {
  // 1. Read Inputs from DOM
  state.basicPay = parseFloat(document.getElementById("basic-pay").value) || 0;
  state.daPercentP1 = parseFloat(document.getElementById("da-percent-p1").value) || 0;
  state.daPercentP2 = parseFloat(document.getElementById("da-percent-p2").value) || 0;
  state.isQuarters = document.getElementById("quarters-toggle").checked;
  state.isHigherTpta = document.getElementById("tpta-toggle").checked;

  const cityTierElements = document.getElementsByName("city-tier");
  for (const el of cityTierElements) {
    if (el.checked) {
      state.cityTier = el.value;
      break;
    }
  }

  // Handle quarters HRA visibility and rent inputs
  const rentInput = document.getElementById("rent-paid");
  const rentGroup = document.getElementById("rent-input-group");
  const cityTierGroup = document.getElementById("city-tier-group");

  if (state.isQuarters) {
    rentInput.disabled = true;
    rentInput.value = 0;
    state.rentPaid = 0;
    rentGroup.style.opacity = "0.5";
    cityTierGroup.style.opacity = "0.5";
  } else {
    rentInput.disabled = false;
    state.rentPaid = parseFloat(rentInput.value) || 0;
    rentGroup.style.opacity = "1";
    cityTierGroup.style.opacity = "1";
  }

  state.ceaChildren = parseInt(document.getElementById("cea-children").value, 10) || 0;
  state.exemptionLtc = parseFloat(document.getElementById("exemption-ltc").value) || 0;
  
  state.deduct80C = parseFloat(document.getElementById("deduct-80c").value) || 0;
  state.deduct80D = parseFloat(document.getElementById("deduct-80d").value) || 0;
  state.deductNps = parseFloat(document.getElementById("deduct-nps").value) || 0;

  // 2. Perform Salary splits
  // Period 1 (Apr - Jun: 3 months)
  const daP1Val = state.basicPay * (state.daPercentP1 / 100);
  const hraP1Val = calculateHra(state.basicPay, state.daPercentP1, state.cityTier, state.isQuarters);
  const taP1Val = calculateTa(state.payLevel, state.basicPay, state.daPercentP1, state.isHigherTpta);

  state.breakdownP1.basic = state.basicPay;
  state.breakdownP1.da = daP1Val;
  state.breakdownP1.hra = hraP1Val;
  state.breakdownP1.ta = taP1Val;
  state.monthlyGrossP1 = state.basicPay + daP1Val + hraP1Val + taP1Val;

  // Period 2 (Jul - Mar: 9 months)
  const daP2Val = state.basicPay * (state.daPercentP2 / 100);
  const hraP2Val = calculateHra(state.basicPay, state.daPercentP2, state.cityTier, state.isQuarters);
  const taP2Val = calculateTa(state.payLevel, state.basicPay, state.daPercentP2, state.isHigherTpta);

  state.breakdownP2.basic = state.basicPay;
  state.breakdownP2.da = daP2Val;
  state.breakdownP2.hra = hraP2Val;
  state.breakdownP2.ta = taP2Val;
  state.monthlyGrossP2 = state.basicPay + daP2Val + hraP2Val + taP2Val;

  // Correct 3-month / 9-month Annual Gross Formula
  state.annualGross = (state.monthlyGrossP1 * 3) + (state.monthlyGrossP2 * 9);

  // 3. Perform Tax logic
  // Exemptions (Old Regime)
  const exemptHra = calculateHraExemption(
    state.basicPay, 
    state.daPercentP1, state.daPercentP2, 
    hraP1Val, hraP2Val, 
    state.rentPaid, 
    state.cityTier, 
    state.isQuarters
  );
  const exemptCea = state.ceaChildren * 1200; // ₹1,200 per child (max 2 children)
  const exemptLtc = state.exemptionLtc;

  state.taxOld = calculateOldRegimeTax(state.annualGross, exemptHra, exemptCea, exemptLtc, state.deduct80C, state.deduct80D, state.deductNps);
  state.taxNew = calculateNewRegimeTax(state.annualGross);

  // Render to UI
  renderOutputs();
}

// ==========================================================================
// Rendering and Formatting Utilities
// ==========================================================================

function formatCurrency(num) {
  const rounded = Math.round(num);
  return "₹" + rounded.toLocaleString("en-IN");
}

function renderOutputs() {
  // Render Salary tab values
  document.getElementById("monthly-gross-p1").innerText = formatCurrency(state.monthlyGrossP1);
  document.getElementById("monthly-gross-p2").innerText = formatCurrency(state.monthlyGrossP2);
  document.getElementById("annual-gross").innerText = formatCurrency(state.annualGross);

  // Period comparisons table
  document.getElementById("breakdown-basic-p1").innerText = formatCurrency(state.breakdownP1.basic);
  document.getElementById("breakdown-basic-p2").innerText = formatCurrency(state.breakdownP2.basic);
  
  document.getElementById("breakdown-da-p1").innerText = `${formatCurrency(state.breakdownP1.da)} (${state.daPercentP1}%)`;
  document.getElementById("breakdown-da-p2").innerText = `${formatCurrency(state.breakdownP2.da)} (${state.daPercentP2}%)`;

  document.getElementById("breakdown-hra-p1").innerText = state.isQuarters ? "₹0 (Qtrs)" : formatCurrency(state.breakdownP1.hra);
  document.getElementById("breakdown-hra-p2").innerText = state.isQuarters ? "₹0 (Qtrs)" : formatCurrency(state.breakdownP2.hra);

  document.getElementById("breakdown-ta-p1").innerText = formatCurrency(state.breakdownP1.ta);
  document.getElementById("breakdown-ta-p2").innerText = formatCurrency(state.breakdownP2.ta);

  // HRA Notice handling
  const hraNoticeEl = document.getElementById("hra-notice");
  const hraNoticeText = document.getElementById("hra-notice-text");

  if (state.isQuarters) {
    hraNoticeEl.style.display = "flex";
    hraNoticeText.innerText = "Staying in Official Quarters. HRA is set to ₹0.";
  } else if (state.daPercentP1 > 50 || state.daPercentP2 > 50) {
    hraNoticeEl.style.display = "flex";
    hraNoticeText.innerText = "HRA rates are automatically upgraded to 30%/20%/10% for periods where DA crosses 50%.";
  } else {
    hraNoticeEl.style.display = "none";
  }

  // Sync Gross Salary to Tax tab
  document.getElementById("tax-gross-display").innerText = formatCurrency(state.annualGross);

  // Render Tax tab comparison values
  document.getElementById("old-taxable").innerText = formatCurrency(state.taxOld.taxableIncome);
  document.getElementById("old-base-tax").innerText = formatCurrency(state.taxOld.baseTax);
  document.getElementById("old-cess").innerText = formatCurrency(state.taxOld.cess);
  document.getElementById("old-total-tax").innerText = formatCurrency(state.taxOld.totalTax);

  document.getElementById("new-taxable").innerText = formatCurrency(state.taxNew.taxableIncome);
  document.getElementById("new-base-tax").innerText = formatCurrency(state.taxNew.baseTax);
  document.getElementById("new-cess").innerText = formatCurrency(state.taxNew.cess);
  document.getElementById("new-total-tax").innerText = formatCurrency(state.taxNew.totalTax);

  // Set highlight/active status on tax regime column
  const oldBox = document.getElementById("old-regime-box");
  const newBox = document.getElementById("new-regime-box");
  const banner = document.getElementById("savings-banner");

  const diff = Math.abs(state.taxOld.totalTax - state.taxNew.totalTax);

  if (state.taxOld.totalTax < state.taxNew.totalTax) {
    oldBox.classList.add("active");
    newBox.classList.remove("active");
    banner.className = "savings-banner alert-success";
    banner.innerText = `Old Tax Regime is better! You save ${formatCurrency(diff)} annually.`;
  } else if (state.taxNew.totalTax < state.taxOld.totalTax) {
    newBox.classList.add("active");
    oldBox.classList.remove("active");
    banner.className = "savings-banner alert-success";
    banner.innerText = `New Tax Regime is better! You save ${formatCurrency(diff)} annually.`;
  } else {
    oldBox.classList.remove("active");
    newBox.classList.remove("active");
    banner.className = "savings-banner alert-info";
    banner.innerText = "Both tax regimes result in the exact same tax liability.";
  }

  // Render 87A rebate & marginal relief notifications in Tax tab
  const rebateNotice = document.getElementById("rebate-87a-notice");
  const reliefNotice = document.getElementById("marginal-relief-notice");

  if (state.taxNew.taxableIncome > 0 && state.taxNew.taxableIncome <= 1200000) {
    rebateNotice.style.display = "flex";
    document.getElementById("rebate-text").innerText = `Section 87A rebate of ${formatCurrency(state.taxNew.rebate)} applied. Net tax is zero.`;
  } else {
    rebateNotice.style.display = "none";
  }

  if (state.taxNew.taxableIncome > 1200000 && state.taxNew.rebate > 0) {
    reliefNotice.style.display = "flex";
  } else {
    reliefNotice.style.display = "none";
  }

  // 4. Render Summary tab values
  // Salary Breakdown Table
  document.getElementById("sum-basic-p1").innerText = formatCurrency(state.breakdownP1.basic);
  document.getElementById("sum-basic-p2").innerText = formatCurrency(state.breakdownP2.basic);
  
  document.getElementById("sum-da-p1").innerText = `${formatCurrency(state.breakdownP1.da)} (${state.daPercentP1}%)`;
  document.getElementById("sum-da-p2").innerText = `${formatCurrency(state.breakdownP2.da)} (${state.daPercentP2}%)`;

  document.getElementById("sum-hra-p1").innerText = state.isQuarters ? "₹0 (Qtrs)" : formatCurrency(state.breakdownP1.hra);
  document.getElementById("sum-hra-p2").innerText = state.isQuarters ? "₹0 (Qtrs)" : formatCurrency(state.breakdownP2.hra);

  document.getElementById("sum-ta-p1").innerText = formatCurrency(state.breakdownP1.ta);
  document.getElementById("sum-ta-p2").innerText = formatCurrency(state.breakdownP2.ta);

  document.getElementById("sum-monthly-gross-p1").innerText = formatCurrency(state.monthlyGrossP1);
  document.getElementById("sum-monthly-gross-p2").innerText = formatCurrency(state.monthlyGrossP2);
  document.getElementById("sum-annual-gross").innerText = formatCurrency(state.annualGross);

  // Tax Table details
  document.getElementById("sum-tax-gross-old").innerText = formatCurrency(state.annualGross);
  document.getElementById("sum-tax-gross-new").innerText = formatCurrency(state.annualGross);
  
  document.getElementById("sum-ex-hra").innerText = "- " + formatCurrency(state.taxOld.exemptHra);
  document.getElementById("sum-ex-cea").innerText = "- " + formatCurrency(state.taxOld.exemptCea);
  document.getElementById("sum-ex-ltc").innerText = "- " + formatCurrency(state.taxOld.exemptLtc);

  document.getElementById("sum-80c").innerText = "- " + formatCurrency(Math.min(state.deduct80C, 150000));
  document.getElementById("sum-80d").innerText = "- " + formatCurrency(Math.min(state.deduct80D, 100000));
  document.getElementById("sum-nps").innerText = "- " + formatCurrency(Math.min(state.deductNps, 50000));

  document.getElementById("sum-taxable-old").innerText = formatCurrency(state.taxOld.taxableIncome);
  document.getElementById("sum-taxable-new").innerText = formatCurrency(state.taxNew.taxableIncome);
  document.getElementById("sum-basetax-old").innerText = formatCurrency(state.taxOld.baseTax);
  document.getElementById("sum-basetax-new").innerText = formatCurrency(state.taxNew.baseTax);
  
  document.getElementById("sum-rebate-old").innerText = "- " + formatCurrency(state.taxOld.rebate);
  document.getElementById("sum-rebate-new").innerText = "- " + formatCurrency(state.taxNew.rebate);
  document.getElementById("sum-cess-old").innerText = formatCurrency(state.taxOld.cess);
  document.getElementById("sum-cess-new").innerText = formatCurrency(state.taxNew.cess);
  
  document.getElementById("sum-totaltax-old").innerText = formatCurrency(state.taxOld.totalTax);
  document.getElementById("sum-totaltax-new").innerText = formatCurrency(state.taxNew.totalTax);

  // Set recommendation card text in Summary tab
  const recBadge = document.getElementById("sum-recommendation");
  if (state.taxOld.totalTax < state.taxNew.totalTax) {
    recBadge.className = "recommendation-badge alert-success";
    recBadge.innerText = `RECOMMENDATION: Opt for the OLD Tax Regime. It saves you ${formatCurrency(diff)} in tax liability this year.`;
  } else if (state.taxNew.totalTax < state.taxOld.totalTax) {
    recBadge.className = "recommendation-badge alert-success";
    recBadge.innerText = `RECOMMENDATION: Opt for the NEW Tax Regime (Default). It saves you ${formatCurrency(diff)} in tax liability this year.`;
  } else {
    recBadge.className = "recommendation-badge alert-info";
    recBadge.innerText = "RECOMMENDATION: You can choose either regime as the tax liabilities are identical. (New Regime is default).";
  }
}

// ==========================================================================
// Routing and Tab Navigation
// ==========================================================================
function setupTabNavigation() {
  const tabs = [
    { buttonId: "nav-btn-salary", panelId: "tab-salary" },
    { buttonId: "nav-btn-tax", panelId: "tab-tax" },
    { buttonId: "nav-btn-summary", panelId: "tab-summary" }
  ];

  tabs.forEach(tab => {
    document.getElementById(tab.buttonId).addEventListener("click", () => {
      // Deactivate all nav buttons and panels
      tabs.forEach(t => {
        document.getElementById(t.buttonId).classList.remove("active");
        document.getElementById(t.panelId).classList.remove("active");
      });

      // Activate current
      document.getElementById(tab.buttonId).classList.add("active");
      document.getElementById(tab.panelId).classList.add("active");
      
      // Auto scroll content window back to top on tab switch
      document.querySelector(".content-container").scrollTop = 0;
    });
  });
}

// ==========================================================================
// Theme Toggler (Light / Dark Mode)
// ==========================================================================
function setupThemeToggle() {
  const toggleBtn = document.getElementById("theme-toggle");
  const sunIcon = toggleBtn.querySelector(".sun-icon");
  const moonIcon = toggleBtn.querySelector(".moon-icon");

  toggleBtn.addEventListener("click", () => {
    const isDark = document.body.classList.toggle("dark-mode");
    document.body.classList.toggle("light-mode", !isDark);

    if (isDark) {
      sunIcon.style.display = "none";
      moonIcon.style.display = "block";
      localStorage.setItem("theme", "dark");
    } else {
      sunIcon.style.display = "block";
      moonIcon.style.display = "none";
      localStorage.setItem("theme", "light");
    }
  });

  // Load saved theme or system preferences
  const savedTheme = localStorage.getItem("theme");
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  
  if (savedTheme === "dark" || (!savedTheme && prefersDark)) {
    document.body.classList.add("dark-mode");
    document.body.classList.remove("light-mode");
    sunIcon.style.display = "none";
    moonIcon.style.display = "block";
  }
}

// ==========================================================================
// PWA Helper Setup
// ==========================================================================
function registerServiceWorker() {
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("sw.js")
        .then(reg => console.log("Service Worker registered successfully.", reg.scope))
        .catch(err => console.log("Service Worker registration failed: ", err));
    });
  }
}

// ==========================================================================
// Export & Clipboard actions
// ==========================================================================
function showToast(message) {
  const toast = document.getElementById("toast");
  toast.innerText = message;
  toast.classList.add("show");
  setTimeout(() => {
    toast.classList.remove("show");
  }, 2500);
}

function setupExportActions() {
  // 1. Text Summary Export
  document.getElementById("copy-summary-btn").addEventListener("click", () => {
    const isNewBetter = state.taxNew.totalTax < state.taxOld.totalTax;
    const isOldBetter = state.taxOld.totalTax < state.taxNew.totalTax;
    
    let advice = "Either regime yields identical liability.";
    if (isNewBetter) {
      advice = `Opt for the NEW Tax Regime. Savings: ${formatCurrency(state.taxOld.totalTax - state.taxNew.totalTax)}/yr.`;
    } else if (isOldBetter) {
      advice = `Opt for the OLD Tax Regime. Savings: ${formatCurrency(state.taxNew.totalTax - state.taxOld.totalTax)}/yr.`;
    }

    const summaryText = `----------------------------------------
7TH CPC SALARY & INCOME TAX SUMMARY ASSESSMENT
----------------------------------------
FINANCIAL YEAR: FY 2025-26 & FY 2026-27

SALARY DETAILS:
- Basic Pay (Monthly): ${formatCurrency(state.basicPay)}
- Official Quarters: ${state.isQuarters ? "Yes (HRA = ₹0)" : "No"}
- HRA City Class: ${state.cityTier}
- Higher TPTA City: ${state.isHigherTpta ? "Yes" : "No"}

PERIOD BREAKDOWNS (3m / 9m SPLITS):
* Period 1 (Apr - Jun: 3 months) | DA: ${state.daPercentP1}%
  - Monthly DA: ${formatCurrency(state.breakdownP1.da)}
  - Monthly HRA: ${formatCurrency(state.breakdownP1.hra)}
  - Monthly TA: ${formatCurrency(state.breakdownP1.ta)}
  - Monthly Gross: ${formatCurrency(state.monthlyGrossP1)}

* Period 2 (Jul - Mar: 9 months) | DA: ${state.daPercentP2}%
  - Monthly DA: ${formatCurrency(state.breakdownP2.da)}
  - Monthly HRA: ${formatCurrency(state.breakdownP2.hra)}
  - Monthly TA: ${formatCurrency(state.breakdownP2.ta)}
  - Monthly Gross: ${formatCurrency(state.monthlyGrossP2)}

- Total Computed Annual Gross Salary: ${formatCurrency(state.annualGross)}

DEDUCTIONS & EXEMPTIONS UNDER OLD REGIME:
- Standard Deduction: ₹50,000
- Section 10(13A) HRA Exemption: ${formatCurrency(state.taxOld.exemptHra)} (Rent Paid: ${formatCurrency(state.rentPaid)}/mo)
- Section 10(14) CEA Exemption: ${formatCurrency(state.taxOld.exemptCea)} (${state.ceaChildren} Children)
- Section 10(5) LTC Exemption: ${formatCurrency(state.taxOld.exemptLtc)}
- Section 80C Deductions: ${formatCurrency(Math.min(state.deduct80C, 150000))}
- Section 80D Medical Insurance: ${formatCurrency(Math.min(state.deduct80D, 100000))}
- NPS Sec 80CCD(1B) Contribution: ${formatCurrency(Math.min(state.deductNps, 50000))}
- Total Deductions & Exemptions: ${formatCurrency(state.taxOld.deductionsTotal)}

TAX ASSESSMENT COMPARISON:
1. OLD REGIME:
   - Taxable Income: ${formatCurrency(state.taxOld.taxableIncome)}
   - Total Tax Due (incl. Cess): ${formatCurrency(state.taxOld.totalTax)}

2. NEW REGIME (DEFAULT):
   - Taxable Income: ${formatCurrency(state.taxNew.taxableIncome)}
   - Total Tax Due (incl. Cess): ${formatCurrency(state.taxNew.totalTax)}

RECOMMENDATION SUMMARY:
${advice}
----------------------------------------
Calculated via Central Government Salary & Tax PWA.
----------------------------------------`;

    navigator.clipboard.writeText(summaryText)
      .then(() => showToast("Summary text copied to clipboard!"))
      .catch(err => {
        console.error("Could not copy text: ", err);
        showToast("Copy failed. Please try again.");
      });
  });

  // 2. Print / PDF Export
  document.getElementById("print-pdf-btn").addEventListener("click", () => {
    window.print();
  });
}

// ==========================================================================
// Initialization & Event Binding
// ==========================================================================
document.addEventListener("DOMContentLoaded", () => {
  // Bind inputs and change handlers
  const basicPayInput = document.getElementById("basic-pay");
  const daPercentP1Input = document.getElementById("da-percent-p1");
  const daPercentP2Input = document.getElementById("da-percent-p2");
  const quartersToggle = document.getElementById("quarters-toggle");
  const tptaToggle = document.getElementById("tpta-toggle");
  const payLevelSelect = document.getElementById("pay-level");
  
  const cityTierRadios = document.getElementsByName("city-tier");
  const rentPaidInput = document.getElementById("rent-paid");
  const ceaChildrenSelect = document.getElementById("cea-children");
  const exemptionLtcInput = document.getElementById("exemption-ltc");

  const deduct80CInput = document.getElementById("deduct-80c");
  const deduct80DInput = document.getElementById("deduct-80d");
  const deductNpsInput = document.getElementById("deduct-nps");

  // Initial Calculation Run
  updateCalculations();

  // Pay Level Selector listener: auto fills starting basic pay of selected level
  payLevelSelect.addEventListener("change", (e) => {
    state.payLevel = e.target.value;
    const minBasic = PAY_LEVEL_MINIMUMS[state.payLevel];
    if (minBasic) {
      basicPayInput.value = minBasic;
    }
    updateCalculations();
  });

  // General Input change listeners
  const liveInputs = [
    basicPayInput, daPercentP1Input, daPercentP2Input, 
    rentPaidInput, exemptionLtcInput, 
    deduct80CInput, deduct80DInput, deductNpsInput
  ];
  
  liveInputs.forEach(input => {
    input.addEventListener("input", updateCalculations);
  });

  quartersToggle.addEventListener("change", updateCalculations);
  tptaToggle.addEventListener("change", updateCalculations);
  ceaChildrenSelect.addEventListener("change", updateCalculations);

  cityTierRadios.forEach(radio => {
    radio.addEventListener("change", updateCalculations);
  });

  // Set up tab routing and lookups
  setupTabNavigation();
  setupThemeToggle();
  setupExportActions();
  registerServiceWorker();
});

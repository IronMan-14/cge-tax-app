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
  basicPay: 56100, // March Base Basic Pay
  incrementAmount: 1700,
  incrementMonth: "January",
  ceaReceived: 54000,
  cityTier: "X", // X, Y, or Z
  isHigherTpta: true,
  isQuarters: false,

  // Tax Inputs & Deductions
  rentPaid: 15000,
  ceaChildren: 2,
  exemptionLtc: 0,
  deduct24b: 0,        // Section 24(b) - capped at 2,00,000
  deduct80E: 0,        // Section 80E - no limit
  deductProfTax: 2500, // Section 16(iii) - no limit
  deduct80C: 150000,   // capped at 1,50,000
  deduct80D: 25000,    // capped at 25,000
  deductNps: 50000,    // capped at 50,000
  tdsPaid: 0,

  // Calculated Outputs
  months: [], // Array of 12 month objects representing March to February
  annualGrossSalary: 0,
  aprilArrears: 0,
  octoberArrears: 0,
  totalGrossIncome: 0,

  taxOld: {
    taxableIncome: 0,
    deductionsTotal: 0,
    exemptHra: 0,
    exemptCea: 0,
    exemptLtc: 0,
    baseTax: 0,
    rebate: 0,
    cess: 0,
    totalTax: 0,
    netLiability: 0
  },
  taxNew: {
    taxableIncome: 0,
    deductionsTotal: 75000,
    baseTax: 0,
    rebate: 0,
    cess: 0,
    totalTax: 0,
    netLiability: 0
  }
};

const MONTHS_ORDER = [
  "March", "April", "May", "June", "July", "August", 
  "September", "October", "November", "December", "January", "February"
];

// ==========================================================================
// Core Calculation Logic
// ==========================================================================

/**
 * Calculates base TA rate before DA.
 */
function getBaseTaRate(payLevel, basic, isHigherTpta) {
  let baseTa = 0;
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
  return baseTa;
}

/**
 * Calculates HRA based on city tier, DA percentage, and Official Quarters status.
 * Rates:
 * - X: 30% (Floor: 5,400)
 * - Y: 20% (Floor: 3,600)
 * - Z: 10% (Floor: 1,800)
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
 */
function calculateTa(payLevel, basic, daPercent, isHigherTpta) {
  const baseTa = getBaseTaRate(payLevel, basic, isHigherTpta);
  const daOnTa = baseTa * (daPercent / 100);
  return baseTa + daOnTa;
}

/**
 * Calculates HRA Tax Exemption (Sec 10(13A)) under Old Regime.
 * Exemption is the minimum of 3 values:
 * 1. Actual HRA received.
 * 2. Rent paid minus 10% of (Basic + DA).
 * 3. 50% (Class X) or 40% (Class Y/Z) of (Basic + DA).
 */
function calculateHraExemption(months, rentPaid, cityTier, isQuarters) {
  if (isQuarters || rentPaid <= 0) {
    return 0;
  }

  const annualHraReceived = months.reduce((sum, m) => sum + m.hra, 0);
  const annualRentPaid = rentPaid * 12;

  const annualBasic = months.reduce((sum, m) => sum + m.basic, 0);
  const annualDa = months.reduce((sum, m) => sum + m.da, 0);
  const BDA_a = annualBasic + annualDa;

  const rentExcess = Math.max(0, annualRentPaid - (0.10 * BDA_a));
  const cityPercentage = cityTier === "X" ? 0.50 : 0.40;
  const limitByCity = BDA_a * cityPercentage;

  return Math.min(annualHraReceived, rentExcess, limitByCity);
}

/**
 * Calculates Old Tax Regime liability (FY 2025-26).
 */
function calculateOldRegimeTax(grossIncome, exemptHra, exemptCea, exemptLtc, deduct24b, deduct80E, deductProfTax, deduct80C, deduct80D, deductNps) {
  const capped24b = Math.min(deduct24b, 200000);
  const capped80C = Math.min(deduct80C, 150000);
  const capped80D = Math.min(deduct80D, 25000);
  const cappedNps = Math.min(deductNps, 50000);
  const standardDeduction = 50000;

  // Total deductions = standard deduction + capped 24b + 80E + 16iii + capped 80 series + Section 10 exemptions
  const totalDeductions = standardDeduction + exemptHra + exemptCea + exemptLtc + capped24b + deduct80E + deductProfTax + capped80C + capped80D + cappedNps;
  const taxableIncome = Math.max(0, grossIncome - totalDeductions);

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
 * Calculates New Tax Regime base tax using the Budget 2025-26 slabs.
 * - Up to 4L: Nil | 4L-8L: 5% | 8L-12L: 10% | 12L-16L: 15% | 16L-20L: 20% | 20L-24L: 25% | Above 24L: 30%
 */
function calculateNewRegimeBaseTax(income) {
  if (income <= 400000) return 0;
  let tax = 0;
  if (income > 2400000) {
    tax += (income - 2400000) * 0.30;
    tax += 400000 * 0.25; // 20L to 24L
    tax += 400000 * 0.20; // 16L to 20L
    tax += 400000 * 0.15; // 12L to 16L
    tax += 400000 * 0.10; // 8L to 12L
    tax += 400000 * 0.05; // 4L to 8L
  } else if (income > 2000000) {
    tax += (income - 2000000) * 0.25;
    tax += 400000 * 0.20; // 16L to 20L
    tax += 400000 * 0.15; // 12L to 16L
    tax += 400000 * 0.10; // 8L to 12L
    tax += 400000 * 0.05; // 4L to 8L
  } else if (income > 1600000) {
    tax += (income - 1600000) * 0.20;
    tax += 400000 * 0.15; // 12L to 16L
    tax += 400000 * 0.10; // 8L to 12L
    tax += 400000 * 0.05; // 4L to 8L
  } else if (income > 1200000) {
    tax += (income - 1200000) * 0.15;
    tax += 400000 * 0.10; // 8L to 12L
    tax += 400000 * 0.05; // 4L to 8L
  } else if (income > 800000) {
    tax += (income - 800000) * 0.10;
    tax += 400000 * 0.05; // 4L to 8L
  } else if (income > 400000) {
    tax += (income - 400000) * 0.05;
  }
  return tax;
}

/**
 * Calculates New Tax Regime liability (FY 2025-26).
 */
function calculateNewRegimeTax(grossIncome) {
  const standardDeduction = 75000;
  const taxableIncome = Math.max(0, grossIncome - standardDeduction);

  const baseTax = calculateNewRegimeBaseTax(taxableIncome);

  let finalBaseTax = baseTax;
  let rebate = 0;

  // Rebate & Marginal Relief Section 87A (Budget 2025-26)
  if (taxableIncome <= 1200000) {
    rebate = baseTax;
    finalBaseTax = 0;
  } else {
    // Marginal Relief check: tax payable <= excess income over 12L
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
 * Helper to display values dynamically across months inside a period.
 * If values are constant, returns single formatted currency, otherwise a range "Min / Max".
 */
function formatPeriodValues(monthsInPeriod, key) {
  const values = monthsInPeriod.map(m => m[key]);
  const unique = [...new Set(values)];
  if (unique.length === 1) {
    return formatCurrency(unique[0]);
  } else {
    unique.sort((a, b) => a - b);
    return unique.map(v => formatCurrency(v)).join(" / ");
  }
}

/**
 * Main calculation orchestration. Syncs the UI and state variables.
 */
function updateCalculations() {
  // 1. Read Inputs from DOM
  state.basicPay = parseFloat(document.getElementById("basic-pay").value) || 0;
  state.incrementAmount = parseFloat(document.getElementById("increment-amount").value) || 0;
  state.incrementMonth = document.getElementById("increment-month").value;
  state.ceaReceived = parseFloat(document.getElementById("cea-received").value) || 0;
  state.isQuarters = document.getElementById("quarters-toggle").checked;
  state.isHigherTpta = document.getElementById("tpta-toggle").checked;
  state.payLevel = document.getElementById("pay-level").value;

  const cityTierElements = document.getElementsByName("city-tier");
  for (const el of cityTierElements) {
    if (el.checked) {
      state.cityTier = el.value;
      break;
    }
  }

  // Handle quarters and rent visibility
  const rentInput = document.getElementById("rent-paid");
  const rentGroup = document.getElementById("rent-input-group");
  const cityTierGroup = document.getElementById("city-tier-group");

  if (state.isQuarters) {
    rentInput.disabled = true;
    rentInput.value = 0;
    state.rentPaid = 0;
    if (rentGroup) rentGroup.style.opacity = "0.5";
    if (cityTierGroup) cityTierGroup.style.opacity = "0.5";
  } else {
    rentInput.disabled = false;
    state.rentPaid = parseFloat(rentInput.value) || 0;
    if (rentGroup) rentGroup.style.opacity = "1";
    if (cityTierGroup) cityTierGroup.style.opacity = "1";
  }

  state.ceaChildren = parseInt(document.getElementById("cea-children").value, 10) || 0;
  state.exemptionLtc = parseFloat(document.getElementById("exemption-ltc").value) || 0;
  state.deduct24b = parseFloat(document.getElementById("deduct-24b").value) || 0;
  state.deduct80E = parseFloat(document.getElementById("deduct-80e").value) || 0;
  state.deductProfTax = parseFloat(document.getElementById("deduct-prof-tax").value) || 0;
  state.deduct80C = parseFloat(document.getElementById("deduct-80c").value) || 0;
  state.deduct80D = parseFloat(document.getElementById("deduct-80d").value) || 0;
  state.deductNps = parseFloat(document.getElementById("deduct-nps").value) || 0;
  state.tdsPaid = parseFloat(document.getElementById("tds-paid").value) || 0;

  // 2. Perform 12-Month Simulation (March to February cycle)
  state.months = [];
  const incIndex = MONTHS_ORDER.indexOf(state.incrementMonth);

  for (let m = 0; m < 12; m++) {
    const monthName = MONTHS_ORDER[m];
    
    // A. Monthly Basic
    let basic = state.basicPay;
    if (m >= incIndex) {
      basic += state.incrementAmount;
    }

    // B. 3-Period DA (Locked to March Base Pay)
    let daPercent = 53;
    if (m >= 1 && m <= 6) {
      daPercent = 55; // April - September
    } else if (m >= 7 && m <= 11) {
      daPercent = 58; // October - February
    }
    const da = state.basicPay * (daPercent / 100);

    // C. HRA
    const hra = calculateHra(basic, daPercent, state.cityTier, state.isQuarters);

    // D. TA
    const ta = calculateTa(state.payLevel, basic, daPercent, state.isHigherTpta);

    // E. Monthly Gross
    const gross = basic + da + hra + ta;

    state.months.push({
      month: monthName,
      basic,
      daPercent,
      da,
      hra,
      ta,
      gross
    });
  }

  // 3. Arrears & Total Gross Salary
  const marchBaseTa = getBaseTaRate(state.payLevel, state.basicPay, state.isHigherTpta);
  state.aprilArrears = 3 * ((state.basicPay * 0.02) + (marchBaseTa * 0.02));
  state.octoberArrears = 3 * ((state.basicPay * 0.03) + (marchBaseTa * 0.03));

  state.annualGrossSalary = state.months.reduce((sum, m) => sum + m.gross, 0);
  state.totalGrossIncome = state.annualGrossSalary + state.aprilArrears + state.octoberArrears + state.ceaReceived;

  // 4. Tax logic (Old vs New Regime)
  const exemptHra = calculateHraExemption(state.months, state.rentPaid, state.cityTier, state.isQuarters);
  const exemptCea = state.ceaChildren * 1200; // max ₹2400
  const exemptLtc = state.exemptionLtc;

  const oldTaxObj = calculateOldRegimeTax(
    state.totalGrossIncome,
    exemptHra, exemptCea, exemptLtc,
    state.deduct24b, state.deduct80E, state.deductProfTax,
    state.deduct80C, state.deduct80D, state.deductNps
  );
  state.taxOld = {
    ...oldTaxObj,
    netLiability: oldTaxObj.totalTax - state.tdsPaid
  };

  const newTaxObj = calculateNewRegimeTax(state.totalGrossIncome);
  state.taxNew = {
    ...newTaxObj,
    netLiability: newTaxObj.totalTax - state.tdsPaid
  };

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
  const p1Months = [state.months[0]];
  const p2Months = state.months.slice(1, 7);
  const p3Months = state.months.slice(7, 12);

  // Render Salary tab values
  document.getElementById("monthly-gross-p1").innerText = formatPeriodValues(p1Months, "gross");
  document.getElementById("monthly-gross-p2").innerText = formatPeriodValues(p2Months, "gross");
  document.getElementById("monthly-gross-p3").innerText = formatPeriodValues(p3Months, "gross");
  document.getElementById("arrears-total-display").innerText = formatCurrency(state.aprilArrears + state.octoberArrears);
  document.getElementById("annual-gross").innerText = formatCurrency(state.totalGrossIncome);

  // Period comparisons table
  document.getElementById("breakdown-basic-p1").innerText = formatPeriodValues(p1Months, "basic");
  document.getElementById("breakdown-basic-p2").innerText = formatPeriodValues(p2Months, "basic");
  document.getElementById("breakdown-basic-p3").innerText = formatPeriodValues(p3Months, "basic");
  
  document.getElementById("breakdown-da-p1").innerText = `${formatPeriodValues(p1Months, "da")} (53%)`;
  document.getElementById("breakdown-da-p2").innerText = `${formatPeriodValues(p2Months, "da")} (55%)`;
  document.getElementById("breakdown-da-p3").innerText = `${formatPeriodValues(p3Months, "da")} (58%)`;

  document.getElementById("breakdown-hra-p1").innerText = state.isQuarters ? "₹0 (Qtrs)" : formatPeriodValues(p1Months, "hra");
  document.getElementById("breakdown-hra-p2").innerText = state.isQuarters ? "₹0 (Qtrs)" : formatPeriodValues(p2Months, "hra");
  document.getElementById("breakdown-hra-p3").innerText = state.isQuarters ? "₹0 (Qtrs)" : formatPeriodValues(p3Months, "hra");

  document.getElementById("breakdown-ta-p1").innerText = formatPeriodValues(p1Months, "ta");
  document.getElementById("breakdown-ta-p2").innerText = formatPeriodValues(p2Months, "ta");
  document.getElementById("breakdown-ta-p3").innerText = formatPeriodValues(p3Months, "ta");

  // Arrears text breakdown
  document.getElementById("arrears-p1-text").innerText = `April Arrears: ${formatCurrency(state.aprilArrears)}`;
  document.getElementById("arrears-p2-text").innerText = `October Arrears: ${formatCurrency(state.octoberArrears)}`;

  // HRA Notice handling
  const hraNoticeEl = document.getElementById("hra-notice");
  const hraNoticeText = document.getElementById("hra-notice-text");

  if (state.isQuarters) {
    hraNoticeEl.style.display = "flex";
    hraNoticeText.innerText = "Staying in Official Quarters. HRA is set to ₹0.";
  } else {
    hraNoticeEl.style.display = "flex";
    hraNoticeText.innerText = "HRA rates are automatically upgraded to 30%/20%/10% since DA is > 50% in all periods of FY 2025-26.";
  }

  // Sync Gross Salary to Tax tab
  document.getElementById("tax-gross-display").innerText = formatCurrency(state.totalGrossIncome);

  // Render Tax tab comparison values
  document.getElementById("old-taxable").innerText = formatCurrency(state.taxOld.taxableIncome);
  document.getElementById("old-total-tax").innerText = formatCurrency(state.taxOld.totalTax);

  document.getElementById("new-taxable").innerText = formatCurrency(state.taxNew.taxableIncome);
  document.getElementById("new-total-tax").innerText = formatCurrency(state.taxNew.totalTax);

  // Dynamic status styling on Due / Refund in comparison cards
  const oldRefundDueValEl = document.getElementById("old-refund-due-val");
  const oldRefundDueLabelEl = document.getElementById("old-refund-due-label");
  const oldRefundDueStatEl = document.getElementById("old-refund-due-stat");

  const oldNet = state.taxOld.netLiability;
  oldRefundDueValEl.innerText = formatCurrency(Math.abs(oldNet));
  if (oldNet > 0) {
    oldRefundDueLabelEl.innerText = "Tax Due";
    oldRefundDueStatEl.className = "regime-stat highlight-stat status-due";
  } else if (oldNet < 0) {
    oldRefundDueLabelEl.innerText = "Refund";
    oldRefundDueStatEl.className = "regime-stat highlight-stat status-refund";
  } else {
    oldRefundDueLabelEl.innerText = "Net Due/Refund";
    oldRefundDueStatEl.className = "regime-stat highlight-stat";
  }

  const newRefundDueValEl = document.getElementById("new-refund-due-val");
  const newRefundDueLabelEl = document.getElementById("new-refund-due-label");
  const newRefundDueStatEl = document.getElementById("new-refund-due-stat");

  const newNet = state.taxNew.netLiability;
  newRefundDueValEl.innerText = formatCurrency(Math.abs(newNet));
  if (newNet > 0) {
    newRefundDueLabelEl.innerText = "Tax Due";
    newRefundDueStatEl.className = "regime-stat highlight-stat status-due";
  } else if (newNet < 0) {
    newRefundDueLabelEl.innerText = "Refund";
    newRefundDueStatEl.className = "regime-stat highlight-stat status-refund";
  } else {
    newRefundDueLabelEl.innerText = "Net Due/Refund";
    newRefundDueStatEl.className = "regime-stat highlight-stat";
  }

  // Set active class on better tax regime box and update banner advice
  const oldBox = document.getElementById("old-regime-box");
  const newBox = document.getElementById("new-regime-box");
  const banner = document.getElementById("savings-banner");

  const diff = Math.abs(state.taxOld.totalTax - state.taxNew.totalTax);

  if (state.taxOld.totalTax < state.taxNew.totalTax) {
    oldBox.classList.add("active");
    newBox.classList.remove("active");
    banner.className = "savings-banner alert-success";
    banner.innerText = `Old Regime is Beneficial! You save ${formatCurrency(diff)} annually.`;
  } else if (state.taxNew.totalTax < state.taxOld.totalTax) {
    newBox.classList.add("active");
    oldBox.classList.remove("active");
    banner.className = "savings-banner alert-success";
    banner.innerText = `New Regime is Beneficial! You save ${formatCurrency(diff)} annually.`;
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
  // Salary Table
  document.getElementById("sum-basic-p1").innerText = formatPeriodValues(p1Months, "basic");
  document.getElementById("sum-basic-p2").innerText = formatPeriodValues(p2Months, "basic");
  document.getElementById("sum-basic-p3").innerText = formatPeriodValues(p3Months, "basic");
  
  document.getElementById("sum-da-p1").innerText = `${formatPeriodValues(p1Months, "da")} (53%)`;
  document.getElementById("sum-da-p2").innerText = `${formatPeriodValues(p2Months, "da")} (55%)`;
  document.getElementById("sum-da-p3").innerText = `${formatPeriodValues(p3Months, "da")} (58%)`;

  document.getElementById("sum-hra-p1").innerText = state.isQuarters ? "₹0 (Qtrs)" : formatPeriodValues(p1Months, "hra");
  document.getElementById("sum-hra-p2").innerText = state.isQuarters ? "₹0 (Qtrs)" : formatPeriodValues(p2Months, "hra");
  document.getElementById("sum-hra-p3").innerText = state.isQuarters ? "₹0 (Qtrs)" : formatPeriodValues(p3Months, "hra");

  document.getElementById("sum-ta-p1").innerText = formatPeriodValues(p1Months, "ta");
  document.getElementById("sum-ta-p2").innerText = formatPeriodValues(p2Months, "ta");
  document.getElementById("sum-ta-p3").innerText = formatPeriodValues(p3Months, "ta");

  document.getElementById("sum-monthly-gross-p1").innerText = formatPeriodValues(p1Months, "gross");
  document.getElementById("sum-monthly-gross-p2").innerText = formatPeriodValues(p2Months, "gross");
  document.getElementById("sum-monthly-gross-p3").innerText = formatPeriodValues(p3Months, "gross");
  
  document.getElementById("sum-arr-apr").innerText = formatCurrency(state.aprilArrears);
  document.getElementById("sum-arr-oct").innerText = formatCurrency(state.octoberArrears);
  document.getElementById("sum-cea-rec").innerText = formatCurrency(state.ceaReceived);
  document.getElementById("sum-annual-gross").innerText = formatCurrency(state.totalGrossIncome);

  // Tax Table details
  document.getElementById("sum-tax-gross-old").innerText = formatCurrency(state.totalGrossIncome);
  document.getElementById("sum-tax-gross-new").innerText = formatCurrency(state.totalGrossIncome);
  
  document.getElementById("sum-ex-hra").innerText = "- " + formatCurrency(state.taxOld.exemptHra);
  document.getElementById("sum-ex-cea").innerText = "- " + formatCurrency(state.taxOld.exemptCea);
  document.getElementById("sum-ex-ltc").innerText = "- " + formatCurrency(state.taxOld.exemptLtc);
  document.getElementById("sum-ex-24b").innerText = "- " + formatCurrency(Math.min(state.deduct24b, 200000));
  document.getElementById("sum-ex-80e").innerText = "- " + formatCurrency(state.deduct80E);
  document.getElementById("sum-ex-prof").innerText = "- " + formatCurrency(state.deductProfTax);

  document.getElementById("sum-80c").innerText = "- " + formatCurrency(Math.min(state.deduct80C, 150000));
  document.getElementById("sum-80d").innerText = "- " + formatCurrency(Math.min(state.deduct80D, 25000));
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
  
  document.getElementById("sum-tds-old").innerText = "- " + formatCurrency(state.tdsPaid);
  document.getElementById("sum-tds-new").innerText = "- " + formatCurrency(state.tdsPaid);

  // Net Payable / Refund styling in summary table
  const sumNetOldEl = document.getElementById("sum-net-old");
  if (oldNet > 0) {
    sumNetOldEl.innerText = `${formatCurrency(oldNet)} (Tax Due)`;
    sumNetOldEl.className = "text-right text-bold status-due";
  } else if (oldNet < 0) {
    sumNetOldEl.innerText = `${formatCurrency(Math.abs(oldNet))} (Refund)`;
    sumNetOldEl.className = "text-right text-bold status-refund";
  } else {
    sumNetOldEl.innerText = formatCurrency(0);
    sumNetOldEl.className = "text-right text-bold";
  }

  const sumNetNewEl = document.getElementById("sum-net-new");
  if (newNet > 0) {
    sumNetNewEl.innerText = `${formatCurrency(newNet)} (Tax Due)`;
    sumNetNewEl.className = "text-right text-bold status-due";
  } else if (newNet < 0) {
    sumNetNewEl.innerText = `${formatCurrency(Math.abs(newNet))} (Refund)`;
    sumNetNewEl.className = "text-right text-bold status-refund";
  } else {
    sumNetNewEl.innerText = formatCurrency(0);
    sumNetNewEl.className = "text-right text-bold";
  }

  // Set recommendation card text in Summary tab
  const recBadge = document.getElementById("sum-recommendation");
  if (state.taxOld.totalTax < state.taxNew.totalTax) {
    recBadge.className = "recommendation-badge alert-success";
    recBadge.innerText = `RECOMMENDATION: Old Regime is Beneficial. It saves you ${formatCurrency(diff)} in tax liability this year.`;
  } else if (state.taxNew.totalTax < state.taxOld.totalTax) {
    recBadge.className = "recommendation-badge alert-success";
    recBadge.innerText = `RECOMMENDATION: New Regime is Beneficial. It saves you ${formatCurrency(diff)} in tax liability this year.`;
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
      advice = `New Regime is Beneficial! You save ${formatCurrency(state.taxOld.totalTax - state.taxNew.totalTax)}/yr.`;
    } else if (isOldBetter) {
      advice = `Old Regime is Beneficial! You save ${formatCurrency(state.taxNew.totalTax - state.taxOld.totalTax)}/yr.`;
    }

    const p1Months = [state.months[0]];
    const p2Months = state.months.slice(1, 7);
    const p3Months = state.months.slice(7, 12);

    const summaryText = `----------------------------------------
7TH CPC SALARY & INCOME TAX SUMMARY ASSESSMENT
----------------------------------------
FINANCIAL YEAR: FY 2025-26
ASSESSMENT YEAR: AY 2026-27

SALARY PARAMETERS:
- Pay Level (7th CPC): Level ${state.payLevel}
- March Base Basic Pay: ${formatCurrency(state.basicPay)}
- Increment Amount: ${formatCurrency(state.incrementAmount)}
- Increment Month: ${state.incrementMonth}
- Staying in Official Quarters: ${state.isQuarters ? "Yes" : "No"}
- HRA City Classification: Class ${state.cityTier}
- Higher TPTA City (Category A): ${state.isHigherTpta ? "Yes" : "No"}
- Children Education Allowance Received: ${formatCurrency(state.ceaReceived)}

PERIOD BREAKDOWNS (12-MONTH SIMULATION):
* Period 1 (March - 1 month) | DA: 53%
  - Monthly Basic: ${formatPeriodValues(p1Months, "basic")}
  - Monthly DA: ${formatPeriodValues(p1Months, "da")}
  - Monthly HRA: ${state.isQuarters ? "₹0 (Qtrs)" : formatPeriodValues(p1Months, "hra")}
  - Monthly TA: ${formatPeriodValues(p1Months, "ta")}
  - Monthly Gross: ${formatPeriodValues(p1Months, "gross")}

* Period 2 (Apr - Sep - 6 months) | DA: 55%
  - Monthly Basic: ${formatPeriodValues(p2Months, "basic")}
  - Monthly DA: ${formatPeriodValues(p2Months, "da")}
  - Monthly HRA: ${state.isQuarters ? "₹0 (Qtrs)" : formatPeriodValues(p2Months, "hra")}
  - Monthly TA: ${formatPeriodValues(p2Months, "ta")}
  - Monthly Gross: ${formatPeriodValues(p2Months, "gross")}

* Period 3 (Oct - Feb - 5 months) | DA: 58%
  - Monthly Basic: ${formatPeriodValues(p3Months, "basic")}
  - Monthly DA: ${formatPeriodValues(p3Months, "da")}
  - Monthly HRA: ${state.isQuarters ? "₹0 (Qtrs)" : formatPeriodValues(p3Months, "hra")}
  - Monthly TA: ${formatPeriodValues(p3Months, "ta")}
  - Monthly Gross: ${formatPeriodValues(p3Months, "gross")}

ARREARS & ALLOWANCES:
- April Arrears (3 months): ${formatCurrency(state.aprilArrears)}
- October Arrears (3 months): ${formatCurrency(state.octoberArrears)}
- Children Education Allowance (CEA) Received: ${formatCurrency(state.ceaReceived)}

ANNUAL SUMS:
- Annual Gross Salary (Computed): ${formatCurrency(state.annualGrossSalary)}
- Total Gross Income: ${formatCurrency(state.totalGrossIncome)}

TAX ASSESSMENT:
1. OLD TAX REGIME:
   - Taxable Income: ${formatCurrency(state.taxOld.taxableIncome)}
   - Section 10(13A) HRA Exemption: ${formatCurrency(state.taxOld.exemptHra)} (Rent Paid: ${formatCurrency(state.rentPaid)}/mo)
   - Section 10(14) CEA Exemption: ${formatCurrency(state.taxOld.exemptCea)}
   - Section 10(5) LTC Exemption: ${formatCurrency(state.taxOld.exemptLtc)}
   - Section 24(b) Housing Loan Interest: ${formatCurrency(Math.min(state.deduct24b, 200000))}
   - Section 80E Education Loan Interest: ${formatCurrency(state.deduct80E)}
   - Section 16(iii) Professional Tax: ${formatCurrency(state.deductProfTax)}
   - Section 80C Deductions: ${formatCurrency(Math.min(state.deduct80C, 150000))}
   - Section 80D Medical Insurance: ${formatCurrency(Math.min(state.deduct80D, 25000))}
   - NPS Sec 80CCD(1B) Contribution: ${formatCurrency(Math.min(state.deductNps, 50000))}
   - Total Deductions & Exemptions: ${formatCurrency(state.taxOld.deductionsTotal)}
   - Total Tax (incl. Cess): ${formatCurrency(state.taxOld.totalTax)}
   - TDS Paid: ${formatCurrency(state.tdsPaid)}
   - Net Payable/Refund: ${state.taxOld.netLiability > 0 ? "Tax Due: " : "Refund: "}${formatCurrency(Math.abs(state.taxOld.netLiability))}

2. NEW TAX REGIME (DEFAULT):
   - Taxable Income: ${formatCurrency(state.taxNew.taxableIncome)}
   - Standard Deduction: ${formatCurrency(75000)}
   - Total Tax (incl. Cess): ${formatCurrency(state.taxNew.totalTax)}
   - TDS Paid: ${formatCurrency(state.tdsPaid)}
   - Net Payable/Refund: ${state.taxNew.netLiability > 0 ? "Tax Due: " : "Refund: "}${formatCurrency(Math.abs(state.taxNew.netLiability))}

RECOMMENDATION:
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
  const incrementAmountInput = document.getElementById("increment-amount");
  const incrementMonthSelect = document.getElementById("increment-month");
  const ceaReceivedInput = document.getElementById("cea-received");
  const quartersToggle = document.getElementById("quarters-toggle");
  const tptaToggle = document.getElementById("tpta-toggle");
  const payLevelSelect = document.getElementById("pay-level");
  
  const cityTierRadios = document.getElementsByName("city-tier");
  const rentPaidInput = document.getElementById("rent-paid");
  const ceaChildrenSelect = document.getElementById("cea-children");
  const exemptionLtcInput = document.getElementById("exemption-ltc");

  const deduct24bInput = document.getElementById("deduct-24b");
  const deduct80EInput = document.getElementById("deduct-80e");
  const deductProfTaxInput = document.getElementById("deduct-prof-tax");
  const deduct80CInput = document.getElementById("deduct-80c");
  const deduct80DInput = document.getElementById("deduct-80d");
  const deductNpsInput = document.getElementById("deduct-nps");
  const tdsPaidInput = document.getElementById("tds-paid");

  // Initial state setup from DOM
  state.payLevel = payLevelSelect.value;
  const initialMinBasic = PAY_LEVEL_MINIMUMS[state.payLevel];
  if (initialMinBasic && !basicPayInput.value) {
    basicPayInput.value = initialMinBasic;
  }

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
    basicPayInput, incrementAmountInput, ceaReceivedInput, 
    rentPaidInput, exemptionLtcInput, 
    deduct24bInput, deduct80EInput, deductProfTaxInput,
    deduct80CInput, deduct80DInput, deductNpsInput, tdsPaidInput
  ];
  
  liveInputs.forEach(input => {
    if (input) {
      input.addEventListener("input", updateCalculations);
    }
  });

  incrementMonthSelect.addEventListener("change", updateCalculations);
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

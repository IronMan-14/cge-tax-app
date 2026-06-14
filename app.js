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

const payMatrix = {
  "1": [18000, 18500, 19100, 19700, 20300, 20900, 21500, 22100, 22800, 23500, 24200, 24900, 25600, 26400, 27200, 28000, 28800, 29700, 30600, 31500, 32400, 33400, 34400, 35400, 36500, 37600, 38700, 39900, 41100, 42300, 43600, 44900, 46200, 47600, 49000, 50500, 52000, 53600, 55200, 56900],
  "2": [19900, 20500, 21100, 21700, 22400, 23100, 23800, 24500, 25200, 26000, 26800, 27600, 28400, 29300, 30200, 31100, 32000, 33000, 34000, 35000, 36100, 37200, 38300, 39400, 40600, 41800, 43100, 44400, 45700, 47100, 48500, 50000, 51500, 53000, 54600, 56200, 57900, 59600, 61400, 63200],
  "3": [21700, 22400, 23100, 23800, 24500, 25200, 26000, 26800, 27600, 28400, 29300, 30200, 31100, 32000, 33000, 34000, 35000, 36100, 37200, 38300, 39400, 40600, 41800, 43100, 44400, 45700, 47100, 48500, 50000, 51500, 53000, 54600, 56200, 57900, 59600, 61400, 63200, 65100, 67100, 69100],
  "4": [25500, 26300, 27100, 27900, 28700, 29600, 30500, 31400, 32300, 33300, 34300, 35300, 36400, 37500, 38600, 39800, 41000, 42200, 43500, 44800, 46100, 47500, 48900, 50400, 51900, 53500, 55100, 56800, 58500, 60300, 62100, 64000, 65900, 67900, 69900, 72000, 74200, 76400, 78700, 81100],
  "5": [29200, 30100, 31000, 31900, 32900, 33900, 34900, 35900, 37000, 38100, 39200, 40400, 41600, 42800, 44100, 45400, 46800, 48200, 49600, 51100, 52600, 54200, 55800, 57500, 59200, 61000, 62800, 64700, 66600, 68600, 70700, 72800, 75000, 77300, 79600, 82000, 84500, 87000, 89600, 92300],
  "6": [35400, 36500, 37600, 38700, 39900, 41100, 42300, 43600, 44900, 46200, 47600, 49000, 50500, 52000, 53600, 55200, 56900, 58600, 60400, 62200, 64100, 66000, 68000, 70000, 72100, 74300, 76500, 78800, 81200, 83600, 86100, 88700, 91400, 94100, 96900, 99800, 102800, 105900, 109100, 112400],
  "7": [44900, 46200, 47600, 49000, 50500, 52000, 53600, 55200, 56900, 58600, 60400, 62200, 64100, 66000, 68000, 70000, 72100, 74300, 76500, 78800, 81200, 83600, 86100, 88700, 91400, 94100, 96900, 99800, 102800, 105900, 109100, 112400, 115800, 119300, 122900, 126600, 130400, 134300, 138300, 142400],
  "8": [47600, 49000, 50500, 52000, 53600, 55200, 56900, 58600, 60400, 62200, 64100, 66000, 68000, 70000, 72100, 74300, 76500, 78800, 81200, 83600, 86100, 88700, 91400, 94100, 96900, 99800, 102800, 105900, 109100, 112400, 115800, 119300, 122900, 126600, 130400, 134300, 138300, 142400, 146700, 151100],
  "9": [53100, 54700, 56300, 58000, 59700, 61500, 63300, 65200, 67200, 69200, 71300, 73400, 75600, 77900, 80200, 82600, 85100, 87700, 90300, 93000, 95800, 98700, 101700, 104800, 107900, 111100, 114400, 117800, 121300, 124900, 128600, 132500, 136500, 140600, 144800, 149100, 153600, 158200, 162900, 167800],
  "10": [56100, 57800, 59500, 61300, 63100, 65000, 67000, 69000, 71100, 73200, 75400, 77700, 80000, 82400, 84900, 87400, 90000, 92700, 95500, 98400, 101400, 104400, 107500, 110700, 114000, 117400, 120900, 124500, 128200, 132000, 136000, 140100, 144300, 148600, 153100, 157700, 162400, 167300, 172300, 177500],
  "11": [67700, 69700, 71800, 74000, 76200, 78500, 80900, 83300, 85800, 88400, 91100, 93800, 96600, 99500, 102500, 105600, 108800, 112100, 115500, 119000, 122600, 126300, 130100, 134000, 138000, 142100, 146400, 150800, 155300, 160000, 164800, 169700, 174800, 180000, 185400, 191000, 196700, 202600, 208700, 215000],
  "12": [78800, 81200, 83600, 86100, 88700, 91400, 94100, 96900, 99800, 102800, 105900, 109100, 112400, 115800, 119300, 122900, 126600, 130400, 134300, 138300, 142400, 146700, 151100, 155600, 160300, 165100, 170100, 175200, 180500, 185900, 191500, 197200, 203100, 209200, 215500, 222000],
  "13": [123100, 126800, 130600, 134500, 138500, 142700, 147000, 151400, 155900, 160600, 165400, 170400, 175500, 180800, 186200, 191800, 197600, 203500, 209600, 215900],
  "13A": [131100, 135000, 139100, 143300, 147600, 152000, 156600, 161300, 166100, 171100, 176200, 181500, 186900, 192500, 198300, 204200, 210300, 216600],
  "14": [144200, 148500, 153000, 157600, 162300, 167200, 172200, 177400, 182700, 188200, 193800, 199600, 205600, 211800, 218200],
  "15": [182200, 187700, 193300, 199100, 205100, 211300, 217600, 224100],
  "16": [205400, 211600, 217900, 224400],
  "17": [225000],
  "18": [250000]
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
  financialYear: "2025-26",
  daRateP1: 53,
  daRateP2: 55,
  daRateP3: 58,
  baseTaRate: 3600,
  hraRateSelect: 30,
  cityTier: "X",
  isHigherTpta: true,
  isQuarters: false,
  arrPromo: 0,
  elLtc: 0,

  // Tax Inputs & Deductions
  rentPaid: 180000,
  ceaChildren: 2,
  ceaReceived: 54000,
  deduct24b: 0,        // Section 24(b) - Capped at 2,00,000
  deduct80E: 0,        // Section 80E - No limit
  deductProfTax: 2500, // Section 16(iii) - No limit
  deduct80cLic: 50000,
  deduct80cPli: 0,
  deduct80cGpf: 100000,
  deduct80cTuition: 0,
  deduct80cHousing: 0,
  deduct80cInsurance: 0,
  deduct80D: 25000,    // Health Insurance - Capped at 25,000
  deductNps: 50000,    // NPS 80CCD(1B) - Capped at 50,000
  tdsPaid: 0,          // Total Income Tax paid

  // Calculated Outputs
  months: [],
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
window.state = state;



const MONTHS_ORDER = [
  "March", "April", "May", "June", "July", "August", 
  "September", "October", "November", "December", "January", "February"
];

// ==========================================================================
// Core Calculation Logic
// ==========================================================================

/**
 * Calculates standard base TA rate before DA.
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
 * Calculates HRA based on HRA rate select.
 * X floor: 5400, Y floor: 3600, Z floor: 1800.
 */
function calculateHra(basic, ratePercent) {
  if (ratePercent === 0) {
    return 0;
  }

  let floor = 0;
  if (ratePercent === 27 || ratePercent === 30) {
    floor = 5400;
  } else if (ratePercent === 18 || ratePercent === 20) {
    floor = 3600;
  } else if (ratePercent === 9 || ratePercent === 10) {
    floor = 1800;
  }

  const calculatedHra = basic * (ratePercent / 100);
  return Math.max(calculatedHra, floor);
}

/**
 * Calculates HRA Tax Exemption (Sec 10(13A)) under Old Regime.
 */
function calculateHraExemption(months, rentPaidAnnual, cityTier, hraRateSelect) {
  if (hraRateSelect === 0 || rentPaidAnnual <= 0) {
    return 0;
  }

  const annualHraReceived = months.reduce((sum, m) => sum + m.hra, 0);
  const annualBasic = months.reduce((sum, m) => sum + m.basic, 0);
  const annualDa = months.reduce((sum, m) => sum + m.da, 0);
  const BDA_a = annualBasic + annualDa;

  const rentExcess = Math.max(0, rentPaidAnnual - (0.10 * BDA_a));
  const cityPercentage = cityTier === "X" ? 0.50 : 0.40;
  const limitByCity = BDA_a * cityPercentage;

  return Math.min(annualHraReceived, rentExcess, limitByCity);
}

/**
 * Calculates Old Tax Regime liability (FY 2025-26).
 */
function calculateOldRegimeTax(grossIncome, exemptHra, exemptCea, exemptLtc, deduct24b, deduct80E, deductProfTax, total80C, deduct80D, deductNps) {
  const capped24b = Math.min(deduct24b, 200000);
  const capped80C = Math.min(total80C, 150000);
  const capped80D = Math.min(deduct80D, 25000);
  const cappedNps = Math.min(deductNps, 50000);
  const standardDeduction = 50000;

  // Deductions: std + exemptHra + exemptCea + exemptLtc + capped24b + 80E + PT + capped 80C + capped 80D + capped NPS
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
 * Helper to display values dynamically across months inside a period.
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
 * Dynamically populates the Basic Pay dropdown based on Pay Level.
 */
function populateBasicPayDropdown(level) {
  const basicSelect = document.getElementById("basic-pay");
  if (!basicSelect) return;
  basicSelect.innerHTML = "";
  const pays = payMatrix[level] || [];
  pays.forEach(pay => {
    const opt = document.createElement("option");
    opt.value = pay;
    opt.innerText = "₹" + pay.toLocaleString("en-IN");
    basicSelect.appendChild(opt);
  });
  if (pays.length > 0) {
    if (level === "10" && pays.includes(56100)) {
      basicSelect.value = "56100";
    } else {
      basicSelect.value = pays[0];
    }
  }
}

/**
 * Main calculation orchestration. Syncs the UI and state variables.
 */
function updateCalculations() {
  // 1. Read Inputs from DOM
  state.basicPay = parseFloat(document.getElementById("basic-pay").value) || 0;
  
  // Automatically calculate the increment: 3% of March Basic Pay, rounded to nearest 100
  const calcIncrement = Math.round((state.basicPay * 0.03) / 100) * 100;
  state.incrementAmount = calcIncrement;
  document.getElementById("increment-amount").value = calcIncrement;

  state.incrementMonth = document.getElementById("increment-month").value;
  state.financialYear = document.getElementById("financial-year").value;

  state.daRateP1 = parseFloat(document.getElementById("da-rate-p1").value) || 0;
  state.daRateP2 = parseFloat(document.getElementById("da-rate-p2").value) || 0;
  state.daRateP3 = parseFloat(document.getElementById("da-rate-p3").value) || 0;

  state.baseTaRate = parseFloat(document.getElementById("base-ta-rate").value) || 0;
  state.hraRateSelect = parseFloat(document.getElementById("hra-rate-select").value) || 0;
  
  state.isQuarters = (state.hraRateSelect === 0);
  state.isHigherTpta = document.getElementById("tpta-toggle").checked;
  state.payLevel = document.getElementById("pay-level").value;

  state.arrPromo = parseFloat(document.getElementById("arr-promo").value) || 0;
  state.elLtc = parseFloat(document.getElementById("el-ltc").value) || 0;

  state.cityTier = document.getElementById("city-classification").value;

  // Deductions inputs
  state.rentPaid = parseFloat(document.getElementById("rent-paid").value) || 0;
  state.ceaChildren = parseInt(document.getElementById("cea-children").value, 10) || 0;
  state.ceaReceived = parseFloat(document.getElementById("cea-received").value) || 0;

  state.deduct24b = parseFloat(document.getElementById("deduct-24b").value) || 0;
  state.deduct80E = parseFloat(document.getElementById("deduct-80e").value) || 0;
  state.deductProfTax = parseFloat(document.getElementById("deduct-prof-tax").value) || 0;

  // Grouped 80C Deductions
  state.deduct80cLic = parseFloat(document.getElementById("deduct-80c-lic").value) || 0;
  state.deduct80cPli = parseFloat(document.getElementById("deduct-80c-pli").value) || 0;
  state.deduct80cGpf = parseFloat(document.getElementById("deduct-80c-gpf").value) || 0;
  state.deduct80cTuition = parseFloat(document.getElementById("deduct-80c-tuition").value) || 0;
  state.deduct80cHousing = parseFloat(document.getElementById("deduct-80c-housing").value) || 0;
  state.deduct80cInsurance = parseFloat(document.getElementById("deduct-80c-insurance").value) || 0;

  state.deduct80D = parseFloat(document.getElementById("deduct-80d").value) || 0;
  state.deductNps = parseFloat(document.getElementById("deduct-nps").value) || 0;
  state.tdsPaid = parseFloat(document.getElementById("tds-paid").value) || 0;

  // 2. Arrears Calculations (Calculated before the 12-month simulation so April Arrears can be injected)
  const daDifferencePercentage = state.daRateP2 - state.daRateP1;
  state.aprilArrears = 3 * (state.basicPay + state.baseTaRate) * (daDifferencePercentage / 100);

  const diffOct = (state.daRateP3 - state.daRateP2) / 100;
  state.octoberArrears = 3 * ((state.basicPay * diffOct) + (state.baseTaRate * diffOct));

  // 3. Perform 12-Month Simulation (March to February cycle)
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
    let daPercent = state.daRateP1;
    if (m >= 1 && m <= 6) {
      daPercent = state.daRateP2; // April - September
    } else if (m >= 7 && m <= 11) {
      daPercent = state.daRateP3; // October - February
    }
    const da = state.basicPay * (daPercent / 100);

    // C. HRA
    const hra = calculateHra(basic, state.hraRateSelect);

    // D. TA
    const ta = state.baseTaRate * (1 + daPercent / 100);

    // E. Monthly Gross
    let gross = basic + da + hra + ta;
    
    // Inject April Arrears directly into April month (index 1) Monthly Gross
    if (m === 1) {
      gross += state.aprilArrears;
    }

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

  // 4. Annual Gross Salary and Total Gross Income
  state.annualGrossSalary = state.months.reduce((sum, m) => sum + m.gross, 0);
  
  // Total Gross Income includes salary + standard arrears (already inside annualGrossSalary) + October arrears + promotion arrears + LTC encashment + CEA received
  state.totalGrossIncome = state.annualGrossSalary + state.octoberArrears + state.ceaReceived + state.arrPromo + state.elLtc;

  // 4. Tax logic (Old vs New Regime)
  const exemptHra = calculateHraExemption(state.months, state.rentPaid, state.cityTier, state.hraRateSelect);
  const exemptCea = Math.min(state.ceaChildren, 2) * 1200; 
  const exemptLtc = state.elLtc; // Fully exempt under Old Regime Section 10(5)
  const total80C = state.deduct80cLic + state.deduct80cPli + state.deduct80cGpf + state.deduct80cTuition + state.deduct80cHousing + state.deduct80cInsurance;

  const oldTaxObj = calculateOldRegimeTax(
    state.totalGrossIncome,
    exemptHra, exemptCea, exemptLtc,
    state.deduct24b, state.deduct80E, state.deductProfTax,
    total80C, state.deduct80D, state.deductNps
  );
  state.taxOld = {
    ...oldTaxObj,
    total80C,
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

  // Dynamic labels for Period 1, 2, and 3
  document.getElementById("label-monthly-gross-p1").innerText = `Period 1 (March - ${state.daRateP1}%)`;
  document.getElementById("label-monthly-gross-p2").innerText = `Period 2 (Apr-Sep - ${state.daRateP2}%)`;
  document.getElementById("label-monthly-gross-p3").innerText = `Period 3 (Oct-Feb - ${state.daRateP3}%)`;

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
  
  document.getElementById("breakdown-da-p1").innerText = `${formatPeriodValues(p1Months, "da")} (${state.daRateP1}%)`;
  document.getElementById("breakdown-da-p2").innerText = `${formatPeriodValues(p2Months, "da")} (${state.daRateP2}%)`;
  document.getElementById("breakdown-da-p3").innerText = `${formatPeriodValues(p3Months, "da")} (${state.daRateP3}%)`;

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
  const rentPaidInput = document.getElementById("rent-paid");

  if (state.isQuarters) {
    hraNoticeEl.style.display = "flex";
    hraNoticeText.innerText = "Staying in Official Quarters. HRA is set to ₹0.";
    if (rentPaidInput) rentPaidInput.disabled = true;
  } else {
    hraNoticeEl.style.display = "flex";
    hraNoticeText.innerText = `HRA rates are automatically upgraded to 30%/20%/10% (Selected: ${state.hraRateSelect}%).`;
    if (rentPaidInput) rentPaidInput.disabled = false;
  }


  // Explicit Exemption Displays (Requirement 3)
  const exempt24b = Math.min(state.deduct24b, 200000);
  document.getElementById("exemption-24b-display").innerText = "Housing Loan Interest Exemption: " + formatCurrency(exempt24b);

  const exemptCea = Math.min(state.ceaChildren, 2) * 1200;
  document.getElementById("exemption-cea-display").innerText = "Children Education Allowance Exemption: " + formatCurrency(exemptCea);

  document.getElementById("exemption-hra-display").innerText = "House Rent Allowance Exemption: " + formatCurrency(state.taxOld.exemptHra);

  const exempt80d = Math.min(state.deduct80D, 25000);
  document.getElementById("exemption-80d-display").innerText = "Health Insurance Exemption: " + formatCurrency(exempt80d);

  const exemptNps = Math.min(state.deductNps, 50000);
  document.getElementById("exemption-nps-display").innerText = "Exemption under 80CCD (1B): " + formatCurrency(exemptNps);

  document.getElementById("exemption-80c-display").innerText = "Total 80C Savings: " + formatCurrency(state.taxOld.total80C) + " (Capped at " + formatCurrency(150000) + ")";

  // Sync Gross Salary to Tax tab
  document.getElementById("tax-gross-display").innerText = formatCurrency(state.totalGrossIncome);

  // Render Tax tab comparison values (Old Regime)
  document.getElementById("old-gross").innerText = formatCurrency(state.totalGrossIncome);
  document.getElementById("old-taxable").innerText = formatCurrency(state.taxOld.taxableIncome);
  document.getElementById("old-base-tax").innerText = formatCurrency(state.taxOld.baseTax);
  document.getElementById("old-cess").innerText = formatCurrency(state.taxOld.cess);
  document.getElementById("old-total-tax").innerText = formatCurrency(state.taxOld.totalTax);

  // Render Tax tab comparison values (New Regime)
  document.getElementById("new-gross").innerText = formatCurrency(state.totalGrossIncome);
  document.getElementById("new-taxable").innerText = formatCurrency(state.taxNew.taxableIncome);
  document.getElementById("new-base-tax").innerText = formatCurrency(state.taxNew.baseTax);
  document.getElementById("new-cess").innerText = formatCurrency(state.taxNew.cess);
  document.getElementById("new-total-tax").innerText = formatCurrency(state.taxNew.totalTax);

  // Dynamic status styling on Tax Due / Refund in comparison cards (Requirement 4)
  const oldRefundDueValEl = document.getElementById("old-refund-due-val");
  const oldRefundDueLabelEl = document.getElementById("old-refund-due-label");
  const oldRefundDueStatEl = document.getElementById("old-refund-due-stat");

  const oldNet = state.taxOld.netLiability;
  if (oldNet > 0) {
    oldRefundDueLabelEl.innerText = "Tax Due / Refund";
    oldRefundDueValEl.innerText = `${formatCurrency(oldNet)} (Tax Due)`;
    oldRefundDueStatEl.className = "regime-stat highlight-stat status-due";
  } else if (oldNet < 0) {
    oldRefundDueLabelEl.innerText = "Tax Due / Refund";
    oldRefundDueValEl.innerText = `${formatCurrency(Math.abs(oldNet))} (Refund)`;
    oldRefundDueStatEl.className = "regime-stat highlight-stat status-refund";
  } else {
    oldRefundDueLabelEl.innerText = "Tax Due / Refund";
    oldRefundDueValEl.innerText = formatCurrency(0);
    oldRefundDueStatEl.className = "regime-stat highlight-stat";
  }

  const newRefundDueValEl = document.getElementById("new-refund-due-val");
  const newRefundDueLabelEl = document.getElementById("new-refund-due-label");
  const newRefundDueStatEl = document.getElementById("new-refund-due-stat");

  const newNet = state.taxNew.netLiability;
  if (newNet > 0) {
    newRefundDueLabelEl.innerText = "Tax Due / Refund";
    newRefundDueValEl.innerText = `${formatCurrency(newNet)} (Tax Due)`;
    newRefundDueStatEl.className = "regime-stat highlight-stat status-due";
  } else if (newNet < 0) {
    newRefundDueLabelEl.innerText = "Tax Due / Refund";
    newRefundDueValEl.innerText = `${formatCurrency(Math.abs(newNet))} (Refund)`;
    newRefundDueStatEl.className = "regime-stat highlight-stat status-refund";
  } else {
    newRefundDueLabelEl.innerText = "Tax Due / Refund";
    newRefundDueValEl.innerText = formatCurrency(0);
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

  if (state.taxNew.taxableIncome > 0 && state.taxNew.taxableIncome <= 1200000) {
    rebateNotice.style.display = "flex";
    document.getElementById("rebate-text").innerText = `Section 87A rebate of ${formatCurrency(state.taxNew.rebate)} applied. Net tax is zero.`;
  } else {
    rebateNotice.style.display = "none";
  }

  // 4. Render Summary tab values
  document.getElementById("sum-financial-year").innerText = state.financialYear;

  // Salary Table
  document.getElementById("sum-basic-p1").innerText = formatPeriodValues(p1Months, "basic");
  document.getElementById("sum-basic-p2").innerText = formatPeriodValues(p2Months, "basic");
  document.getElementById("sum-basic-p3").innerText = formatPeriodValues(p3Months, "basic");
  
  document.getElementById("sum-da-p1").innerText = `${formatPeriodValues(p1Months, "da")} (${state.daRateP1}%)`;
  document.getElementById("sum-da-p2").innerText = `${formatPeriodValues(p2Months, "da")} (${state.daRateP2}%)`;
  document.getElementById("sum-da-p3").innerText = `${formatPeriodValues(p3Months, "da")} (${state.daRateP3}%)`;

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
  document.getElementById("sum-arr-promo").innerText = formatCurrency(state.arrPromo);
  document.getElementById("sum-el-ltc").innerText = formatCurrency(state.elLtc);
  document.getElementById("sum-annual-gross").innerText = formatCurrency(state.totalGrossIncome);

  // Tax Table details
  document.getElementById("sum-tax-gross-old").innerText = formatCurrency(state.totalGrossIncome);
  document.getElementById("sum-tax-gross-new").innerText = formatCurrency(state.totalGrossIncome);
  
  document.getElementById("sum-ex-hra").innerText = "- " + formatCurrency(state.taxOld.exemptHra);
  document.getElementById("sum-ex-cea").innerText = "- " + formatCurrency(state.taxOld.exemptCea);
  document.getElementById("sum-ex-ltc").innerText = "- " + formatCurrency(state.taxOld.exemptLtc);
  document.getElementById("sum-ex-24b").innerText = "- " + formatCurrency(exempt24b);
  document.getElementById("sum-ex-80e").innerText = "- " + formatCurrency(state.deduct80E);
  document.getElementById("sum-ex-prof").innerText = "- " + formatCurrency(state.deductProfTax);

  document.getElementById("sum-80c").innerText = "- " + formatCurrency(Math.min(state.taxOld.total80C, 150000));
  document.getElementById("sum-80d").innerText = "- " + formatCurrency(exempt80d);
  document.getElementById("sum-nps").innerText = "- " + formatCurrency(exemptNps);

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

  // Set recommendation card text in Summary tab (Requirement 4)
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
FINANCIAL YEAR: FY ${state.financialYear}
ASSESSMENT YEAR: AY 2026-27

SALARY PARAMETERS:
- Pay Level (7th CPC): Level ${state.payLevel}
- March Base Basic Pay: ${formatCurrency(state.basicPay)}
- Increment Amount: ${formatCurrency(state.incrementAmount)}
- Increment Month: ${state.incrementMonth}
- Staying in Official Quarters: ${state.isQuarters ? "Yes" : "No"}
- Rate of House Rent Allowance: ${state.hraRateSelect}%
- Basic Rate of Transport Allowance: ${state.baseTaRate}
- HRA City Classification: Class ${state.cityTier}
- Higher TPTA City (Category A): ${state.isHigherTpta ? "Yes" : "No"}
- Children Education Allowance: ${formatCurrency(state.ceaReceived)}
- Arrears received due to promotion: ${formatCurrency(state.arrPromo)}
- EL encashed while availing LTC: ${formatCurrency(state.elLtc)}

PERIOD BREAKDOWNS (12-MONTH SIMULATION):
* Period 1 (March - 1 month) | DA: ${state.daRateP1}%
  - Monthly Basic: ${formatPeriodValues(p1Months, "basic")}
  - Monthly DA: ${formatPeriodValues(p1Months, "da")}
  - Monthly HRA: ${state.isQuarters ? "₹0 (Qtrs)" : formatPeriodValues(p1Months, "hra")}
  - Monthly TA: ${formatPeriodValues(p1Months, "ta")}
  - Monthly Gross: ${formatPeriodValues(p1Months, "gross")}

* Period 2 (Apr - Sep - 6 months) | DA: ${state.daRateP2}%
  - Monthly Basic: ${formatPeriodValues(p2Months, "basic")}
  - Monthly DA: ${formatPeriodValues(p2Months, "da")}
  - Monthly HRA: ${state.isQuarters ? "₹0 (Qtrs)" : formatPeriodValues(p2Months, "hra")}
  - Monthly TA: ${formatPeriodValues(p2Months, "ta")}
  - Monthly Gross: ${formatPeriodValues(p2Months, "gross")}

* Period 3 (Oct - Feb - 5 months) | DA: ${state.daRateP3}%
  - Monthly Basic: ${formatPeriodValues(p3Months, "basic")}
  - Monthly DA: ${formatPeriodValues(p3Months, "da")}
  - Monthly HRA: ${state.isQuarters ? "₹0 (Qtrs)" : formatPeriodValues(p3Months, "hra")}
  - Monthly TA: ${formatPeriodValues(p3Months, "ta")}
  - Monthly Gross: ${formatPeriodValues(p3Months, "gross")}

ARREARS & ALLOWANCES:
- April Arrears (3 months): ${formatCurrency(state.aprilArrears)}
- October Arrears (3 months): ${formatCurrency(state.octoberArrears)}

ANNUAL SUMS:
- Annual Gross Salary (Computed): ${formatCurrency(state.annualGrossSalary)}
- Total Gross Income: ${formatCurrency(state.totalGrossIncome)}

TAX ASSESSMENT:
1. TAX AS PER OLD REGIME:
   - Total Gross Income: ${formatCurrency(state.totalGrossIncome)}
   - Taxable Income: ${formatCurrency(state.taxOld.taxableIncome)}
   - House Rent Allowance Exemption: ${formatCurrency(state.taxOld.exemptHra)} (Rent Paid: ${formatCurrency(state.rentPaid)}/yr)
   - Children Education Allowance Exemption: ${formatCurrency(state.taxOld.exemptCea)}
   - EL encashed while availing LTC: ${formatCurrency(state.taxOld.exemptLtc)}
   - Housing Loan Interest Exemption: ${formatCurrency(Math.min(state.deduct24b, 200000))}
   - Education Loan Interest Paid during the FY: ${formatCurrency(state.deduct80E)}
   - Professional Tax: ${formatCurrency(state.deductProfTax)}
   - Savings under 80 C: ${formatCurrency(Math.min(state.taxOld.total80C, 150000))}
   - Health Insurance Exemption: ${formatCurrency(Math.min(state.deduct80D, 25000))}
   - Exemption under 80CCD (1B): ${formatCurrency(Math.min(state.deductNps, 50000))}
   - Total Deductions & Exemptions: ${formatCurrency(state.taxOld.deductionsTotal)}
   - Total Income tax: ${formatCurrency(state.taxOld.totalTax)}
   - Total Income Tax paid: ${formatCurrency(state.tdsPaid)}
   - Tax Due / Refund: ${state.taxOld.netLiability > 0 ? "Tax Due: " : "Refund: "}${formatCurrency(Math.abs(state.taxOld.netLiability))}

2. TAX AS PER NEW REGIME (DEFAULT):
   - Total Gross Income: ${formatCurrency(state.totalGrossIncome)}
   - Taxable Income: ${formatCurrency(state.taxNew.taxableIncome)}
   - Standard Deduction: ${formatCurrency(75000)}
   - Total Income tax: ${formatCurrency(state.taxNew.totalTax)}
   - Total Income Tax paid: ${formatCurrency(state.tdsPaid)}
   - Tax Due / Refund: ${state.taxNew.netLiability > 0 ? "Tax Due: " : "Refund: "}${formatCurrency(Math.abs(state.taxNew.netLiability))}

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
  const financialYearSelect = document.getElementById("financial-year");

  const daRateP1Select = document.getElementById("da-rate-p1");
  const daRateP2Select = document.getElementById("da-rate-p2");
  const daRateP3Select = document.getElementById("da-rate-p3");

  const baseTaRateSelect = document.getElementById("base-ta-rate");
  const hraRateSelect = document.getElementById("hra-rate-select");
  const quartersToggle = document.getElementById("quarters-toggle");
  const tptaToggle = document.getElementById("tpta-toggle");
  const payLevelSelect = document.getElementById("pay-level");
  
  const cityClassificationSelect = document.getElementById("city-classification");
  const rentPaidInput = document.getElementById("rent-paid");
  const ceaChildrenSelect = document.getElementById("cea-children");
  const ceaReceivedInput = document.getElementById("cea-received");

  const arrPromoInput = document.getElementById("arr-promo");
  const elLtcInput = document.getElementById("el-ltc");

  const deduct24bInput = document.getElementById("deduct-24b");
  const deduct80EInput = document.getElementById("deduct-80e");
  const deductProfTaxInput = document.getElementById("deduct-prof-tax");

  const deduct80cLicInput = document.getElementById("deduct-80c-lic");
  const deduct80cPliInput = document.getElementById("deduct-80c-pli");
  const deduct80cGpfInput = document.getElementById("deduct-80c-gpf");
  const deduct80cTuitionInput = document.getElementById("deduct-80c-tuition");
  const deduct80cHousingInput = document.getElementById("deduct-80c-housing");
  const deduct80cInsuranceInput = document.getElementById("deduct-80c-insurance");

  const deduct80DInput = document.getElementById("deduct-80d");
  const deductNpsInput = document.getElementById("deduct-nps");
  const tdsPaidInput = document.getElementById("tds-paid");

  // Initial state setup from DOM
  state.payLevel = payLevelSelect.value;
  populateBasicPayDropdown(state.payLevel);

  // Smart Auto-fill bindings
  function syncStandardRates() {
    // 1. Auto-fill Base TA
    const basic = parseFloat(basicPayInput.value) || 0;
    const isHigherTpta = tptaToggle.checked;
    const standardBaseTa = getBaseTaRate(state.payLevel, basic, isHigherTpta);
    baseTaRateSelect.value = standardBaseTa;

    // 2. Auto-fill HRA Rate
    if (quartersToggle.checked) {
      hraRateSelect.value = "0";
      hraRateSelect.disabled = true;
    } else {
      hraRateSelect.disabled = false;
      const selectedTier = cityClassificationSelect.value;
      if (selectedTier === "X") hraRateSelect.value = "30";
      else if (selectedTier === "Y") hraRateSelect.value = "20";
      else if (selectedTier === "Z") hraRateSelect.value = "10";
    }
  }

  // Trigger auto-fill initially
  syncStandardRates();
  updateCalculations();

  // Pay Level Selector listener: auto fills basic options and syncs rates
  payLevelSelect.addEventListener("change", (e) => {
    state.payLevel = e.target.value;
    populateBasicPayDropdown(state.payLevel);
    syncStandardRates();
    updateCalculations();
  });

  // TPTA, Quarters, and City Classification change updates
  tptaToggle.addEventListener("change", () => {
    syncStandardRates();
    updateCalculations();
  });
  quartersToggle.addEventListener("change", () => {
    syncStandardRates();
    updateCalculations();
  });
  cityClassificationSelect.addEventListener("change", () => {
    syncStandardRates();
    updateCalculations();
  });

  // Basic Pay manually updated should also sync standard TA
  basicPayInput.addEventListener("change", () => {
    syncStandardRates();
    updateCalculations();
  });

  // General Input change listeners
  const liveInputs = [
    incrementAmountInput, ceaReceivedInput, arrPromoInput, elLtcInput,
    rentPaidInput, deduct24bInput, deduct80EInput, deductProfTaxInput,
    deduct80cLicInput, deduct80cPliInput, deduct80cGpfInput, 
    deduct80cTuitionInput, deduct80cHousingInput, deduct80cInsuranceInput,
    deduct80DInput, deductNpsInput, tdsPaidInput
  ];
  
  liveInputs.forEach(input => {
    if (input) {
      input.addEventListener("input", updateCalculations);
    }
  });

  // Dropdowns change update calculations
  const dropdownInputs = [
    incrementMonthSelect, financialYearSelect,
    daRateP1Select, daRateP2Select, daRateP3Select,
    baseTaRateSelect, hraRateSelect, ceaChildrenSelect
  ];

  dropdownInputs.forEach(select => {
    if (select) {
      select.addEventListener("change", updateCalculations);
    }
  });

  // Set up tab routing and lookups
  setupTabNavigation();
  setupThemeToggle();
  setupExportActions();
  registerServiceWorker();
});

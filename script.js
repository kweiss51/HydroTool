class HydropowerCalculator {
    constructor() {
        this.currentUnit = 'si';
        this.currentTableView = 'siToImperial';
        this.lastCalcResults = null;

        this.constants = {
            si: {
                gravity: 9.81,
                densityUnit: 'kg/m³',
                flowRateUnit: 'm³/s',
                headUnit: 'm',
                gravityUnit: 'm/s²',
                powerUnit: 'W'
            },
            imperial: {
                gravity: 32.174,
                densityUnit: 'lb/ft³',
                flowRateUnit: 'ft³/s',
                headUnit: 'ft',
                gravityUnit: 'ft/s²',
                powerUnit: 'ft·lbf/s'
            }
        };

        this.conversionData = {
            siToImperial: [
                { from: '1 Watt (W)',      to: '0.001341 Horsepower (HP)' },
                { from: '1 Kilowatt (kW)', to: '1.34102 Horsepower (HP)' },
                { from: '1 Watt (W)',      to: '0.737562 ft·lbf/s' },
                { from: '1 Watt (W)',      to: '3.41214 BTU/h' },
                { from: '1 m³/s',          to: '35.3147 ft³/s' },
                { from: '1 meter (m)',     to: '3.28084 feet (ft)' },
                { from: '1 kg/m³',         to: '0.062428 lb/ft³' },
                { from: '1 m/s²',          to: '3.28084 ft/s²' }
            ],
            imperialToSi: [
                { from: '1 Horsepower (HP)', to: '745.7 Watts (W)' },
                { from: '1 Horsepower (HP)', to: '0.7457 Kilowatts (kW)' },
                { from: '1 ft·lbf/s',        to: '1.35582 Watts (W)' },
                { from: '1 BTU/h',           to: '0.293071 Watts (W)' },
                { from: '1 ft³/s',           to: '0.0283168 m³/s' },
                { from: '1 foot (ft)',        to: '0.3048 meters (m)' },
                { from: '1 lb/ft³',          to: '16.0185 kg/m³' },
                { from: '1 ft/s²',           to: '0.3048 m/s²' }
            ]
        };

        this.initializeEventListeners();
        this.updateUnits();
        this.populateConversionTable();
    }

    initializeEventListeners() {
        document.getElementById('siUnits').addEventListener('click', () => this.switchUnits('si'));
        document.getElementById('imperialUnits').addEventListener('click', () => this.switchUnits('imperial'));

        document.getElementById('siToImperialBtn').addEventListener('click', () => this.switchTableView('siToImperial'));
        document.getElementById('imperialToSiBtn').addEventListener('click', () => this.switchTableView('imperialToSi'));

        document.getElementById('copyResultsBtn').addEventListener('click', () => this.copyResults());
        document.getElementById('downloadCSVBtn').addEventListener('click', () => this.downloadCSV());

        ['flowRate', 'head', 'efficiency', 'density', 'hoursPerYear'].forEach(id => {
            document.getElementById(id)?.addEventListener('input', () => this.calculatePower());
        });
    }

    switchUnits(unitSystem) {
        document.querySelectorAll('.unit-btn').forEach(btn => btn.classList.remove('active'));
        document.getElementById(unitSystem + 'Units').classList.add('active');

        if (this.currentUnit !== unitSystem) {
            this.convertExistingValues(unitSystem);
        }

        this.currentUnit = unitSystem;
        this.updateUnits();
        this.calculatePower();
    }

    convertExistingValues(newUnit) {
        const flowRateInput = document.getElementById('flowRate');
        const headInput     = document.getElementById('head');
        const densityInput  = document.getElementById('density');

        if (flowRateInput.value) {
            flowRateInput.value = newUnit === 'imperial'
                ? (parseFloat(flowRateInput.value) * 35.3147).toFixed(4)
                : (parseFloat(flowRateInput.value) / 35.3147).toFixed(4);
        }

        if (headInput.value) {
            headInput.value = newUnit === 'imperial'
                ? (parseFloat(headInput.value) * 3.28084).toFixed(2)
                : (parseFloat(headInput.value) / 3.28084).toFixed(2);
        }

        if (densityInput.value) {
            densityInput.value = newUnit === 'imperial'
                ? (parseFloat(densityInput.value) * 0.062428).toFixed(2)
                : (parseFloat(densityInput.value) / 0.062428).toFixed(1);
        }
    }

    updateUnits() {
        const c = this.constants[this.currentUnit];

        document.getElementById('flowRateUnit').textContent = c.flowRateUnit;
        document.getElementById('headUnit').textContent     = c.headUnit;
        document.getElementById('gravityUnit').textContent  = c.gravityUnit;
        document.getElementById('densityUnit').textContent  = c.densityUnit;
        document.getElementById('gravity').value            = c.gravity;

        // Gravity is unused in Imperial (g/g_c = 1); hide it to avoid confusion
        document.getElementById('gravityRow').style.display =
            this.currentUnit === 'si' ? '' : 'none';

        document.getElementById('density').value =
            this.currentUnit === 'si' ? '1000' : '62.43';

        this.updateFormulaLabels();
    }

    updateFormulaLabels() {
        const si = this.currentUnit === 'si';
        const th = si
            ? 'P<sub>th</sub> = ρ × g × Q × h'
            : 'P<sub>th</sub> = γ × Q × h';
        const pr = si
            ? 'P<sub>a</sub> = μ × ρ × g × Q × h'
            : 'P<sub>a</sub> = μ × γ × Q × h';

        document.getElementById('resultFormulaTheoretical').innerHTML  = th;
        document.getElementById('resultFormulaPractical').innerHTML    = pr;
        document.getElementById('infoFormulaTheoretical').innerHTML    =
            `<strong>${th}</strong>`;
        document.getElementById('infoFormulaPractical').innerHTML      =
            `<strong>P<sub>a</sub> = μ × P<sub>th</sub></strong>`;
    }

    switchTableView(viewType) {
        document.querySelectorAll('.table-btn').forEach(btn => btn.classList.remove('active'));
        document.getElementById(viewType + 'Btn').classList.add('active');
        this.currentTableView = viewType;
        this.populateConversionTable();
    }

    populateConversionTable() {
        const table = document.getElementById('conversionTable');
        const data  = this.conversionData[this.currentTableView];

        table.innerHTML = `
            <thead><tr><th>From</th><th>To</th></tr></thead>
            <tbody>
                ${data.map(r => `<tr><td>${r.from}</td><td>${r.to}</td></tr>`).join('')}
            </tbody>`;
    }

    calculatePower() {
        this.clearValidationErrors();

        const flowRate      = parseFloat(document.getElementById('flowRate').value);
        const head          = parseFloat(document.getElementById('head').value);
        const efficiencyPct = parseFloat(document.getElementById('efficiency').value);
        const density       = parseFloat(document.getElementById('density').value);
        const hoursPerYear  = parseFloat(document.getElementById('hoursPerYear').value) || 8760;

        let valid = true;
        if (!(flowRate > 0))                        { this.setInputError('flowRate', 'Enter a positive value');     valid = false; }
        if (!(head > 0))                            { this.setInputError('head', 'Enter a positive value');         valid = false; }
        if (!(efficiencyPct > 0 && efficiencyPct <= 100)) { this.setInputError('efficiency', 'Enter 1 – 100');    valid = false; }
        if (!(density > 0))                         { this.setInputError('density', 'Enter a positive value');      valid = false; }

        if (!valid) { this.clearResults(); return; }

        const efficiency = efficiencyPct / 100;
        const gravity    = this.constants[this.currentUnit].gravity;

        const theoreticalPower = this.currentUnit === 'si'
            ? density * gravity * flowRate * head       // Watts
            : density * flowRate * head;                // ft·lbf/s (γ × Q × h, g cancels with g_c)

        const practicalPower = efficiency * theoreticalPower;

        const practicalKW = this.currentUnit === 'si'
            ? practicalPower / 1000
            : practicalPower * 1.35582 / 1000;         // ft·lbf/s → kW

        const annualEnergy = practicalKW * hoursPerYear / 1000; // MWh/yr

        this.lastCalcResults = {
            theoreticalPower, practicalPower, practicalKW,
            annualEnergy, flowRate, head, efficiency, density, hoursPerYear
        };

        this.displayResults(theoreticalPower, practicalPower, practicalKW, annualEnergy);
        this.displayConversions(theoreticalPower, practicalPower);
    }

    setInputError(id, msg) {
        const input = document.getElementById(id);
        if (!input) return;
        input.classList.add('input-error');
        let errEl = input.parentElement.querySelector('.error-msg');
        if (!errEl) {
            errEl = document.createElement('span');
            errEl.className = 'error-msg';
            input.parentElement.appendChild(errEl);
        }
        errEl.textContent = msg;
    }

    clearValidationErrors() {
        document.querySelectorAll('.input-error').forEach(el => el.classList.remove('input-error'));
        document.querySelectorAll('.error-msg').forEach(el => el.remove());
    }

    displayResults(theoreticalPower, practicalPower, practicalKW, annualEnergy) {
        if (this.currentUnit === 'si') {
            document.getElementById('theoreticalPower').innerHTML =
                `${this.formatNumber(theoreticalPower)} W<br>
                 <small>${this.formatNumber(theoreticalPower / 1000)} kW</small>`;
            document.getElementById('practicalPower').innerHTML =
                `${this.formatNumber(practicalPower)} W<br>
                 <small>${this.formatNumber(practicalPower / 1000)} kW</small>`;
        } else {
            document.getElementById('theoreticalPower').innerHTML =
                `${this.formatNumber(theoreticalPower)} ft·lbf/s<br>
                 <small>${this.formatNumber(theoreticalPower / 550)} HP</small>`;
            document.getElementById('practicalPower').innerHTML =
                `${this.formatNumber(practicalPower)} ft·lbf/s<br>
                 <small>${this.formatNumber(practicalPower / 550)} HP</small>`;
        }

        document.getElementById('annualEnergy').innerHTML =
            `${this.formatNumber(annualEnergy)} MWh/yr<br>
             <small>${this.formatNumber(annualEnergy * 1000)} kWh/yr</small>`;
    }

    displayConversions(theoreticalPower, practicalPower) {
        const conversionsDiv = document.getElementById('conversions');
        let rows;

        if (this.currentUnit === 'si') {
            rows = [
                { label: 'Theoretical Power',        from: `${this.formatNumber(theoreticalPower)} W`,       to: `${this.formatNumber(theoreticalPower * 0.00134102)} HP` },
                { label: 'Practical Power',           from: `${this.formatNumber(practicalPower)} W`,         to: `${this.formatNumber(practicalPower  * 0.00134102)} HP` },
                { label: 'Theoretical (ft·lbf/s)',    from: `${this.formatNumber(theoreticalPower)} W`,       to: `${this.formatNumber(theoreticalPower * 0.737562)} ft·lbf/s` },
                { label: 'Theoretical (BTU/h)',       from: `${this.formatNumber(theoreticalPower)} W`,       to: `${this.formatNumber(theoreticalPower * 3.41214)} BTU/h` },
            ];
        } else {
            rows = [
                { label: 'Theoretical Power',         from: `${this.formatNumber(theoreticalPower)} ft·lbf/s`, to: `${this.formatNumber(theoreticalPower * 1.35582)} W` },
                { label: 'Practical Power',            from: `${this.formatNumber(practicalPower)} ft·lbf/s`,   to: `${this.formatNumber(practicalPower  * 1.35582)} W` },
                { label: 'Theoretical (HP)',           from: `${this.formatNumber(theoreticalPower)} ft·lbf/s`, to: `${this.formatNumber(theoreticalPower / 550)} HP` },
                { label: 'Theoretical (BTU/h)',        from: `${this.formatNumber(theoreticalPower * 1.35582)} W`, to: `${this.formatNumber(theoreticalPower * 1.35582 * 3.41214)} BTU/h` },
            ];
        }

        conversionsDiv.innerHTML = rows.map(r => `
            <div class="conversion-item">
                <div class="conv-label">${r.label}</div>
                <div class="from">${r.from}</div>
                <div class="to">= ${r.to}</div>
            </div>`).join('');
    }

    formatNumber(num) {
        if (num === null || num === undefined || !isFinite(num)) return '—';
        if (num === 0) return '0';
        const abs = Math.abs(num);
        if (abs < 0.001)  return num.toExponential(2);
        if (abs < 1)      return num.toLocaleString('en-US', { minimumFractionDigits: 4, maximumFractionDigits: 4 });
        if (abs < 10)     return num.toLocaleString('en-US', { minimumFractionDigits: 3, maximumFractionDigits: 3 });
        if (abs < 100)    return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        if (abs < 10000)  return num.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
        return Math.round(num).toLocaleString('en-US');
    }

    clearResults() {
        ['theoreticalPower', 'practicalPower', 'annualEnergy'].forEach(id => {
            document.getElementById(id).textContent = '—';
        });
        document.getElementById('conversions').innerHTML = '';
    }

    copyResults() {
        if (!this.lastCalcResults) return;
        const r = this.lastCalcResults;
        const unitLabel   = this.currentUnit === 'si' ? 'SI (Metric)' : 'Imperial';
        const powerUnit   = this.constants[this.currentUnit].powerUnit;
        const flowUnit    = this.constants[this.currentUnit].flowRateUnit;
        const headUnit    = this.constants[this.currentUnit].headUnit;

        const text = [
            '=== Hydropower Calculation Results ===',
            `Unit System:          ${unitLabel}`,
            `Flow Rate (Q):        ${this.formatNumber(r.flowRate)} ${flowUnit}`,
            `Head (H):             ${this.formatNumber(r.head)} ${headUnit}`,
            `Efficiency:           ${(r.efficiency * 100).toFixed(1)}%`,
            `Theoretical Power:    ${this.formatNumber(r.theoreticalPower)} ${powerUnit}`,
            `Practical Power:      ${this.formatNumber(r.practicalPower)} ${powerUnit}`,
            `Practical Power (kW): ${this.formatNumber(r.practicalKW)} kW`,
            `Annual Energy:        ${this.formatNumber(r.annualEnergy)} MWh/yr`,
            `Operating Hrs/Year:   ${r.hoursPerYear} h/yr`,
        ].join('\n');

        navigator.clipboard.writeText(text).then(() => {
            const btn = document.getElementById('copyResultsBtn');
            const orig = btn.textContent;
            btn.textContent = '✓ Copied!';
            btn.classList.add('btn-success');
            setTimeout(() => { btn.textContent = orig; btn.classList.remove('btn-success'); }, 2000);
        });
    }

    downloadCSV() {
        if (!this.lastCalcResults) return;
        const r = this.lastCalcResults;
        const u = this.currentUnit;

        const rows = [
            ['Parameter', 'Value', 'Unit'],
            ['Unit System',          u === 'si' ? 'SI (Metric)' : 'Imperial', ''],
            ['Flow Rate',            r.flowRate,                    this.constants[u].flowRateUnit],
            ['Head',                 r.head,                        this.constants[u].headUnit],
            ['Efficiency',           (r.efficiency * 100).toFixed(1), '%'],
            ['Water Density',        r.density,                     this.constants[u].densityUnit],
            ['Theoretical Power',    r.theoreticalPower.toFixed(2), this.constants[u].powerUnit],
            ['Practical Power',      r.practicalPower.toFixed(2),   this.constants[u].powerUnit],
            ['Practical Power (kW)', r.practicalKW.toFixed(3),      'kW'],
            ['Annual Energy',        r.annualEnergy.toFixed(2),     'MWh/yr'],
            ['Operating Hrs/Year',   r.hoursPerYear,                'h/yr'],
        ];

        const csv  = rows.map(row => row.map(c => `"${c}"`).join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url  = URL.createObjectURL(blob);
        const a    = Object.assign(document.createElement('a'), { href: url, download: 'hydropower-results.csv' });
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const calculator = new HydropowerCalculator();
    document.getElementById('flowRate').value  = '1';
    document.getElementById('head').value      = '100';
    document.getElementById('efficiency').value = '85';
    calculator.calculatePower();
});

class PumpedStorageCalculator {
    constructor() {
        this.currentUnit = 'si';
        this.reservoirType = 'fixed';
        this.constants = {
            si: {
                gravity: 9.81, // m/s²
                density: 1000, // kg/m³
                powerUnits: ['kW', 'MW'],
                lengthUnit: 'm',
                volumeUnit: 'm³',
                flowUnit: 'm³/s',
                energyUnit: 'kWh'
            },
            imperial: {
                gravity: 32.174, // ft/s²
                density: 62.43, // lb/ft³
                powerUnits: ['kW', 'MW', 'HP', 'kHP'],
                lengthUnit: 'ft',
                volumeUnit: 'ft³',
                flowUnit: 'ft³/s',
                energyUnit: 'kWh'
            }
        };
        
        this.conversionFactors = {
            siToImperial: {
                length: 3.28084, // m to ft
                volume: 35.3147, // m³ to ft³
                flow: 35.3147, // m³/s to ft³/s
                power_kW_to_HP: 1.34102,
                power_MW_to_kHP: 1341.02
            },
            imperialToSi: {
                length: 0.3048, // ft to m
                volume: 0.0283168, // ft³ to m³
                flow: 0.0283168, // ft³/s to m³/s
                power_HP_to_kW: 0.7457,
                power_kHP_to_MW: 0.7457
            }
        };
        
        this.initializeEventListeners();
        this.updateUnits();
        this.initializeReservoirConfig();
    }

    initializeEventListeners() {
        // Unit selector radio buttons
        document.querySelectorAll('input[name="unitSystem"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                this.switchUnits(e.target.value);
            });
        });
        
        // Reservoir type selection
        document.querySelectorAll('input[name="reservoirType"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                this.reservoirType = e.target.value;
                this.updateReservoirInputs();
            });
        });
        
        // Advanced toggle
        document.getElementById('advancedToggle').addEventListener('click', () => {
            this.toggleAdvanced();
        });
        
        // Calculate button
        document.getElementById('calculateBtn').addEventListener('click', () => {
            this.calculateSystem();
        });
        
        // Real-time calculation on input change
        const inputs = ['desiredPower', 'operationTime', 'staticHead', 'flowRate', 'pumpEfficiency', 
                       'turbineEfficiency', 'generatorEfficiency'];
        inputs.forEach(inputId => {
            const element = document.getElementById(inputId);
            if (element) {
                element.addEventListener('input', () => {
                    this.calculateSystem();
                });
            }
        });
        
        // Power unit change
        document.getElementById('powerUnit').addEventListener('change', () => {
            this.calculateSystem();
        });
    }

    switchUnits(unitSystem) {
        // Update active radio button (no need to update button classes for radio buttons)
        
        // Convert existing values if any
        if (this.currentUnit !== unitSystem) {
            this.convertExistingValues(unitSystem);
        }
        
        this.currentUnit = unitSystem;
        this.updateUnits();
    }

    convertExistingValues(newUnit) {
        const staticHeadInput = document.getElementById('staticHead');
        const flowRateInput = document.getElementById('flowRate');
        const penstockLengthInput = document.getElementById('penstockLength');
        const penstockDiameterInput = document.getElementById('penstockDiameter');
        
        const lengthFactor = newUnit === 'imperial' ? 
            this.conversionFactors.siToImperial.length : 
            this.conversionFactors.imperialToSi.length;
            
        const flowFactor = newUnit === 'imperial' ? 
            this.conversionFactors.siToImperial.flow : 
            this.conversionFactors.imperialToSi.flow;
        
        if (staticHeadInput.value) {
            staticHeadInput.value = (parseFloat(staticHeadInput.value) * lengthFactor).toFixed(2);
        }
        
        if (flowRateInput && flowRateInput.value) {
            flowRateInput.value = (parseFloat(flowRateInput.value) * flowFactor).toFixed(3);
        }
        
        if (penstockLengthInput && penstockLengthInput.value) {
            penstockLengthInput.value = (parseFloat(penstockLengthInput.value) * lengthFactor).toFixed(1);
        }
        
        if (penstockDiameterInput && penstockDiameterInput.value) {
            penstockDiameterInput.value = (parseFloat(penstockDiameterInput.value) * lengthFactor).toFixed(2);
        }
    }

    updateUnits() {
        const constants = this.constants[this.currentUnit];
        
        // Update unit labels
        document.getElementById('headUnit').textContent = constants.lengthUnit;
        document.getElementById('flowUnit').textContent = constants.flowUnit;
        
        // Update advanced parameter units if they exist
        const lengthUnitEl = document.getElementById('lengthUnit');
        if (lengthUnitEl) lengthUnitEl.textContent = constants.lengthUnit;
        
        const diameterUnitEl = document.getElementById('diameterUnit');
        if (diameterUnitEl) diameterUnitEl.textContent = constants.lengthUnit;
        
        // Update power unit options
        const powerUnitSelect = document.getElementById('powerUnit');
        const currentPowerUnit = powerUnitSelect.value;
        powerUnitSelect.innerHTML = '';
        
        constants.powerUnits.forEach(unit => {
            const option = document.createElement('option');
            option.value = unit;
            option.textContent = unit;
            powerUnitSelect.appendChild(option);
        });
        
        // Try to preserve the current power unit, or set a reasonable default
        if (constants.powerUnits.includes(currentPowerUnit)) {
            powerUnitSelect.value = currentPowerUnit;
        } else {
            // Set default to kW for both systems
            powerUnitSelect.value = 'kW';
        }
    }

    calculateSystem() {
        const inputs = this.getInputValues();
        
        if (!this.validateInputs(inputs)) {
            this.clearResults();
            return;
        }
        
        const calculations = this.performCalculations(inputs);
        this.displayResults(calculations);
        this.displayCalculationSteps(calculations);
        this.displayConversions(calculations);
        this.createCharts(calculations);
    }

    getInputValues() {
        const powerValue = parseFloat(document.getElementById('desiredPower').value) || 0;
        const powerUnit = document.getElementById('powerUnit').value;
        
        // Convert all power to kW for consistent calculations
        let power = powerValue;
        if (powerUnit === 'MW') {
            power = powerValue * 1000; // MW to kW
        } else if (powerUnit === 'HP') {
            power = powerValue * 0.7457; // HP to kW
        } else if (powerUnit === 'kHP') {
            power = powerValue * 745.7; // kHP to kW
        }
        // kW stays as is
        
        return {
            power: power, // Always in kW
            powerUnit: powerUnit,
            operationTime: parseFloat(document.getElementById('operationTime').value) || 8,
            staticHead: parseFloat(document.getElementById('staticHead').value) || 0,
            flowRate: parseFloat(document.getElementById('flowRate').value) || 0,
            pumpEfficiency: parseFloat(document.getElementById('pumpEfficiency').value) || 0.85,
            turbineEfficiency: parseFloat(document.getElementById('turbineEfficiency').value) || 0.90,
            generatorEfficiency: parseFloat(document.getElementById('generatorEfficiency').value) || 0.95,
            penstockLength: parseFloat(document.getElementById('penstockLength').value) || 0,
            penstockDiameter: parseFloat(document.getElementById('penstockDiameter').value) || 0,
            roughness: parseFloat(document.getElementById('roughness').value) || 0.0015
        };
    }

    validateInputs(inputs) {
        // Count how many of the three main parameters are provided
        const powerProvided = inputs.power > 0;
        const headProvided = inputs.staticHead > 0;
        const flowRateProvided = inputs.flowRate > 0;
        
        const providedCount = [powerProvided, headProvided, flowRateProvided].filter(Boolean).length;
        
        // Need at least 2 of the 3 main parameters, plus operation time
        return providedCount >= 2 && inputs.operationTime > 0;
    }

    calculateHeadLoss(flowRate, penstockDiameter, penstockLength, roughness) {
        if (penstockLength === 0 || penstockDiameter === 0) {
            return 0;
        }

        // Convert inputs for calculation consistency
        const Q = flowRate; // m³/s
        const D = this.currentUnit === 'imperial' ? penstockDiameter * 0.3048 : penstockDiameter; // Convert to meters if needed
        const L = this.currentUnit === 'imperial' ? penstockLength * 0.3048 : penstockLength; // Convert to meters if needed
        const e = roughness; // m

        // Calculate velocity
        const A = Math.PI * Math.pow(D / 2, 2); // Cross-sectional area
        const V = Q / A; // Velocity

        // Calculate Reynolds number
        const nu = 1.004e-6; // Kinematic viscosity of water at 20°C (m²/s)
        const Re = (V * D) / nu;

        // Calculate friction factor using Colebrook-White equation approximation
        let f;
        if (Re < 2300) {
            // Laminar flow
            f = 64 / Re;
        } else {
            // Turbulent flow - Swamee-Jain approximation
            const term1 = e / (3.7 * D);
            const term2 = 5.74 / Math.pow(Re, 0.9);
            f = 0.25 / Math.pow(Math.log10(term1 + term2), 2);
        }

        // Calculate head loss using Darcy-Weisbach equation
        const headLoss = f * (L / D) * (Math.pow(V, 2) / (2 * 9.81)); // meters

        return this.currentUnit === 'imperial' ? headLoss * 3.28084 : headLoss; // Convert to feet if Imperial
    }

    performCalculations(inputs) {
        const constants = this.constants[this.currentUnit];
        const g = constants.gravity;
        const rho = constants.density;
        
        // Calculate efficiencies
        const roundTripEfficiency = inputs.pumpEfficiency * inputs.turbineEfficiency * Math.pow(inputs.generatorEfficiency, 2);
        const pumpingEfficiency = inputs.pumpEfficiency * inputs.generatorEfficiency;
        const generationEfficiency = inputs.turbineEfficiency * inputs.generatorEfficiency;
        
        // Determine which parameters are provided and calculate the missing one
        let flowRate = inputs.flowRate;
        let staticHead = inputs.staticHead;
        let actualPower = inputs.power;
        
        // Identify the missing parameter and calculate it
        if (inputs.power === 0 && inputs.staticHead > 0 && inputs.flowRate > 0) {
            // Calculate power from head and flow rate
            actualPower = this.calculatePower(flowRate, staticHead, generationEfficiency, g, rho);
        } else if (inputs.staticHead === 0 && inputs.power > 0 && inputs.flowRate > 0) {
            // Calculate head from power and flow rate
            staticHead = this.calculateHead(actualPower, flowRate, generationEfficiency, g, rho);
        } else if (inputs.flowRate === 0 && inputs.power > 0 && inputs.staticHead > 0) {
            // Calculate flow rate from power and head
            flowRate = this.calculateFlowRate(actualPower, staticHead, generationEfficiency, g, rho);
        } else if (inputs.power > 0 && inputs.staticHead > 0 && inputs.flowRate > 0) {
            // All three provided - use them as is, but recalculate power for consistency
            actualPower = this.calculatePower(flowRate, staticHead, generationEfficiency, g, rho);
        }
        
        // Calculate head losses if penstock parameters are provided
        const headLoss = this.calculateHeadLoss(flowRate, inputs.penstockDiameter, inputs.penstockLength, inputs.roughness);
        const effectiveHead = staticHead - headLoss;
        
        // If head losses are significant, recalculate power with effective head
        if (headLoss > 0) {
            actualPower = this.calculatePower(flowRate, effectiveHead, generationEfficiency, g, rho);
        }
        
        // Calculate required reservoir volume
        const reservoirVolume = flowRate * inputs.operationTime * 3600; // Convert hours to seconds
        
        // Calculate energy storage capacity
        const energyCapacity = this.calculateEnergyCapacity(reservoirVolume, effectiveHead, roundTripEfficiency, g, rho);
        
        // Calculate pumping power required
        const pumpingPower = actualPower / roundTripEfficiency;
        
        return {
            inputs,
            constants,
            roundTripEfficiency,
            pumpingEfficiency,
            generationEfficiency,
            staticHead: staticHead,
            headLoss,
            effectiveHead,
            flowRate,
            actualPower,
            reservoirVolume,
            energyCapacity,
            pumpingPower
        };
    }

    calculatePower(flowRate, head, efficiency, g, rho) {
        // P = ρ × g × Q × H × η
        const powerWatts = rho * g * flowRate * head * efficiency;
        return powerWatts / 1000; // Always return kW
    }

    calculateFlowRate(power, head, efficiency, g, rho) {
        // P = ρ × g × Q × H × η
        // Q = P / (ρ × g × H × η)
        
        const powerInWatts = power * 1000; // power is always in kW, convert to Watts
        return powerInWatts / (rho * g * head * efficiency);
    }

    calculateHead(power, flowRate, efficiency, g, rho) {
        // P = ρ × g × Q × H × η
        // H = P / (ρ × g × Q × η)
        
        const powerInWatts = power * 1000; // power is always in kW, convert to Watts
        return powerInWatts / (rho * g * flowRate * efficiency);
    }

    calculateEnergyCapacity(volume, head, efficiency, g, rho) {
        // E = ρ × g × V × H × η (in Joules)
        // Convert to kWh: divide by 3.6 × 10^6
        
        const energyJoules = rho * g * volume * head * efficiency;
        return energyJoules / 3600000; // Convert J to kWh
    }

    displayResults(calc) {
        const { inputs, constants } = calc;
        
        // Determine which values were calculated vs provided
        const powerCalculated = inputs.power === 0;
        const headCalculated = inputs.staticHead === 0;
        const flowCalculated = inputs.flowRate === 0;
        
        // Power Capacity
        const powerUnit = inputs.powerUnit || 'kW';
        let powerDisplay = calc.actualPower;
        if (powerUnit === 'MW') {
            powerDisplay = calc.actualPower / 1000;
        } else if (powerUnit === 'HP') {
            powerDisplay = calc.actualPower / 0.7457;
        } else if (powerUnit === 'kHP') {
            powerDisplay = calc.actualPower / 745.7;
        }
        
        document.getElementById('powerCapacity').innerHTML = 
            `${this.formatNumber(powerDisplay)} ${powerUnit}${powerCalculated ? ' <span class="calculated">(calculated)</span>' : ''}<br>
            <small>${this.formatNumber(calc.actualPower)} kW</small>`;
        
        // Static Head
        document.getElementById('staticHeadResult').innerHTML = 
            `${this.formatNumber(calc.staticHead)} ${constants.lengthUnit}${headCalculated ? ' <span class="calculated">(calculated)</span>' : ''}<br>
            <small>Effective: ${this.formatNumber(calc.effectiveHead)} ${constants.lengthUnit}</small>`;
        
        // Flow Rate
        document.getElementById('flowRateResult').innerHTML = 
            `${this.formatNumber(calc.flowRate)} ${constants.flowUnit}${flowCalculated ? ' <span class="calculated">(calculated)</span>' : ''}`;
        
        // Energy Capacity
        document.getElementById('energyCapacity').innerHTML = 
            `${this.formatNumber(calc.energyCapacity)} kWh<br>
            <small>${this.formatNumber(calc.energyCapacity / 1000)} MWh</small>`;
        
        // Reservoir Volume
        document.getElementById('reservoirVolume').innerHTML = 
            `${this.formatNumber(calc.reservoirVolume)} ${constants.volumeUnit}<br>
            <small>${this.formatNumber(calc.reservoirVolume / 1000)} k${constants.volumeUnit}</small>`;
        
        // Round-trip Efficiency
        document.getElementById('roundTripEfficiency').innerHTML = 
            `${(calc.roundTripEfficiency * 100).toFixed(1)}%<br>
            <small>Energy Recovery Rate</small>`;
    }

    displayCalculationSteps(calc) {
        const { inputs, constants } = calc;
        const steps = [];
        
        // Step 1: Input Summary
        steps.push({
            title: "1. Input Parameters",
            calculation: `
                Power Capacity: ${inputs.power} ${inputs.powerUnit}
                Operation Time: ${inputs.operationTime} hours
                Static Head: ${inputs.staticHead} ${constants.lengthUnit}
                Pump Efficiency: ${(inputs.pumpEfficiency * 100).toFixed(1)}%
                Turbine Efficiency: ${(inputs.turbineEfficiency * 100).toFixed(1)}%
                Generator/Motor Efficiency: ${(inputs.generatorEfficiency * 100).toFixed(1)}%
            `,
            result: "Parameters validated and ready for calculation"
        });
        
        // Step 2: Efficiency Calculations
        steps.push({
            title: "2. System Efficiency Calculations",
            calculation: `
                Pumping Efficiency = η_pump × η_motor
                = ${inputs.pumpEfficiency.toFixed(3)} × ${inputs.generatorEfficiency.toFixed(3)}
                = ${calc.pumpingEfficiency.toFixed(3)} (${(calc.pumpingEfficiency * 100).toFixed(1)}%)
                
                Generation Efficiency = η_turbine × η_generator  
                = ${inputs.turbineEfficiency.toFixed(3)} × ${inputs.generatorEfficiency.toFixed(3)}
                = ${calc.generationEfficiency.toFixed(3)} (${(calc.generationEfficiency * 100).toFixed(1)}%)
                
                Round-trip Efficiency = η_pumping × η_generation
                = ${calc.pumpingEfficiency.toFixed(3)} × ${calc.generationEfficiency.toFixed(3)}
            `,
            result: `Round-trip Efficiency = ${(calc.roundTripEfficiency * 100).toFixed(1)}%`
        });
        
        // Step 3: Flow Rate Calculation
        const powerInWatts = this.currentUnit === 'si' ? inputs.power * 1000 : inputs.power * 745.7;
        steps.push({
            title: "3. Required Flow Rate Calculation",
            calculation: `
                Formula: Q = P / (ρ × g × H × η_generation)
                
                Where:
                P = ${powerInWatts.toFixed(0)} W (${inputs.power} ${inputs.powerUnit} converted)
                ρ = ${constants.density} ${this.currentUnit === 'si' ? 'kg/m³' : 'lb/ft³'}
                g = ${constants.gravity} ${constants.lengthUnit}/s²
                H = ${calc.effectiveHead.toFixed(2)} ${constants.lengthUnit}
                η = ${calc.generationEfficiency.toFixed(3)}
                
                Q = ${powerInWatts.toFixed(0)} / (${constants.density} × ${constants.gravity} × ${calc.effectiveHead.toFixed(2)} × ${calc.generationEfficiency.toFixed(3)})
            `,
            result: `Q = ${calc.flowRate.toFixed(3)} ${constants.flowUnit}`
        });
        
        // Step 4: Volume Calculation
        steps.push({
            title: "4. Required Reservoir Volume",
            calculation: `
                Formula: V = Q × t_operation
                
                V = ${calc.flowRate.toFixed(3)} ${constants.flowUnit} × ${inputs.operationTime} hours
                V = ${calc.flowRate.toFixed(3)} × ${inputs.operationTime * 3600} seconds
            `,
            result: `V = ${this.formatNumber(calc.reservoirVolume)} ${constants.volumeUnit}`
        });
        
        // Step 5: Energy Storage Capacity
        steps.push({
            title: "5. Energy Storage Capacity",
            calculation: `
                Formula: E = ρ × g × V × H × η_roundtrip / 3.6×10⁶
                
                E = ${constants.density} × ${constants.gravity} × ${this.formatNumber(calc.reservoirVolume)} × ${calc.effectiveHead.toFixed(2)} × ${calc.roundTripEfficiency.toFixed(3)} / 3,600,000
                
                Energy in Joules = ${this.formatNumber(calc.energyCapacity * 3600000)} J
            `,
            result: `E = ${this.formatNumber(calc.energyCapacity)} kWh`
        });
        
        // Display steps
        const stepsContainer = document.getElementById('calculationSteps');
        stepsContainer.innerHTML = steps.map(step => `
            <div class="calculation-step">
                <div class="step-title">${step.title}</div>
                <div class="step-calculation">${step.calculation}</div>
                <div class="step-result">Result: ${step.result}</div>
            </div>
        `).join('');
    }

    displayConversions(calc) {
        const conversions = [];
        
        if (this.currentUnit === 'si') {
            // SI to Imperial conversions
            const flowRateImp = calc.flowRate * this.conversionFactors.siToImperial.flow;
            const volumeImp = calc.reservoirVolume * this.conversionFactors.siToImperial.volume;
            const headImp = calc.effectiveHead * this.conversionFactors.siToImperial.length;
            const powerHP = calc.inputs.power * this.conversionFactors.siToImperial.power_kW_to_HP;
            
            conversions.push(
                { from: `${calc.flowRate.toFixed(3)} m³/s`, to: `${flowRateImp.toFixed(3)} ft³/s` },
                { from: `${this.formatNumber(calc.reservoirVolume)} m³`, to: `${this.formatNumber(volumeImp)} ft³` },
                { from: `${calc.effectiveHead.toFixed(2)} m`, to: `${headImp.toFixed(2)} ft` },
                { from: `${calc.inputs.power} kW`, to: `${powerHP.toFixed(1)} HP` },
                { from: `${this.formatNumber(calc.energyCapacity)} kWh`, to: `${this.formatNumber(calc.energyCapacity * 3.412)} BTU` }
            );
        } else {
            // Imperial to SI conversions
            const flowRateSI = calc.flowRate * this.conversionFactors.imperialToSi.flow;
            const volumeSI = calc.reservoirVolume * this.conversionFactors.imperialToSi.volume;
            const headSI = calc.effectiveHead * this.conversionFactors.imperialToSi.length;
            const powerkW = calc.inputs.power * this.conversionFactors.imperialToSi.power_HP_to_kW;
            
            conversions.push(
                { from: `${calc.flowRate.toFixed(3)} ft³/s`, to: `${flowRateSI.toFixed(3)} m³/s` },
                { from: `${this.formatNumber(calc.reservoirVolume)} ft³`, to: `${this.formatNumber(volumeSI)} m³` },
                { from: `${calc.effectiveHead.toFixed(2)} ft`, to: `${headSI.toFixed(2)} m` },
                { from: `${calc.inputs.power} HP`, to: `${powerkW.toFixed(1)} kW` },
                { from: `${this.formatNumber(calc.energyCapacity)} kWh`, to: `${this.formatNumber(calc.energyCapacity * 3.412)} BTU` }
            );
        }
        
        const conversionsDiv = document.getElementById('conversions');
        conversionsDiv.innerHTML = conversions.map(conv => `
            <div class="conversion-item">
                <div class="from">${conv.from}</div>
                <div class="to">= ${conv.to}</div>
            </div>
        `).join('');
    }

    formatNumber(num) {
        if (num === 0 || num === null || num === undefined) return '0';
        if (isNaN(num)) return 'NaN';
        
        const absNum = Math.abs(num);
        if (absNum < 0.01) return num.toExponential(2);
        if (absNum < 1000) return num.toFixed(2);
        if (absNum < 1000000) return (num / 1000).toFixed(2) + 'K';
        return (num / 1000000).toFixed(2) + 'M';
    }

    clearResults() {
        document.getElementById('powerCapacity').innerHTML = '-';
        document.getElementById('staticHeadResult').innerHTML = '-';
        document.getElementById('energyCapacity').innerHTML = '-';
        document.getElementById('flowRateResult').innerHTML = '-';
        document.getElementById('reservoirVolume').innerHTML = '-';
        document.getElementById('roundTripEfficiency').innerHTML = '-';
        document.getElementById('calculationSteps').innerHTML = '';
        document.getElementById('conversions').innerHTML = '';
    }

    createCharts(calc) {
        this.createEfficiencyChart(calc);
        this.createPowerHeadChart(calc);
        this.createEnergyDurationChart(calc);
        this.createCostBenefitChart(calc);
    }

    createEfficiencyChart(calc) {
        const ctx = document.getElementById('efficiencyChart').getContext('2d');
        
        // Destroy existing chart if it exists
        if (this.efficiencyChart) {
            this.efficiencyChart.destroy();
        }
        
        this.efficiencyChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Round-trip Efficiency', 'Energy Loss'],
                datasets: [{
                    data: [
                        calc.roundTripEfficiency * 100,
                        (1 - calc.roundTripEfficiency) * 100
                    ],
                    backgroundColor: ['#27ae60', '#e74c3c'],
                    borderWidth: 2,
                    borderColor: '#fff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 10,
                            font: {
                                size: 10
                            }
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return context.label + ': ' + context.parsed.toFixed(1) + '%';
                            }
                        }
                    }
                }
            }
        });
    }

    createPowerHeadChart(calc) {
        const ctx = document.getElementById('powerHeadChart').getContext('2d');
        
        if (this.powerHeadChart) {
            this.powerHeadChart.destroy();
        }
        
        // Generate data points for different heads
        const heads = [];
        const powers = [];
        const currentHead = calc.effectiveHead;
        const currentPower = calc.inputs.power;
        
        for (let i = 0.5; i <= 2; i += 0.1) {
            const head = currentHead * i;
            const power = currentPower * i; // Simplified relationship
            heads.push(head.toFixed(0));
            powers.push(power);
        }
        
        this.powerHeadChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: heads,
                datasets: [{
                    label: 'Power Output',
                    data: powers,
                    borderColor: '#4a90e2',
                    backgroundColor: 'rgba(74,144,226,0.1)',
                    borderWidth: 2,
                    pointBackgroundColor: '#4a90e2',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 1,
                    pointRadius: 3,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: `Head (${this.constants[this.currentUnit].lengthUnit})`,
                            font: {
                                size: 10
                            }
                        },
                        ticks: {
                            font: {
                                size: 9
                            }
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: `Power (${calc.inputs.powerUnit})`,
                            font: {
                                size: 10
                            }
                        },
                        ticks: {
                            font: {
                                size: 9
                            }
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
    }

    createEnergyDurationChart(calc) {
        const ctx = document.getElementById('energyDurationChart').getContext('2d');
        
        if (this.energyDurationChart) {
            this.energyDurationChart.destroy();
        }
        
        // Generate data for different operation durations
        const durations = [1, 2, 4, 6, 8, 10, 12, 24];
        const energyCapacities = durations.map(hours => {
            const volume = calc.flowRate * hours * 3600;
            return this.calculateEnergyCapacity(volume, calc.effectiveHead, calc.roundTripEfficiency, 
                this.constants[this.currentUnit].gravity, this.constants[this.currentUnit].density);
        });
        
        this.energyDurationChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: durations.map(d => d + 'h'),
                datasets: [{
                    label: 'Energy Storage (kWh)',
                    data: energyCapacities,
                    backgroundColor: 'rgba(46,204,113,0.7)',
                    borderColor: '#2ecc71',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Operation Duration',
                            font: {
                                size: 10
                            }
                        },
                        ticks: {
                            font: {
                                size: 9
                            }
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Energy Capacity (kWh)',
                            font: {
                                size: 10
                            }
                        },
                        ticks: {
                            font: {
                                size: 9
                            }
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
    }

    createCostBenefitChart(calc) {
        const ctx = document.getElementById('costBenefitChart').getContext('2d');
        
        if (this.costBenefitChart) {
            this.costBenefitChart.destroy();
        }
        
        // Industry-standard PSH cost breakdown based on methodology studies
        const categories = ['Civil Works', 'Turbine/Pump', 'Generator/Motor', 'Electrical Systems', 'Other Equipment'];
        const proportions = [45, 25, 15, 10, 5]; // Percentage breakdown from PSH methodology
        
        this.costBenefitChart = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: categories.map((cat, index) => `${cat} (${proportions[index]}%)`),
                datasets: [{
                    data: proportions,
                    backgroundColor: [
                        '#8B4513', '#1E90FF', '#FF6347', '#32CD32', '#9370DB'
                    ],
                    borderWidth: 2,
                    borderColor: '#fff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 8,
                            font: {
                                size: 9
                            }
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return context.label.split(' (')[0] + ': ' + context.parsed + '%';
                            }
                        }
                    }
                }
            }
        });
    }

    toggleAdvanced() {
        const advancedContent = document.getElementById('advancedContent');
        const toggleBtn = document.getElementById('advancedToggle');
        const toggleIcon = toggleBtn.querySelector('.toggle-icon');
        
        if (advancedContent.classList.contains('active')) {
            advancedContent.classList.remove('active');
            toggleBtn.classList.remove('active');
            toggleIcon.textContent = '▼';
        } else {
            advancedContent.classList.add('active');
            toggleBtn.classList.add('active');
            toggleIcon.textContent = '▲';
        }
    }
}

// Initialize the calculator when the page loads
document.addEventListener('DOMContentLoaded', () => {
    const calculator = new PumpedStorageCalculator();
    
    // Make toggleAdvanced globally accessible
    window.toggleAdvanced = () => calculator.toggleAdvanced();
    
    // Add some example values for demonstration - showing flexible calculation
    setTimeout(() => {
        // Example: Calculate flow rate from power and head
        document.getElementById('desiredPower').value = '100';
        document.getElementById('operationTime').value = '8';
        document.getElementById('staticHead').value = '200';
        // Flow rate left blank - will be calculated
        
        // Trigger calculation
        calculator.calculateSystem();
    }, 500);
});

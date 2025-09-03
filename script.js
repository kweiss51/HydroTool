class HydropowerCalculator {
    constructor() {
        this.currentUnit = 'si';
        this.constants = {
            si: {
                gravity: 9.81, // m/s²
                densityUnit: 'kg/m³',
                flowRateUnit: 'm³/s',
                headUnit: 'm',
                powerUnit: 'W'
            },
            imperial: {
                gravity: 32.174, // ft/s²
                densityUnit: 'lb/ft³',
                flowRateUnit: 'ft³/s',
                headUnit: 'ft',
                powerUnit: 'ft·lb/s'
            }
        };
        
        this.initializeEventListeners();
        this.updateUnits();
    }

    initializeEventListeners() {
        // Unit selector buttons
        document.getElementById('siUnits').addEventListener('click', () => {
            this.switchUnits('si');
        });
        
        document.getElementById('imperialUnits').addEventListener('click', () => {
            this.switchUnits('imperial');
        });
        
        // Calculate button
        document.getElementById('calculateBtn').addEventListener('click', () => {
            this.calculatePower();
        });
        
        // Real-time calculation on input change
        const inputs = ['flowRate', 'head', 'efficiency', 'density'];
        inputs.forEach(inputId => {
            document.getElementById(inputId).addEventListener('input', () => {
                this.calculatePower();
            });
        });
    }

    switchUnits(unitSystem) {
        // Update active button
        document.querySelectorAll('.unit-btn').forEach(btn => btn.classList.remove('active'));
        document.getElementById(unitSystem + 'Units').classList.add('active');
        
        // Convert existing values if any
        if (this.currentUnit !== unitSystem) {
            this.convertExistingValues(unitSystem);
        }
        
        this.currentUnit = unitSystem;
        this.updateUnits();
    }

    convertExistingValues(newUnit) {
        const flowRateInput = document.getElementById('flowRate');
        const headInput = document.getElementById('head');
        const densityInput = document.getElementById('density');
        
        if (flowRateInput.value) {
            if (newUnit === 'imperial' && this.currentUnit === 'si') {
                // m³/s to ft³/s
                flowRateInput.value = (parseFloat(flowRateInput.value) * 35.3147).toFixed(4);
            } else if (newUnit === 'si' && this.currentUnit === 'imperial') {
                // ft³/s to m³/s
                flowRateInput.value = (parseFloat(flowRateInput.value) / 35.3147).toFixed(4);
            }
        }
        
        if (headInput.value) {
            if (newUnit === 'imperial' && this.currentUnit === 'si') {
                // m to ft
                headInput.value = (parseFloat(headInput.value) * 3.28084).toFixed(2);
            } else if (newUnit === 'si' && this.currentUnit === 'imperial') {
                // ft to m
                headInput.value = (parseFloat(headInput.value) / 3.28084).toFixed(2);
            }
        }
        
        if (densityInput.value) {
            if (newUnit === 'imperial' && this.currentUnit === 'si') {
                // kg/m³ to lb/ft³
                densityInput.value = (parseFloat(densityInput.value) * 0.062428).toFixed(2);
            } else if (newUnit === 'si' && this.currentUnit === 'imperial') {
                // lb/ft³ to kg/m³
                densityInput.value = (parseFloat(densityInput.value) / 0.062428).toFixed(1);
            }
        }
    }

    updateUnits() {
        const constants = this.constants[this.currentUnit];
        
        document.getElementById('flowRateUnit').textContent = constants.flowRateUnit;
        document.getElementById('headUnit').textContent = constants.headUnit;
        document.getElementById('densityUnit').textContent = constants.densityUnit;
        
        // Update density default value
        if (this.currentUnit === 'si') {
            document.getElementById('density').value = '1000';
        } else {
            document.getElementById('density').value = '62.43';
        }
    }

    calculatePower() {
        const flowRate = parseFloat(document.getElementById('flowRate').value);
        const head = parseFloat(document.getElementById('head').value);
        const efficiency = parseFloat(document.getElementById('efficiency').value);
        const density = parseFloat(document.getElementById('density').value);
        
        if (!flowRate || !head || !efficiency || !density) {
            this.clearResults();
            return;
        }
        
        const constants = this.constants[this.currentUnit];
        const gravity = constants.gravity;
        
        // Calculate theoretical power
        let theoreticalPower;
        if (this.currentUnit === 'si') {
            // P = ρ × q × g × h (Watts)
            theoreticalPower = density * flowRate * gravity * head;
        } else {
            // P = ρ × q × g × h (ft·lb/s)
            theoreticalPower = density * flowRate * gravity * head;
        }
        
        // Calculate practical power
        const practicalPower = efficiency * theoreticalPower;
        
        this.displayResults(theoreticalPower, practicalPower, flowRate, head, density, efficiency);
    }

    displayResults(theoreticalPower, practicalPower, flowRate, head, density, efficiency) {
        // Display main results
        if (this.currentUnit === 'si') {
            document.getElementById('theoreticalPower').innerHTML = 
                `${this.formatNumber(theoreticalPower)} W<br>
                <small>${this.formatNumber(theoreticalPower / 1000)} kW</small>`;
            
            document.getElementById('practicalPower').innerHTML = 
                `${this.formatNumber(practicalPower)} W<br>
                <small>${this.formatNumber(practicalPower / 1000)} kW</small>`;
        } else {
            document.getElementById('theoreticalPower').innerHTML = 
                `${this.formatNumber(theoreticalPower)} ft·lb/s<br>
                <small>${this.formatNumber(theoreticalPower / 550)} HP</small>`;
            
            document.getElementById('practicalPower').innerHTML = 
                `${this.formatNumber(practicalPower)} ft·lb/s<br>
                <small>${this.formatNumber(practicalPower / 550)} HP</small>`;
        }
        
        this.displayConversions(theoreticalPower, practicalPower);
    }

    displayConversions(theoreticalPower, practicalPower) {
        const conversionsDiv = document.getElementById('conversions');
        
        let conversions = [];
        
        if (this.currentUnit === 'si') {
            // SI to Imperial conversions
            const theoreticalHP = theoreticalPower * 0.00134102; // W to HP
            const practicalHP = practicalPower * 0.00134102;
            const theoreticalFtLbs = theoreticalPower * 0.737562; // W to ft·lb/s
            const practicalFtLbs = practicalPower * 0.737562;
            const theoreticalBTUs = theoreticalPower * 3.41214; // W to BTU/h
            const practicalBTUs = practicalPower * 3.41214;
            
            conversions = [
                {
                    from: `${this.formatNumber(theoreticalPower)} W`,
                    to: `${this.formatNumber(theoreticalHP)} HP`
                },
                {
                    from: `${this.formatNumber(practicalPower)} W`,
                    to: `${this.formatNumber(practicalHP)} HP (practical)`
                },
                {
                    from: `${this.formatNumber(theoreticalPower)} W`,
                    to: `${this.formatNumber(theoreticalFtLbs)} ft·lb/s`
                },
                {
                    from: `${this.formatNumber(practicalPower)} W`,
                    to: `${this.formatNumber(practicalFtLbs)} ft·lb/s (practical)`
                },
                {
                    from: `${this.formatNumber(theoreticalPower)} W`,
                    to: `${this.formatNumber(theoreticalBTUs)} BTU/h`
                },
                {
                    from: `${this.formatNumber(practicalPower)} W`,
                    to: `${this.formatNumber(practicalBTUs)} BTU/h (practical)`
                }
            ];
        } else {
            // Imperial to SI conversions
            const theoreticalW = theoreticalPower * 1.35582; // ft·lb/s to W
            const practicalW = practicalPower * 1.35582;
            const theoreticalHP = theoreticalPower / 550; // ft·lb/s to HP
            const practicalHP = practicalPower / 550;
            const theoreticalBTUs = theoreticalW * 3.41214; // W to BTU/h
            const practicalBTUs = practicalW * 3.41214;
            
            conversions = [
                {
                    from: `${this.formatNumber(theoreticalPower)} ft·lb/s`,
                    to: `${this.formatNumber(theoreticalW)} W`
                },
                {
                    from: `${this.formatNumber(practicalPower)} ft·lb/s`,
                    to: `${this.formatNumber(practicalW)} W (practical)`
                },
                {
                    from: `${this.formatNumber(theoreticalPower)} ft·lb/s`,
                    to: `${this.formatNumber(theoreticalHP)} HP`
                },
                {
                    from: `${this.formatNumber(practicalPower)} ft·lb/s`,
                    to: `${this.formatNumber(practicalHP)} HP (practical)`
                },
                {
                    from: `${this.formatNumber(theoreticalW)} W`,
                    to: `${this.formatNumber(theoreticalBTUs)} BTU/h`
                },
                {
                    from: `${this.formatNumber(practicalW)} W`,
                    to: `${this.formatNumber(practicalBTUs)} BTU/h (practical)`
                }
            ];
        }
        
        conversionsDiv.innerHTML = conversions.map(conv => `
            <div class="conversion-item">
                <div class="from">${conv.from}</div>
                <div class="to">= ${conv.to}</div>
            </div>
        `).join('');
    }

    formatNumber(num) {
        if (num === 0) return '0';
        if (num < 1000) return num.toFixed(2);
        if (num < 1000000) return (num / 1000).toFixed(2) + 'K';
        return (num / 1000000).toFixed(2) + 'M';
    }

    clearResults() {
        document.getElementById('theoreticalPower').textContent = '-';
        document.getElementById('practicalPower').textContent = '-';
        document.getElementById('conversions').innerHTML = '';
    }
}

// Initialize the calculator when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new HydropowerCalculator();
    
    // Add some example values for demonstration
    setTimeout(() => {
        document.getElementById('flowRate').value = '1';
        document.getElementById('head').value = '100';
        document.getElementById('efficiency').value = '0.85';
        
        // Trigger calculation
        const calculator = new HydropowerCalculator();
        calculator.calculatePower();
    }, 500);
});

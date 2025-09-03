# Hydropower Calculator

A comprehensive web application for calculating hydropower generation in both Imperial and SI units. This calculator is based on industry-standard formulas and includes detailed unit conversions.

## Features

- **Dual Unit Systems**: Calculate in both SI (metric) and Imperial units
- **Real-time Calculations**: Results update as you type
- **Comprehensive Conversions**: Shows power in Watts, Kilowatts, Horsepower, BTU/h, and ft·lb/s
- **Formula Display**: Shows the mathematical formulas being used
- **Responsive Design**: Works on desktop and mobile devices

## Formulas Used

### Theoretical Power
```
P_th = ρ × q × g × h
```
Where:
- **P_th** = Theoretical power (W)
- **ρ** = Water density (~1000 kg/m³ or ~62.43 lb/ft³)
- **q** = Water flow rate (m³/s or ft³/s)
- **g** = Acceleration due to gravity (9.81 m/s² or 32.174 ft/s²)
- **h** = Head/height (m or ft)

### Practical Power
```
P_a = μ × P_th
```
Where:
- **P_a** = Actual available power (W)
- **μ** = Efficiency (typically 0.75 to 0.95)

## Running the Application

### Method 1: Python Server (Recommended)
1. Make sure Python 3 is installed on your system
2. Open Terminal/Command Prompt
3. Navigate to the project directory:
   ```bash
   cd "/Users/kyleweiss/Documents/GitHub/HydroTool"
   ```
4. Run the server:
   ```bash
   python3 server.py
   ```
5. The application will automatically open in your browser at `http://localhost:8080`

### Method 2: Direct File Access
1. Open the `index.html` file directly in your web browser
2. Note: Some features may be limited when not running from a server

## Usage Instructions

1. **Select Unit System**: Choose between SI (metric) or Imperial units
2. **Enter Parameters**:
   - **Flow Rate**: Water flow through the turbine
   - **Head**: Vertical height of water fall
   - **Efficiency**: Turbine efficiency (0.75-0.95 typical)
   - **Water Density**: Usually 1000 kg/m³ (SI) or 62.43 lb/ft³ (Imperial)
3. **View Results**: 
   - Theoretical power (without efficiency losses)
   - Practical power (with efficiency applied)
   - Unit conversions to various power measurements

## Unit Conversions

The application automatically converts between:
- **Watts (W)** ↔ **Horsepower (HP)**
- **Watts (W)** ↔ **ft·lb/s**
- **Watts (W)** ↔ **BTU/h**
- **Kilowatts (kW)** for large values

## Example Calculation

For a hydropower system with:
- Flow rate: 1 m³/s
- Head: 100 m
- Efficiency: 85%
- Water density: 1000 kg/m³

**Theoretical Power**: 1000 × 1 × 9.81 × 100 = 981,000 W = 981 kW
**Practical Power**: 0.85 × 981,000 = 833,850 W = 833.85 kW

## References

This calculator is based on formulas and data from:
- Engineering ToolBox (https://www.engineeringtoolbox.com/hydropower-d_1359.html)
- Industry standard hydropower calculation methods
- Imperial to SI unit conversion factors

## Technical Details

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Backend**: Python 3 HTTP server
- **Browser Compatibility**: Modern browsers (Chrome, Firefox, Safari, Edge)
- **Mobile Responsive**: Optimized for mobile and tablet devices

## Troubleshooting

**Server won't start:**
- Make sure Python 3 is installed
- Check that port 8080 is not already in use
- Try running with `python server.py` instead of `python3 server.py`

**Calculations seem wrong:**
- Verify input units match the selected unit system
- Check that efficiency is entered as a decimal (0.85, not 85%)
- Ensure all required fields have valid positive numbers

**Browser won't open automatically:**
- Manually navigate to `http://localhost:8080`
- Check firewall settings
- Try a different browser

# Cost Calculation Engine

All cost calculations are performed **client-side** in [`frontend/src/lib/calculator.ts`](frontend/src/lib/calculator.ts). Results update reactively as the user adjusts parameters and are auto-saved to the backend every 1.5 seconds.

## Input Sources

| Source | Fields |
|--------|--------|
| **3D File Processing** (Celery worker) | `volume_mm3`, `dim_x`, `dim_y`, `dim_z`, `poly_count` |
| **User Parameters** (UI sliders/inputs) | Everything else — material, density, infill%, print time, markup%, etc. |

## Calculation Pipeline

### 1. Effective Volume
Adjusts raw model volume for infill density and support structures:
```
effective_volume_cm3 = volume_cm3 × (infill% / 100) + volume_cm3 × (supports% / 100)
```

### 2. Material Weight
Accounts for material density and manufacturing waste:
```
base_weight_g     = effective_volume_cm3 × density_g_per_cm3
final_weight_g    = base_weight_g × (1 + waste% / 100)
```

### 3. Material Cost
```
material_cost = (final_weight_g / 1000) × price_per_kg
```

### 4. Operating Costs
```
machine_amortization = print_hours × amortization_cost_per_hour
electricity_cost     = print_hours × electricity_cost_per_hour
model_prep_cost      = (prep_minutes / 60) × $20/hr
post_process_cost    = post_process_hours × $15/hr
```

### 5. Unit Cost (with defect margin)
```
raw_unit_cost = material_cost + machine_amortization + electricity_cost + model_prep_cost + post_process_cost
unit_cost     = raw_unit_cost × (1 + defect_rate% / 100)
```

### 6. Pricing
```
selling_price_pre_tax = unit_cost × (1 + markup% / 100)
profit_per_unit       = selling_price_pre_tax - unit_cost
total_unit_price      = selling_price_pre_tax × (1 + tax% / 100)
batch_total           = total_unit_price × quantity
```

## Output Object

```typescript
{
    weightGrams: number,      // Final material weight including waste
    materialCost: number,     // Raw material cost
    printCost: number,        // Machine amortization cost
    powerCost: number,        // Electricity cost
    laborCost: number,        // Prep + post-processing labor
    unitCost: number,         // Total cost per unit (with defect margin)
    profitPerUnit: number,    // Markup profit per unit
    totalUnitPrice: number,   // Final selling price per unit (with tax)
    finalBatchPrice: number   // Total price for the full batch
}
```

## Hardcoded Assumptions

| Parameter | Value | Notes |
|-----------|-------|-------|
| Model prep labor rate | $20/hr | Applied to `modelPrepMins` |
| Post-processing labor rate | $15/hr | Applied to `postProcessHours` |

All other values are user-configurable via the Production Setup panel.

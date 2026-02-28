export const calculateEconomics = (params: any, volumeMm3: number | undefined) => {
    if (!volumeMm3) return null;

    const volCm3 = volumeMm3 / 1000;

    // Apparent volume based on infill (simplified calculation)
    const effectiveVolCm3 = volCm3 * (params.infill / 100) + (volCm3 * (params.supports / 100));

    // Base weight in grams including waste
    const baseWeight = effectiveVolCm3 * params.density;
    const finalWeightGrams = baseWeight * (1 + (params.wastePercent / 100));

    // Material Cost
    const materialCost = (finalWeightGrams / 1000) * params.pricePerKg;

    // Operating Costs
    const printCost = params.printTimeHours * params.amortizationCostPerHour;
    const powerCost = params.printTimeHours * params.electricityCostPerHour;
    const prepCost = (params.modelPrepMins / 60) * 20; // Assume $20/hr labor
    const postCost = params.postProcessHours * 15; // Assume $15/hr post-process labor

    const unitCost = materialCost + printCost + powerCost + prepCost + postCost;

    // Defects
    const costWithDefects = unitCost * (1 + (params.defectRateRate / 100));

    // Markup and profit
    const sellingPricePreTax = costWithDefects * (1 + (params.markupPercent / 100));
    const profitPerUnit = sellingPricePreTax - costWithDefects;

    // Taxes
    const totalUnitPrice = sellingPricePreTax * (1 + (params.taxRatePercent / 100));
    const finalBatchPrice = totalUnitPrice * params.quantity;

    return {
        weightGrams: finalWeightGrams,
        materialCost,
        printCost,
        powerCost,
        laborCost: prepCost + postCost,
        unitCost: costWithDefects,
        profitPerUnit,
        totalUnitPrice,
        finalBatchPrice
    };
};

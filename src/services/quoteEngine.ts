import type {
  CarInsuranceCondition,
  HouseInsuranceCondition,
  HealthInsuranceCondition,
  QuoteResult,
} from '../types'

function roundTo2(n: number) {
  return Math.round(n * 100) / 100
}

export function calculateCarQuote(condition: CarInsuranceCondition): QuoteResult {
  const base = 800
  const coverageMultiplier = { basic: 0.7, standard: 1.0, comprehensive: 1.4 }[condition.coverageLevel]
  const usageMultiplier = { personal: 1.0, business: 1.3, rideshare: 1.5 }[condition.usage]
  const accidentSurcharge = 1 + condition.priorAccidents * 0.15
  const experienceDiscount = condition.driverLicenseYears > 10 ? 0.9 : condition.driverLicenseYears > 5 ? 0.95 : 1.0
  const ageMultiplier = condition.vehicleYear < 2015 ? 0.85 : condition.vehicleYear > 2020 ? 1.1 : 1.0
  const mileageMultiplier = 1 + (condition.annualMileage - 12000) / 100000

  const annual = roundTo2(
    base * coverageMultiplier * usageMultiplier * accidentSurcharge * experienceDiscount * ageMultiplier * mileageMultiplier,
  )

  const breakdown: Record<string, number> = {
    liability: roundTo2(annual * 0.4),
    collision: roundTo2(annual * 0.3),
    comprehensive: roundTo2(annual * 0.2),
    medical: roundTo2(annual * 0.1),
  }

  const effectiveDate = new Date()
  effectiveDate.setDate(effectiveDate.getDate() + 1)
  const expiryDate = new Date(effectiveDate)
  expiryDate.setFullYear(expiryDate.getFullYear() + 1)

  return {
    monthlyPremium: roundTo2(annual / 12),
    annualPremium: annual,
    deductible: condition.coverageLevel === 'basic' ? 1000 : condition.coverageLevel === 'standard' ? 500 : 250,
    coverageLimit: condition.coverageLevel === 'basic' ? 50000 : condition.coverageLevel === 'standard' ? 100000 : 300000,
    effectiveDate: effectiveDate.toISOString().split('T')[0],
    expiryDate: expiryDate.toISOString().split('T')[0],
    breakdown,
  }
}

export function calculateHouseQuote(condition: HouseInsuranceCondition): QuoteResult {
  const baseRate = 0.003
  const constructionMultiplier = { wood: 1.2, brick: 0.9, concrete: 0.85, mixed: 1.0 }[condition.constructionType]
  const roofMultiplier = { asphalt: 1.0, metal: 0.9, tile: 0.95, flat: 1.15 }[condition.roofType]
  const roofAgeMultiplier = 1 + condition.roofAge / 100
  const occupancyMultiplier = { owner: 1.0, tenant: 1.2, vacant: 1.5 }[condition.occupancy]
  const sprinklerDiscount = condition.hasSprinklers ? 0.95 : 1.0
  const securityDiscount = condition.hasSecuritySystem ? 0.97 : 1.0
  const poolSurcharge = condition.hasPool ? 1.05 : 1.0
  const ageMultiplier = 1 + (new Date().getFullYear() - condition.yearBuilt) / 500

  const annual = roundTo2(
    condition.desiredCoverage *
      baseRate *
      constructionMultiplier *
      roofMultiplier *
      roofAgeMultiplier *
      occupancyMultiplier *
      sprinklerDiscount *
      securityDiscount *
      poolSurcharge *
      ageMultiplier,
  )

  const breakdown: Record<string, number> = {
    dwelling: roundTo2(annual * 0.55),
    otherStructures: roundTo2(annual * 0.1),
    personalProperty: roundTo2(annual * 0.2),
    liability: roundTo2(annual * 0.1),
    additionalLiving: roundTo2(annual * 0.05),
  }

  const effectiveDate = new Date()
  effectiveDate.setDate(effectiveDate.getDate() + 1)
  const expiryDate = new Date(effectiveDate)
  expiryDate.setFullYear(expiryDate.getFullYear() + 1)

  return {
    monthlyPremium: roundTo2(annual / 12),
    annualPremium: annual,
    deductible: 1000,
    coverageLimit: condition.desiredCoverage,
    effectiveDate: effectiveDate.toISOString().split('T')[0],
    expiryDate: expiryDate.toISOString().split('T')[0],
    breakdown,
  }
}

export function calculateHealthQuote(condition: HealthInsuranceCondition): QuoteResult {
  const planBase = { HMO: 280, PPO: 380, EPO: 320, HDHP: 220 }[condition.planType]
  const coverageMultiplier = { individual: 1.0, couple: 1.85, family: 2.4 }[condition.coverageType]
  const ageMultiplier = 1 + (condition.clientAge - 25) * 0.03
  const smokingMultiplier = { never: 1.0, former: 1.15, current: 1.5 }[condition.smokingStatus]
  const bmiMultiplier = condition.bmi > 30 ? 1.1 : condition.bmi > 35 ? 1.25 : 1.0
  const conditionSurcharge = 1 + condition.preExistingConditions.length * 0.08
  const prescriptionSurcharge = 1 + condition.prescriptionCount * 0.02

  let monthly = planBase * coverageMultiplier * ageMultiplier * smokingMultiplier * bmiMultiplier * conditionSurcharge * prescriptionSurcharge
  const breakdown: Record<string, number> = { medical: roundTo2(monthly) }

  if (condition.needsDental) { const d = roundTo2(40 * coverageMultiplier); monthly += d; breakdown.dental = d }
  if (condition.needsVision) { const v = roundTo2(20 * coverageMultiplier); monthly += v; breakdown.vision = v }
  if (condition.needsMental) { const m = roundTo2(35 * coverageMultiplier); monthly += m; breakdown.mental = m }

  monthly = roundTo2(monthly)
  const annual = roundTo2(monthly * 12)

  const effectiveDate = new Date()
  effectiveDate.setDate(effectiveDate.getDate() + 1)
  const expiryDate = new Date(effectiveDate)
  expiryDate.setFullYear(expiryDate.getFullYear() + 1)

  return {
    monthlyPremium: monthly,
    annualPremium: annual,
    deductible: condition.desiredDeductible,
    coverageLimit: 5000000,
    effectiveDate: effectiveDate.toISOString().split('T')[0],
    expiryDate: expiryDate.toISOString().split('T')[0],
    breakdown,
  }
}

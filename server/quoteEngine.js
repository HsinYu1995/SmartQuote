function roundTo2(n) {
  return Math.round(n * 100) / 100
}

function dateOnly(date) {
  return date.toISOString().split('T')[0]
}

function coverageDates() {
  const effectiveDate = new Date()
  effectiveDate.setDate(effectiveDate.getDate() + 1)
  const expiryDate = new Date(effectiveDate)
  expiryDate.setFullYear(expiryDate.getFullYear() + 1)

  return {
    effectiveDate: dateOnly(effectiveDate),
    expiryDate: dateOnly(expiryDate),
  }
}

export function calculateCarQuote(condition) {
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

  return {
    monthlyPremium: roundTo2(annual / 12),
    annualPremium: annual,
    deductible: condition.coverageLevel === 'basic' ? 1000 : condition.coverageLevel === 'standard' ? 500 : 250,
    coverageLimit: condition.coverageLevel === 'basic' ? 50000 : condition.coverageLevel === 'standard' ? 100000 : 300000,
    ...coverageDates(),
    breakdown: {
      liability: roundTo2(annual * 0.4),
      collision: roundTo2(annual * 0.3),
      comprehensive: roundTo2(annual * 0.2),
      medical: roundTo2(annual * 0.1),
    },
  }
}

export function calculateHouseQuote(condition) {
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

  return {
    monthlyPremium: roundTo2(annual / 12),
    annualPremium: annual,
    deductible: 1000,
    coverageLimit: condition.desiredCoverage,
    ...coverageDates(),
    breakdown: {
      dwelling: roundTo2(annual * 0.55),
      otherStructures: roundTo2(annual * 0.1),
      personalProperty: roundTo2(annual * 0.2),
      liability: roundTo2(annual * 0.1),
      additionalLiving: roundTo2(annual * 0.05),
    },
  }
}

export function calculateHealthQuote(condition) {
  const planBase = { HMO: 280, PPO: 380, EPO: 320, HDHP: 220 }[condition.planType]
  const coverageMultiplier = { individual: 1.0, couple: 1.85, family: 2.4 }[condition.coverageType]
  const ageMultiplier = 1 + (condition.clientAge - 25) * 0.03
  const smokingMultiplier = { never: 1.0, former: 1.15, current: 1.5 }[condition.smokingStatus]
  const bmiMultiplier = condition.bmi > 35 ? 1.25 : condition.bmi > 30 ? 1.1 : 1.0
  const conditionSurcharge = 1 + condition.preExistingConditions.length * 0.08
  const prescriptionSurcharge = 1 + condition.prescriptionCount * 0.02

  let monthly =
    planBase *
    coverageMultiplier *
    ageMultiplier *
    smokingMultiplier *
    bmiMultiplier *
    conditionSurcharge *
    prescriptionSurcharge

  const breakdown = { medical: roundTo2(monthly) }

  if (condition.needsDental) {
    const dental = roundTo2(40 * coverageMultiplier)
    monthly += dental
    breakdown.dental = dental
  }
  if (condition.needsVision) {
    const vision = roundTo2(20 * coverageMultiplier)
    monthly += vision
    breakdown.vision = vision
  }
  if (condition.needsMental) {
    const mental = roundTo2(35 * coverageMultiplier)
    monthly += mental
    breakdown.mental = mental
  }

  monthly = roundTo2(monthly)

  return {
    monthlyPremium: monthly,
    annualPremium: roundTo2(monthly * 12),
    deductible: condition.desiredDeductible,
    coverageLimit: 5000000,
    ...coverageDates(),
    breakdown,
  }
}

export function calculateQuote(type, condition) {
  if (type === 'car') return calculateCarQuote(condition)
  if (type === 'house') return calculateHouseQuote(condition)
  if (type === 'health') return calculateHealthQuote(condition)
  throw new Error(`Unsupported quote type: ${type}`)
}

export function isHighRisk(type, condition) {
  return (
    (type === 'car' && condition.priorAccidents >= 3) ||
    (type === 'health' &&
      condition.smokingStatus === 'current' &&
      Array.isArray(condition.preExistingConditions) &&
      condition.preExistingConditions.length > 2)
  )
}

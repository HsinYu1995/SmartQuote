export type InsuranceType = 'car' | 'house' | 'health'

export type QuoteStatus = 'pending' | 'approved' | 'rejected' | 'expired'

export interface Broker {
  id: string
  name: string
  email: string
  licenseNumber: string
  agency: string
}

export interface Client {
  firstName: string
  lastName: string
  dateOfBirth: string
  email: string
  phone: string
  address: string
  city: string
  state: string
  zipCode: string
}

// ─── Car Insurance ───────────────────────────────────────────────────────────

export type VehicleUsage = 'personal' | 'business' | 'rideshare'
export type CoverageLevel = 'basic' | 'standard' | 'comprehensive'

export interface CarInsuranceCondition {
  vehicleMake: string
  vehicleModel: string
  vehicleYear: number
  vehicleVin: string
  usage: VehicleUsage
  annualMileage: number
  coverageLevel: CoverageLevel
  driverLicenseYears: number
  priorAccidents: number
  currentInsurer?: string
}

// ─── House Insurance ─────────────────────────────────────────────────────────

export type ConstructionType = 'wood' | 'brick' | 'concrete' | 'mixed'
export type RoofType = 'asphalt' | 'metal' | 'tile' | 'flat'
export type OccupancyType = 'owner' | 'tenant' | 'vacant'

export interface HouseInsuranceCondition {
  propertyAddress: string
  propertyCity: string
  propertyState: string
  propertyZip: string
  yearBuilt: number
  squareFootage: number
  constructionType: ConstructionType
  roofType: RoofType
  roofAge: number
  occupancy: OccupancyType
  hasSprinklers: boolean
  hasSecuritySystem: boolean
  hasPool: boolean
  estimatedValue: number
  desiredCoverage: number
}

// ─── Health Insurance ────────────────────────────────────────────────────────

export type PlanType = 'HMO' | 'PPO' | 'EPO' | 'HDHP'
export type CoverageType = 'individual' | 'couple' | 'family'
export type SmokingStatus = 'never' | 'former' | 'current'

export interface HealthInsuranceCondition {
  planType: PlanType
  coverageType: CoverageType
  clientAge: number
  smokingStatus: SmokingStatus
  bmi: number
  preExistingConditions: string[]
  desiredDeductible: number
  needsDental: boolean
  needsVision: boolean
  needsMental: boolean
  prescriptionCount: number
}

// ─── Quote ───────────────────────────────────────────────────────────────────

export interface QuoteResult {
  monthlyPremium: number
  annualPremium: number
  deductible: number
  coverageLimit: number
  effectiveDate: string
  expiryDate: string
  breakdown: Record<string, number>
  notes?: string
}

export interface Quote {
  id: string
  referenceNumber: string
  type: InsuranceType
  status: QuoteStatus
  client: Client
  condition: CarInsuranceCondition | HouseInsuranceCondition | HealthInsuranceCondition
  result?: QuoteResult
  brokerId: string
  createdAt: string
  updatedAt: string
}

// ─── API ─────────────────────────────────────────────────────────────────────

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface ApiError {
  message: string
  code: string
  details?: Record<string, string[]>
}

export interface QuoteFilters {
  type?: InsuranceType
  status?: QuoteStatus
  search?: string
  page?: number
  pageSize?: number
  dateFrom?: string
  dateTo?: string
}

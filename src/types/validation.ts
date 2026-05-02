import { z } from 'zod'

export const clientSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone must be at least 10 digits'),
  address: z.string().min(1, 'Address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(2, 'State is required'),
  zipCode: z.string().regex(/^\d{5}(-\d{4})?$/, 'Invalid ZIP code'),
})

export const carConditionSchema = z.object({
  vehicleMake: z.string().min(1, 'Vehicle make is required'),
  vehicleModel: z.string().min(1, 'Vehicle model is required'),
  vehicleYear: z.number().min(1900).max(new Date().getFullYear() + 1),
  vehicleVin: z.string().length(17, 'VIN must be 17 characters'),
  usage: z.enum(['personal', 'business', 'rideshare']),
  annualMileage: z.number().min(1000).max(200000),
  coverageLevel: z.enum(['basic', 'standard', 'comprehensive']),
  driverLicenseYears: z.number().min(0).max(70),
  priorAccidents: z.number().min(0).max(20),
  currentInsurer: z.string().optional(),
})

export const houseConditionSchema = z.object({
  propertyAddress: z.string().min(1, 'Property address is required'),
  propertyCity: z.string().min(1, 'City is required'),
  propertyState: z.string().min(2, 'State is required'),
  propertyZip: z.string().regex(/^\d{5}(-\d{4})?$/, 'Invalid ZIP code'),
  yearBuilt: z.number().min(1800).max(new Date().getFullYear()),
  squareFootage: z.number().min(100).max(50000),
  constructionType: z.enum(['wood', 'brick', 'concrete', 'mixed']),
  roofType: z.enum(['asphalt', 'metal', 'tile', 'flat']),
  roofAge: z.number().min(0).max(100),
  occupancy: z.enum(['owner', 'tenant', 'vacant']),
  hasSprinklers: z.boolean(),
  hasSecuritySystem: z.boolean(),
  hasPool: z.boolean(),
  estimatedValue: z.number().min(50000),
  desiredCoverage: z.number().min(50000),
})

export const healthConditionSchema = z.object({
  planType: z.enum(['HMO', 'PPO', 'EPO', 'HDHP']),
  coverageType: z.enum(['individual', 'couple', 'family']),
  clientAge: z.number().min(18).max(85),
  smokingStatus: z.enum(['never', 'former', 'current']),
  bmi: z.number().min(10).max(60),
  preExistingConditions: z.array(z.string()),
  desiredDeductible: z.number().min(0),
  needsDental: z.boolean(),
  needsVision: z.boolean(),
  needsMental: z.boolean(),
  prescriptionCount: z.number().min(0).max(50),
})

export type ClientFormData = z.infer<typeof clientSchema>
export type CarConditionFormData = z.infer<typeof carConditionSchema>
export type HouseConditionFormData = z.infer<typeof houseConditionSchema>
export type HealthConditionFormData = z.infer<typeof healthConditionSchema>

import { z } from 'zod';
import { categories, units } from './db.js';
export const text = max => z.string().trim().max(max);
export const quantity = z.number().finite().min(0).max(1_000_000).refine(n => Math.abs(n*1000-Math.round(n*1000)) < 0.000001, 'Use at most 3 decimal places.');
export const cost = z.number().finite().min(0).max(10_000_000).refine(n => Math.abs(n*100-Math.round(n*100)) < 0.000001, 'Use at most 2 decimal places for cost.');
export const itemSchema = z.object({
  sku: text(40).min(1).regex(/^[A-Za-z0-9_-]+$/, 'SKU can contain letters, numbers, hyphens and underscores.').transform(s=>s.toUpperCase()),
  name: text(120).min(1), category: z.enum(categories), color: text(60).default(''), unit: z.enum(units),
  quantity: quantity.default(0), reorderLevel: quantity, unitCost: cost,
  location: text(100).default(''), supplierId: z.number().int().positive().nullable().default(null), notes: text(1000).default(''),
}).superRefine((value,ctx) => {
  if(value.unit !== 'meter') for (const key of ['quantity','reorderLevel']) {
    if(!Number.isInteger(value[key])) ctx.addIssue({code:'custom',path:[key],message:`${value.unit} quantities must be whole numbers.`});
  }
});
export const supplierSchema = z.object({name:text(120).min(1),contact:text(100).default(''),email:z.union([z.email(),z.literal('')]).default(''),phone:text(40).default(''),address:text(200).default('')});
export const userSchema = z.object({name:text(100).min(2),email:z.email().max(200).transform(s=>s.toLowerCase()),password:z.string().min(8).max(128),role:z.enum(['admin','staff','viewer'])});
export const movementSchema = z.object({itemId:z.number().int().positive(),type:z.enum(['receive','issue','adjust']),quantity,
  expectedQuantity: quantity.optional(), reference:text(80).default(''),reason:text(500).min(3,'Enter a reason with at least 3 characters.')});
export function parse(schema,input) {
  const result = schema.safeParse(input);
  if(!result.success) {
    const error = new Error(result.error.issues.map(i=>`${i.path.join('.') || 'Input'}: ${i.message}`).join(' '));
    error.status=400; throw error;
  }
  return result.data;
}
export function fail(status,message) { const error=new Error(message); error.status=status; throw error; }

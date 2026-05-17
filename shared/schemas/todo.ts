import { z } from 'zod'

export const todoSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1).max(100),
  completed: z.boolean(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})
export type Todo = z.infer<typeof todoSchema>

export const createTodoSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1).max(100),
  completed: z.boolean(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})
export type CreateTodoInput = z.infer<typeof createTodoSchema>

export const updateTodoSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1).max(100),
})
export type UpdateTodoInput = z.infer<typeof updateTodoSchema>

export const toggleTodoSchema = z.object({
  id: z.string().uuid(),
  completed: z.boolean(),
})
export type ToggleTodoInput = z.infer<typeof toggleTodoSchema>

export const deleteTodoSchema = z.object({
  id: z.string().uuid(),
})
export type DeleteTodoInput = z.infer<typeof deleteTodoSchema>

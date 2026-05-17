import { baseProcedure, createTRPCRouter } from "../init";
import { z } from "zod";
import {
  createTodoSchema,
  updateTodoSchema,
  toggleTodoSchema,
  deleteTodoSchema,
} from "#shared/schemas/todo";
import {
  getAllTodos,
  createTodo,
  updateTodo,
  toggleTodo,
  deleteTodo,
} from "../../utils/db";
import { TRPCError } from "@trpc/server";

export const appRouter = createTRPCRouter({
  hello: baseProcedure
    .input(
      z.object({
        text: z.string(),
      }),
    )
    .query((opts) => {
      return {
        greeting: `hello ${opts.input.text}`,
      };
    }),

  todo: createTRPCRouter({
    list: baseProcedure.query(() => {
      return getAllTodos();
    }),

    create: baseProcedure
      .input(createTodoSchema)
      .mutation((opts) => {
        return createTodo(opts.input);
      }),

    update: baseProcedure
      .input(updateTodoSchema)
      .mutation(async (opts) => {
        const result = await updateTodo(opts.input.id, opts.input.title);
        if (!result) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: `Todo with id "${opts.input.id}" not found`,
          });
        }
        return result;
      }),

    toggle: baseProcedure
      .input(toggleTodoSchema)
      .mutation(async (opts) => {
        const result = await toggleTodo(opts.input.id, opts.input.completed);
        if (!result) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: `Todo with id "${opts.input.id}" not found`,
          });
        }
        return result;
      }),

    delete: baseProcedure
      .input(deleteTodoSchema)
      .mutation(async (opts) => {
        const result = await deleteTodo(opts.input.id);
        if (!result) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: `Todo with id "${opts.input.id}" not found`,
          });
        }
        return result;
      }),
  }),
});

export type AppRouter = typeof appRouter;

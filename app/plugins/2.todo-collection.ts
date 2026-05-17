import { createCollection } from "@tanstack/vue-db";
import { queryCollectionOptions } from "@tanstack/query-db-collection";
import { QueryClient } from "@tanstack/query-core";
import type {
  InsertMutationFnParams,
  UpdateMutationFnParams,
  DeleteMutationFnParams,
} from "@tanstack/db";
import {
  todoSchema,
  type Todo,
  type CreateTodoInput,
  type UpdateTodoInput,
  type ToggleTodoInput,
  type DeleteTodoInput,
} from "#shared/schemas/todo";

interface TRpcClient {
  todo: {
    list: { query: () => Promise<Todo[]> };
    create: { mutate: (input: CreateTodoInput) => Promise<Todo> };
    toggle: { mutate: (input: ToggleTodoInput) => Promise<Todo> };
    update: { mutate: (input: UpdateTodoInput) => Promise<Todo> };
    delete: { mutate: (input: DeleteTodoInput) => Promise<Todo | null> };
  };
}

function createTodoCollection(trpc: TRpcClient) {
  const queryClient = new QueryClient();
  return createCollection(
    queryCollectionOptions({
      queryKey: ["todos"],
      queryFn: () => trpc.todo.list.query(),
      queryClient,
      getKey: (item: Todo) => item.id,
      schema: todoSchema,
      onInsert: async ({ transaction }: InsertMutationFnParams<Todo>) => {
        const results = await Promise.all(
          transaction.mutations.map((m) => trpc.todo.create.mutate(m.modified)),
        );
        return results;
      },
      onUpdate: async ({ transaction }: UpdateMutationFnParams<Todo>) => {
        await Promise.all(
          transaction.mutations.map((m) => {
            const changes = m.changes;
            if (changes.completed !== undefined) {
              return trpc.todo.toggle.mutate({
                id: m.key,
                completed: changes.completed,
              });
            }
            if (changes.title !== undefined) {
              return trpc.todo.update.mutate({
                id: m.key,
                title: changes.title,
              });
            }
          }),
        );
      },
      onDelete: async ({ transaction }: DeleteMutationFnParams<Todo>) => {
        await Promise.all(
          transaction.mutations.map((m) =>
            trpc.todo.delete.mutate({ id: m.key }),
          ),
        );
      },
    }),
  );
}

export default defineNuxtPlugin(() => {
  const { $trpc: trpc } = useNuxtApp();
  const todoCollection = createTodoCollection(trpc);

  return {
    provide: {
      todoCollection,
    },
  };
});

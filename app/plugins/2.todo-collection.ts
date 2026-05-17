import { createCollection } from "@tanstack/vue-db";
import { queryCollectionOptions } from "@tanstack/query-db-collection";
import { QueryClient } from "@tanstack/query-core";
import { todoSchema, type Todo } from "#shared/schemas/todo";

function createTodoCollection(trpc: any) {
  const queryClient = new QueryClient();
  return createCollection(
    queryCollectionOptions({
      queryKey: ["todos"],
      queryFn: () => trpc.todo.list.query(),
      queryClient,
      getKey: (item: Todo) => item.id,
      schema: todoSchema,
      onInsert: async ({ transaction }: any) => {
        await Promise.all(
          transaction.mutations.map((m: any) =>
            trpc.todo.create.mutate(m.modified as Todo),
          ),
        );
      },
      onUpdate: async ({ transaction }: any) => {
        await Promise.all(
          transaction.mutations.map((m: any) => {
            const changes = m.changes as Partial<Todo>;
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
      onDelete: async ({ transaction }: any) => {
        await Promise.all(
          transaction.mutations.map((m: any) =>
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

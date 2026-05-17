import type { Collection } from "@tanstack/db";
import type { Todo } from "#shared/schemas/todo";

export function useTodoCollection(): Collection<Todo, string> {
  const { $todoCollection } = useNuxtApp();
  return $todoCollection;
}

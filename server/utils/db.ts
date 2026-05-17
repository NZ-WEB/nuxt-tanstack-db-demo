import prisma from "./prisma";
import type { Todo } from "#shared/schemas/todo";

function toDto(todo: {
  id: string;
  title: string;
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
}): Todo {
  return {
    id: todo.id,
    title: todo.title,
    completed: todo.completed,
    createdAt: todo.createdAt.toISOString(),
    updatedAt: todo.updatedAt.toISOString(),
  };
}

export async function getAllTodos(): Promise<Todo[]> {
  const todos = await prisma.todo.findMany({
    orderBy: { createdAt: "desc" },
  });
  return todos.map(toDto);
}

export async function createTodo(data: {
  id: string;
  title: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}): Promise<Todo> {
  const todo = await prisma.todo.create({
    data: {
      id: data.id,
      title: data.title,
      completed: data.completed,
      createdAt: new Date(data.createdAt),
    },
  });
  return toDto(todo);
}

export async function getTodoById(id: string): Promise<Todo | null> {
  const todo = await prisma.todo.findUnique({ where: { id } });
  return todo ? toDto(todo) : null;
}

export async function updateTodo(id: string, title: string): Promise<Todo | null> {
  try {
    const todo = await prisma.todo.update({
      where: { id },
      data: { title },
    });
    return toDto(todo);
  } catch {
    return null;
  }
}

export async function toggleTodo(id: string, completed: boolean): Promise<Todo | null> {
  try {
    const todo = await prisma.todo.update({
      where: { id },
      data: { completed },
    });
    return toDto(todo);
  } catch {
    return null;
  }
}

export async function deleteTodo(id: string): Promise<Todo | null> {
  try {
    const todo = await prisma.todo.delete({
      where: { id },
    });
    return toDto(todo);
  } catch {
    return null;
  }
}

<script setup lang="ts">
import { useLiveQuery } from "@tanstack/vue-db";

const todoCollection = useTodoCollection();

const newTitle = ref("");

const route = useRoute();

const sortDir = ref(String(route.query.sort) as "asc" | "desc");

const {
    data: todos,
    isLoading,
    isReady,
} = useLiveQuery(
    (q) =>
        q
            .from({ todo: todoCollection })
            .orderBy(({ todo }) => todo.createdAt, sortDir.value),
    [sortDir],
);

const editingId = ref<string | null>(null);
const editingTitle = ref("");

function toggleSort() {
    sortDir.value = sortDir.value === "desc" ? "asc" : "desc";
    navigateTo({ query: { ...route.query, sort: sortDir.value } });
}

function addTodo() {
    const title = newTitle.value.trim();
    if (!title) return;
    newTitle.value = "";
    todoCollection.insert({
        id: crypto.randomUUID(),
        title,
        completed: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    });
}

function toggleTodo(id: string) {
    todoCollection.update(id, (draft) => {
        draft.completed = !draft.completed;
    });
}

function startEditing(id: string, currentTitle: string) {
    editingId.value = id;
    editingTitle.value = currentTitle;
}

function saveTitle(id: string) {
    const title = editingTitle.value.trim();
    if (!title) {
        cancelEditing();
        return;
    }
    todoCollection.update(id, (draft) => {
        draft.title = title;
    });
    cancelEditing();
}

function cancelEditing() {
    editingId.value = null;
    editingTitle.value = "";
}

function removeTodo(id: string) {
    todoCollection.delete(id);
}

onMounted(() => {
    todoCollection.preload();
});
</script>

<template>
    <ClientOnly>
        <div class="todo-app">
            <h1>TanStack DB + Nuxt</h1>

            <div v-if="!isReady || isLoading" class="loading">
                Loading todos...
            </div>

            <template v-else>
                <form class="add-form" @submit.prevent="addTodo">
                    <input
                        v-model="newTitle"
                        placeholder="What needs to be done?"
                        class="input"
                    />
                    <button
                        type="submit"
                        :disabled="!newTitle.trim()"
                        class="btn"
                    >
                        Add
                    </button>
                </form>

                <div class="sort-bar">
                    <button @click="toggleSort" class="btn sort-btn">
                        {{
                            sortDir === "desc" ? "Newest first" : "Oldest first"
                        }}
                    </button>
                </div>

                <ul v-if="todos && todos.length" class="todo-list">
                    <li
                        v-for="todo in todos"
                        :key="todo.id"
                        class="todo-item"
                        :class="{ completed: todo.completed }"
                    >
                        <input
                            type="checkbox"
                            :checked="todo.completed"
                            @change="toggleTodo(todo.id)"
                            class="checkbox"
                        />

                        <div v-if="editingId === todo.id" class="edit-mode">
                            <input
                                v-model="editingTitle"
                                @keyup.enter="saveTitle(todo.id)"
                                @keyup.escape="cancelEditing()"
                                class="input edit-input"
                            />
                            <button
                                @click="saveTitle(todo.id)"
                                class="btn small"
                            >
                                Save
                            </button>
                            <button
                                @click="cancelEditing()"
                                class="btn small cancel"
                            >
                                Cancel
                            </button>
                        </div>

                        <span
                            v-else
                            class="todo-title"
                            @dblclick="startEditing(todo.id, todo.title)"
                        >
                            {{ todo.title }}
                        </span>

                        <button
                            @click="removeTodo(todo.id)"
                            class="btn small danger"
                        >
                            Delete
                        </button>
                    </li>
                </ul>

                <p v-else class="empty">No todos yet. Add one above!</p>
            </template>
        </div>
    </ClientOnly>
</template>

<style scoped>
.todo-app {
    max-width: 500px;
    margin: 2rem auto;
    font-family: system-ui, sans-serif;
}
h1 {
    font-size: 1.5rem;
    margin-bottom: 1rem;
}
.loading {
    color: #888;
}
.add-form {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 1rem;
}
.input {
    flex: 1;
    padding: 0.5rem;
    border: 1px solid #ccc;
    border-radius: 4px;
}
.btn {
    padding: 0.5rem 1rem;
    background: #007bff;
    color: #fff;
    border: none;
    border-radius: 4px;
    cursor: pointer;
}
.btn:disabled {
    opacity: 0.5;
}
.btn.small {
    padding: 0.25rem 0.5rem;
    font-size: 0.8rem;
}
.btn.cancel {
    background: #6c757d;
}
.btn.danger {
    background: #dc3545;
}
.sort-bar {
    display: flex;
    justify-content: flex-end;
    margin-bottom: 0.75rem;
}
.sort-btn {
    font-size: 0.85rem;
    background: #6c757d;
}
.sort-btn:hover {
    background: #5a6268;
}
.todo-list {
    list-style: none;
    padding: 0;
}
.todo-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem;
    border-bottom: 1px solid #eee;
}
.todo-item.completed .todo-title {
    text-decoration: line-through;
    color: #999;
}
.todo-title {
    flex: 1;
    cursor: pointer;
}
.checkbox {
    width: 1.2rem;
    height: 1.2rem;
}
.edit-mode {
    display: flex;
    gap: 0.25rem;
    flex: 1;
}
.edit-input {
    flex: 1;
}
.empty {
    color: #888;
    text-align: center;
}
</style>

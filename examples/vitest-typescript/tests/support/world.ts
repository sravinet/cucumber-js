import { setWorldConstructor, IWorld, IWorldOptions } from '@cucumber/cucumber/esm'
import { TodoList, Task } from '../../src/todo'

/**
 * Custom world interface for the todo list example
 */
export interface ITodoWorld extends IWorld {
  todoList: TodoList;
  addTask(task: string): void;
  completeTask(task: string): boolean;
  removeTask(task: string): boolean;
  hasTask(task: string): boolean;
  isTaskCompleted(task: string): boolean;
  getTasks(): Task[];
  setTasks(tasks: Task[]): void;
  clear(): void;
}

/**
 * Custom world class for the todo list example
 */
class TodoWorld implements ITodoWorld {
  todoList: TodoList;

  /**
   * Constructor for the todo world
   * @param options World options
   */
  constructor(options: IWorldOptions) {
    this.todoList = new TodoList();
  }

  /**
   * Add a task to the todo list
   * @param task The task description
   */
  addTask(task: string): void {
    this.todoList.addTask(task);
  }

  /**
   * Mark a task as completed
   * @param task The task description
   * @returns true if the task was found and marked as completed, false otherwise
   */
  completeTask(task: string): boolean {
    return this.todoList.completeTask(task);
  }

  /**
   * Remove a task from the todo list
   * @param task The task description
   * @returns true if the task was found and removed, false otherwise
   */
  removeTask(task: string): boolean {
    return this.todoList.removeTask(task);
  }

  /**
   * Check if a task exists in the todo list
   * @param task The task description
   * @returns true if the task exists, false otherwise
   */
  hasTask(task: string): boolean {
    return this.todoList.hasTask(task);
  }

  /**
   * Check if a task is completed
   * @param task The task description
   * @returns true if the task is completed, false otherwise or if the task doesn't exist
   */
  isTaskCompleted(task: string): boolean {
    return this.todoList.isTaskCompleted(task);
  }

  /**
   * Get all tasks
   * @returns A copy of the tasks array
   */
  getTasks(): Task[] {
    return this.todoList.getTasks();
  }

  /**
   * Set the tasks in the todo list
   * @param tasks The tasks to set
   */
  setTasks(tasks: Task[]): void {
    this.clear();
    tasks.forEach(task => {
      this.todoList.addTask(task.task);
      if (task.completed) {
        this.todoList.completeTask(task.task);
      }
    });
  }

  /**
   * Clear all tasks
   */
  clear(): void {
    this.todoList.clear();
  }
}

setWorldConstructor(TodoWorld) 
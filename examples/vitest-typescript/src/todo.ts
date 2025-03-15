/**
 * Represents a task in a todo list
 */
export interface Task {
  /**
   * The task description
   */
  task: string;
  
  /**
   * Whether the task is completed
   */
  completed: boolean;
}

/**
 * A simple todo list implementation
 */
export class TodoList {
  /**
   * The list of tasks
   */
  private tasks: Task[] = [];

  /**
   * Add a task to the todo list
   * @param task The task description
   */
  addTask(task: string): void {
    this.tasks.push({
      task,
      completed: false
    });
  }

  /**
   * Mark a task as completed
   * @param task The task description
   * @returns true if the task was found and marked as completed, false otherwise
   */
  completeTask(task: string): boolean {
    const taskItem = this.tasks.find(t => t.task === task);
    if (taskItem) {
      taskItem.completed = true;
      return true;
    }
    return false;
  }

  /**
   * Remove a task from the todo list
   * @param task The task description
   * @returns true if the task was found and removed, false otherwise
   */
  removeTask(task: string): boolean {
    const index = this.tasks.findIndex(t => t.task === task);
    if (index !== -1) {
      this.tasks.splice(index, 1);
      return true;
    }
    return false;
  }

  /**
   * Check if a task exists in the todo list
   * @param task The task description
   * @returns true if the task exists, false otherwise
   */
  hasTask(task: string): boolean {
    return this.tasks.some(t => t.task === task);
  }

  /**
   * Check if a task is completed
   * @param task The task description
   * @returns true if the task is completed, false otherwise or if the task doesn't exist
   */
  isTaskCompleted(task: string): boolean {
    const taskItem = this.tasks.find(t => t.task === task);
    return taskItem ? taskItem.completed : false;
  }

  /**
   * Get all tasks
   * @returns A copy of the tasks array
   */
  getTasks(): Task[] {
    return [...this.tasks];
  }

  /**
   * Clear all tasks
   */
  clear(): void {
    this.tasks = [];
  }
} 
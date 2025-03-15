import { Given, When, Then, Before, DataTable } from '@cucumber/cucumber/vitest'
import { expect } from 'vitest'
import { Task } from '../../src/todo'
import { ITodoWorld } from '../support/world'

// Clear the todo list before each scenario
Before(function(this: ITodoWorld) {
  this.clear()
})

Given('I have an empty todo list', function(this: ITodoWorld) {
  this.clear()
})

Given('I have a todo list with the following tasks:', function(this: ITodoWorld, dataTable: DataTable) {
  const tasks = dataTable.hashes().map(row => ({
    task: row.task,
    completed: row.completed === 'true'
  }))
  this.setTasks(tasks)
})

When('I add {string} to my todo list', function(this: ITodoWorld, task: string) {
  this.addTask(task)
})

When('I mark {string} as completed', function(this: ITodoWorld, task: string) {
  this.completeTask(task)
})

When('I remove {string} from my todo list', function(this: ITodoWorld, task: string) {
  this.removeTask(task)
})

Then('my todo list should contain {string}', function(this: ITodoWorld, task: string) {
  expect(this.hasTask(task)).toBe(true)
})

Then('my todo list should not contain {string}', function(this: ITodoWorld, task: string) {
  expect(this.hasTask(task)).toBe(false)
})

Then('the task {string} should be completed', function(this: ITodoWorld, task: string) {
  expect(this.isTaskCompleted(task)).toBe(true)
})

Then('the task {string} should not be completed', function(this: ITodoWorld, task: string) {
  expect(this.isTaskCompleted(task)).toBe(false)
}) 
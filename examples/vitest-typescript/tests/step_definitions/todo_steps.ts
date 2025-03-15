import { Given, When, Then, Before, DataTable } from '@cucumber/cucumber/esm'
import { strict as assert } from 'node:assert'
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
  assert.equal(this.hasTask(task), true, `Expected todo list to contain "${task}"`)
})

Then('my todo list should not contain {string}', function(this: ITodoWorld, task: string) {
  assert.equal(this.hasTask(task), false, `Expected todo list not to contain "${task}"`)
})

Then('the task {string} should be completed', function(this: ITodoWorld, task: string) {
  assert.equal(this.isTaskCompleted(task), true, `Expected task "${task}" to be completed`)
})

Then('the task {string} should not be completed', function(this: ITodoWorld, task: string) {
  assert.equal(this.isTaskCompleted(task), false, `Expected task "${task}" not to be completed`)
}) 
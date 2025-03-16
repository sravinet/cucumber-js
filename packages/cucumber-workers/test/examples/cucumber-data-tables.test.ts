import { test, expect } from 'vitest';
import { DataTable } from '../../src/core/data-table.js';

// Create a test to demonstrate DataTable functionality
test('DataTable functionality with product data', () => {
  // Create a DataTable for products
  const productsTable = new DataTable([
    ['id', 'name', 'price', 'in_stock'],
    ['1', 'Product A', '10.99', 'true'],
    ['2', 'Product B', '24.99', 'true'],
    ['3', 'Product C', '5.99', 'false']
  ]);
  
  // Test raw() method
  expect(productsTable.raw()).toEqual([
    ['id', 'name', 'price', 'in_stock'],
    ['1', 'Product A', '10.99', 'true'],
    ['2', 'Product B', '24.99', 'true'],
    ['3', 'Product C', '5.99', 'false']
  ]);
  
  // Test rows() method
  expect(productsTable.rows()).toEqual([
    ['1', 'Product A', '10.99', 'true'],
    ['2', 'Product B', '24.99', 'true'],
    ['3', 'Product C', '5.99', 'false']
  ]);
  
  // Test hashes() method
  expect(productsTable.hashes()).toEqual([
    { id: '1', name: 'Product A', price: '10.99', in_stock: 'true' },
    { id: '2', name: 'Product B', price: '24.99', in_stock: 'true' },
    { id: '3', name: 'Product C', price: '5.99', in_stock: 'false' }
  ]);
  
  // Test typedHashes() method
  const typedHashes = productsTable.typedHashes({
    id: Number,
    price: Number,
    in_stock: (value) => value === 'true'
  });
  
  expect(typedHashes).toEqual([
    { id: 1, name: 'Product A', price: 10.99, in_stock: true },
    { id: 2, name: 'Product B', price: 24.99, in_stock: true },
    { id: 3, name: 'Product C', price: 5.99, in_stock: false }
  ]);
  
  // Filter in-stock products
  const inStockProducts = typedHashes
    .filter(product => product.in_stock)
    .map(({ name, price }) => ({ name, price }));
  
  expect(inStockProducts).toEqual([
    { name: 'Product A', price: 10.99 },
    { name: 'Product B', price: 24.99 }
  ]);
});

test('DataTable functionality with product attributes', () => {
  // Create a DataTable for product attributes
  const attributesTable = new DataTable([
    ['name', 'Premium Widget'],
    ['description', 'A premium widget'],
    ['price', '49.99'],
    ['category', 'Electronics']
  ]);
  
  // Test rowsHash() method
  expect(attributesTable.rowsHash()).toEqual({
    name: 'Premium Widget',
    description: 'A premium widget',
    price: '49.99',
    category: 'Electronics'
  });
  
  // Format the product details
  const attributes = attributesTable.rowsHash();
  const formattedDetails = Object.entries(attributes)
    .map(([key, value]) => `${key.charAt(0).toUpperCase() + key.slice(1)}: ${value}`)
    .join('\n');
  
  expect(formattedDetails).toBe(
    'Name: Premium Widget\n' +
    'Description: A premium widget\n' +
    'Price: 49.99\n' +
    'Category: Electronics'
  );
});

test('DataTable functionality with transposing data', () => {
  // Create a DataTable for product data
  const productDataTable = new DataTable([
    ['name', 'Product A', 'Product B', 'Product C'],
    ['price', '10.99', '24.99', '5.99'],
    ['in_stock', 'true', 'true', 'false']
  ]);
  
  // Test transpose() method
  const transposed = productDataTable.transpose();
  
  expect(transposed.raw()).toEqual([
    ['name', 'price', 'in_stock'],
    ['Product A', '10.99', 'true'],
    ['Product B', '24.99', 'true'],
    ['Product C', '5.99', 'false']
  ]);
  
  // Test hashes() on transposed data
  expect(transposed.hashes()).toEqual([
    { name: 'Product A', price: '10.99', in_stock: 'true' },
    { name: 'Product B', price: '24.99', in_stock: 'true' },
    { name: 'Product C', price: '5.99', in_stock: 'false' }
  ]);
}); 
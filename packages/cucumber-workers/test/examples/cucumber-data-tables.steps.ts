import { Given, When, Then, DataTable } from '../../src/index.js';

// Define the World interface for type safety
interface ProductsWorld {
  products?: Array<{
    id: number;
    name: string;
    price: number;
    in_stock: boolean;
  }>;
  inStockProducts?: Array<{
    name: string;
    price: string;
  }>;
  productAttributes?: Record<string, string>;
  formattedDetails?: string;
  productData?: string[][];
  transposedData?: DataTable;
  productRecords?: Record<string, string>[];
}

// Type converters for the product data
const productTypes = {
  id: Number,
  price: Number,
  in_stock: (value: string) => value === 'true'
};

Given('the following products exist:', function(this: ProductsWorld, dataTable: DataTable) {
  // Convert the table to an array of objects with typed values
  this.products = dataTable.typedHashes(productTypes) as Array<{
    id: number;
    name: string;
    price: number;
    in_stock: boolean;
  }>;
  
  // eslint-disable-next-line no-console
  console.log('Products:', this.products);
});

When('I filter in-stock products', function(this: ProductsWorld) {
  if (!this.products) {
    throw new Error('No products defined');
  }
  
  // Filter in-stock products and select only name and price fields
  this.inStockProducts = this.products
    .filter(product => product.in_stock)
    .map(({ name, price }) => ({ name, price: price.toString() }));
  
  // eslint-disable-next-line no-console
  console.log('In-stock products:', this.inStockProducts);
});

Then('I should have {int} in-stock products', function(this: ProductsWorld, count: number) {
  if (!this.inStockProducts) {
    throw new Error('No in-stock products defined');
  }
  
  if (this.inStockProducts.length !== count) {
    throw new Error(`Expected ${count} in-stock products but got ${this.inStockProducts.length}`);
  }
});

Then('they should be:', function(this: ProductsWorld, dataTable: DataTable) {
  if (!this.inStockProducts) {
    throw new Error('No in-stock products defined');
  }
  
  // Convert the expected data table to an array of objects
  const expectedProducts = dataTable.hashes();
  
  // Check if the in-stock products match the expected products
  if (JSON.stringify(this.inStockProducts) !== JSON.stringify(expectedProducts)) {
    throw new Error(
      `In-stock products do not match expected products.\n` +
      `Expected: ${JSON.stringify(expectedProducts)}\n` +
      `Actual: ${JSON.stringify(this.inStockProducts)}`
    );
  }
});

Given('a product with the following attributes:', function(this: ProductsWorld, dataTable: DataTable) {
  // Convert the table to an object using rowsHash
  this.productAttributes = dataTable.rowsHash();
  
  // eslint-disable-next-line no-console
  console.log('Product attributes:', this.productAttributes);
});

When('I format the product details', function(this: ProductsWorld) {
  if (!this.productAttributes) {
    throw new Error('No product attributes defined');
  }
  
  // Format the product details as a string
  this.formattedDetails = Object.entries(this.productAttributes)
    .map(([key, value]) => `${key.charAt(0).toUpperCase() + key.slice(1)}: ${value}`)
    .join('\n');
  
  // eslint-disable-next-line no-console
  console.log('Formatted details:', this.formattedDetails);
});

Then('the formatted details should contain:', function(this: ProductsWorld, docString: string) {
  if (!this.formattedDetails) {
    throw new Error('No formatted details defined');
  }
  
  // Check if the formatted details match the expected string
  if (this.formattedDetails !== docString.trim()) {
    throw new Error(
      `Formatted details do not match expected string.\n` +
      `Expected: ${docString.trim()}\n` +
      `Actual: ${this.formattedDetails}`
    );
  }
});

Given('the following product data:', function(this: ProductsWorld, dataTable: DataTable) {
  // Store the raw table data
  this.productData = dataTable.raw();
  
  // eslint-disable-next-line no-console
  console.log('Product data:', this.productData);
});

When('I transpose the product data', function(this: ProductsWorld) {
  if (!this.productData) {
    throw new Error('No product data defined');
  }
  
  // Create a DataTable from the product data and transpose it
  const table = new DataTable(this.productData);
  this.transposedData = table.transpose();
  
  // eslint-disable-next-line no-console
  console.log('Transposed data:', this.transposedData.raw());
});

Then('I should have the following product records:', function(this: ProductsWorld, dataTable: DataTable) {
  if (!this.transposedData) {
    throw new Error('No transposed data defined');
  }
  
  // Convert the transposed data to an array of objects
  this.productRecords = this.transposedData.hashes();
  
  // Convert the expected data table to an array of objects
  const expectedRecords = dataTable.hashes();
  
  // Check if the product records match the expected records
  if (JSON.stringify(this.productRecords) !== JSON.stringify(expectedRecords)) {
    throw new Error(
      `Product records do not match expected records.\n` +
      `Expected: ${JSON.stringify(expectedRecords)}\n` +
      `Actual: ${JSON.stringify(this.productRecords)}`
    );
  }
}); 
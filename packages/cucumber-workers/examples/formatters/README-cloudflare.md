# Using the JSON Formatter in Cloudflare Workers

This guide explains how to use the Cucumber Workers JSON formatter in a Cloudflare Workers environment.

## Overview

The JSON formatter generates test reports in the standard Cucumber JSON format, which can be used for reporting, analysis, and integration with other tools. In a Cloudflare Workers environment, we need to adapt how we store and retrieve these reports since we don't have access to a filesystem.

## Example Implementation

The `json-formatter-cloudflare.ts` file demonstrates a complete implementation of a Cloudflare Worker that:

1. Runs Cucumber tests
2. Generates JSON reports
3. Stores reports in KV storage
4. Provides APIs to retrieve reports

## Key Components

### 1. Worker Setup

The example includes:
- Type definitions for Cloudflare Workers
- A fetch handler with routing
- KV storage integration
- Error handling

### 2. JSON Formatter Configuration

```typescript
const formatter = new JsonFormatter(
  { 
    outputFile: reportKey,
    includeSource: true,
    includeAttachments: true
  },
  () => {}, // No console output
  workerFileWriter
);
```

The key customization is the `workerFileWriter` function that stores reports in KV:

```typescript
const workerFileWriter = async (path: string, content: string): Promise<void> => {
  await env.CUCUMBER_RESULTS.put(reportKey, content);
  ctx.waitUntil(
    (async () => {
      console.log(`Test report stored with key: ${reportKey}`);
    })()
  );
};
```

### 3. Wrangler Configuration

The `wrangler.toml` file shows how to configure your Worker:

```toml
name = "cucumber-json-formatter"
main = "./json-formatter-cloudflare.ts"
compatibility_date = "2023-12-01"

# KV Namespace for storing test results
kv_namespaces = [
  { binding = "CUCUMBER_RESULTS", id = "YOUR_KV_NAMESPACE_ID" }
]
```

## API Endpoints

The example Worker provides three endpoints:

1. **POST /run-tests** - Run Cucumber tests and generate a report
2. **GET /reports** - List all available test reports
3. **GET /report/{id}** - Get a specific test report

## Usage

### 1. Deploy the Worker

1. Install Wrangler: `npm install -g wrangler`
2. Create a KV namespace: `wrangler kv:namespace create CUCUMBER_RESULTS`
3. Update the `wrangler.toml` file with your KV namespace ID
4. Deploy: `wrangler deploy`

### 2. Run Tests

Send a POST request to the `/run-tests` endpoint:

```bash
curl -X POST https://cucumber-json-formatter.your-worker.workers.dev/run-tests \
  -H "Content-Type: application/json" \
  -d '{"additionalScenarios": 5}'
```

### 3. Get Reports

List all reports:

```bash
curl https://cucumber-json-formatter.your-worker.workers.dev/reports
```

Get a specific report:

```bash
curl https://cucumber-json-formatter.your-worker.workers.dev/report/REPORT_ID
```

## Integration with CI/CD

You can integrate this Worker with your CI/CD pipeline to run tests and generate reports automatically:

1. Deploy the Worker to your Cloudflare account
2. Add a step in your CI/CD pipeline to trigger tests
3. Store the report ID for later retrieval
4. Use the report in your deployment process or for notifications

## Best Practices

1. **Authentication**: Add authentication to protect your API endpoints
2. **Rate Limiting**: Configure rate limits to prevent abuse
3. **Error Handling**: Implement comprehensive error handling
4. **Logging**: Use Cloudflare Workers logging for debugging
5. **Expiration**: Set expiration times for your KV entries to manage storage

## Limitations

1. KV storage has size limits (25MB per value)
2. Workers have execution time limits (50ms - 30s depending on plan)
3. Consider using Durable Objects for more complex state management

## Resources

- [Cloudflare Workers Documentation](https://developers.cloudflare.com/workers/)
- [Cloudflare KV Storage](https://developers.cloudflare.com/workers/runtime-apis/kv/)
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/) 
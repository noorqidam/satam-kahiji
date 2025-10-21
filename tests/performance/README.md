# Performance Testing Suite

This directory contains comprehensive performance tests for the Laravel application running on Octane with FrankenPHP.

## Prerequisites

1. **k6 Installation**
   ```bash
   # macOS
   brew install k6
   
   # Ubuntu/Debian
   sudo gpg -k
   sudo gpg --no-default-keyring --keyring /usr/share/keyrings/k6-archive-keyring.gpg --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
   echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
   sudo apt-get update
   sudo apt-get install k6
   
   # Or download from: https://k6.io/docs/getting-started/installation/
   ```

2. **Server Running**
   ```bash
   php artisan octane:start --server=frankenphp --host=127.0.0.1 --port=8000
   ```

## Test Files

### 1. Smoke Test (`smoke-test.js`)
- **Purpose**: Quick validation that all critical components work
- **Load**: 1 virtual user for 1 minute
- **Tests**: Homepage, static assets, API endpoints
- **Use Case**: CI/CD pipeline, quick health checks

### 2. Load Test (`load-test.js`)
- **Purpose**: Realistic load testing with gradual ramp-up
- **Load**: Up to 50 concurrent users
- **Duration**: ~6 minutes total
- **Tests**: Mixed scenarios (static assets 40%, page loads 40%, API calls 20%)
- **Use Case**: Production readiness validation

### 3. Stress Test (`stress-test.js`)
- **Purpose**: Find breaking point and system limits
- **Load**: Up to 200 concurrent users
- **Duration**: ~12 minutes total
- **Tests**: High concurrent load on all endpoints
- **Use Case**: Capacity planning, finding bottlenecks

## Running Tests

### Quick Start
```bash
# Run all tests
./tests/performance/run-tests.sh

# Run specific test
./tests/performance/run-tests.sh smoke
./tests/performance/run-tests.sh load
./tests/performance/run-tests.sh stress
```

### Manual Execution
```bash
# Individual test files
k6 run tests/performance/smoke-test.js
k6 run tests/performance/load-test.js
k6 run tests/performance/stress-test.js

# With results output
k6 run --out json=results.json tests/performance/load-test.js
```

## Performance Targets

### Expected Performance (Octane + FrankenPHP)
- **Static Assets**: < 200ms (95th percentile)
- **Page Loads**: < 1000ms (95th percentile)
- **API Responses**: < 300ms (95th percentile)
- **Error Rate**: < 5% under normal load
- **Concurrent Users**: 50+ without degradation

### Stress Test Thresholds
- **Response Time**: < 2000ms (95th percentile)
- **Error Rate**: < 10% under high stress
- **Breaking Point**: ~200 concurrent users

## Metrics Tracked

### Built-in k6 Metrics
- `http_req_duration`: HTTP request duration
- `http_req_failed`: Failed HTTP requests rate
- `http_reqs`: Total HTTP requests
- `vus`: Virtual users
- `vus_max`: Maximum virtual users

### Custom Metrics
- `asset_load_time`: Static asset loading time
- `page_load_time`: Full page loading time
- `api_response_time`: API endpoint response time
- `error_rate`: Custom error tracking
- `static_asset_requests`: Counter for asset requests

## Test Scenarios

### Static Asset Testing
Tests loading of:
- JavaScript bundles (`app-*.js`, `react-vendor-*.js`)
- CSS files (`app-*.css`)
- Vendor libraries
- MIME type validation

### Page Load Testing
Tests rendering of:
- Homepage (`/`)
- News page (`/news`)
- Gallery (`/gallery`)
- Static pages (`/about`, `/facilities`, etc.)

### API Testing
Tests performance of:
- Public API endpoints (`/api/pages`)
- JSON response validation
- Response time consistency

## Analyzing Results

### Console Output
- Real-time metrics during test execution
- Pass/fail status for each check
- Summary statistics at completion

### JSON Results
Results are saved to `tests/performance/results/` with timestamps:
```
results/
├── smoke-test_20231121_143022.json
├── load-test_20231121_143522.json
└── stress-test_20231121_144822.json
```

### Key Metrics to Monitor
1. **Response Times**: p95 should meet targets
2. **Error Rates**: Should stay below thresholds
3. **Throughput**: Requests per second
4. **Resource Utilization**: Monitor server CPU/memory

## Troubleshooting

### Common Issues

**High Response Times**
- Check server resources (CPU, memory)
- Verify Octane worker count
- Monitor database connections
- Check for memory leaks

**High Error Rates**
- Check server logs
- Verify all assets are built and present
- Check file permissions
- Monitor connection limits

**Connection Refused**
- Ensure server is running on correct port
- Check firewall settings
- Verify host binding (127.0.0.1 vs localhost)

### Performance Optimization Tips

1. **Octane Configuration**
   ```bash
   # Increase worker count
   php artisan octane:start --workers=4
   
   # Monitor worker memory
   php artisan octane:status
   ```

2. **FrankenPHP Tuning**
   - Adjust Caddyfile settings
   - Enable HTTP/2 (requires TLS)
   - Optimize static file caching

3. **Asset Optimization**
   - Enable gzip compression
   - Use CDN for static assets
   - Implement browser caching

## Integration

### CI/CD Pipeline
Add to your CI/CD pipeline:
```yaml
# Example GitHub Actions
- name: Run Performance Tests
  run: |
    php artisan octane:start --daemonize
    ./tests/performance/run-tests.sh smoke
    php artisan octane:stop
```

### Monitoring
- Set up alerts for performance degradation
- Monitor trends over time
- Compare before/after deployments

## Next Steps

1. **Baseline Establishment**: Run tests on current setup
2. **Optimization**: Implement improvements based on results
3. **Continuous Monitoring**: Regular performance validation
4. **Scaling Strategy**: Plan for traffic growth based on limits found
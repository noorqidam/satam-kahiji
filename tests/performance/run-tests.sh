#!/bin/bash

# Performance Test Runner for Laravel + Octane + FrankenPHP
# Requires k6 to be installed: https://k6.io/docs/getting-started/installation/

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
BASE_URL="http://127.0.0.1:8000"
RESULTS_DIR="tests/performance/results"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

echo -e "${BLUE}🚀 Laravel Octane Performance Test Suite${NC}"
echo -e "${BLUE}=======================================${NC}"

# Check if k6 is installed
if ! command -v k6 &> /dev/null; then
    echo -e "${RED}❌ k6 is not installed. Please install k6 first:${NC}"
    echo -e "${YELLOW}   macOS: brew install k6${NC}"
    echo -e "${YELLOW}   Linux: sudo apt-get install k6${NC}"
    echo -e "${YELLOW}   Or visit: https://k6.io/docs/getting-started/installation/${NC}"
    exit 1
fi

# Check if server is running
echo -e "${BLUE}🔍 Checking if server is running...${NC}"
if ! curl -s "$BASE_URL" > /dev/null; then
    echo -e "${RED}❌ Server is not running at $BASE_URL${NC}"
    echo -e "${YELLOW}💡 Start your server with: php artisan octane:start --server=frankenphp${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Server is running at $BASE_URL${NC}"

# Create results directory
mkdir -p "$RESULTS_DIR"

# Function to run test with results
run_test() {
    local test_name=$1
    local test_file=$2
    local description=$3
    
    echo -e "${BLUE}🧪 Running $test_name...${NC}"
    echo -e "${YELLOW}   $description${NC}"
    
    local result_file="$RESULTS_DIR/${test_name}_${TIMESTAMP}.json"
    
    if k6 run --out json="$result_file" "$test_file"; then
        echo -e "${GREEN}✅ $test_name completed successfully${NC}"
        echo -e "${BLUE}📊 Results saved to: $result_file${NC}"
    else
        echo -e "${RED}❌ $test_name failed${NC}"
        return 1
    fi
    
    echo ""
}

# Run tests based on argument or run all
case "${1:-all}" in
    "smoke")
        run_test "smoke-test" "tests/performance/smoke-test.js" "Quick validation test (1 user, 1 minute)"
        ;;
    "load")
        run_test "load-test" "tests/performance/load-test.js" "Load test with gradual ramp-up (up to 50 users)"
        ;;
    "stress")
        run_test "stress-test" "tests/performance/stress-test.js" "Stress test to find breaking point (up to 200 users)"
        ;;
    "all")
        echo -e "${BLUE}🎯 Running complete test suite...${NC}"
        echo ""
        
        run_test "smoke-test" "tests/performance/smoke-test.js" "Quick validation test (1 user, 1 minute)"
        sleep 5
        
        run_test "load-test" "tests/performance/load-test.js" "Load test with gradual ramp-up (up to 50 users)"
        sleep 10
        
        echo -e "${YELLOW}⚠️  About to run stress test - this will put significant load on your server${NC}"
        read -p "Continue? (y/N): " -n 1 -r
        echo ""
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            run_test "stress-test" "tests/performance/stress-test.js" "Stress test to find breaking point (up to 200 users)"
        else
            echo -e "${YELLOW}⏭️  Skipping stress test${NC}"
        fi
        ;;
    *)
        echo -e "${RED}❌ Unknown test: $1${NC}"
        echo -e "${YELLOW}Available tests: smoke, load, stress, all${NC}"
        echo -e "${YELLOW}Usage: $0 [smoke|load|stress|all]${NC}"
        exit 1
        ;;
esac

echo -e "${GREEN}🎉 Test suite completed!${NC}"
echo -e "${BLUE}📊 Results are saved in: $RESULTS_DIR${NC}"
echo -e "${YELLOW}💡 Use 'k6 run --out cloud' to upload results to k6 Cloud for analysis${NC}"
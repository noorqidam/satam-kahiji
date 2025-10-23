#!/bin/bash

# Memory monitoring script for k6 performance testing
# Usage: ./monitor-system-memory.sh [duration_in_seconds]

DURATION=${1:-300}  # Default 5 minutes
LOG_FILE="memory-usage-$(date +%Y%m%d-%H%M%S).log"
INTERVAL=5  # Check every 5 seconds

echo "🧠 Starting system memory monitoring for ${DURATION} seconds"
echo "📝 Logging to: ${LOG_FILE}"
echo "⏱️  Checking every ${INTERVAL} seconds"

# Header for log file
echo "timestamp,total_mem_gb,used_mem_gb,free_mem_gb,mem_usage_percent,php_processes,laravel_mem_mb" > "$LOG_FILE"

START_TIME=$(date +%s)
END_TIME=$((START_TIME + DURATION))

while [ $(date +%s) -lt $END_TIME ]; do
    TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')
    
    # Get memory info (macOS)
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS memory monitoring
        MEM_INFO=$(vm_stat | perl -ne '/page size of (\d+)/ and $size=$1; /Pages\s+([^:]+):\s+(\d+)/ and printf("%-16s % 16.2f Mi\n", "$1:", $2 * $size / 1048576);')
        TOTAL_MEM=$(sysctl -n hw.memsize)
        TOTAL_MEM_GB=$(echo "scale=2; $TOTAL_MEM / 1024 / 1024 / 1024" | bc)
        
        # Get memory pressure
        MEM_PRESSURE=$(memory_pressure | grep "System-wide memory free percentage" | awk '{print $NF}' | tr -d '%')
        USED_PERCENT=$(echo "scale=2; 100 - $MEM_PRESSURE" | bc)
        USED_MEM_GB=$(echo "scale=2; $TOTAL_MEM_GB * $USED_PERCENT / 100" | bc)
        FREE_MEM_GB=$(echo "scale=2; $TOTAL_MEM_GB - $USED_MEM_GB" | bc)
        
    else
        # Linux memory monitoring
        MEM_INFO=$(free -g)
        TOTAL_MEM_GB=$(free -g | awk '/^Mem:/ {print $2}')
        USED_MEM_GB=$(free -g | awk '/^Mem:/ {print $3}')
        FREE_MEM_GB=$(free -g | awk '/^Mem:/ {print $4}')
        USED_PERCENT=$(free | awk '/^Mem:/ {printf("%.2f", $3/$2 * 100)}')
    fi
    
    # Count PHP processes
    PHP_PROCESSES=$(ps aux | grep -c '[p]hp')
    
    # Get Laravel/PHP memory usage (rough estimate)
    LARAVEL_MEM_MB=$(ps aux | grep '[p]hp' | awk '{sum += $6} END {print sum/1024}')
    
    # Log to file
    echo "${TIMESTAMP},${TOTAL_MEM_GB},${USED_MEM_GB},${FREE_MEM_GB},${USED_PERCENT},${PHP_PROCESSES},${LARAVEL_MEM_MB}" >> "$LOG_FILE"
    
    # Display real-time info
    printf "\r⏰ %s | 💾 Memory: %.1fGB/%.1fGB (%.1f%%) | 🐘 PHP: %d processes (%.1fMB)" \
           "$(date '+%H:%M:%S')" "$USED_MEM_GB" "$TOTAL_MEM_GB" "$USED_PERCENT" "$PHP_PROCESSES" "$LARAVEL_MEM_MB"
    
    sleep $INTERVAL
done

echo -e "\n✅ Memory monitoring completed!"
echo "📊 Results saved to: $LOG_FILE"
echo ""
echo "📈 Quick Analysis:"
head -1 "$LOG_FILE"
tail -5 "$LOG_FILE"

echo ""
echo "💡 To analyze the data:"
echo "   - Import $LOG_FILE into Excel/Google Sheets"
echo "   - Use 'sort -t, -k5 -nr $LOG_FILE' to find peak memory usage"
echo "   - Check for memory leaks by comparing start vs end usage"
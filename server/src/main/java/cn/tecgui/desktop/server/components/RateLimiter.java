package cn.tecgui.desktop.server.components;

import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class RateLimiter {
    private final Map<String, RateLimitInfo> userRateMap = new ConcurrentHashMap<>();
    private static final int MAX_MESSAGES_PER_MINUTE = 60; // 每分钟最多60条消息

    public boolean allowMessage(String userId) {
        RateLimitInfo info = userRateMap.computeIfAbsent(userId, k -> new RateLimitInfo());

        long now = System.currentTimeMillis();
        if (now - info.lastResetTime > 60_000) { // 超过1分钟，重置计数器
            info.reset();
        }

        if (info.count >= MAX_MESSAGES_PER_MINUTE) {
            return false;
        }

        info.count++;
        return true;
    }

    private static class RateLimitInfo {
        int count = 0;
        long lastResetTime = System.currentTimeMillis();

        void reset() {
            count = 0;
            lastResetTime = System.currentTimeMillis();
        }
    }
}

package cn.tecgui.desktop.server.service;

import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.socket.WebSocketSession;

import java.time.Duration;
import java.util.Collections;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Service
public class DeviceSessionService {
    private final RedisTemplate<String, Object> redisTemplate;
    private static final String USER_DEVICES_KEY_PREFIX = "user_devices:";  // 用户ID -> 设备列表
    private static final String DEVICE_SESSION_KEY_PREFIX = "device_session:"; // 设备ID -> SessionId

    // 本地缓存，存储设备ID到 WebSocketSession，防止频繁 Redis 操作（可优化）
    private final ConcurrentHashMap<String, WebSocketSession> deviceSessionCache = new ConcurrentHashMap<>();

    public DeviceSessionService(RedisTemplate<String, Object> redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    public void addDeviceSession(String uid, String deviceId, WebSocketSession session) {
        // 绑定设备到用户，存储到 Redis
        String userDevicesKey = USER_DEVICES_KEY_PREFIX + uid;
        redisTemplate.opsForSet().add(userDevicesKey, deviceId);

        String deviceSessionKey = DEVICE_SESSION_KEY_PREFIX + deviceId;
        redisTemplate.opsForValue().set(deviceSessionKey, session.getId(), Duration.ofHours(1));

        deviceSessionCache.put(deviceId, session);
    }

    public void removeDeviceSession(String uid, String deviceId) {
        String userDevicesKey = USER_DEVICES_KEY_PREFIX + uid;
        redisTemplate.opsForSet().remove(userDevicesKey, deviceId);

        String deviceSessionKey = DEVICE_SESSION_KEY_PREFIX + deviceId;
        redisTemplate.delete(deviceSessionKey);

        deviceSessionCache.remove(deviceId);
    }

    public Set<String> getUserDevices(String uid) {
        String userDevicesKey = USER_DEVICES_KEY_PREFIX + uid;
        Set<Object> members = redisTemplate.opsForSet().members(userDevicesKey);
        if (members == null) return Collections.emptySet();

        return members.stream().map(Object::toString).collect(Collectors.toSet());
    }

    public WebSocketSession getSessionByDeviceId(String deviceId) {
        return deviceSessionCache.get(deviceId);
    }
}


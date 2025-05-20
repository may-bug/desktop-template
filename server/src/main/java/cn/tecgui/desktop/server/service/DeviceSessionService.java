package cn.tecgui.desktop.server.service;

import cn.tecgui.desktop.server.model.ConnInfo;
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
    private static final String USER_DEVICES_KEY_PREFIX = "user_devices:";
    private static final String USER_UID_KEY_PREFIX = "user_uid:";

    private final ConcurrentHashMap<String, ConnInfo> deviceSessionCache = new ConcurrentHashMap<>();
    public final ConcurrentHashMap<String, String> deviceToUserMap = new ConcurrentHashMap<>();

    public DeviceSessionService(RedisTemplate<String, Object> redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    public void addDeviceSession(String deviceId,ConnInfo info) {
        // 绑定设备到用户，存储到 Redis
        String userDevicesKey = USER_DEVICES_KEY_PREFIX + deviceId;
        redisTemplate.opsForSet().add(userDevicesKey, deviceId);

        deviceSessionCache.put(deviceId,info);
    }

    public void removeDeviceSession(String deviceId) {
        String userDevicesKey = USER_DEVICES_KEY_PREFIX + deviceId;
        redisTemplate.opsForSet().remove(userDevicesKey, deviceId);

        deviceSessionCache.remove(deviceId);
    }

    public Set<String> getUserDevices(String uid) {
        String userDevicesKey = USER_DEVICES_KEY_PREFIX + uid;
        Set<Object> members = redisTemplate.opsForSet().members(userDevicesKey);
        if (members == null) return Collections.emptySet();

        return members.stream().map(Object::toString).collect(Collectors.toSet());
    }
}


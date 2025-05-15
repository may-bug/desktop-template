package cn.tecgui.desktop.server.service.impl;


import cn.dev33.satoken.stp.StpUtil;
import cn.tecgui.desktop.server.except.RoomFullException;
import cn.tecgui.desktop.server.except.RoomNotFoundException;
import cn.tecgui.desktop.server.except.UnauthorizedAccessException;
import cn.tecgui.desktop.server.model.Room;
import cn.tecgui.desktop.server.model.RoomDTO;
import cn.tecgui.desktop.server.service.RoomService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import cn.tecgui.desktop.server.model.CreateRoomRequest;

import java.util.*;
import java.util.concurrent.TimeUnit;

@Service
@Slf4j
public class RoomServiceImpl implements RoomService {

    private static final String ROOM_KEY_PREFIX = "room:";
    private static final String ROOM_SET_KEY = "rooms";
    private static final long ROOM_TTL = 3600; // 房间空闲1小时后自动销毁
    private static final long ROOM_CHECK_INTERVAL = 1800000; // 30分钟检查一次

    private final RedisTemplate<String, Object> redisTemplate;

    public RoomServiceImpl(RedisTemplate<String, Object> redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    @Override
    public List<RoomDTO> getAllRooms() {
        Set<Object> roomIdsTemp = redisTemplate.opsForSet().members(ROOM_SET_KEY);
        Set<String> roomIds =new HashSet<>();
        if (roomIdsTemp == null || roomIdsTemp.isEmpty()) {
            return Collections.emptyList();
        }
        for (Object roomId : roomIdsTemp) {
            roomIds.add(String.valueOf(roomId));
        }

        List<RoomDTO> result = new ArrayList<>();
        for (String roomId : roomIds) {
            Room room = (Room) redisTemplate.opsForValue().get(ROOM_KEY_PREFIX + roomId);
            if (room != null) {
                result.add(convertToDTO(room));
            }
        }
        return result;
    }

    @Override
    public Room createRoom(CreateRoomRequest request, String creatorId) {
        String roomId = UUID.randomUUID().toString();
        Room room = new Room();
        room.setId(roomId);
        room.setName(request.getName());
        room.setCreatorId(creatorId);
        room.setCreatorName(StpUtil.getSession().getString("username"));
        room.setPrivate(request.isPrivate());
        room.setPassword(request.getPassword());
        room.setMaxUsers(request.getMaxUsers());
        room.setCreatedAt(System.currentTimeMillis());
        room.setLastActiveTime(System.currentTimeMillis());

        // 加入房间
        room.getUserIds().add(creatorId);

        // 存储到Redis
        redisTemplate.opsForValue().set(
                ROOM_KEY_PREFIX + roomId,
                room,
                ROOM_TTL,
                TimeUnit.SECONDS
        );
        redisTemplate.opsForSet().add(ROOM_SET_KEY, roomId);

        log.info("Room created: {}", roomId);
        return room;
    }

    @Override
    public void joinRoom(String roomId, String password, String userId) throws RoomNotFoundException, UnauthorizedAccessException {
        Room room = getRoomById(roomId);

        // 检查房间密码
        if (room.isPrivate() && !room.getPassword().equals(password)) {
            throw new UnauthorizedAccessException("Invalid room password");
        }

        // 检查房间人数
        if (room.getUserIds().size() >= room.getMaxUsers()) {
            throw new RoomFullException("Room is full");
        }

        // 加入房间
        synchronized (room) {  // 添加同步块保证线程安全
            Set<String> newUserIds = new HashSet<>(room.getUserIds());
            newUserIds.add(userId);
            room.setUserIds(newUserIds);
        }
        room.setLastActiveTime(System.currentTimeMillis());

        // 更新Redis
        redisTemplate.opsForValue().set(
                ROOM_KEY_PREFIX + roomId,
                room,
                ROOM_TTL,
                TimeUnit.SECONDS
        );

        log.info("User {} joined room {}", userId, roomId);
    }

    @Override
    public void leaveRoom(String roomId, String userId) throws RoomNotFoundException {
        Room room = getRoomById(roomId);
        synchronized (room) {  // 添加同步块保证线程安全
            Set<String> newUserIds = new HashSet<>(room.getUserIds());
            newUserIds.remove(userId);
            room.setUserIds(newUserIds);
        }
        room.setLastActiveTime(System.currentTimeMillis());

        if (room.getUserIds().isEmpty()) {
            // 房间无人，设置更短的TTL
            redisTemplate.opsForValue().set(
                    ROOM_KEY_PREFIX + roomId,
                    room,
                    300, // 5分钟
                    TimeUnit.SECONDS
            );
        } else {
            redisTemplate.opsForValue().set(
                    ROOM_KEY_PREFIX + roomId,
                    room
            );
        }

        log.info("User {} left room {}", userId, roomId);
    }

    @Override
    public boolean checkRoomExists(String roomId) {
        return Boolean.TRUE.equals(redisTemplate.hasKey(ROOM_KEY_PREFIX + roomId));
    }

    @Override
    @Scheduled(fixedRate = ROOM_CHECK_INTERVAL)
    public void cleanupInactiveRooms() {
        log.info("Starting room cleanup task...");
        Set<Object> roomIdsTemp = redisTemplate.opsForSet().members(ROOM_SET_KEY);
        Set<String> roomIds = new HashSet<>();
        if (roomIdsTemp == null || roomIdsTemp.isEmpty()) {
            return;
        }
        for (Object roomId : roomIdsTemp) {
            roomIds.add(String.valueOf(roomId));
        }

        int cleaned = 0;
        for (String roomId : roomIds) {
            Room room = (Room) redisTemplate.opsForValue().get(ROOM_KEY_PREFIX + roomId);
            if (room == null) {
                redisTemplate.opsForSet().remove(ROOM_SET_KEY, roomId);
                cleaned++;
                continue;
            }

            // 检查房间是否空闲超时
            long inactiveDuration = System.currentTimeMillis() - room.getLastActiveTime();
            if (room.getUserIds().isEmpty() && inactiveDuration > TimeUnit.MINUTES.toMillis(5)) {
                redisTemplate.delete(ROOM_KEY_PREFIX + roomId);
                redisTemplate.opsForSet().remove(ROOM_SET_KEY, roomId);
                cleaned++;
                log.info("Cleaned up inactive room: {}", roomId);
            }
        }

        log.info("Room cleanup completed. {} rooms cleaned.", cleaned);
    }

    private Room getRoomById(String roomId) throws RoomNotFoundException {
        Room room = (Room) redisTemplate.opsForValue().get(ROOM_KEY_PREFIX + roomId);
        if (room == null) {
            throw new RoomNotFoundException("Room not found");
        }
        return room;
    }

    public RoomDTO convertToDTO(Room room) {
        RoomDTO dto = new RoomDTO();
        dto.setId(room.getId());
        dto.setName(room.getName());
        dto.setCreatorName(room.getCreatorName());
        dto.setPrivate(room.isPrivate());
        dto.setMaxUsers(room.getMaxUsers());
        dto.setUserCount(room.getUserIds().size());
        dto.setJoined(room.getUserIds().contains(StpUtil.getLoginIdAsString()));
        return dto;
    }
}

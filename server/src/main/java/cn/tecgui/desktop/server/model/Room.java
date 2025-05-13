package cn.tecgui.desktop.server.model;

import lombok.Data;
import lombok.Getter;
import org.springframework.web.socket.WebSocketSession;

import java.util.Collections;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

/**
 * 房间
 */
@Data
public class Room {
    @Getter
    private final String id;
    private final Set<UserSession> users = ConcurrentHashMap.newKeySet();

    public Room(String id) {
        this.id = id;
    }

    public Set<UserSession> getUsers() {
        return Collections.unmodifiableSet(users);
    }

    public int getUserCount() {
        return users.size();
    }

    public UserSession getUser(String userId) {
        return users.stream()
                .filter(u -> u.getUserId().equals(userId))
                .findFirst()
                .orElse(null);
    }

    public UserSession getUserBySession(WebSocketSession session) {
        return users.stream()
                .filter(u -> u.getSession().getId().equals(session.getId()))
                .findFirst()
                .orElse(null);
    }

    public synchronized void addUser(UserSession user) {
        users.add(user);
    }

    public synchronized void removeUser(String userId) {
        users.removeIf(u -> u.getUserId().equals(userId));
    }
}


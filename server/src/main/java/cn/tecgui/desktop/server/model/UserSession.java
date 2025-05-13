package cn.tecgui.desktop.server.model;

import lombok.Getter;
import org.springframework.web.socket.WebSocketSession;

import java.util.Objects;

// UserSession.java
@Getter
public class UserSession {
    private final String userId;
    private final WebSocketSession session;

    public UserSession(String userId, WebSocketSession session) {
        this.userId = userId;
        this.session = session;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        UserSession that = (UserSession) o;
        return userId.equals(that.userId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(userId);
    }
}

package cn.tecgui.desktop.server.except;

// RoomFullException.java
public class RoomFullException extends SignalingException {
    public RoomFullException(String message) {
        super(message);
    }
}

package cn.tecgui.desktop.server.except;

public class RoomNotFoundException extends Throwable {
    public RoomNotFoundException(String message) {
        super(message);
    }
}

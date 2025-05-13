package cn.tecgui.desktop.server.except;

public class PermissionDeniedException extends Throwable {
    public PermissionDeniedException(String message) {
        super(message);
    }
}

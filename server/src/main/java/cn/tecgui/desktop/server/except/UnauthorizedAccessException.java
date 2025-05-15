package cn.tecgui.desktop.server.except;

public class UnauthorizedAccessException extends Throwable {
    public UnauthorizedAccessException(String message) {
        super(message);
    }
}

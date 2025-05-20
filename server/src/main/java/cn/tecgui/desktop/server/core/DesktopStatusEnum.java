package cn.tecgui.desktop.server.core;

import lombok.Getter;

@Getter
public enum DesktopStatusEnum {
    REQUEST("request"),
    ANSWER("answer"),
    REJECT("reject"),
    REQUIRE_PASSWORD("require_password"),
    AUTH_FAILURE("auth_failure"),
    AUTH_SUCCESS("auth_success"),
    CLOSED("closed");

    private final String value;
    DesktopStatusEnum(String value) {
        this.value = value;
    }
}

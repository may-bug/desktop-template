package cn.tecgui.desktop.server.components;

import cn.dev33.satoken.stp.StpUtil;
import org.springframework.stereotype.Component;

@Component
public class SaTokenManager {
    public String getUidByToken(String token) {
        try {
            return StpUtil.getLoginIdByToken(token).toString();
        } catch (Exception e) {
            return null;
        }
    }
}

